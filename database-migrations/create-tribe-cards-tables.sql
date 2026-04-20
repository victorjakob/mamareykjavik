-- Tribe Cards System Migration
-- =============================
-- Two tables power the Tribe Card system:
--
--  1. tribe_card_requests — public submissions from /tribe-card/request
--     Admin reviews in /admin/cards/tribe-cards and approves/rejects.
--
--  2. tribe_cards — issued cards (one per holder_email, unique)
--     Each has an access_token for the public /tribe-card/[token] view,
--     a discount_percent (e.g. 15, 20, 25) and a duration.
--
-- Conventions match meal_cards / gift_cards / custom_cards:
--   - No RLS; authorization is enforced in API routes (NextAuth admin check).
--   - updated_at is maintained by a trigger.
--   - metadata JSONB is kept for future flexibility (e.g. paid-tribe fields).
--
-- This file is intended to be applied once. It is idempotent where possible
-- (IF NOT EXISTS on tables / indexes / columns), but re-running after the
-- schema changes may need manual reconciliation.

-- ─── Requests table ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tribe_card_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Submitter info (from the public request form)
  name  TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,

  -- Review lifecycle
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, approved, rejected
  review_notes  TEXT,
  reviewed_by   TEXT,                      -- admin email / name
  reviewed_at   TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_tribe_card_requests_status     ON tribe_card_requests(status);
CREATE INDEX IF NOT EXISTS idx_tribe_card_requests_email      ON tribe_card_requests(email);
CREATE INDEX IF NOT EXISTS idx_tribe_card_requests_created_at ON tribe_card_requests(created_at DESC);

-- ─── Cards table ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tribe_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Public access token for /tribe-card/[token]
  access_token UUID NOT NULL DEFAULT gen_random_uuid(),

  -- Holder info (email is the primary link key — one card per email)
  holder_email TEXT NOT NULL,
  holder_name  TEXT NOT NULL,
  holder_phone TEXT,

  -- Linked user_id when the holder has (or creates) a mama.is account.
  -- References auth.users; set ON DELETE SET NULL so removing a user
  -- doesn't orphan the card — the email still links it back.
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Discount and validity
  discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  duration_type    TEXT    NOT NULL CHECK (duration_type IN ('month','6months','year','unlimited')),
  issued_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,  -- NULL for unlimited

  -- Lifecycle and source
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','expired','revoked')),
  source TEXT NOT NULL DEFAULT 'legacy'
    CHECK (source IN ('legacy','paid-tribe','gift','friends-family','other')),

  -- Link back to the request this card was issued from (nullable for
  -- cards created manually by admin)
  request_id UUID REFERENCES tribe_card_requests(id) ON DELETE SET NULL,

  -- Admin notes + future fields
  notes    TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One active card per email. A holder can in theory hold only one card at a time.
-- (Revoked / expired cards don't block issuing a new one, because we update
--  the existing row on re-issue rather than inserting a new one.)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_tribe_cards_holder_email ON tribe_cards(holder_email);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_tribe_cards_access_token ON tribe_cards(access_token);
CREATE INDEX IF NOT EXISTS idx_tribe_cards_status     ON tribe_cards(status);
CREATE INDEX IF NOT EXISTS idx_tribe_cards_user_id    ON tribe_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_tribe_cards_expires_at ON tribe_cards(expires_at);

-- ─── updated_at trigger ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_tribe_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tribe_card_requests_updated_at ON tribe_card_requests;
CREATE TRIGGER tribe_card_requests_updated_at
  BEFORE UPDATE ON tribe_card_requests
  FOR EACH ROW EXECUTE FUNCTION update_tribe_updated_at();

DROP TRIGGER IF EXISTS tribe_cards_updated_at ON tribe_cards;
CREATE TRIGGER tribe_cards_updated_at
  BEFORE UPDATE ON tribe_cards
  FOR EACH ROW EXECUTE FUNCTION update_tribe_updated_at();

-- ─── Documentation ───────────────────────────────────────────────────────────
COMMENT ON TABLE  tribe_card_requests IS 'Public submissions from /tribe-card/request. Reviewed by admin.';
COMMENT ON TABLE  tribe_cards         IS 'Issued tribe cards. One per holder_email. Public view via access_token.';
COMMENT ON COLUMN tribe_cards.access_token     IS 'Unique token for /tribe-card/[token] public access (no login required).';
COMMENT ON COLUMN tribe_cards.duration_type    IS 'month | 6months | year | unlimited. Drives expires_at calculation at approval/edit time.';
COMMENT ON COLUMN tribe_cards.source           IS 'legacy (grandfathered), paid-tribe (future subscription), gift, friends-family, other.';
COMMENT ON COLUMN tribe_cards.user_id          IS 'Linked auth.users.id when holder has a mama.is account. Populated on signup/login or manually.';
