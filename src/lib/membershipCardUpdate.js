// Shared finalisation tail for the "update payment card" self-service flow.
// -----------------------------------------------------------------------------
// Called by both /api/membership/update-card (frictionless 3DS path) and
// /api/membership/rpg-verify (post-challenge completion, when the stashed
// metadata.threeds.flow === "card_update"). Keeping this in one place means
// "verified new card → stored + outstanding renewal retried" is computed
// identically regardless of whether the bank asked for a challenge.
//
// Why there is NO charge here:
//   membershipTeya.js has no verify-only / zero-amount payment helper, and
//   the MIT renewal leg (chargeRpgMultiToken via mitChargeRenewal) only needs
//   the MultiToken on the wire — initial_transaction_id is audit linkage, not
//   a request field. The SCA requirement is satisfied by the MPI enrollment /
//   validation the caller already ran; the first real money movement on the
//   new card is either the immediate renewOne() retry below (grace_period /
//   past_due) or the next scheduled cron renewal. Charging active members
//   just to swap a card would double-bill them mid-period.
//
// Input:
//   supabase, subscriptionId, email,
//   multiToken, last4, brand, expiration (MMYY or null), orderId
//
// Side effects:
//   - DELETE + INSERT on membership_payment_methods for (subscriptionId,
//     default) — a legacy member with no row simply matches nothing on the
//     delete and gets a fresh insert.
//   - UPDATE membership_subscriptions.metadata — clears any threeds challenge
//     state, stamps card_updated_at.
//   - Audits 'card_updated' (explicitly allowed by the events CHECK).
//   - If the subscription is grace_period / past_due, immediately re-runs the
//     outstanding renewal through renewOne() — the exact invocation pattern
//     the admin "Retry now" button uses — so the member doesn't wait for the
//     cron to restore their benefits.
//
// Returns:
//   { ok: true, renewal: <renewOne result> | null }

import { redactTeyaPayload } from "@/lib/membershipTeya";
import { renewOne } from "@/lib/membershipRenew";

export async function applyCardUpdate({
  supabase,
  subscriptionId,
  email,
  multiToken,
  last4,
  brand,
  expiration,          // MMYY string hinted by the browser form, or null
  orderId,
}) {
  // One default card per subscription — replace whatever is on file.
  await supabase.from("membership_payment_methods")
    .delete()
    .eq("subscription_id", subscriptionId)
    .eq("is_default", true);
  await supabase.from("membership_payment_methods").insert({
    subscription_id:        subscriptionId,
    member_email:           email,
    provider:               "teya",
    virtual_card_number:    null,                       // RPG flow uses multi-token only
    rpg_multi_token:        multiToken,
    card_expiration:        expiration || null,
    card_last4:             last4 || null,
    card_brand:             brand || null,
    // No charge happens during a card update, so there is no fresh CIT
    // transaction id. mitChargeRenewal only logs its presence — the MIT
    // request itself never sends it — so renewals keep working without one.
    initial_transaction_id: null,
    is_default:             true,
  });

  // Re-read the subscription: renewOne() needs the full row, and we want the
  // freshest status before deciding whether to retry the outstanding renewal.
  const { data: subRow } = await supabase
    .from("membership_subscriptions")
    .select(`
      id, member_email, member_name, user_id, tier, price_amount, currency, status,
      current_period_start, current_period_end, next_billing_date,
      cancel_at_period_end, tribe_card_id, metadata
    `)
    .eq("id", subscriptionId)
    .maybeSingle();

  // Clear any 3DS challenge state + stamp the update.
  const cleanMetadata = { ...(subRow?.metadata || {}) };
  delete cleanMetadata.threeds;
  cleanMetadata.card_updated_at = new Date().toISOString();
  await supabase.from("membership_subscriptions")
    .update({ metadata: cleanMetadata })
    .eq("id", subscriptionId);

  // ─── Audit (event_type 'card_updated' is in the events CHECK) ───────────
  await supabase.from("membership_payment_events").insert({
    subscription_id: subscriptionId,
    member_email:    email,
    event_type:      "card_updated",
    order_id:        orderId || null,
    message:         last4
      ? `Member saved a new card (•••• ${last4}).`
      : "Member saved a new card.",
    raw: redactTeyaPayload({ flow: "rpg_card_update", brand: brand || null, last4: last4 || null }),
  });

  // ─── Outstanding renewal → retry right now ───────────────────────────────
  // Same ad-hoc renewOne() call as /api/admin/memberships/[id]/retry, so the
  // dunning state machine + audit trail stay single-sourced. Best effort —
  // the card update itself already succeeded even if the retry declines.
  let renewal = null;
  if (subRow && ["grace_period", "past_due"].includes(subRow.status)) {
    try {
      renewal = await renewOne(supabase, subRow, new Date());
    } catch (err) {
      console.error("applyCardUpdate renewOne crashed for", subscriptionId, err);
      renewal = { subscriptionId, action: "retry_crashed", error: String(err?.message || err) };
    }
  }

  return { ok: true, renewal };
}
