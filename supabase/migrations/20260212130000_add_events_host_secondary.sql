-- Allow two event manager emails (both can edit + receive notifications)
-- We keep the existing `events.host` as the primary manager email, and add
-- `events.host_secondary` as an optional secondary manager email.

alter table if exists public.events
  add column if not exists host_secondary text null;

