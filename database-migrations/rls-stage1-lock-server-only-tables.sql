-- RLS stage 1 (applied 2026-09-26): enable row level security with no
-- policies on tables that neither mamareykjavik nor mama-manager reads with
-- the public (anon) key. The service role bypasses RLS, so server code is
-- unaffected. Undo for one table: alter table public.<t> disable row level security;
do $$
declare t text;
begin
  foreach t in array array['affirmations','auto_credit_subscriptions','checkin_logs','checkin_pins','clock_payroll_categories','clock_special_days','coupons','custom_cards','financial_metrics','gift_card_usage_history','gift_cards','manage_staff','meal_card_usage_history','membership_payment_events','membership_payment_methods','membership_subscriptions','membership_waitlist','n8n_memory_main','n8n_vendor_memory','password_reset_tokens','payday_exports','private_session_bookings','private_session_offerings','private_session_slot_offerings','private_session_slots','private_session_waitlist','private_space_blocked_dates','private_space_bookings','private_space_subscriptions','social_posts','tour_booking_events','tour_bookings','tour_sessions','tribe_card_notifications','tribe_card_requests','tribe_cards','wallet_pass_devices','wallet_pass_registrations','whitelotus_booking_comments','whitelotus_bookings','work_credit_history']
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;
