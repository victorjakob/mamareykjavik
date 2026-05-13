-- The Private Space — Booking Tables Migration
-- ==============================================
-- Stores booking requests, recurring subscriptions, and admin-blocked dates
-- for the rentable wellness room ("Einkarýmið" / The Private Space) at /private-space.
--
-- Status machine for private_space_bookings.status:
--   pending      → request submitted by renter, admin has not reviewed
--   approved     → admin approved, payment link emailed, slot reserved-soft
--   declined     → admin declined, slot released
--   paid         → renter paid via SecurePay or RPG, slot locked-hard (terminal-success)
--   completed    → booking date passed
--   cancelled    → renter or admin cancelled (refund flag in metadata)
--   refunded     → refund issued via Teya
-- NOTE: A `confirmed` state existed in an earlier draft of this ladder but
-- was retired in favour of `paid` (single source of truth for "the room is
-- yours"). Active availability queries should treat ("approved","paid") as
-- the busy set.
--
-- Reference ID format: PS-{timestamp}-{random}  (matches WL- pattern)
-- Auth: handled in API routes via NextAuth — no RLS policies (consistent with whitelotus_bookings)

CREATE TABLE IF NOT EXISTS private_space_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id TEXT UNIQUE NOT NULL,

  -- Contact
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,

  -- Practice details
  practice_type TEXT NOT NULL,            -- "therapy" | "coaching" | "circle" | "shoot" | "lesson" | "other"
  practice_description TEXT,              -- free text "what will happen here"
  group_size INT NOT NULL DEFAULT 1,      -- max 10

  -- Booking type + scheduling
  booking_type TEXT NOT NULL,             -- "hourly" | "half_day" | "full_day" | "recurring_weekly"
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,

  -- Recurring (only set when booking_type = "recurring_weekly")
  recurrence_weekday SMALLINT,            -- 0=Mon .. 6=Sun
  recurrence_start_time TIME,
  recurrence_duration_minutes INT,
  recurrence_end_date DATE,               -- null = open-ended

  -- Pricing
  total_amount_isk INT NOT NULL,          -- snapshot of price at request time
  promo_code TEXT,
  discount_amount_isk INT DEFAULT 0,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  decline_reason TEXT,
  admin_notes TEXT,

  -- Payment (Teya)
  payment_method TEXT,                    -- "securepay" | "rpg" | "invoice"
  securepay_orderid TEXT,
  securepay_refundid TEXT,                -- 10-digit gateway id (NOT the auth code — see memory)
  rpg_multitoken TEXT,
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,

  -- i18n
  language TEXT NOT NULL DEFAULT 'is',

  -- Snapshot
  booking_data JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Recurring subscriptions (parent record + monthly RPG charges)
CREATE TABLE IF NOT EXISTS private_space_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES private_space_bookings(id) ON DELETE SET NULL,

  -- Renter snapshot (so subscription survives even if booking row is removed)
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,

  -- Schedule
  weekday SMALLINT NOT NULL,              -- 0=Mon .. 6=Sun
  start_time TIME NOT NULL,
  duration_minutes INT NOT NULL,

  -- Billing
  monthly_amount_isk INT NOT NULL,
  rpg_multitoken TEXT NOT NULL,
  next_charge_at TIMESTAMPTZ NOT NULL,

  -- Lifecycle
  status TEXT NOT NULL DEFAULT 'active',  -- active | paused | cancelled | failed
  cancelled_at TIMESTAMPTZ,
  cancellation_effective_at TIMESTAMPTZ,  -- 30-day notice
  last_charge_at TIMESTAMPTZ,
  failed_charge_count INT DEFAULT 0,

  -- Metadata
  language TEXT NOT NULL DEFAULT 'is',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Admin-blocked dates (Mama's own use, holidays, maintenance, private events)
CREATE TABLE IF NOT EXISTS private_space_blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  reason TEXT,
  blocked_by_email TEXT,                  -- admin user email for audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (end_at > start_at)
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ps_bookings_reference_id ON private_space_bookings(reference_id);
CREATE INDEX IF NOT EXISTS idx_ps_bookings_email ON private_space_bookings(contact_email);
CREATE INDEX IF NOT EXISTS idx_ps_bookings_status ON private_space_bookings(status);
CREATE INDEX IF NOT EXISTS idx_ps_bookings_start_at ON private_space_bookings(start_at);
CREATE INDEX IF NOT EXISTS idx_ps_bookings_created_at ON private_space_bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ps_bookings_securepay_orderid ON private_space_bookings(securepay_orderid);

CREATE INDEX IF NOT EXISTS idx_ps_subs_status ON private_space_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_ps_subs_next_charge_at ON private_space_subscriptions(next_charge_at);
CREATE INDEX IF NOT EXISTS idx_ps_subs_email ON private_space_subscriptions(contact_email);

CREATE INDEX IF NOT EXISTS idx_ps_blocked_start_at ON private_space_blocked_dates(start_at);
CREATE INDEX IF NOT EXISTS idx_ps_blocked_end_at ON private_space_blocked_dates(end_at);

-- ── Updated-at triggers ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_private_space_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ps_bookings_updated_at ON private_space_bookings;
CREATE TRIGGER trg_ps_bookings_updated_at
  BEFORE UPDATE ON private_space_bookings
  FOR EACH ROW EXECUTE FUNCTION update_private_space_updated_at();

DROP TRIGGER IF EXISTS trg_ps_subs_updated_at ON private_space_subscriptions;
CREATE TRIGGER trg_ps_subs_updated_at
  BEFORE UPDATE ON private_space_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_private_space_updated_at();
