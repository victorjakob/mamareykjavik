-- Per-slot capacity for parallel bookings.
-- Lets a single slot row represent N simultaneous sessions — e.g. three
-- Mayan elders during one residency can each see a client at the same time.
-- Applied to Supabase already; this file is the canonical record.

ALTER TABLE private_session_slots
  ADD COLUMN IF NOT EXISTS capacity INT NOT NULL DEFAULT 1;

ALTER TABLE private_session_slots
  DROP CONSTRAINT IF EXISTS private_session_slots_capacity_positive;

ALTER TABLE private_session_slots
  ADD CONSTRAINT private_session_slots_capacity_positive CHECK (capacity > 0);

-- Multiple bookings per slot when capacity > 1. Application enforces
-- "occupancy < capacity" at insertion time.
ALTER TABLE private_session_bookings
  DROP CONSTRAINT IF EXISTS private_session_bookings_slot_id_key;

COMMENT ON COLUMN private_session_slots.capacity IS
  'How many parallel bookings this slot can hold.';
