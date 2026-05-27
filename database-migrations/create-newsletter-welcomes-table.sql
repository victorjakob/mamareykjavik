-- newsletter_welcomes
-- Tracks who has already received the auto-sent welcome newsletter email so
-- we never send it twice, no matter how many times someone signs up or buys
-- a ticket with the same address.
--
-- The email column is the primary key (lowercased on write).
-- source captures where the welcome was triggered from.
-- subscribed_at is when the welcome went out.
--
-- RLS is enabled with no public policies. All writes go through the server
-- using the service role inside enrolAndWelcome().

create table if not exists public.newsletter_welcomes (
  email          text primary key,
  source         text not null,                       -- account_optin | ticket_buyer | rein_warmup
  consent_basis  text,                                -- explicit_optin | soft_optin_customer
  welcomed_at    timestamptz not null default now(),
  unsubscribed_at timestamptz,                        -- mirror of Resend state for quick lookups
  resend_contact_id text,                             -- contact id returned by Resend Audience API
  metadata       jsonb,                               -- room for future fields (name at time of welcome, etc.)
  created_at     timestamptz not null default now()
);

create index if not exists newsletter_welcomes_source_idx
  on public.newsletter_welcomes (source);

create index if not exists newsletter_welcomes_welcomed_at_idx
  on public.newsletter_welcomes (welcomed_at desc);

alter table public.newsletter_welcomes enable row level security;

-- No public policies. The service role bypasses RLS, which is what the
-- enrolAndWelcome helper uses. If we ever expose a self-service unsubscribe
-- endpoint we will add a narrow policy here for the matching email only.
