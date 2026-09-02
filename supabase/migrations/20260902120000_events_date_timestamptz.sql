-- Event times are Iceland time (Atlantic/Reykjavik = UTC+0 all year).
--
-- `events.date` / `events.early_bird_date` were `timestamp without time zone`,
-- so PostgREST returned e.g. "2026-08-20T18:00:00" with no offset. Browsers
-- parse that as the *visitor's* local time, so a guest in the US saw a 6pm
-- Reykjavík event as 11pm. Every value was written as UTC by the app, so we
-- reinterpret the stored wall-clock as UTC and switch to timestamptz. From now
-- on the API returns "2026-08-20T18:00:00+00:00", which is unambiguous everywhere.

alter table public.events
  alter column date type timestamptz using date at time zone 'UTC',
  alter column early_bird_date type timestamptz using early_bird_date at time zone 'UTC';
