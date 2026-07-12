-- Membership Waitlist Migration
-- =============================
-- "Notify me" capture for membership tiers that aren't open yet (today:
-- High Ticket / patron). The public POST /api/membership/waitlist route
-- inserts here; the admin subscribers dashboard reads it as the "waitlist"
-- source pool (see BUSINESS_POOLS in src/lib/subscribers.js).
--
-- One row per (email, tier) — repeat submissions are silent no-ops, which
-- keeps the public endpoint rate-limit friendly.
--
-- Conventions match create-memberships-tables.sql:
--   - No RLS; authorization is enforced in API routes.
--   - Idempotent (IF NOT EXISTS) so re-running is safe.

CREATE TABLE IF NOT EXISTS membership_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  email  TEXT NOT NULL,
  name   TEXT,
  note   TEXT,

  -- Which tier they want to hear about. Defaults to the only gated tier.
  tier   TEXT NOT NULL DEFAULT 'patron',

  locale TEXT,                       -- 'en' | 'is' — language they signed up in
  source TEXT,                       -- where the form lived, e.g. 'membership_page'

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (email, tier)
);

CREATE INDEX IF NOT EXISTS idx_membership_waitlist_tier ON membership_waitlist(tier);

-- ─── Documentation ───────────────────────────────────────────────────────────
COMMENT ON TABLE  membership_waitlist       IS '"Notify me" signups for membership tiers not yet open (High Ticket / patron).';
COMMENT ON COLUMN membership_waitlist.tier  IS 'Tier the visitor wants news about. Unique together with email.';
