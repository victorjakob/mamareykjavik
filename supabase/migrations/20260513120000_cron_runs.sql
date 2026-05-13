-- cron_runs — logbook of every automatic + manually-triggered cron run.
-- Surfaced in /admin/automations as "Last ran X ago".
--
-- Each cron handler:
--   1. Inserts a row on entry (status='running'),
--   2. Updates status + finished_at + result/error on exit.
-- The trigger-now admin endpoint sets triggered_by='admin' via header so
-- manual runs are distinguishable from the scheduled ones.

create table if not exists public.cron_runs (
  id              bigserial primary key,
  automation_id   text not null,                      -- matches AUTOMATION_MANIFEST id
  started_at      timestamptz not null default now(),
  finished_at     timestamptz,
  status          text not null default 'running',    -- running | ok | error
  result          jsonb,                              -- arbitrary payload, e.g. { processed: 5 }
  error           text,                               -- error message when status='error'
  triggered_by    text not null default 'cron'        -- 'cron' | 'admin'
);

create index if not exists cron_runs_automation_id_started_idx
  on public.cron_runs (automation_id, started_at desc);

-- Lock the table down: nobody reads/writes it from the client. All access
-- goes through the server with the service role.
alter table public.cron_runs enable row level security;
