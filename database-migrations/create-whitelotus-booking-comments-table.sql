-- White Lotus Booking Section Comments Table Migration
-- =====================================================
-- This table stores section-specific comments from customers
-- and allows admins to accept/decline them
--
-- Sections:
-- - guest_count: Comments about guest count
-- - services: Comments about selected services
-- - food: Comments about food
-- - drinks: Comments about drinks
-- - room_setup: Comments about room setup
-- - tech_and_music: Comments about tech and music
-- - tablecloth: Comments about tablecloth/decorations
-- - notes: Comments about general notes
-- - event_info: Comments about event information
-- - contact: Comments about contact information
--
-- Status: pending, accepted, declined

CREATE TABLE whitelotus_booking_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES whitelotus_bookings(id) ON DELETE CASCADE,
  section TEXT NOT NULL, -- guest_count, services, food, drinks, room_setup, tech_and_music, tablecloth, notes, event_info, contact
  comment TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, accepted, declined
  admin_response TEXT, -- Admin's response/answer to the comment
  created_by_email TEXT NOT NULL, -- Customer email who created the comment
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by TEXT, -- Admin email who reviewed
  reviewed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_whitelotus_booking_comments_booking_id ON whitelotus_booking_comments(booking_id);
CREATE INDEX IF NOT EXISTS idx_whitelotus_booking_comments_section ON whitelotus_booking_comments(booking_id, section);
CREATE INDEX IF NOT EXISTS idx_whitelotus_booking_comments_status ON whitelotus_booking_comments(status);
CREATE INDEX IF NOT EXISTS idx_whitelotus_booking_comments_created_at ON whitelotus_booking_comments(created_at DESC);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_whitelotus_booking_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER whitelotus_booking_comments_updated_at
  BEFORE UPDATE ON whitelotus_booking_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_whitelotus_booking_comments_updated_at();

