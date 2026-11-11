-- Gift card expiry
-- =================
-- Applied to the live database (mama-s) on 10 Nov 2026 as migration
-- "add_gift_cards_expires_at".
--
-- Terms from Nov 2026: a gift card is valid for four years from purchase
-- and is good for food and drink only.
--
-- expires_at = NULL  -> sold before the new terms; honoured as sold
--                       (no expiry, wider use).
-- expires_at set     -> sold under the new terms; set to purchase time
--                       + 4 years in /api/saltpay/giftcard/success-server.

ALTER TABLE public.gift_cards ADD COLUMN IF NOT EXISTS expires_at timestamptz;

COMMENT ON COLUMN public.gift_cards.expires_at IS 'When the card stops being valid. NULL = sold before the Nov 2026 terms and honoured as sold (no expiry, wider use). Cards sold under the new terms (food and drink only) get purchase time + 4 years.';
