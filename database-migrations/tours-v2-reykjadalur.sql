-- Tours v2 — Reykjadalur launch (Aug 2026)
-- Applied to prod via Supabase on 2026-08-06 (Cowork session).
-- Kept here per repo convention: database-migrations/ SQL must be applied
-- against prod BEFORE deploying code that queries the new columns.

-- 1) Richer tour content model -------------------------------------------
ALTER TABLE tours
  ADD COLUMN IF NOT EXISTS subtitle text,
  ADD COLUMN IF NOT EXISTS long_description text,
  ADD COLUMN IF NOT EXISTS itinerary jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS included text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS what_to_bring text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS important_info text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS meeting_point text,
  ADD COLUMN IF NOT EXISTS difficulty text,
  ADD COLUMN IF NOT EXISTS min_age integer,
  ADD COLUMN IF NOT EXISTS schedule_note text,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS private_base_price integer,
  ADD COLUMN IF NOT EXISTS private_base_guests integer,
  ADD COLUMN IF NOT EXISTS private_extra_guest_price integer,
  ADD COLUMN IF NOT EXISTS private_max_guests integer,
  ADD COLUMN IF NOT EXISTS private_description text;

-- Slug should be unique — booking/detail pages resolve by slug.
CREATE UNIQUE INDEX IF NOT EXISTS tours_slug_key ON tours (slug);

-- 2) Booking payment metadata --------------------------------------------
-- refundid: Teya/SaltPay gateway id from the success callback (10-digit).
-- Required for refunds via securepay/refund.aspx — NOT the 6-digit auth code.
ALTER TABLE tour_bookings
  ADD COLUMN IF NOT EXISTS refundid text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- 3) Remove 2025 walking-tour test data -----------------------------------
DELETE FROM tour_bookings
 WHERE tour_session_id IN (
   SELECT ts.id FROM tour_sessions ts
   JOIN tours t ON t.id = ts.tour_id
   WHERE t.slug IN ('ocean-path', 'city-path'));

DELETE FROM tour_sessions
 WHERE tour_id IN (SELECT id FROM tours WHERE slug IN ('ocean-path', 'city-path'));

DELETE FROM tours WHERE slug IN ('ocean-path', 'city-path');

-- 4) Seed: Reykjadalur Hot Spring Hike ------------------------------------
INSERT INTO tours (
  name, slug, subtitle, description, short_description, long_description,
  price, duration_minutes, max_capacity, image_url,
  highlights, itinerary, included, what_to_bring, important_info,
  meeting_point, difficulty, min_age, schedule_note, is_active,
  private_base_price, private_base_guests, private_extra_guest_price,
  private_max_guests, private_description
)
SELECT
  'Reykjadalur Hot Spring Hike',
  'reykjadalur',
  'A small-group geothermal journey from Reykjavík',
  'Walk through a living geothermal valley and bathe in a naturally warm river.',
  'Walk through a living geothermal valley and bathe in a naturally warm river — finishing with a plant-based meal at Mama.',
  E'Leave Reykjavík behind and join Mama Tours for a small-group journey into Reykjadalur — one of Iceland''s most extraordinary geothermal landscapes.\n\nWe begin at Mama Reykjavík and travel together to Hveragerði, where our guided hike leads through a landscape of steaming earth, mountain views, bubbling springs and flowing water. After walking approximately 3.5 kilometres into the valley, we arrive at the naturally warm river, where there is time to bathe, rest and experience the landscape at a slower pace.\n\nAfter returning to Reykjavík, we finish the journey together with a nourishing plant-based meal at Mama.\n\nThis experience is designed for travellers who want to do more than simply see Iceland. It is an invitation to move through the landscape, feel its elements and share a meaningful day with a small group of fellow travellers.',
  24900, 390, 8,
  'https://res.cloudinary.com/dy8q4hf0k/image/upload/v1745168491/relic2_c15dsg.jpg', -- TODO: replace with Reykjadalur photo
  ARRAY[
    'Guided hike through a living geothermal valley',
    'Bathe in the naturally warm river',
    'Small group — maximum eight guests',
    'Plant-based meal at Mama after the hike'
  ],
  '[
    {"time":"08:15","title":"Check-in at Mama, clothing and equipment check"},
    {"time":"08:30","title":"Depart Bankastræti 2"},
    {"time":"09:15","title":"Arrive at Reykjadalur trailhead; safety briefing"},
    {"time":"09:30","title":"Begin guided hike"},
    {"time":"10:45","title":"Arrive at the hot river — bathing, refreshments and quiet time"},
    {"time":"11:45","title":"Begin return hike"},
    {"time":"13:00","title":"Return to vehicle, drive back to Reykjavík"},
    {"time":"14:00","title":"Plant-based meal at Mama"},
    {"time":"15:00","title":"Experience finishes"}
  ]'::jsonb,
  ARRAY[
    'Transportation from Reykjavík',
    'Friendly driver and guide',
    'Guided Reykjadalur hike',
    'Time to bathe in the geothermal river',
    'Light refreshments',
    'Plant-based meal at Mama after the hike',
    'Parking and local fees'
  ],
  ARRAY[
    'Proper hiking shoes',
    'Waterproof jacket and trousers',
    'Warm layers',
    'Swimsuit and towel',
    'Water bottle',
    'Small backpack',
    'Hat and gloves when conditions require them'
  ],
  ARRAY[
    'The hike is approximately 7 km return with 300–350 m of elevation gain — you must be comfortable walking uphill for 60–90 minutes and completing the full return journey. Terrain can be rocky, wet or muddy.',
    'We recommend wearing your swimsuit underneath your hiking clothes. There are simple changing screens beside the river, but no indoor changing rooms or toilets in the valley.',
    'Icelandic weather can change quickly. The tour may be changed, postponed or cancelled if trail, road or weather conditions are unsafe.',
    'Guests must follow the guide''s instructions, remain on marked paths and keep a safe distance from boiling springs and fragile geothermal ground.',
    'If Mama Tours cancels the experience, guests may choose a new date or receive a full refund.',
    'Minimum age: 12 years.'
  ],
  E'Mama Reykjavík\nBankastræti 2, 101 Reykjavík',
  'Moderate — 7 km return, 300–350 m elevation gain',
  12,
  'Every Wednesday · 08:30–15:00',
  true,
  169000, 4, 29000, 8,
  'Would you prefer to experience Reykjadalur with only your partner, family or friends? Our private journey includes Reykjavík pickup, private transportation, your own driver-guide, the complete guided hike, time in the geothermal river and a plant-based meal at Mama. The pace adapts to your group, while always respecting the conditions and safety requirements of the trail.'
WHERE NOT EXISTS (SELECT 1 FROM tours WHERE slug = 'reykjadalur');
