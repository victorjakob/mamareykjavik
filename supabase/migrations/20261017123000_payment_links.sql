-- Payment links: "pay this amount" links an admin creates in /admin/payment-links
-- and sends to a customer. The customer pays by card on Teya SecurePay (same
-- merchant account as event tickets). One row per link.
--
--   id                  — also the public token: /pay/<id> (random uuid v4)
--   teya_order_id       — SecurePay orderid (max 12 alphanumeric, "PL" + 10 hex).
--                         Regenerated each time the customer presses Pay, so a
--                         retry after cancel/error never reuses an orderid.
--   status              — created → paid, or failed / cancelled (customer can
--                         still retry those until expires_at). "sent" is not
--                         tracked: the admin sends the link themselves.
--   callback_payload    — Teya's server callback body (card number is masked
--                         by Teya; stored as received).

create table if not exists public.payment_links (
  id                   uuid primary key default gen_random_uuid(),
  amount_isk           integer not null check (amount_isk > 0),
  reference            text not null,
  customer_name        text not null,
  customer_contact     text null,
  url                  text not null,
  teya_order_id        text null unique,
  status               text not null default 'created'
                         check (status in ('created', 'paid', 'failed', 'cancelled')),
  created_at           timestamptz not null default now(),
  created_by           text null,          -- admin email
  expires_at           timestamptz null,
  paid_at              timestamptz null,
  teya_transaction_id  text null,
  callback_payload     jsonb null
);

create index if not exists payment_links_created_at_idx
  on public.payment_links (created_at desc);

-- RLS on with no policies: only the service role (server code) can read or
-- write, same as gatekeeper_configs / cron_runs. Admin access goes through
-- /api/admin/payment-links, which checks the admin session.
alter table public.payment_links enable row level security;
