-- Custom Cards Table Migration
-- ===========================
-- This table stores custom cards created by admins
-- 
-- Features:
-- - Admin-created cards for specific companies/persons
-- - Magic link access via access_token
-- - Flexible expiration options (none, date, monthly reset, monthly add)
-- - Email delivery with magic link
-- - Tracks remaining balance
-- - Admin-only description field
--
-- Usage:
-- - API route: /api/admin/custom-cards
-- - Card access: /custom-card/[token]
-- - Status: active, used, expired, cancelled
-- - Expiration types: none, date, monthly_reset, monthly_add

CREATE TABLE IF NOT EXISTS custom_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Access token for magic link
  access_token UUID UNIQUE DEFAULT gen_random_uuid(),
  
  -- Card Information
  card_name TEXT NOT NULL, -- Name of the card (e.g., "Employee Card", "VIP Card")
  company_person TEXT, -- Company or person this card belongs to
  
  -- Card Details
  amount INTEGER NOT NULL, -- Card value in ISK
  remaining_balance INTEGER NOT NULL, -- Remaining balance (starts equal to amount)
  
  -- Recipient Information
  recipient_email TEXT NOT NULL, -- Email to send magic link to
  recipient_name TEXT, -- Optional recipient name
  
  -- Expiration Settings
  expiration_type TEXT NOT NULL DEFAULT 'none', -- 'none', 'date', 'monthly_reset', 'monthly_add'
  expiration_date TIMESTAMPTZ, -- For 'date' type
  monthly_amount INTEGER, -- For 'monthly_add' type - amount to add each month
  last_reset_date TIMESTAMPTZ, -- Track when monthly reset/add last occurred
  
  -- Admin Notes
  admin_description TEXT, -- Optional description (only visible to admins)
  
  -- Status Tracking
  status TEXT DEFAULT 'active', -- 'active', 'used', 'expired', 'cancelled'
  sent_at TIMESTAMPTZ, -- When email was sent
  email_sent BOOLEAN DEFAULT false, -- Track if email has been sent
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT, -- Admin email who created the card
  
  -- Additional data (for future flexibility)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Constraints
  CONSTRAINT amount_positive CHECK (amount > 0),
  CONSTRAINT remaining_balance_non_negative CHECK (remaining_balance >= 0),
  CONSTRAINT valid_expiration_type CHECK (expiration_type IN ('none', 'date', 'monthly_reset', 'monthly_add')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'used', 'expired', 'cancelled'))
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_custom_cards_access_token ON custom_cards(access_token);
CREATE INDEX IF NOT EXISTS idx_custom_cards_recipient_email ON custom_cards(recipient_email);
CREATE INDEX IF NOT EXISTS idx_custom_cards_status ON custom_cards(status);
CREATE INDEX IF NOT EXISTS idx_custom_cards_expiration_date ON custom_cards(expiration_date);
CREATE INDEX IF NOT EXISTS idx_custom_cards_company_person ON custom_cards(company_person);
CREATE INDEX IF NOT EXISTS idx_custom_cards_created_at ON custom_cards(created_at DESC);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_custom_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER custom_cards_updated_at
  BEFORE UPDATE ON custom_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_cards_updated_at();

-- Comments for documentation
COMMENT ON TABLE custom_cards IS 'Stores admin-created custom cards with flexible expiration options';
COMMENT ON COLUMN custom_cards.access_token IS 'Unique token for direct card access via magic link';
COMMENT ON COLUMN custom_cards.card_name IS 'Name of the card (e.g., "Employee Card", "VIP Card")';
COMMENT ON COLUMN custom_cards.company_person IS 'Company or person this card belongs to';
COMMENT ON COLUMN custom_cards.expiration_type IS 'Type of expiration: none (no expiration), date (specific date), monthly_reset (reset to original amount monthly), monthly_add (add monthly_amount each month)';
COMMENT ON COLUMN custom_cards.monthly_amount IS 'Amount to add each month for monthly_add expiration type';
COMMENT ON COLUMN custom_cards.last_reset_date IS 'Date when monthly reset/add last occurred';
COMMENT ON COLUMN custom_cards.admin_description IS 'Optional description visible only to admins';
COMMENT ON COLUMN custom_cards.status IS 'Card status: active (usable), used (fully redeemed), expired (past expiration), cancelled (admin cancelled)';

