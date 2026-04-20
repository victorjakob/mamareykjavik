# Mama Membership — operator handbook

Everything needed to go live with the Free / Tribe / Patron tiers. The
recurring-charge leg uses Teya's **RPG** (Restful Payment Gateway, REST/JSON)
API per `docs.borgun.is/paymentgateways/bapi/rpg/`, not the older B-Gateway
XML API.

---

## 1. Run the migrations

Apply both migration files to the Supabase project, in order:

```bash
psql "$SUPABASE_DB_URL" -f database-migrations/create-memberships-tables.sql
psql "$SUPABASE_DB_URL" -f database-migrations/add-rpg-multi-token-to-membership-payment-methods.sql
```

What they create:

- `membership_subscriptions` — one row per member, state machine across
  `pending_payment → active → grace_period → past_due → canceled`.
- `membership_payment_methods` — Teya SaveCard tokens + RPG MultiToken:
  - `virtual_card_number` — returned by SecurePay SaveCard (one-off, used to
    bootstrap the RPG MultiToken on the first renewal).
  - `card_expiration` / `card_last4` / `card_brand` — metadata.
  - `rpg_multi_token` — Teya RPG MultiToken, created lazily on the first
    renewal and reused for every subsequent MIT charge. No PAN is ever stored.
- `membership_payment_events` — audit trail for every webhook hit, every
  renewal attempt, every dunning decision. Idempotent on
  `(order_id, event_type)`.
- `tribe_cards` is left alone — we reuse it with `source = 'paid-tribe'`.

---

## 2. Environment variables

Add these to `.env` (and to Vercel project settings):

```bash
# --- Teya SecurePay (HPP, first charge) — reuse existing SALTPAY_* -----
# These already exist; the membership flow piggy-backs on them.
# SALTPAY_MERCHANT_ID=...
# SALTPAY_SECRET_KEY=...
# SALTPAY_PAYMENT_GATEWAY_ID=...
# SALTPAY_BASE_URL=https://test.borgun.is/SecurePay/default.aspx

# --- Membership-specific return URLs ----------------------------------
SALTPAY_MEMBERSHIP_RETURN_URL_SUCCESS=https://mama.is/membership/success
SALTPAY_MEMBERSHIP_RETURN_URL_SUCCESS_SERVER=https://mama.is/api/membership/saltpay-callback
SALTPAY_MEMBERSHIP_RETURN_URL_CANCEL=https://mama.is/membership?status=cancel
SALTPAY_MEMBERSHIP_RETURN_URL_ERROR=https://mama.is/membership?status=error

# --- Teya RPG (MIT renewals) ------------------------------------------
# Test:       https://test.borgun.is/rpg
# Production: https://gw.borgun.is/rpg      (confirm with Teya before go-live)
SALTPAY_RPG_BASE_URL=https://test.borgun.is/rpg
SALTPAY_RPG_PUBLIC_KEY=<from Teya>
SALTPAY_RPG_PRIVATE_KEY=<from Teya — secret>

# Optional: override the Authorization header format if Teya confirms
# something other than "Basic base64(public:private)". Values:
#   basic_pair    (default) → Basic base64("publicKey:privateKey")
#   basic_private           → Basic base64("privateKey")
#   basic_private_colon     → Basic base64("privateKey:")
# SALTPAY_RPG_AUTH_MODE=basic_pair

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

Vercel calls it with `Authorization: Bearer $CRON_SECRET`. While
`SALTPAY_RPG_PRIVATE_KEY` is blank, every eligible row returns
`action: "skipped_rpg_stub"` — no charges, no status flips. Safe to ship
today.

To smoke-test locally:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/renew-memberships
```

### How renewals actually flow

1. Cron picks every subscription with `next_billing_date <= now()` and
   status in `active` or `grace_period`.
2. For each row, the cron reads `membership_payment_methods` and calls
   `mitChargeRenewal()`:
   - **First renewal:** `rpg_multi_token` is null, so the helper POSTs the
     `virtual_card_number` to `/api/token/multi` to mint an RPG MultiToken,
     then POSTs `/api/payment` with `PaymentType: "TokenMulti"`. The cron
     persists the fresh token to `rpg_multi_token`.
   - **Every later renewal:** straight to `/api/payment` with the stored
     MultiToken — no bootstrap step.
3. On success: extend `current_period_end` +1 month, extend the tribe card.
4. On soft decline: schedule a retry (day +3, then day +7, then `past_due`).
5. On hard decline (bad card, fraud, etc.): go straight to `past_due` and
   expire the tribe card.

---

## 4. What's live once you deploy

| Route | Method | Purpose |
|---|---|---|
| `/membership` | GET | Landing page, three tier cards, Patron slider |
| `/is/membership` | GET | Icelandic mirror (same component, locale-switched) |
| `/api/membership/join-free` | POST | Instant free-tier activation (auth) |
| `/api/membership/checkout` | POST | Starts Tribe/Patron checkout → Teya URL |
| `/api/membership/saltpay-callback` | POST | Teya server-to-server webhook (only source of truth) |
| `/api/membership/cancel` | POST | Cancel-at-period-end (paid) / immediate (free) |
| `/api/cron/renew-memberships` | GET | Daily renewal + dunning (cron-only) |

The webhook captures the SaveCard virtual card number and issues a
`tribe_cards` row with `source = 'paid-tribe'`, so paid members immediately
get the discount card the rest of the system already understands.

---

## 5. Sandbox verification

Before flipping production, run a Tribe signup end-to-end against test MID
`9256684` with card `4176 6699 9900 0104`, exp `12/31`, CVV `012`. Confirm:

1. Redirect to Teya SecurePay, submit the card.
2. Webhook fires → `membership_subscriptions.status = 'active'`.
3. `membership_payment_methods` has a `virtual_card_number` (not a raw PAN).
4. `tribe_cards` has a row with `source = 'paid-tribe'`.
5. Fast-forward `next_billing_date` to today in the DB:
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
7. Inspect `membership_payment_events` — you should see
   `renewal_attempted` → `renewal_succeeded`, and the
   `membership_payment_methods.rpg_multi_token` column is now populated.
8. Hit the cron a second time after fast-forwarding again — this time the
   charge skips the token-create step (no `newRpgMultiToken` in the raw log).

If the first run fails with `HTTP 401 Unauthorized`, Teya's auth format is
different from the default `basic_pair`. Try the overrides in the env var
comments (`basic_private`, `basic_private_colon`) before contacting Teya.

---

## 6. Remaining work

1. **Production RPG base URL** — confirm with Teya whether it's
   `https://gw.borgun.is/rpg` or a different host before go-live.
2. **Auth-format confirmation** — the Swagger spec doesn't state the exact
   `Authorization` encoding. We default to
   `Basic base64(publicKey:privateKey)`; if the sandbox rejects with 401,
   flip `SALTPAY_RPG_AUTH_MODE` to `basic_private` or
   `basic_private_colon`.
3. **Member profile UI** — add a "Membership" block to `/profile` showing
   tier, next bill date, and a Cancel button wiring to
   `/api/membership/cancel`.

---

## 7. Where to look when something breaks

- `membership_payment_events` is the first stop. Every webhook hit, every
  renewal attempt, every dunning decision leaves a row. Query:
  ```sql
  select created_at, event_type, message, action_code, order_id
  from membership_payment_events
  where member_email = 'x@y.com'
  order by created_at desc;
  ```
- Teya dashboards (`portal.teya.is`) for what actually reached them.
- Vercel function logs for webhook crashes (we always reply 200 so Teya
  doesn't retry forever, but errors land in `webhook_rejected`).
- If a renewal keeps failing with `action_code: null, reason: "http_error"`,
  the RPG credentials are probably wrong. A `notImplemented: true,
  reason: "rpg_not_configured"` means the env vars are blank — the cron
  stays in safe-skip mode.
