-- Create gift card usage history table
CREATE TABLE IF NOT EXISTS gift_card_usage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_card_id UUID NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
  amount_used INTEGER NOT NULL, -- Amount redeemed in ISK
  balance_remaining_after INTEGER NOT NULL, -- Balance after this redemption
  used_at TIMESTAMPTZ DEFAULT NOW(),
  used_by_email TEXT,
  order_id UUID, -- Reference to order where gift card was used (if applicable)
  notes TEXT,
  CONSTRAINT amount_used_positive CHECK (amount_used > 0)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_gift_card_usage_history_card_id ON gift_card_usage_history(gift_card_id);
CREATE INDEX IF NOT EXISTS idx_gift_card_usage_history_used_at ON gift_card_usage_history(used_at DESC);
CREATE INDEX IF NOT EXISTS idx_gift_card_usage_history_order_id ON gift_card_usage_history(order_id);

COMMENT ON TABLE gift_card_usage_history IS 'Tracks every time gift cards are redeemed';
COMMENT ON COLUMN gift_card_usage_history.amount_used IS 'Amount redeemed in ISK in this transaction';
COMMENT ON COLUMN gift_card_usage_history.balance_remaining_after IS 'Balance remaining on card after this redemption';

