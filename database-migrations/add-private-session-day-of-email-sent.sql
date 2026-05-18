-- Add throttle column for the day-of "address coming shortly" attendee email.
-- Used by /api/cron/private-session-reminders so it can't double-fire.
-- Applied to Supabase already; this file is the canonical record.

ALTER TABLE private_session_bookings
  ADD COLUMN IF NOT EXISTS day_of_email_sent_at TIMESTAMPTZ;

COMMENT ON COLUMN private_session_bookings.day_of_email_sent_at IS
  'Set when the day-of fallback "address coming shortly" email is sent to the attendee.';
