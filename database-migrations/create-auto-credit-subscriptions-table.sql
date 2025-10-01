-- Create auto_credit_subscriptions table for monthly auto-credit functionality
CREATE TABLE IF NOT EXISTS auto_credit_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  monthly_amount INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  next_payment_date TIMESTAMPTZ NOT NULL,
  last_payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_auto_credit_subscriptions_email ON auto_credit_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_auto_credit_subscriptions_next_payment ON auto_credit_subscriptions(next_payment_date);
CREATE INDEX IF NOT EXISTS idx_auto_credit_subscriptions_active ON auto_credit_subscriptions(is_active);

-- Note: RLS is disabled since we're using NextAuth for authentication
-- API routes are protected with NextAuth session checks instead

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_auto_credit_subscriptions_updated_at 
  BEFORE UPDATE ON auto_credit_subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
