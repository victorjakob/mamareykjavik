-- Add language column to whitelotus_bookings table
-- This stores the language preference (is/en) when the booking was submitted

ALTER TABLE whitelotus_bookings
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'is';

-- Create index for language lookups if needed
CREATE INDEX IF NOT EXISTS idx_whitelotus_bookings_language 
ON whitelotus_bookings(language);

