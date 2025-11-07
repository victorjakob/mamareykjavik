-- Add access_token column to meal_cards table for magic link access
ALTER TABLE meal_cards 
ADD COLUMN IF NOT EXISTS access_token UUID DEFAULT gen_random_uuid();

-- Create unique index on access_token for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_meal_cards_access_token ON meal_cards(access_token);

-- Generate tokens for existing cards that don't have one
UPDATE meal_cards 
SET access_token = gen_random_uuid() 
WHERE access_token IS NULL;

COMMENT ON COLUMN meal_cards.access_token IS 'Unique token for direct card access via magic link (no login required)';

