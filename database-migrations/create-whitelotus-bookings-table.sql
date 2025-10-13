-- White Lotus Bookings Table Migration
-- =====================================
-- This table stores all booking requests for the White Lotus venue
-- 
-- Features:
-- - Stores structured booking data with separate fields for common queries
-- - Keeps full booking JSON in booking_data for complete audit trail
-- - Includes comments for each section (services, food, drinks, etc.)
-- - Automatic updated_at timestamp via trigger
-- - Indexed for fast lookups by reference_id, email, date, and status
--
-- Note: No RLS policies - authorization is handled in API routes via NextAuth
--
-- Usage:
-- - API route: /api/wl/booking
-- - Reference ID format: WL-{timestamp}-{random}
-- - Default status: pending (can be: pending, confirmed, cancelled)

CREATE TABLE whitelotus_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id TEXT UNIQUE NOT NULL,
  
  -- Contact Information
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  
  -- Date and Time
  preferred_datetime TIMESTAMPTZ,
  start_time TEXT,
  end_time TEXT,
  datetime_comment TEXT,
  
  -- Services
  services JSONB DEFAULT '[]'::jsonb,
  services_comment TEXT,
  
  -- Food
  food TEXT,
  food_details JSONB,
  food_comment TEXT,
  
  -- Drinks
  drinks JSONB,
  drinks_comment TEXT,
  
  -- Guest Information
  guest_count TEXT,
  guest_count_comment TEXT,
  
  -- Room Setup
  room_setup TEXT,
  room_setup_comment TEXT,
  
  -- Tablecloth
  tablecloth TEXT,
  tablecloth_comment TEXT,
  
  -- Additional Notes
  notes TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, confirmed, cancelled
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  
  -- Full booking data (for reference)
  booking_data JSONB NOT NULL
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_whitelotus_bookings_reference_id ON whitelotus_bookings(reference_id);
CREATE INDEX IF NOT EXISTS idx_whitelotus_bookings_email ON whitelotus_bookings(contact_email);
CREATE INDEX IF NOT EXISTS idx_whitelotus_bookings_datetime ON whitelotus_bookings(preferred_datetime);
CREATE INDEX IF NOT EXISTS idx_whitelotus_bookings_status ON whitelotus_bookings(status);
CREATE INDEX IF NOT EXISTS idx_whitelotus_bookings_created_at ON whitelotus_bookings(created_at DESC);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_whitelotus_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER whitelotus_bookings_updated_at
  BEFORE UPDATE ON whitelotus_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_whitelotus_bookings_updated_at();

