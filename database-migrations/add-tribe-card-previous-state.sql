-- Add `previous_state` to tribe_cards so we can temporarily boost a member's
-- discount while they have a paid subscription and restore their underlying
-- card when the subscription cancels/expires.
--
-- Scenario: a legacy holder with 15% unlimited subscribes to Tribe (20%
-- monthly). While subscribed they see 20%. If they later cancel, we revert
-- to 15% unlimited instead of losing their original grant.
--
-- The snapshot is written by mergeTribeCardExtension() in membershipTeya.js
-- on the upgrade path, and cleared by restoreTribeCardFromPrevious() on
-- cancellation or renewal hard-fail. Shape:
--   {
--     source:           "legacy" | "friends-family" | "gift" | ...,
--     discount_percent: number,
--     duration_type:    "month" | "6months" | "year" | "unlimited",
--     expires_at:       ISO timestamp | null,
--     holder_name:      string | null
--   }

alter table tribe_cards
  add column if not exists previous_state jsonb;

comment on column tribe_cards.previous_state is
  'Snapshot of this card''s original benefit before a paid subscription temporarily boosted it. Restored on cancellation if still valid.';
