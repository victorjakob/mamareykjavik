-- Meal Cards Table Migration
-- ===========================
-- This table stores meal card purchases (e.g., 5 Meals for Winter offer)
-- 
-- Features:
-- - Links purchases to user accounts via email
-- - Tracks remaining meals and validity period
-- - Stores payment information and order details
-- - Automatic updated_at timestamp via trigger
-- - Indexed for fast lookups by order_id, email, and status
--
-- Note: No RLS policies - authorization is handled in API routes via NextAuth
--
-- Usage:
-- - API route: /api/saltpay/5-meals
-- - Order ID format: random hex string (12 chars)
-- - Status: pending, paid, used, expired

CREATE TABLE IF NOT EXISTS meal_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  
  -- Buyer Information
  buyer_email TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  
  -- Card Details
  meals_remaining INTEGER NOT NULL DEFAULT 5,
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  
  -- Payment Information
  price INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, paid, used, expired
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Additional data (for future flexibility)
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_meal_cards_order_id ON meal_cards(order_id);
CREATE INDEX IF NOT EXISTS idx_meal_cards_email ON meal_cards(buyer_email);
CREATE INDEX IF NOT EXISTS idx_meal_cards_status ON meal_cards(status);
CREATE INDEX IF NOT EXISTS idx_meal_cards_valid_until ON meal_cards(valid_until);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_meal_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER meal_cards_updated_at
  BEFORE UPDATE ON meal_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_meal_cards_updated_at();

-- Comments for documentation
COMMENT ON TABLE meal_cards IS 'Stores meal card purchases linked to user accounts via email';
COMMENT ON COLUMN meal_cards.order_id IS 'SaltPay order ID for payment tracking';
COMMENT ON COLUMN meal_cards.buyer_email IS 'Email address - used to link to user account when created';
COMMENT ON COLUMN meal_cards.meals_remaining IS 'Number of meals remaining on the card';
COMMENT ON COLUMN meal_cards.status IS 'Card status: pending (payment pending), paid (active), used (all meals used), expired (past valid_until)';


