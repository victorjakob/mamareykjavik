-- Summer Market admin workflow columns
-- Adds dedicated columns for application/payment/confirmation states.

alter table if exists public.summer_market_vendor_applications
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists accepted_at timestamptz null,
  add column if not exists acceptance_email_sent_at timestamptz null,
  add column if not exists accepted_by text null,
  add column if not exists is_confirmed boolean not null default false,
  add column if not exists confirmed_at timestamptz null;

-- Keep compatibility with updated form (kennitala / applying_for removed from UI).
alter table if exists public.summer_market_vendor_applications
  alter column kennitala drop not null,
  alter column applying_for drop not null;

-- Ensure status has a predictable default.
alter table if exists public.summer_market_vendor_applications
  alter column status set default 'pending';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'summer_market_vendor_applications_status_check'
  ) then
    alter table public.summer_market_vendor_applications
      add constraint summer_market_vendor_applications_status_check
      check (status in ('pending', 'accepted', 'rejected'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'summer_market_vendor_applications_payment_status_check'
  ) then
    alter table public.summer_market_vendor_applications
      add constraint summer_market_vendor_applications_payment_status_check
      check (payment_status in ('unpaid', 'confirmation_paid', 'fully_paid'));
  end if;
end $$;

-- Backfill from legacy raw_payload.admin_meta when present.
update public.summer_market_vendor_applications
set
  status = case
    when raw_payload->'admin_meta'->>'applicationStatus' in ('pending', 'accepted', 'rejected')
      then raw_payload->'admin_meta'->>'applicationStatus'
    else status
  end,
  payment_status = case
    when raw_payload->'admin_meta'->>'paymentStatus' in ('unpaid', 'confirmation_paid', 'fully_paid')
      then raw_payload->'admin_meta'->>'paymentStatus'
    else payment_status
  end,
  accepted_at = coalesce(
    accepted_at,
    nullif(raw_payload->'admin_meta'->>'acceptedAt', '')::timestamptz
  ),
  acceptance_email_sent_at = coalesce(
    acceptance_email_sent_at,
    nullif(raw_payload->'admin_meta'->>'acceptanceEmailSentAt', '')::timestamptz
  ),
  accepted_by = coalesce(
    accepted_by,
    nullif(raw_payload->'admin_meta'->>'acceptedBy', '')
  ),
  is_confirmed = coalesce(
    nullif(raw_payload->'admin_meta'->>'isConfirmed', '')::boolean,
    is_confirmed
  ),
  confirmed_at = coalesce(
    confirmed_at,
    nullif(raw_payload->'admin_meta'->>'confirmedAt', '')::timestamptz
  );
