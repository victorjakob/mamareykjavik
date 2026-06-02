-- Track when the per-weekend vendor welcome email was sent so re-running
-- the send-weekend-welcome admin action never double-mails a vendor.
-- Same idea for the Saturday-specific breakdown notice.

alter table public.summer_market_vendor_applications
  add column if not exists weekend_welcome_sent_at timestamptz,
  add column if not exists saturday_breakdown_notice_sent_at timestamptz;

comment on column public.summer_market_vendor_applications.weekend_welcome_sent_at is
  'When the vendor was sent the per-weekend welcome email by the send-weekend-welcome admin action. Prevents double-sends.';

comment on column public.summer_market_vendor_applications.saturday_breakdown_notice_sent_at is
  'When the vendor was sent the Saturday-specific breakdown notice (early closure for private events). Prevents double-sends.';
