-- Private Session — Healing Sessions Booking System Migration
-- ============================================================
-- Booking system for visiting healers offering private sessions at /private-session.
-- The first practitioner is a teacher visiting from Guatemala. Mama holds the
-- container; practitioners are guest offerings during short residencies.
--
-- Cash-only: no online payment. Payment happens in person after the session.
--
-- Slot model: a slot is the practitioner's availability window. The client picks
-- one of the offerings allowed in that slot at booking time. Booking the slot
-- closes it for all of its offerings (one booking per slot).
--
-- Location flow: actual_location starts NULL. The booking manager fills it in
-- per slot. A cron job runs the day before each session and either emails the
-- client the location (if set) or escalates to Mama (if still NULL).
--
-- Status machine for private_session_bookings.status:
--   confirmed   → slot booked, confirmation email sent
--   cancelled   → cancelled by admin or client
--   completed   → session date passed and happened
--   no_show     → client didn't arrive
--
-- Status machine for private_session_slots.status:
--   available   → bookable
--   booked      → has an active booking
--   cancelled   → admin removed it (e.g. practitioner changed plans)
--   completed   → past, had a session
--
-- Status machine for private_session_waitlist.status:
--   waiting     → in queue
--   offered     → claim link sent, 6h window open
--   claimed     → converted to a real booking
--   expired     → 6h passed without a claim
--   declined    → client opted out
--   removed     → admin removed
--
-- Reference ID format: PSESS-{timestamp}-{random}  (matches PS- / WL- pattern)
-- Auth: handled in API routes via NextAuth — no RLS policies (consistent with private_space_bookings)
-- Calendar: rendered in-app in the admin dashboard from this data; no external calendar API.

-- ── Practitioners ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS private_session_practitioners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  country_of_origin TEXT,
  bio_md TEXT,                              -- markdown
  photo_url TEXT,                           -- Cloudinary URL (uploads handled separately)
  residency_start DATE,
  residency_end DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INT NOT NULL DEFAULT 0,
  meta_seo_title TEXT,
  meta_seo_description TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (residency_end IS NULL OR residency_start IS NULL OR residency_end >= residency_start)
);

-- ── Offerings (per practitioner) ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS private_session_offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES private_session_practitioners(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description_md TEXT,                      -- markdown
  modality TEXT,                            -- e.g. "Sound healing" | "Cacao ceremony" | "Breathwork"
  duration_minutes INT NOT NULL,
  price_isk INT NOT NULL DEFAULT 0,         -- display only — payment is cash in person
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INT NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (duration_minutes > 0)
);

-- ── Slots (practitioner availability windows) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS private_session_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES private_session_practitioners(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'available', -- available | booked | cancelled | completed
  published_area TEXT,                      -- vague hint shown publicly e.g. "Reykjavík 101" (optional)
  actual_location TEXT,                     -- NULLABLE — booking manager fills in per slot
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (ends_at > starts_at)
);

-- ── Slot ↔ Offering join (which offerings are bookable within each slot) ──────
-- When a slot is created the admin can tick which of the practitioner's offerings
-- are bookable in that window. Default behaviour in the app: link all active
-- offerings of the practitioner.
CREATE TABLE IF NOT EXISTS private_session_slot_offerings (
  slot_id UUID NOT NULL REFERENCES private_session_slots(id) ON DELETE CASCADE,
  offering_id UUID NOT NULL REFERENCES private_session_offerings(id) ON DELETE CASCADE,
  PRIMARY KEY (slot_id, offering_id)
);

-- ── Bookings ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS private_session_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id TEXT UNIQUE NOT NULL,        -- PSESS-{timestamp}-{random}

  -- One booking per slot. Offering is chosen at booking time.
  slot_id UUID NOT NULL UNIQUE REFERENCES private_session_slots(id) ON DELETE RESTRICT,
  offering_id UUID NOT NULL REFERENCES private_session_offerings(id) ON DELETE RESTRICT,

  -- Client contact
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  client_note TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'confirmed', -- confirmed | cancelled | completed | no_show

  -- Email audit trail
  confirmation_email_sent_at TIMESTAMPTZ,
  day_before_email_sent_at TIMESTAMPTZ,    -- set when client received the location reveal
  location_alert_sent_at TIMESTAMPTZ,      -- set when Mama was emailed because location was still NULL

  -- Cancellation
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  cancelled_by TEXT,                        -- "client" | "admin"

  -- i18n + freeform
  language TEXT NOT NULL DEFAULT 'en',
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Waitlist ──────────────────────────────────────────────────────────────────
-- Per offering by default. Optionally pinned to a specific slot.
CREATE TABLE IF NOT EXISTS private_session_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offering_id UUID NOT NULL REFERENCES private_session_offerings(id) ON DELETE CASCADE,
  slot_id UUID REFERENCES private_session_slots(id) ON DELETE SET NULL,

  -- Client contact
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  client_note TEXT,

  -- Lifecycle
  status TEXT NOT NULL DEFAULT 'waiting',   -- waiting | offered | claimed | expired | declined | removed
  offered_at TIMESTAMPTZ,
  offer_expires_at TIMESTAMPTZ,             -- 6h after offered_at
  claim_token TEXT UNIQUE,                  -- generated when status -> offered

  language TEXT NOT NULL DEFAULT 'en',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pses_practitioners_slug ON private_session_practitioners(slug);
CREATE INDEX IF NOT EXISTS idx_pses_practitioners_active ON private_session_practitioners(is_active);
CREATE INDEX IF NOT EXISTS idx_pses_practitioners_display_order ON private_session_practitioners(display_order);

CREATE INDEX IF NOT EXISTS idx_pses_offerings_practitioner ON private_session_offerings(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_pses_offerings_active ON private_session_offerings(is_active);

CREATE INDEX IF NOT EXISTS idx_pses_slots_practitioner_starts ON private_session_slots(practitioner_id, starts_at);
CREATE INDEX IF NOT EXISTS idx_pses_slots_status ON private_session_slots(status);
CREATE INDEX IF NOT EXISTS idx_pses_slots_starts_at ON private_session_slots(starts_at);

CREATE INDEX IF NOT EXISTS idx_pses_slot_offerings_offering ON private_session_slot_offerings(offering_id);

CREATE INDEX IF NOT EXISTS idx_pses_bookings_reference ON private_session_bookings(reference_id);
CREATE INDEX IF NOT EXISTS idx_pses_bookings_email ON private_session_bookings(client_email);
CREATE INDEX IF NOT EXISTS idx_pses_bookings_status ON private_session_bookings(status);
CREATE INDEX IF NOT EXISTS idx_pses_bookings_offering ON private_session_bookings(offering_id);
CREATE INDEX IF NOT EXISTS idx_pses_bookings_created_at ON private_session_bookings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pses_waitlist_offering ON private_session_waitlist(offering_id);
CREATE INDEX IF NOT EXISTS idx_pses_waitlist_status ON private_session_waitlist(status);
CREATE INDEX IF NOT EXISTS idx_pses_waitlist_claim_token ON private_session_waitlist(claim_token);
CREATE INDEX IF NOT EXISTS idx_pses_waitlist_created_at ON private_session_waitlist(created_at);

-- ── Updated-at triggers ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_private_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pses_practitioners_updated_at ON private_session_practitioners;
CREATE TRIGGER trg_pses_practitioners_updated_at
  BEFORE UPDATE ON private_session_practitioners
  FOR EACH ROW EXECUTE FUNCTION update_private_session_updated_at();

DROP TRIGGER IF EXISTS trg_pses_offerings_updated_at ON private_session_offerings;
CREATE TRIGGER trg_pses_offerings_updated_at
  BEFORE UPDATE ON private_session_offerings
  FOR EACH ROW EXECUTE FUNCTION update_private_session_updated_at();

DROP TRIGGER IF EXISTS trg_pses_slots_updated_at ON private_session_slots;
CREATE TRIGGER trg_pses_slots_updated_at
  BEFORE UPDATE ON private_session_slots
  FOR EACH ROW EXECUTE FUNCTION update_private_session_updated_at();

DROP TRIGGER IF EXISTS trg_pses_bookings_updated_at ON private_session_bookings;
CREATE TRIGGER trg_pses_bookings_updated_at
  BEFORE UPDATE ON private_session_bookings
  FOR EACH ROW EXECUTE FUNCTION update_private_session_updated_at();

DROP TRIGGER IF EXISTS trg_pses_waitlist_updated_at ON private_session_waitlist;
CREATE TRIGGER trg_pses_waitlist_updated_at
  BEFORE UPDATE ON private_session_waitlist
  FOR EACH ROW EXECUTE FUNCTION update_private_session_updated_at();
