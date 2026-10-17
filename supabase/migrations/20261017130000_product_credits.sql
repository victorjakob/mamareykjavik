-- Product credits: a one-time credit for a specific menu item or category
-- (e.g. "one stew of any kind", "one beer"), separate from Mama coins.
-- Created in /admin/credits; the customer opens /claim/<id> and taps
-- "Use credit" at the counter, which redeems it exactly once.
--
--   id                — also the public claim token: /claim/<id> (uuid v4)
--   code              — short human code (6 chars, no look-alike letters) that
--                       counter staff can look up in /admin/credits
--   item_label        — what the credit is for, as shown to the customer
--   menu_item_id /
--   menu_category_id  — optional link to the menu the label was picked from
--   status            — unclaimed → claimed, or cancelled. "Expired" is not
--                       stored: an unclaimed credit past expires_at is expired.
--   claimed_*         — who/what redeemed it: optional name the customer typed,
--                       signed-in user email if any, IP and user agent.

create table if not exists public.product_credits (
  id                  uuid primary key default gen_random_uuid(),
  code                text not null unique,
  item_label          text not null,
  menu_item_id        uuid null references public.menu_items(id) on delete set null,
  menu_category_id    uuid null references public.menu_categories(id) on delete set null,
  customer_name       text null,
  customer_contact    text null,
  note                text null,              -- internal reason, never shown publicly
  expires_at          timestamptz null,
  status              text not null default 'unclaimed'
                        check (status in ('unclaimed', 'claimed', 'cancelled')),
  created_at          timestamptz not null default now(),
  created_by          text null,              -- admin email
  claimed_at          timestamptz null,
  claimed_name        text null,
  claimed_by_email    text null,
  claimed_ip          text null,
  claimed_user_agent  text null,
  cancelled_at        timestamptz null,
  cancelled_by        text null
);

create index if not exists product_credits_created_at_idx
  on public.product_credits (created_at desc);

-- RLS on with no policies: only the service role (server code) can read or
-- write, same as payment_links. Admin access goes through /api/admin/credits.
alter table public.product_credits enable row level security;
