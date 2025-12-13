-- Gift Cards Table Migration
-- ===========================
-- This table stores gift card purchases
-- 
-- Features:
-- - Links purchases to user accounts via email
-- - Tracks remaining balance
-- - Stores payment information and order details
-- - Supports multiple delivery methods (email, pickup, mail)
-- - Automatic updated_at timestamp via trigger
-- - Indexed for fast lookups by order_id, email, status, and access_token
--
-- Note: No RLS policies - authorization is handled in API routes via NextAuth
--
-- Usage:
-- - API route: /api/saltpay/giftcard
-- - Order ID format: random hex string (12 chars)
-- - Status: pending, paid, sent, used, expired
-- - Delivery methods: email, pickup, mail

CREATE TABLE IF NOT EXISTS gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  
  -- Access token for magic link (like meal cards)
  access_token UUID UNIQUE DEFAULT gen_random_uuid(),
  
  -- Buyer Information
  buyer_email TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  
  -- Recipient Information (optional, for email delivery)
  recipient_email TEXT,
  recipient_name TEXT,
  
  -- Card Details
  amount INTEGER NOT NULL, -- Gift card value in ISK
  remaining_balance INTEGER NOT NULL, -- Remaining balance (starts equal to amount)
  
  -- Delivery Information
  delivery_method TEXT NOT NULL, -- 'email', 'pickup', 'mail'
  shipping_address JSONB, -- For mail delivery: {address, city, zip, phone, etc.}
  shipping_cost INTEGER DEFAULT 0, -- 690 kr for mail delivery
  
  -- Status Tracking
  status TEXT DEFAULT 'pending', -- pending, paid, sent, used, expired
  sent_at TIMESTAMPTZ, -- When mailed/emailed
  picked_up BOOLEAN DEFAULT false, -- For pickup method
  picked_up_at TIMESTAMPTZ, -- When picked up
  
  -- Payment Information
  price INTEGER NOT NULL, -- Total price paid (amount + shipping_cost)
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Additional data (for future flexibility)
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_gift_cards_order_id ON gift_cards(order_id);
CREATE INDEX IF NOT EXISTS idx_gift_cards_access_token ON gift_cards(access_token);
CREATE INDEX IF NOT EXISTS idx_gift_cards_buyer_email ON gift_cards(buyer_email);
CREATE INDEX IF NOT EXISTS idx_gift_cards_status ON gift_cards(status);
CREATE INDEX IF NOT EXISTS idx_gift_cards_delivery_method ON gift_cards(delivery_method);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_gift_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gift_cards_updated_at
  BEFORE UPDATE ON gift_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_gift_cards_updated_at();

-- Comments for documentation
COMMENT ON TABLE gift_cards IS 'Stores gift card purchases with multiple delivery options';
COMMENT ON COLUMN gift_cards.order_id IS 'SaltPay order ID for payment tracking';
COMMENT ON COLUMN gift_cards.access_token IS 'Unique token for direct card access via magic link (no login required)';
COMMENT ON COLUMN gift_cards.buyer_email IS 'Email address of the purchaser';
COMMENT ON COLUMN gift_cards.amount IS 'Gift card value in ISK';
COMMENT ON COLUMN gift_cards.remaining_balance IS 'Remaining balance on the gift card';
COMMENT ON COLUMN gift_cards.delivery_method IS 'Delivery method: email (instant), pickup (store), mail (shipped)';
COMMENT ON COLUMN gift_cards.status IS 'Card status: pending (payment pending), paid (active), sent (mailed/emailed), used (fully redeemed), expired (if applicable)';

