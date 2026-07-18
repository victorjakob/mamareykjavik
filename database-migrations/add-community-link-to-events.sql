-- ─────────────────────────────────────────────────────────────────
-- Community link for events (WhatsApp / Telegram / FB group, …)
--
-- Lets each event (and recurring series) carry ONE community join
-- link — e.g. the "Free Your Voice" WhatsApp group — with two
-- independent visibility switches:
--
--   community_link_public    → shown on the public event/series page
--   community_link_in_email  → included warmly in the ticket
--                              confirmation emails (free, door, paid)
--
-- Columns are nullable / default-false so every existing row is
-- unaffected: no link stored, nothing shown, nothing emailed.
-- ─────────────────────────────────────────────────────────────────

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS community_link           text,
  ADD COLUMN IF NOT EXISTS community_link_label     text,
  ADD COLUMN IF NOT EXISTS community_link_public    boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS community_link_in_email  boolean NOT NULL DEFAULT false;

ALTER TABLE event_series
  ADD COLUMN IF NOT EXISTS community_link           text,
  ADD COLUMN IF NOT EXISTS community_link_label     text,
  ADD COLUMN IF NOT EXISTS community_link_public    boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS community_link_in_email  boolean NOT NULL DEFAULT false;
