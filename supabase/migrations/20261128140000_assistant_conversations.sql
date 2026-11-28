-- Website chat assistant: one row per chat session, so the team can read what
-- guests ask, spot wrong answers and improve the bot's knowledge.
-- Server-only: RLS on with no policies, so only the service role can read/write.

create table if not exists public.assistant_conversations (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  page text,
  lang text,
  messages jsonb not null default '[]'::jsonb,
  message_count integer not null default 0,
  handed_off boolean not null default false,
  handed_off_to text,
  flagged boolean not null default false,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assistant_conversations_updated_at_idx
  on public.assistant_conversations (updated_at desc);

alter table public.assistant_conversations enable row level security;
