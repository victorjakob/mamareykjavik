-- When the online-sales host report email was sent for this event.
-- Stamped by both the manual send (manage hub "Email report" modal) and the
-- /api/cron/host-reports sweep, which uses it for idempotency.
-- Applied to production 2026-07-06 via Supabase MCP.
alter table public.events
  add column if not exists host_report_sent_at timestamptz;
