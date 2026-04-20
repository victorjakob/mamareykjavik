# Mama Membership — operator handbook

Everything needed to go live with the Free / Tribe / Patron tiers. Payment
uses Teya's **RPG** (Restful Payment Gateway, REST/JSON) API at
`docs.borgun.is/paymentgateways/bapi/rpg/` for both the initial signup AND
the monthly renewals. We used to plan a SecurePay-first flow; see the note
at the end of §6 for why we no longer do.

---

## 1. Run the migrations

Apply all three migration files to the Supabase project, in order:

```bash
psql "$SUPABASE_DB_URL" -f database-migrations/create-memberships-tables.sql
psql "$SUPABASE_DB_URL" -f database-migrations/add-rpg-multi-token-to-membership-payment-methods.sql
psql "$SUPABASE_DB_URL" -f database-migrations/make-virtual-card-number-nullable.sql
```

What they create:

- `membership_subscriptions` — one row per member, state machine across
  `pending_payment → active → grace_period → past_due → canceled`.
- `membership_payment_methods` — card-on-file metadata + RPG MultiToken:
  - `rpg_multi_token` — the **primary** card-on-file in the new flow.
    Created by `/api/membership/rpg-signup` on the first charge and reused
    forever by the cron. No PAN is ever stored here or anywhere else.
  - `virtual_card_number` — **legacy** (nullable). Historical rows from the
    deprecated SaveCard experiment used this; new rows leave it NULL.
  - `card_last4` / `card_brand` — UI metadata.
- `membership_payment_events` — audit trail for every signup, renewal,
  dunning decision. Idempotent on `(order_id, event_type)`.
- `tribe_cards` is left alone — we reuse it with `source = 'paid-tribe'`.

---

## 2. Environment variables

Add these to `.env` (and to Vercel project settings):

```bash
# --- Teya RPG (signup + renewals, REST/JSON) --------------------------
# Test:       https://test.borgun.is/rpg
# Production: https://ecommerce.borgun.is/rpg
# (Confirmed 2026-04-20 — Teya onboarding email for MID 5144716 (mama.is).
# Swagger at https://ecommerce.borgun.is/rpg/swagger/docs/v1 reports
# host=ecommerce.borgun.is, basePath=/RPG. Path is case-insensitive.)
SALTPAY_RPG_BASE_URL=https://test.borgun.is/rpg
SALTPAY_RPG_PUBLIC_KEY=<from Teya — safe to embed in the browser>
SALTPAY_RPG_PRIVATE_KEY=<from Teya — secret, server-only>

# Optional: override the server-side Authorization header format if Teya
# confirms something other than "Basic base64(public:private)". Values:
#   basic_pair    (default) → Basic base64("publicKey:privateKey")
#   basic_private           → Basic base64("privateKey")
#   basic_private_colon     → Basic base64("privateKey:")
# SALTPAY_RPG_AUTH_MODE=basic_pair

# Optional: override the 3DS TermUrl (the return URL the ACS posts PaRes to).
# When absent we derive it from NEXTAUTH_URL:
#   <NEXTAUTH_URL>/api/membership/rpg-3ds-return
# Override this during local/ngrok testing — the ACS must be able to reach it.
# Warning: Teya rejects TermUrls that contain query parameters (?...).
# SALTPAY_RPG_TERM_URL=https://mama.is/api/membership/rpg-3ds-return

# --- Legacy SecurePay envs --------------------------------------------
# Still used for one-off tickets/gift cards/tours — NOT for memberships.
# SALTPAY_MERCHANT_ID=...
# SALTPAY_SECRET_KEY=...
# SALTPAY_PAYMENT_GATEWAY_ID=...
# SALTPAY_BASE_URL=...

# --- Cron auth (already set for the other crons) ----------------------
# CRON_SECRET=...
```

> **Key rotation:** if RPG keys were ever pasted into a chat log or emailed
> outside an encrypted channel, rotate them with Teya and store the
> replacements only in Vercel's encrypted env. The private key alone can
> charge any card-on-file that's been tokenised for your MID.

---

## 3. Cron

`vercel.json` already registers the daily job at `03:00 UTC`:

```json
{ "path": "/api/cron/renew-memberships", "schedule": "0 3 * * *" }
```

Vercel calls it with `Authorization: Bearer $CRON_SECRET`. If
`SALTPAY_RPG_PRIVATE_KEY` is blank, every eligible row returns
`action: "skipped_rpg_stub"` — no charges, no status flips.

To smoke-test locally:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/renew-memberships
```

### How signup + renewals actually flow

**Signup (CIT) via `/api/membership/rpg-signup`, `/api/membership/rpg-verify`:**

1. Browser fetches `/api/membership/rpg-config` → gets the public key +
   `/api/token/single` URL.
2. `RpgCardForm` collects card details and POSTs them **directly to Teya**.
   The card PAN and CVC NEVER pass through our server.
3. Teya returns a `SingleToken`. The browser hands it to our
   `/api/membership/rpg-signup` route.
4. Our server POSTs `{ TokenSingle }` to Teya `/api/token/multi` with the
   private key → gets a reusable `MultiToken`.
5. Our server POSTs `/api/mpi/v2/enrollment` with that MultiToken + the
   tier amount. Teya returns an `MpiToken` plus one of:
   - **MdStatus 1 (frictionless):** no cardholder interaction needed.
   - **MdStatus 9 (challenge):** a `RedirectToACSData` form that must be
     submitted by the browser so the issuer can challenge the cardholder.
   - **MdStatus 2/3/4/5/6:** scheme not participating or soft error — we
     continue to payment using the MpiToken without a challenge.
   - **MdStatus 0/8/50:** hard fail — we decline and stop.
6. **If no challenge is needed:** our server POSTs `/api/payment` with
   `PaymentType: "TokenMulti"` + `ThreeDSecure: { MpiToken }` to finalise the
   first charge. On success we activate the subscription, store the
   MultiToken on `membership_payment_methods.rpg_multi_token`, and issue
   the `tribe_cards` row.
7. **If a challenge is needed:** rpg-signup stashes the MpiToken,
   MultiToken, MD, and order id on `membership_subscriptions.metadata.threeds`
   and returns a `{ needs3ds: true, challenge: { actionUrl, paReq, md,
   termUrl } }` payload. `RpgCardForm` renders an iframe, POSTs the PaReq
   into it, and waits for `/api/membership/rpg-3ds-return` to post the
   PaRes back up via `postMessage`. The form then calls
   `/api/membership/rpg-verify`, which runs `/api/mpi/v2/validation` and —
   on `MdStatus=1` — finishes the payment via `/api/payment` with the
   same MpiToken. Activation runs through the shared
   `activateSubscriptionFromCharge` helper (`src/lib/membershipActivate.js`)
   so frictionless and post-challenge flows end identically.

**Renewal (MIT) via cron:**

1. Cron picks every row with `next_billing_date <= now()` in `active` or
   `grace_period`.
2. Reads `rpg_multi_token` from `membership_payment_methods`, POSTs
   `/api/payment` with that token. No CVC, no 3DS — true MIT.
3. Success → extend `current_period_end` +1 month, extend the tribe card.
4. Soft decline → schedule retry (day +3, then day +7, then `past_due`).
5. Hard decline → straight to `past_due` and expire the tribe card.

---

## 4. What's live once you deploy

| Route | Method | Purpose |
|---|---|---|
| `/membership` | GET | Landing page, three tier cards, Patron slider |
| `/is/membership` | GET | Icelandic mirror (same component, locale-switched) |
| `/api/membership/join-free` | POST | Instant free-tier activation (auth) |
| `/api/membership/rpg-config` | GET | Public RPG endpoint + public key (auth) |
| `/api/membership/rpg-signup` | POST | Tokenise → MPI enroll → charge (frictionless) OR return 3DS challenge |
| `/api/membership/rpg-verify` | POST | Validate PaRes → charge with MpiToken → activate (post-challenge) |
| `/api/membership/rpg-3ds-return` | GET/POST | TermUrl — receives PaRes from ACS, postMessages to parent |
| `/api/membership/me` | GET | Returns the caller's current membership state |
| `/api/membership/cancel` | POST | Cancel-at-period-end (paid) / immediate (free) |
| `/api/cron/renew-memberships` | GET | Daily renewal + dunning (cron-only) |

`/api/membership/checkout` and `/api/membership/saltpay-callback` still
exist and still work — they're used by the legacy SecurePay flow. Nothing
new should route through them; keep them around only so any in-flight
hosted-page sessions complete cleanly.

---

## 5. Sandbox verification

Test MID is already configured. Test card `4176 6699 9900 0104`, exp
`12/31`, CVC `123`.

1. `/membership` → click **Join the Tribe**. A card form slides in.
2. Either type the test card or click **Fill in test card** (test-mode
   shortcut wired from `/api/membership/rpg-config`).
3. Submit. Expected UI: "Securing card…" → "Processing payment…" → land
   on `/membership` with the "Your plan" banner showing Tribe.
4. Database checks:
   ```sql
   select status, current_period_end, next_billing_date
   from membership_subscriptions where member_email = '<your test email>';
   -- status = 'active', both dates set

   select rpg_multi_token is not null as has_token, card_last4, card_brand
   from membership_payment_methods where member_email = '<your test email>';
   -- has_token = true, card_last4 = '0104', card_brand = 'VISA'

   select status, source, expires_at from tribe_cards
   where holder_email = '<your test email>';
   -- status = 'active', source = 'paid-tribe'
   ```
5. Fast-forward a renewal:
   ```sql
   update membership_subscriptions
     set next_billing_date = now()
     where member_email = '<your test email>';
   ```
6. Hit the cron:
   ```bash
   curl -H "Authorization: Bearer $CRON_SECRET" \
     http://localhost:3000/api/cron/renew-memberships
   ```
7. `membership_payment_events` should now contain
   `renewal_attempted` → `renewal_succeeded` for the test email, and
   `next_billing_date` advances one month.

If any step returns `HTTP 401 Unauthorized` from Teya, the auth format is
different from the default `basic_pair`. Try the overrides
(`basic_private`, `basic_private_colon`) before contacting Teya support.

---

## 6. Remaining work

1. ~~**Production RPG base URL**~~ — ✅ resolved 2026-04-20.
   `https://ecommerce.borgun.is/rpg` (from Teya onboarding email for
   MID 5144716). Set `SALTPAY_RPG_BASE_URL` to that value in Vercel →
   Production env.
2. **Server-side Authorization format** — the Swagger spec doesn't state
   the exact encoding. We default to `Basic base64(publicKey:privateKey)`;
   if the sandbox rejects with 401, flip `SALTPAY_RPG_AUTH_MODE` to
   `basic_private` or `basic_private_colon`.
3. ~~**3DS / PSD2 for CIT**~~ — ✅ implemented 2026-04-20. See the
   signup flow in §3. Helpers live in `src/lib/membershipTeya.js`
   (`mpiEnroll`, `mpiValidate`, `chargeRpgCit` with optional MpiToken)
   and the two-step API in `src/app/api/membership/rpg-signup/route.js`
   + `rpg-verify/route.js`. The TermUrl handler is
   `src/app/api/membership/rpg-3ds-return/route.js`. Still not wired:
   MdStatus 50 (3DS Method pre-step) — rare in practice, returns a clean
   decline for now.
4. **Re-signup UX for the one existing SecurePay subscription**
   (`viggijakob@gmail.com`, sub `fc074998-…`) — that row was created under
   the old flow with no `rpg_multi_token`, so its May 19 renewal will
   fail. Either email the member to re-enter their card via the new
   `/membership` flow, or refund the first charge and let them restart.

---

## 7. Why we pivoted away from SecurePay SaveCard

The original design used Teya's SecurePay hosted page with `savecard=true`
so the callback would return a reusable `virtualcardnumber`. **It does
not.** Empirically confirmed on 2026-04-19 against live MID `9256684`:
the callback returned `{step, amount, status, orderid, cardtype, currency,
refundid, creditcardnumber (masked), authorizationcode}` — no
`virtualcardnumber` and no `savecardcarddata` field. The `savecard=true`
parameter is silently ignored.

RPG has its own tokenization pipeline (`/api/token/single` +
`/api/token/multi`). The current flow skips SecurePay entirely for
subscription signups. SecurePay is still the right tool for one-off
payments (events, shop, meal cards, gift cards) — those don't need
tokenization.

---

## 8. Where to look when something breaks

- `membership_payment_events` is the first stop. Every signup, every
  renewal attempt, every dunning decision leaves a row:
  ```sql
  select created_at, event_type, message, action_code, order_id
  from membership_payment_events
  where member_email = 'x@y.com'
  order by created_at desc;
  ```
- Teya dashboards (`portal.teya.is`) for what actually reached them.
- Vercel function logs for the rpg-signup route — the Teya tokenization
  errors bubble up there.
- If `/api/membership/rpg-signup` returns `402 token_multi_failed`, the
  browser couldn't exchange the SingleToken (wrong public key or RPG
  base URL).
- If it returns `402 decline_*`, the card itself was declined at
  `/api/payment`. The action code in the response tells you which.
