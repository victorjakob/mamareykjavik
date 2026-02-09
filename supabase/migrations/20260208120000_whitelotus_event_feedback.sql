-- White Lotus post-event feedback
-- Stored via server API using SUPABASE_SERVICE_ROLE_KEY (no anon insert/update policies).

create extension if not exists "pgcrypto";

create table if not exists public.whitelotus_event_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  locale text not null default 'en',

  overall_stars int not null,
  recommend_score int not null,

  booking_communication_stars int null,
  staff_service_stars int null,
  space_cleanliness_stars int null,
  improve_one_thing text null,

  segment text not null,

  -- High satisfaction post-submit
  testimonial_ok boolean null,
  testimonial_name text null,
  testimonial_company text null,

  -- Low satisfaction post-submit
  low_satisfaction_details text null,
  follow_up_ok boolean null,
  follow_up_name text null,
  follow_up_contact text null,

  -- Add more details expander
  ambience_vibe_stars int null,
  tech_equipment_stars int null,
  flow_on_the_day_stars int null,
  value_for_money_stars int null,
  best_part text null,

  constraint whitelotus_event_feedback_locale_check
    check (locale in ('en', 'is')),
  constraint whitelotus_event_feedback_overall_stars_check
    check (overall_stars between 1 and 5),
  constraint whitelotus_event_feedback_recommend_score_check
    check (recommend_score between 0 and 10),
  constraint whitelotus_event_feedback_booking_communication_stars_check
    check (booking_communication_stars is null or booking_communication_stars between 1 and 5),
  constraint whitelotus_event_feedback_staff_service_stars_check
    check (staff_service_stars is null or staff_service_stars between 1 and 5),
  constraint whitelotus_event_feedback_space_cleanliness_stars_check
    check (space_cleanliness_stars is null or space_cleanliness_stars between 1 and 5),
  constraint whitelotus_event_feedback_segment_check
    check (segment in ('low', 'middle', 'high')),
  constraint whitelotus_event_feedback_ambience_vibe_stars_check
    check (ambience_vibe_stars is null or ambience_vibe_stars between 1 and 5),
  constraint whitelotus_event_feedback_tech_equipment_stars_check
    check (tech_equipment_stars is null or tech_equipment_stars between 1 and 5),
  constraint whitelotus_event_feedback_flow_on_the_day_stars_check
    check (flow_on_the_day_stars is null or flow_on_the_day_stars between 1 and 5),
  constraint whitelotus_event_feedback_value_for_money_stars_check
    check (value_for_money_stars is null or value_for_money_stars between 1 and 5)
);

create index if not exists whitelotus_event_feedback_created_at_idx
  on public.whitelotus_event_feedback (created_at desc);

-- Keep updated_at current
create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_whitelotus_event_feedback_updated_at on public.whitelotus_event_feedback;
create trigger set_whitelotus_event_feedback_updated_at
before update on public.whitelotus_event_feedback
for each row
execute function public.set_updated_at_timestamp();

-- RLS enabled; no anon insert/update policies.
alter table public.whitelotus_event_feedback enable row level security;

