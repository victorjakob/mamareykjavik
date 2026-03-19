-- Ensure summer_market_vendor_applications table exists for public vendor applications.
-- Anyone can submit via /api/summer-market/apply (no auth required).

create table if not exists public.summer_market_vendor_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  brand_name text not null,
  contact_person text not null,
  email text not null,
  phone_whatsapp text not null,
  what_do_you_sell text not null,
  product_categories jsonb not null default '[]',
  instagram_or_website text,
  interested_month text not null,
  selected_dates jsonb not null default '[]',
  needs_power boolean not null default false,
  tablecloth_rental boolean not null default false,
  setup_notes text,
  photo_urls jsonb not null default '[]',
  community_share boolean not null default false,
  anything_else text,
  application_acknowledged boolean not null default false,
  raw_payload jsonb,
  status text not null default 'pending',
  payment_status text not null default 'unpaid',
  kennitala text,
  applying_for text,
  accepted_at timestamptz,
  acceptance_email_sent_at timestamptz,
  accepted_by text,
  is_confirmed boolean not null default false,
  confirmed_at timestamptz
);

-- RLS: API uses service role which bypasses RLS. Enabling RLS protects against anon key access.
alter table public.summer_market_vendor_applications enable row level security;
