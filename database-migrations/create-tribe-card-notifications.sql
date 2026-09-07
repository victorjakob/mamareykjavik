-- Tribe card lifecycle notifications
-- ---------------------------------------------------------------------------
-- One row per (card, kind) so the daily lifecycle cron can never send the
-- same nudge twice. Kinds:
--   expiring_30d       "your card ends soon" — 30 days before expires_at
--   expired            sent the day the card flips to status = 'expired'
--   expired_followup   gentle nudge ~14 days after expiry
--   tribe_invite       one-off invitation to paid Tribe for unlimited cards
--
-- Apply with:
--   psql "$SUPABASE_DB_URL" -f database-migrations/create-tribe-card-notifications.sql

CREATE TABLE IF NOT EXISTS tribe_card_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tribe_card_id UUID NOT NULL REFERENCES tribe_cards(id) ON DELETE CASCADE,
  kind TEXT NOT NULL
    CHECK (kind IN ('expiring_30d','expired','expired_followup','tribe_invite')),
  sent_to TEXT NOT NULL,
  provider_id TEXT,              -- Resend message id (null when skipped)
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_tribe_card_notification
  ON tribe_card_notifications(tribe_card_id, kind);
CREATE INDEX IF NOT EXISTS idx_tribe_card_notifications_kind
  ON tribe_card_notifications(kind, sent_at DESC);

COMMENT ON TABLE tribe_card_notifications IS
  'Dedupe log for tribe-card lifecycle emails (expiry warnings, expired notice, follow-up, paid-Tribe invite).';
