-- Gatekeeper (door check-in / walk-in ticketing) per-event configuration.
-- One row per event. Created the first time the host opens the Gatekeeper
-- initiator screen; updated on activate / close / reconcile.
--
-- Notes on fields:
--   pin_hash           — bcrypt / sha256 hex of the 4-digit PIN set by the host
--                        on activation. Master PIN (2323) is hard-coded in
--                        the verifier and does NOT get stored here.
--   enabled_methods    — json array of enabled payment methods (strings from
--                        {"cash","transfer","pos","exchange"}).
--   bank_details       — JSON blob with {kt, bank, explanation} for transfer.
--                        Only used when 'transfer' is in enabled_methods.
--   tip_enabled        — whether the kiosk offers an optional tip step.
--   receipt_enabled    — whether the kiosk offers an email receipt checkbox.
--   upsell_enabled     — whether to show the subtle cacao / restaurant upsell.
--   activated_at       — null until the host activates the kiosk; set to now()
--                        when activated. Cleared on full close.
--   closed_at          — timestamp of the last guard-mode close (for report).
--   wrap_sent_at       — timestamp of the Spotify-Wrapped email being sent, so
--                        the cron doesn't re-send for the same event.

create table if not exists public.gatekeeper_configs (
  id              uuid primary key default gen_random_uuid(),
  event_id        bigint not null references public.events(id) on delete cascade,
  pin_hash        text null,
  enabled_methods jsonb not null default '["cash","transfer","pos"]'::jsonb,
  bank_details    jsonb not null default '{}'::jsonb,
  tip_enabled     boolean not null default true,
  receipt_enabled boolean not null default true,
  upsell_enabled  boolean not null default true,
  activated_at    timestamptz null,
  closed_at       timestamptz null,
  wrap_sent_at    timestamptz null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (event_id)
);

create index if not exists gatekeeper_configs_event_id_idx
  on public.gatekeeper_configs (event_id);

-- Simple updated_at trigger so the row's updated_at always reflects the last
-- write. Makes it easier to see the last config change from the admin UI.
create or replace function public.gatekeeper_configs_touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists gatekeeper_configs_touch_updated_at on public.gatekeeper_configs;
create trigger gatekeeper_configs_touch_updated_at
  before update on public.gatekeeper_configs
  for each row execute function public.gatekeeper_configs_touch_updated_at();

-- Server code accesses this table via service role (which bypasses RLS); we
-- enable RLS with no policies so anon/authenticated keys are denied by default.
alter table public.gatekeeper_configs enable row level security;

-- Mark walk-in tickets with richer metadata so the reconciliation + wrap-up
-- email can attribute them accurately. These are additive / nullable.
alter table if exists public.tickets
  add column if not exists gatekeeper boolean not null default false;
alter table if exists public.tickets
  add column if not exists gatekeeper_tip integer null;
alter table if exists public.tickets
  add column if not exists gatekeeper_note text null;
alter table if exists public.tickets
  add column if not exists gatekeeper_receipt_requested boolean not null default false;

create index if not exists tickets_gatekeeper_idx
  on public.tickets (event_id, gatekeeper);
