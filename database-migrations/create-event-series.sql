-- ─────────────────────────────────────────────────────────────────
-- Event series — persistent canonical record for recurring events
--
-- Why this exists:
--   Today every recurrence (e.g. weekly Qi Gong) is stored as its
--   own row in `events` with a dated slug like `qi-gong-05-12`.
--   When that single instance ends, the URL goes dead — which
--   breaks any 2-month FB ad that linked to it.
--
--   `event_series` is the parent record. Its slug stays the same
--   forever (e.g. `qi-gong`) and is the URL we advertise. Every
--   recurrence is still an `events` row, but now linked back to
--   the series via a nullable `series_id` foreign key.
--
-- Backwards-compatible:
--   `series_id` is nullable. Existing events keep working as
--   stand-alone instances. Only events created (or backfilled)
--   under a series carry a value.
--
-- See: src/app/events/[slug]/page.jsx (resolves series first,
--      then falls back to single-event lookup).
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS event_series (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                     text NOT NULL UNIQUE,
  name                     text NOT NULL,
  shortdescription         text,
  description              text,
  image                    text,
  location                 text,
  host                     text,
  host_secondary           text,
  default_price            integer,
  default_duration         numeric,
  recurrence_label         text,        -- human-readable, e.g. "Every Tuesday · 18:00"
  facebook_link            text,
  payment                  text,        -- mirrors events.payment ('online'|'door'|'free')
  has_sliding_scale        boolean NOT NULL DEFAULT false,
  sliding_scale_min        integer,
  sliding_scale_max        integer,
  sliding_scale_suggested  integer,
  hosting_wl_policy_agreed boolean NOT NULL DEFAULT false,
  is_active                boolean NOT NULL DEFAULT true,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  created_by               text         -- email of creator
);

COMMENT ON TABLE  event_series IS
  'Persistent parent record for a recurring event. Its slug is the canonical, ad-friendly URL (mama.is/events/<slug>). Each occurrence stays in `events` and references this row via series_id.';
COMMENT ON COLUMN event_series.slug IS
  'Bare URL slug, e.g. "qi-gong". Must not collide with an existing events.slug — the public route resolves series first, then events.';
COMMENT ON COLUMN event_series.recurrence_label IS
  'Human-readable cadence shown on the series page, e.g. "Every Tuesday · 18:00". Not a machine-readable RRULE — instances are still discrete events rows.';

-- Add series binding to existing events table.
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS series_id uuid REFERENCES event_series(id) ON DELETE SET NULL;

COMMENT ON COLUMN events.series_id IS
  'Optional link to event_series. NULL = stand-alone event. Set automatically when the series toggle is on at create-time, or via the admin "Group into series" backfill tool.';

-- Indexes for the lookup paths the public site uses.
CREATE INDEX IF NOT EXISTS idx_events_series_id        ON events        (series_id);
CREATE INDEX IF NOT EXISTS idx_event_series_slug       ON event_series  (slug);
CREATE INDEX IF NOT EXISTS idx_event_series_is_active  ON event_series  (is_active);

-- Auto-touch updated_at on UPDATE so admins can see when a series was last edited.
CREATE OR REPLACE FUNCTION event_series_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS event_series_touch_updated_at ON event_series;
CREATE TRIGGER event_series_touch_updated_at
  BEFORE UPDATE ON event_series
  FOR EACH ROW EXECUTE FUNCTION event_series_touch_updated_at();
