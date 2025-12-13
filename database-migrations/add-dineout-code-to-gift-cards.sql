-- Add dineout_code column to gift_cards table
-- This code is added manually by admin after creating the gift card in Dineout POS
-- Only used for email delivery method

ALTER TABLE gift_cards
ADD COLUMN IF NOT EXISTS dineout_code TEXT;

COMMENT ON COLUMN gift_cards.dineout_code IS 'Dineout POS gift card code (e.g., geV9jhLE). Added manually by admin after creating gift card in Dineout. Only used for email delivery method.';

CREATE INDEX IF NOT EXISTS idx_gift_cards_dineout_code ON gift_cards(dineout_code) WHERE dineout_code IS NOT NULL;

