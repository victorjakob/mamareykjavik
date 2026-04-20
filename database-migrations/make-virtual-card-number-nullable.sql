-- Make virtual_card_number nullable on membership_payment_methods.
-- ----------------------------------------------------------------
-- Context: SecurePay does NOT return a virtualcardnumber/VCN in its callback
-- payload (empirically confirmed April 2026 — see auto-memory
-- project_mama_teya_savecard_blocker.md). The `savecard=true` flag is silently
-- ignored.
--
-- Mama's new signup flow uses Teya's RPG tokenization directly:
--   1. Browser posts card → /api/token/single (Teya RPG, public key) → SingleToken
--   2. Server converts SingleToken → MultiToken (/api/token/multi)
--   3. Server runs first CIT payment (/api/payment, PaymentType:"TokenMulti")
--   4. Server stores `rpg_multi_token` on membership_payment_methods and
--      NEVER sees a PAN. There IS no virtual_card_number in this flow.
--
-- The original `virtual_card_number TEXT NOT NULL` constraint blocked the new
-- flow from inserting a payment method at all. Make it nullable so RPG-only
-- rows can exist.
--
-- Safe to re-run (ALTER COLUMN DROP NOT NULL is idempotent).

ALTER TABLE public.membership_payment_methods
  ALTER COLUMN virtual_card_number DROP NOT NULL;

COMMENT ON COLUMN public.membership_payment_methods.virtual_card_number IS
  'Legacy SecurePay SaveCard virtual card number (VCN). Nullable — the live flow is RPG-direct tokenization, where only rpg_multi_token is populated. Kept only for historical rows from the deprecated SaveCard experiment.';
