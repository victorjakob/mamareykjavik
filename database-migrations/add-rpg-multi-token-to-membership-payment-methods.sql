-- Add RPG MultiToken column to membership_payment_methods.
--
-- Teya's Restful Payment Gateway (RPG) issues a reusable Token when you POST
-- to /api/token/multi. We convert the SaveCard virtual card number into an
-- RPG MultiToken on the first renewal for a subscription and store the Token
-- here. All subsequent MIT renewals use this token directly, skipping the
-- token-create step.
--
-- Safe to re-run (uses IF NOT EXISTS).

ALTER TABLE public.membership_payment_methods
  ADD COLUMN IF NOT EXISTS rpg_multi_token text;

COMMENT ON COLUMN public.membership_payment_methods.rpg_multi_token IS
  'Teya RPG MultiToken (/api/token/multi) — created lazily on first renewal from virtual_card_number. Reused for every subsequent MIT charge. Never returned to clients.';

CREATE INDEX IF NOT EXISTS membership_payment_methods_rpg_multi_token_idx
  ON public.membership_payment_methods (rpg_multi_token)
  WHERE rpg_multi_token IS NOT NULL;
