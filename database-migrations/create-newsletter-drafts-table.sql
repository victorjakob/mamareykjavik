-- newsletter_drafts
-- One row per Monday auto-drafted weekly newsletter. The Supabase scheduled
-- edge function `draft-weekly-newsletter` writes a draft each Monday at
-- 11:00 Reykjavik time, then sends a preview email to team@mama.is with two
-- buttons (Send it / Edit first) that link back to this row.
--
-- The approval_token is a single-use secret carried in the Send it URL so
-- the action works from any device without requiring a login.

create table if not exists public.newsletter_drafts (
  id                  uuid primary key default gen_random_uuid(),
  send_date           date not null,                   -- the Monday this draft is for
  status              text not null default 'draft',   -- draft | approved | sending | sent | failed
  subject             text not null,
  preheader           text,
  intro_note          text,                            -- editable top line shown above the events
  events_json         jsonb not null,                  -- snapshot of events used, with per-event copy
  html                text not null,                   -- rendered HTML at draft time
  approval_token      uuid not null default gen_random_uuid(),
  resend_broadcast_id text,                            -- id returned by Resend Broadcasts API on send
  error_message       text,                            -- populated on failed
  created_at          timestamptz not null default now(),
  approved_at         timestamptz,
  sent_at             timestamptz
);

create unique index if not exists newsletter_drafts_send_date_idx
  on public.newsletter_drafts (send_date);

create index if not exists newsletter_drafts_status_idx
  on public.newsletter_drafts (status);

alter table public.newsletter_drafts enable row level security;

-- No public policies. The service role inside the scheduled function and the
-- /api/newsletter/approve endpoint bypasses RLS. The /newsletters/[id] edit
-- page reads through a server route behind the admin NextAuth session.
