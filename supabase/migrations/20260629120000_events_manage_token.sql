-- events.manage_token — a per-event secret that lets a host open the event's
-- management hub straight from their email, with no login.
--
--   • Full access to that ONE event (scoped by the token).
--   • Permanent: the link in the host's inbox keeps working.
--   • Resettable: regenerating the token instantly kills old links + cookies,
--     because access checks compare against the CURRENT token value.
--
-- New rows get a token automatically via the column default, so the
-- create-event path needs no change to start issuing links (its insert
-- already does .select(), so the generated token comes back for the email).

create extension if not exists pgcrypto;

alter table events
  add column if not exists manage_token text;

-- Back-fill every existing event with a strong random token (48 hex chars).
update events
  set manage_token = encode(gen_random_bytes(24), 'hex')
  where manage_token is null;

-- New events self-issue a token.
alter table events
  alter column manage_token set default encode(gen_random_bytes(24), 'hex');

create unique index if not exists events_manage_token_key
  on events (manage_token);
