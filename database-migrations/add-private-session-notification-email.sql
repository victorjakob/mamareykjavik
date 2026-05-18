-- Per-practitioner notification email (optional).
-- When set, every booking and waitlist admin email is also CC'd to this
-- address — on top of the global team addresses hardcoded in the booking
-- route (mama.reykjavik@gmail.com + team@whitelotus.is).
--
-- Applied to Supabase already; this file is the canonical record.

ALTER TABLE private_session_practitioners
  ADD COLUMN IF NOT EXISTS notification_email TEXT;

COMMENT ON COLUMN private_session_practitioners.notification_email IS
  'Optional. Extra recipient for booking + waitlist admin notifications.';
