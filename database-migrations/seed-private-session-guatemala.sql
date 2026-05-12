-- Seed: first visiting practitioner (Guatemalan teacher).
-- Idempotent: re-running deletes and re-inserts this practitioner only.
-- Used by stage 2 (public pages) so a reviewer can hit /private-session/[slug].
--
-- Three slots, two of which link to BOTH offerings (acceptance criterion 1
-- requires at least one multi-offering slot in the demo). Third slot is
-- single-offering. All slots start with actual_location = NULL — that's the
-- whole point of the day-before location-reveal cron (handled in stage 5).
-- published_area shows the vague public hint only.

-- ── Reset this practitioner's tree (cascades wipe offerings/slots/joins) ─────
DELETE FROM private_session_practitioners WHERE slug = 'don-tomas';

-- ── Practitioner ─────────────────────────────────────────────────────────────
WITH ins_practitioner AS (
  INSERT INTO private_session_practitioners (
    slug, name, country_of_origin, bio_md, photo_url,
    residency_start, residency_end, is_active, display_order,
    meta_seo_title, meta_seo_description, language
  )
  VALUES (
    'don-tomas',
    'Don Tomás',
    'Guatemala',
    'Don Tomás is a Mayan ajq''ij — a daykeeper and ceremonial guide — visiting Reykjavík from the highlands of Sololá, Guatemala. He carries thirty years of practice in cacao ceremony, fire ritual, and sound-and-breath healing in the Tz''utujil tradition.

He works one-on-one and in very small circles. Sessions are slow and held in silence where possible. Bring an open afternoon, a question if you have one, and water.

This is his first residency at Mama. He is here until the end of June.',
    'https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto,w_1200/mama-reykjavik/mamabanner.jpg',
    '2026-05-15'::date,
    '2026-06-30'::date,
    TRUE,
    1,
    'Don Tomás — Mayan ceremony at Mama Reykjavík',
    'Private cacao, fire and breath sessions with Don Tomás, a visiting daykeeper from Sololá, Guatemala. By appointment in central Reykjavík.',
    'en'
  )
  RETURNING id
),
-- ── Offerings ───────────────────────────────────────────────────────────────
ins_offering_cacao AS (
  INSERT INTO private_session_offerings (
    practitioner_id, title, description_md, modality,
    duration_minutes, price_isk, is_active, display_order
  )
  SELECT
    p.id,
    'Ceremonial cacao — one-to-one',
    'A two-hour ceremonial cacao session, served in the Mayan way, with quiet guidance, breath, and time at the end to rest. For one person, or two who arrive together.',
    'Cacao ceremony',
    120,
    18000,
    TRUE,
    1
  FROM ins_practitioner p
  RETURNING id, practitioner_id
),
ins_offering_breath AS (
  INSERT INTO private_session_offerings (
    practitioner_id, title, description_md, modality,
    duration_minutes, price_isk, is_active, display_order
  )
  SELECT
    p.id,
    'Sound and breath session',
    'A ninety-minute session of guided breath and traditional Mayan sound instruments — a slower, less intense alternative to the cacao ceremony. Good for first-time visitors.',
    'Sound healing',
    90,
    14000,
    TRUE,
    2
  FROM ins_practitioner p
  RETURNING id, practitioner_id
),
-- ── Three slots ─────────────────────────────────────────────────────────────
ins_slots AS (
  INSERT INTO private_session_slots (
    practitioner_id, starts_at, ends_at, status, published_area, actual_location
  )
  SELECT p.id, s.starts_at, s.ends_at, 'available', s.published_area, NULL
  FROM ins_practitioner p,
       (VALUES
         -- Slot A: ~4 days from now, afternoon — multi-offering
         (NOW() + INTERVAL '4 days' + INTERVAL '14 hours',
          NOW() + INTERVAL '4 days' + INTERVAL '16 hours',
          'Reykjavík 101'),
         -- Slot B: ~7 days from now, morning — multi-offering (the demo slot)
         (NOW() + INTERVAL '7 days' + INTERVAL '10 hours',
          NOW() + INTERVAL '7 days' + INTERVAL '12 hours',
          'Reykjavík 101'),
         -- Slot C: ~9 days from now, evening — single-offering (breath only)
         (NOW() + INTERVAL '9 days' + INTERVAL '18 hours',
          NOW() + INTERVAL '9 days' + INTERVAL '19 hours 30 minutes',
          'Reykjavík 101')
       ) AS s(starts_at, ends_at, published_area)
  RETURNING id, starts_at
),
ordered_slots AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY starts_at) AS rn FROM ins_slots
)
-- ── Slot ↔ Offering links ───────────────────────────────────────────────────
INSERT INTO private_session_slot_offerings (slot_id, offering_id)
SELECT s.id, c.id FROM ordered_slots s, ins_offering_cacao c WHERE s.rn IN (1, 2)
UNION ALL
SELECT s.id, b.id FROM ordered_slots s, ins_offering_breath b WHERE s.rn IN (1, 2, 3);
