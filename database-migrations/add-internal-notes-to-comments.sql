-- Add is_internal column to whitelotus_booking_comments table
-- This allows admins to create internal notes that are only visible to other admins

ALTER TABLE whitelotus_booking_comments
ADD COLUMN IF NOT EXISTS is_internal BOOLEAN DEFAULT FALSE;

-- Create index for filtering internal notes
CREATE INDEX IF NOT EXISTS idx_whitelotus_booking_comments_is_internal 
ON whitelotus_booking_comments(booking_id, section, is_internal);

