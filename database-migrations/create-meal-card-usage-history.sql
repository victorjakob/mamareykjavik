-- Create meal card usage history table
CREATE TABLE IF NOT EXISTS meal_card_usage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_card_id UUID NOT NULL REFERENCES meal_cards(id) ON DELETE CASCADE,
  quantity_used INTEGER NOT NULL,
  meals_remaining_after INTEGER NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  used_by_email TEXT,
  notes TEXT,
  CONSTRAINT quantity_used_positive CHECK (quantity_used > 0)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_meal_card_usage_history_card_id ON meal_card_usage_history(meal_card_id);
CREATE INDEX IF NOT EXISTS idx_meal_card_usage_history_used_at ON meal_card_usage_history(used_at DESC);

COMMENT ON TABLE meal_card_usage_history IS 'Tracks every time meals are used from a card';
COMMENT ON COLUMN meal_card_usage_history.quantity_used IS 'Number of meals used in this transaction';
COMMENT ON COLUMN meal_card_usage_history.meals_remaining_after IS 'Meals remaining on card after this use';

