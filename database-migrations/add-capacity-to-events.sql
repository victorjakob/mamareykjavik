-- Add capacity field to events table
-- Capacity represents the maximum number of tickets that can be sold for an event
-- NULL or 0 means unlimited capacity

ALTER TABLE events
ADD COLUMN IF NOT EXISTS capacity INTEGER;

COMMENT ON COLUMN events.capacity IS 'Maximum number of tickets that can be sold. NULL or 0 means unlimited capacity.';

