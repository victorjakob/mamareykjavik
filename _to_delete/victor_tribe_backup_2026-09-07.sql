-- Backup of Victor's tribe card before the 7 Sept 2026 "fresh user" reset.
-- Run this if you ever want the original legacy card back (same access
-- token, so any old links / wallet passes on your phones work again).
INSERT INTO tribe_cards (id, access_token, holder_email, holder_name, holder_phone, user_id,
  discount_percent, duration_type, issued_at, expires_at, status, source, authentication_token, created_at)
VALUES ('352e0b75-b507-41ef-845d-c73c430ee35e', 'f39498a0-4a86-4271-8564-acf7d1fc60dc',
  'viggijakob@gmail.com', 'victor Gressier', '+3546167722', '60daf850-071a-41c5-bedb-0c8e6a408a2a',
  20, 'unlimited', '2026-05-01T12:53:37.696+00', NULL, 'active', 'legacy',
  '20b5ab6a-af03-411b-a78c-5facf1dc62d9', '2026-04-27T16:31:32.329017+00');
-- Wallet registrations (3 devices) pointed at serial tribe-352e0b75-b507-41ef-845d-c73c430ee35e:
--   64b9807d6eeb17193f962017288f64e0, bbc8e360c7991e21754df413469b2ec4, 20220b0f4ae638205ed98ed76d5d1071
-- Subscriptions removed: 8ec5b44c-… (Apr 2026, canceled, refunded) and 114e6e32-… (7 Sept 2026, refunded).
