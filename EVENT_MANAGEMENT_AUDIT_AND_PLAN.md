# Event Management — Audit & Implementation Plan

_Scope: the event‑management surface of the mamareykjavik app (`/events/manager` and everything attached to it), plus the host email, and a new no‑login "magic link" to manage a single event._

_Status: **building** — Phase 0 code is ready (migration not yet applied). Decisions locked 2026-06-29: hub URL `/events/[slug]/manage`; the link gives **full access** to one event, **permanent and resettable**, exchanged for a **90-day** httpOnly cookie. **Refunds are not a live feature** (Teya/SecurePay never worked, unused) — so the link moves no money and the dead refund UI gets removed. **De-duplication is in scope** (Phase 4)._

---

## TL;DR

Event management today is spread across **two parallel systems that share almost no code** (an admin set and a host set), with **four disconnected per‑event pages** and **login required for everything**. The host email sends people to a generic dashboard with no event context.

We will build **one per‑event hub** — a single, tabbed page (Overview · Attendees · Ticket sales · Door check‑in · Edit) — reachable two ways: while logged in (as today), or via a **tokenised link in the host email that needs no login**. The token reuses a pattern your codebase already runs in production (gift/tribe/meal cards), and the access check plugs into the one helper that already guards the door system. The duplicated admin/create code is left untouched in this pass and scheduled as a later clean‑up.

---

# Part 1 — Audit (current state)

## 1.1 There are two parallel event systems

| Area | Admin side | Host side |
|---|---|---|
| List / manage events | `src/app/admin/manage-events/ManageEvents.jsx` (~400 lines) | `src/app/events/manager/ManageEvents.jsx` (~490 lines) |
| Create / edit | `src/app/admin/create-event/` (full: Facebook import, recurring series, variants) | `src/app/events/manager/[slug]/edit/` (slimmer editor) |
| Form components | `admin/create-event/components/*` | `events/manager/[slug]/edit/components/*` |
| Form hook | `useEventForm.js` (~600 lines) | `useEditEventForm.js` (~590 lines) |

The two `ManageEvents.jsx` files are independent implementations of the same screen. The create and edit flows duplicate **~9 form components** (FormField, FormSection, ImageUpload, PaymentMethodSelector, HostSelector, EarlyBirdPricing, SlidingScalePricing, TicketVariants, SubmitButton) and **two near‑identical Zod schemas**. Estimated **~3,700 lines of copy‑paste**. This is the "different versions / wild" feeling — it's real, and it's the root cause.

**Asymmetry that bites:** Facebook import, recurring‑series, and some variant handling exist **only** in the admin create flow. A host editing their own event afterwards can't reach those. Series, once created, can only be edited from a separate `/admin/manage-series` screen.

## 1.2 The per‑event experience is disconnected

For a single event there are four standalone pages, each reached by its own button on the event card and with **no shared navigation between them**:

- `…/[slug]/attendance` — buyer list, check‑in, refunds, "message all", mark sold‑out (~760 lines, `Attendance.jsx`)
- `…/[slug]/sales-stats` — revenue by method, daily chart, host/venue split calculator (~415 lines)
- `…/[slug]/gatekeeper` — the door check‑in kiosk (well‑built; see 1.5)
- `…/[slug]/edit` — the edit form

To move from "who's coming" to "how much did we make" you go **back to the list and re‑enter**. There is no tab bar, no breadcrumb, no "back to event." That's the single biggest UX problem and the easiest big win.

## 1.3 Access is login‑only, and email points nowhere specific

Every entry point requires a NextAuth session. The host‑created email currently sends a generic button:

```js
// src/app/api/events/create-event/route.js  (lines ~242–249)
managerUrl: "https://mama.is/events/manager",
```

```jsx
// src/emails/templates/EventCreatedHostNotification.jsx  (line 62)
<BrandButton href={managerUrl}>Open event manager</BrandButton>
```

So a host must already have an account, log in, and then find their event in a list. For a guest host running one workshop, that's friction we can remove.

## 1.4 Data model (confirmed from code + migrations)

- **`events`** — `id`, `slug`, `name`, `shortdescription`, `description`, `date`, `duration`, `location`, `price`, `capacity`, early‑bird + sliding‑scale fields, `payment` (`online`/`door`/`free`), **`host`** (email), **`host_secondary`** (email), `facebook_link`, `image`, `sold_out`, `series_id`, `created_by`, `created_at`.
- **`tickets`** — one row per order: `event_id`, `order_id`, `buyer_name`, `buyer_email`, `quantity`, `price`, `total_price`, `status` (`pending`/`paid`/`door`/`cash`/`card`/`transfer`/`cancelled`), `used` (checked‑in), `variant_name`, `transaction_id` (Teya/SaltPay), `payment_payload`, `refund_status`/`refund_amount`/`refunded_at`, plus gatekeeper fields (`gatekeeper`, `gatekeeper_tip`, `gatekeeper_note`, `gatekeeper_receipt_requested`).
- **`ticket_variants`** — `event_id`, `name`, `price`, `capacity`, `meta`.
- **`event_series`** — parent of recurring events; events link via `series_id`.
- **`gatekeeper_configs`** — per event: `pin_hash`, `enabled_methods`, `bank_details`, `tip_enabled`, `receipt_enabled`, `activated_at`, `closed_at`, `wrap_sent_at`.
- **`users`** — `email`, `password`, `name`, `role` (`admin`/`host`/`user`), `provider`.

**Ownership is by email, not user id.** A user becomes a "host" automatically at sign‑in if their email matches any event's `host`/`host_secondary` (`src/lib/authOptions.js`). There is no `event_hosts` join table.

## 1.5 What's actually good (keep, don't rebuild)

- **The gatekeeper / door system** is the best‑built piece here: a clean PIN‑gated state machine, a shared server helper, a kiosk back‑guard, and a post‑event "wrap" email. We reuse it as‑is and simply surface it as a tab.
- **A token‑without‑login pattern already ships in production.** Gift, tribe, meal and custom cards authorise by an `access_token` column looked up at `…/by-token/[token]`:
  ```js
  // src/app/api/custom-cards/by-token/[token]/route.js
  const { data: card } = await supabase
    .from("custom_cards").select("*").eq("access_token", token).single();
  ```
  This is exactly the model we want for event management, and it matches the owner's choice (permanent, resettable, full access).
- **One auth chokepoint already exists** for the door system and is trivially generalisable:
  ```js
  // src/app/api/events/gatekeeper/_lib.js
  export async function resolveGatekeeperContext(slug) {
    const session = await getServerSession(authOptions);
    // …looks up event, compares email to host/host_secondary, returns { allowed }
  }
  ```
- **Email already runs on Resend**, not SendGrid — the `src/app/api/sendgrid/…` folder name is just legacy. The render+send pattern (`renderEmail()` → `resend.emails.send()`) is consistent and reusable.
- A signed‑token helper also exists (`src/lib/hostInvites.js`, HMAC‑SHA256 JWTs) if we ever prefer expiring tokens. For "permanent + resettable" the DB‑column approach is the better fit.

## 1.6 Risk flags found during the audit

- **Attendees & sales‑stats fetch event/ticket data client‑side** with no server‑side ownership check — they lean entirely on Supabase RLS. Worth confirming RLS is locked down; the new unified access helper (Part 2.3) is a chance to fix this properly.
- **Master PIN `"2323"` is hard‑coded** in `_lib.js` and always works. Fine for a door tool; just noting it exists.
- **No audit trail on refunds** — once we allow refunds via a no‑login link, we should record _who_ issued each refund (logged‑in user vs magic link).

---

# Part 2 — Target design

## 2.1 One per‑event hub

A single page that becomes the home for an event, with a horizontal tab bar:

| Tab | Reuses | Shows |
|---|---|---|
| **Overview** | new (thin) | Date, capacity vs sold, revenue snapshot, sold‑out toggle, the manage‑link controls (copy / reset), quick links |
| **Attendees** | existing `Attendance.jsx` | Buyer list, check‑in, refunds, message‑all |
| **Ticket sales** | existing `sales-stats` | Revenue by method, daily chart, host/venue split |
| **Door check‑in** | existing gatekeeper | Launches the kiosk / setup |
| **Edit** | existing edit form | Event details |

Same component, two ways in:
- **Logged in** → authorised by host/admin email match (as today).
- **Via email link** → authorised by the event token (no login).

Proposed canonical URL: **`/events/[slug]/manage`** (reads naturally, professional). The email link adds the token: `/events/[slug]/manage?k=TOKEN`. _(Route naming is a small open decision — see Part 5.)_

## 2.2 The magic link (full access · permanent · resettable)

- Add a single column **`events.manage_token`** — a 32‑byte URL‑safe random string, unique, indexed.
- Generated automatically when an event is created (and back‑filled for existing events by the migration).
- The host email links to `/events/[slug]/manage?k=<manage_token>`.
- **Permanent:** the token doesn't expire — the link in the host's inbox always works.
- **Resettable:** an "Reset link" action on the Overview tab regenerates the token, instantly invalidating the old link (for when a link is forwarded or leaked).

## 2.3 Unified access helper (the keystone)

Generalise the existing door‑system helper into one function every event‑management route uses:

```js
// new: src/lib/eventAccess.js
// returns { allowed, mode: 'session' | 'token' | null, event }
export async function resolveEventAccess(slug, { token, cookies }) {
  // 1) session host/admin match  (today's logic from _lib.js)
  // 2) OR valid event token  (k=… on first hit, or the scoped cookie after)
}
```

`resolveGatekeeperContext()` and the attendee/refund/sales APIs all call this. One place defines "who may manage this event," which also closes the client‑side‑fetch gap from 1.6.

## 2.4 Token → cookie exchange (clean URL + safer)

Because there's no login session on the email path, the token must authorise every API call. Rather than dragging `?k=TOKEN` through every request (and leaving it in browser history, referrer headers, and shoulder‑surfing range), the link is exchanged **once**:

1. Host opens `/events/[slug]/manage?k=TOKEN`.
2. Server validates the token against `events.manage_token`.
3. On match → set a **httpOnly, Secure, SameSite=Lax cookie** scoped to that one event id, then **redirect to the clean URL** `/events/[slug]/manage` (token disappears from the address bar).
4. Every `/api/events/…` call authorises via session **or** that cookie, through `resolveEventAccess`.

The DB token stays permanent; the cookie is a rolling 30–90 day convenience that re‑mints whenever the link is clicked again. Reset = regenerate the DB token; existing cookies for the old token stop validating.

## 2.5 Email change

Minimal, surgical:
- In `create-event/route.js`, build `manageUrl = ${BASE}/events/${slug}/manage?k=${manage_token}` and pass it instead of the generic `managerUrl`.
- In `EventCreatedHostNotification.jsx`, point the button at it and reword to **"Manage your event"** with a one‑line "no login needed — this link is yours, keep it safe" note.
- Same treatment can later extend to the paid/free ticket host notifications, which today also link to the generic manager.

## 2.6 Database migration

One new migration in the existing convention (`supabase/migrations/YYYYMMDDHHMMSS_*.sql`, mirroring `20260212130000_add_events_host_secondary.sql`):

```sql
alter table events add column if not exists manage_token text;
create unique index if not exists events_manage_token_key on events (manage_token);
-- back-fill existing rows with a random token (one-time update)
```

No other schema changes required.

---

# Part 3 — Phased roadmap

Each phase is independently shippable and reviewable.

**Phase 0 — Foundations (low risk, no visible change)**
1. Migration: `events.manage_token` + unique index + back‑fill.
2. `src/lib/eventAccess.js`: `resolveEventAccess(slug, {token, cookies})`.
3. Token is auto-issued by the column default — no create-event change needed (the insert already does `.select()`, so the token comes back for the email).

**Phase 1 — The hub shell**
4. New route `/events/[slug]/manage` with the tab bar + Overview tab.
5. Token→cookie exchange + clean‑URL redirect; "link invalid" fallback for bad/expired tokens.
6. Wire `resolveEventAccess` so the page renders for both session and token visitors.

**Phase 2 — Wire the tabs (reuse, don't rebuild)**
7. Mount existing Attendees, Ticket sales, Door check‑in, Edit inside the tabs.
8. Update the four event APIs they call to authorise via `resolveEventAccess` (session **or** cookie).
9. Unify check-in: the legacy desk-attendant manual check-in and the kiosk both write the same `tickets.used` state. Remove the dead refund UI from `Attendance.jsx`.

**Phase 3 — Email + link management**
10. Switch the host email to the tokenised "Manage your event" link.
11. "Copy link" + "Reset link" controls on the Overview tab.
12. Set `Referrer-Policy: no-referrer` on the manage route so the token can't leak via referrer.

**Phase 4 — Consolidation (separate, later; the sprawl clean‑up)**
13. Extract the ~9 duplicated form components into one shared `event-form/` set.
14. Merge the two `ManageEvents.jsx` into one role‑aware list.
15. Single shared Zod schema. Point both create and edit at the shared pieces.

Phases 0–3 deliver exactly what you described. Phase 4 is the "kill the duplication" work and can wait until the hub is proven.

---

# Part 4 — Security considerations (full‑access link)

A permanent, full-access link is sensitive (even though refunds aren't live), so:

- **High‑entropy token** (32 random bytes, URL‑safe), unique‑indexed; brute force is infeasible.
- **Token stripped from the URL** after the one‑time cookie exchange — keeps it out of history, referrer headers, and screenshots.
- **`Referrer-Policy: no-referrer`** on the manage route so the token never leaks to third‑party assets.
- **httpOnly + Secure + SameSite cookie**, scoped to a single event id (a link to event A can't touch event B).
- **Resettable / revocable** in one click from the Overview tab.
- **No money actions on the link** — refunds aren't a live feature, so the worst a leaked link allows is viewing/editing one event and door check-in; one reset kills it.
- **Don't log full manage URLs** in server logs / analytics.

Net: as convenient as the gift‑card links you already trust, scoped to a single event and revocable in one click.

---

# Part 5 — Decisions (locked 2026-06-29)

1. **Route**: `/events/[slug]/manage`.
2. **Cookie lifetime**: 90 days (the DB token stays permanent; this only sets how often a returning host re-clicks the email link).
3. **Refunds**: not a live feature and never worked (Teya/SecurePay). Dropped from scope — no refund gating, no refund-alert email — and the refund UI in `Attendance.jsx` is dead code to remove during dedup.
4. **De-duplication**: in scope, as Phase 4, right after the hub is proven.
5. **Check-in**: two systems today — the legacy desk-attendant manual check-in (`tickets.used`) and the newer kiosk. Unify so both write the same state; kiosk stays primary, manual stays as a low-tech fallback.

---

# Appendix — file‑by‑file change list (Phases 0–3)

**New**
- `supabase/migrations/<ts>_events_manage_token.sql` — column + index + back‑fill.
- `src/lib/eventAccess.js` — unified `resolveEventAccess`.
- `src/app/events/[slug]/manage/page.jsx` — hub shell + tabs + token/cookie entry.
- `src/app/events/[slug]/manage/` tab components (thin Overview; the rest mount existing screens).
- `src/app/api/events/[slug]/manage-link/route.js` — reset / regenerate token (host+admin only).

**Edited**
- `src/app/api/events/gatekeeper/_lib.js` — `resolveGatekeeperContext` delegates to `resolveEventAccess`.
- `src/app/api/events/create-event/route.js` — build + pass the tokenised `manageUrl` (token auto-generated by the column default).
- `src/emails/templates/EventCreatedHostNotification.jsx` — "Manage your event" tokenised button + copy.
- Attendee / refund / sales‑stats / sold‑out / gatekeeper APIs — authorise via `resolveEventAccess`.
- `Attendance.jsx` — remove the dead refund UI; unify its manual check-in with the kiosk state.

**Untouched in this pass**
- `src/app/admin/manage-events/*`, `src/app/admin/create-event/*` (Phase 4 territory).
- The gatekeeper kiosk UI and its flow (reused as a tab, not modified).
</content>
</invoke>
