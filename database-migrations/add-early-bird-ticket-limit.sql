-- Early bird pricing: second end-condition mode.
-- Early bird can now end EITHER on a date (early_bird_date, existing) OR
-- after the first N tickets are sold (early_bird_ticket_limit, new).
-- Exactly one of the two is set per event; the app infers the mode from
-- which column is non-null. Sold count uses tickets with status paid/door
-- (same rule as capacity checks in event-capacity-util.js).
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS early_bird_ticket_limit integer;

COMMENT ON COLUMN events.early_bird_ticket_limit IS
  'Ticket-count early bird mode: early_bird_price applies while fewer than this many tickets are sold (paid/door). NULL = date mode / no early bird.';
