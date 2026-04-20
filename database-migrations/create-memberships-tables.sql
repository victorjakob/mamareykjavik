-- Memberships System Migration
-- =============================
-- Monthly / recurring membership subscriptions (Free, Tribe, Patron).
-- Uses Teya SecurePay for the initial card-on-file signup (CIT, 3-D Secure),
-- then Teya B-API / Greiðslugátt for monthly MIT renewals against the stored
-- virtual card token.
--
-- Three tables:
--
--   1. membership_subscriptions — one per user (keyed by email, like tribe_cards)
--      Holds tier, status, period boundaries, next_billing_date, cancel flags,
--      and a nullable link to the tribe_cards row we auto-issue for paid tiers.
--
--   2. membership_payment_methods — Teya virtual card tokens. Only the token,
--      expiry (MMYY), last 4 digits, and brand are kept. NEVER a real PAN.
--
--   3. membership_payment_events — audit log of every checkout / webhook /
--      renewal / refund. Append-only from API routes.
--
-- Conventions match meal_cards / tribe_cards / gift_cards:
--   - No RLS; authorization is enforced in API routes (NextAuth session).
--   - updated_at is maintained by a trigger (reuse update_tribe_updated_at()
--     so we don't duplicate trigger functions).
--   - metadata JSONB for future flexibility.
--
-- Idempotent where possible (IF NOT EXISTS) so re-running is safe.

-- ─── Subscriptions table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS membership_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Member identity. Email is the primary link (same as tribe_cards), and we
  -- also store user_id when the member has a mama.is account.
  member_email TEXT NOT NULL,
  member_name  TEXT,
  user_id      UUID,                        -- mirrors tribe_cards.user_id pattern
                                            -- (no FK since users table lives
                                            -- in Supabase Auth schema)

  -- Tier and pricing. Patron is pay-what-you-want with a 20k ISK floor, so
  -- price_amount is stored per-subscription (in major ISK units, whole
  -- numbers — Teya accepts e.g. "2000.00" on the wire).
  tier           TEXT NOT NULL
    CHECK (tier IN ('free','tribe','patron')),
  price_amount   INTEGER NOT NULL DEFAULT 0,     -- ISK, whole numbers. 0 for free.
  currency       TEXT NOT NULL DEFAULT 'ISK',
  interval_unit  TEXT NOT NULL DEFAULT 'month'
    CHECK (interval_unit IN ('month','year')),

  -- Lifecycle. See docs for the state machine.
  status TEXT NOT NULL DEFAULT 'pending_payment'
    CHECK (status IN (
      'pending_payment',    -- created at checkout, awaiting Teya webhook
      'active',             -- current, benefits on
      'grace_period',       -- renewal failed, retry scheduled
      'past_due',           -- retries exhausted; benefits paused
      'paused',             -- member-initiated pause
      'canceled',           -- terminal
      'abandoned'           -- pending_payment that expired
    )),
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  next_billing_date     TIMESTAMPTZ,
  cancel_at_period_end  BOOLEAN NOT NULL DEFAULT FALSE,
  canceled_at           TIMESTAMPTZ,
  paused_at             TIMESTAMPTZ,

  -- Link to the tribe_cards row we issue / extend for paid tiers.
  -- Null for free tier. ON DELETE SET NULL so removing a card doesn't break
  -- the subscription record.
  tribe_card_id UUID REFERENCES tribe_cards(id) ON DELETE SET NULL,

  -- Free-form notes + future-proofing (e.g. referral codes, Stripe migration)
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- At most one non-terminal subscription per email. Re-subscribes update the
-- existing row rather than inserting a new one.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_memberships_one_active_per_email
  ON membership_subscriptions(member_email)
  WHERE status IN ('pending_payment','active','grace_period','past_due','paused');

CREATE INDEX IF NOT EXISTS idx_memberships_status     ON membership_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_memberships_next_bill  ON membership_subscriptions(next_billing_date)
  WHERE status IN ('active','grace_period');
CREATE INDEX IF NOT EXISTS idx_memberships_user_id    ON membership_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_tier       ON membership_subscriptions(tier);

-- Reuse the updated_at trigger function created by the tribe-cards migration.
DROP TRIGGER IF EXISTS membership_subscriptions_updated_at ON membership_subscriptions;
CREATE TRIGGER membership_subscriptions_updated_at
  BEFORE UPDATE ON membership_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_tribe_updated_at();

-- ─── Payment methods (Teya virtual card tokens) ──────────────────────────────
CREATE TABLE IF NOT EXISTS membership_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  subscription_id UUID NOT NULL
    REFERENCES membership_subscriptions(id) ON DELETE CASCADE,
  member_email    TEXT NOT NULL,

  -- Teya-issued virtual card number (token) — NOT a real PAN. Safe to store.
  provider               TEXT NOT NULL DEFAULT 'teya',
  virtual_card_number    TEXT NOT NULL,
  card_expiration        TEXT,            -- MMYY
  card_last4             TEXT,
  card_brand             TEXT,            -- VISA, MC, AMEX...

  -- The first (customer-initiated, SCA-authenticated) transaction id.
  -- Subsequent MIT renewals must reference it for PSD2/SCA exemption.
  initial_transaction_id TEXT,

  is_default BOOLEAN NOT NULL DEFAULT TRUE,
  metadata   JSONB   NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One default card per subscription.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_pm_default_per_sub
  ON membership_payment_methods(subscription_id)
  WHERE is_default;

CREATE INDEX IF NOT EXISTS idx_pm_subscription ON membership_payment_methods(subscription_id);
CREATE INDEX IF NOT EXISTS idx_pm_email        ON membership_payment_methods(member_email);

DROP TRIGGER IF EXISTS membership_payment_methods_updated_at ON membership_payment_methods;
CREATE TRIGGER membership_payment_methods_updated_at
  BEFORE UPDATE ON membership_payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_tribe_updated_at();

-- ─── Payment events (audit log) ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS membership_payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  subscription_id UUID REFERENCES membership_subscriptions(id) ON DELETE SET NULL,
  member_email    TEXT,

  event_type TEXT NOT NULL
    CHECK (event_type IN (
      'checkout_created',           -- user hit /api/membership/checkout
      'initial_charge_succeeded',   -- Teya webhook confirmed initial CIT
      'initial_charge_failed',      -- Teya webhook reported failure
      'renewal_attempted',          -- cron started a MIT renewal
      'renewal_succeeded',
      'renewal_failed',
      'refund_issued',
      'card_updated',
      'subscription_canceled',
      'subscription_paused',
      'webhook_rejected'
    )),

  order_id       TEXT,            -- Teya orderid, 12-char alphanumeric
  transaction_id TEXT,            -- Teya TransactionID / AuthorizationCode
  amount         INTEGER,         -- ISK major units; negative for refunds
  currency       TEXT,
  action_code    TEXT,            -- Teya decline code when applicable
  message        TEXT,

  raw       JSONB NOT NULL DEFAULT '{}'::jsonb,     -- redacted Teya payload
  metadata  JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotency: one success event per (order_id, event_type).
CREATE UNIQUE INDEX IF NOT EXISTS uniq_membership_payment_events_success
  ON membership_payment_events(order_id, event_type)
  WHERE event_type IN ('initial_charge_succeeded','renewal_succeeded');

CREATE INDEX IF NOT EXISTS idx_mpe_subscription   ON membership_payment_events(subscription_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mpe_order_id       ON membership_payment_events(order_id);
CREATE INDEX IF NOT EXISTS idx_mpe_email          ON membership_payment_events(member_email);

-- ─── Documentation ───────────────────────────────────────────────────────────
COMMENT ON TABLE  membership_subscriptions      IS 'Recurring community memberships (Free / Tribe / Patron).';
COMMENT ON COLUMN membership_subscriptions.tier IS 'free = no payment; tribe = 2000 ISK/mo fixed; patron = pay-what-you-want ≥ 20000 ISK/mo.';
COMMENT ON COLUMN membership_subscriptions.price_amount IS 'ISK major units (whole kr). 0 for free. ≥20000 for patron.';
COMMENT ON COLUMN membership_subscriptions.tribe_card_id  IS 'Auto-issued tribe_cards row for paid tiers (source=paid-tribe). Null for free.';
COMMENT ON TABLE  membership_payment_methods    IS 'Teya virtual card tokens for MIT recurring charges. Never holds real PANs.';
COMMENT ON TABLE  membership_payment_events     IS 'Append-only audit log of every checkout, webhook, renewal, and refund.';
