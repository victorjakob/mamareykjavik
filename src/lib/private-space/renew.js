// Private Space — recurring-weekly renewal engine.
// -----------------------------------------------------------------------------
// Mirrors src/lib/membershipRenew.js in shape, simplified for the smaller
// Private Space data model (no tribe-card side effects, no wallet pushes).
//
// Called by:
//   • /api/cron/renew-private-space (Vercel Cron, daily)
//   • a future admin "Retry now" button (when we add /private-space/admin/[ref])
//
// Flow per subscription:
//   1. If cancellation_effective_at <= now → finalise (status='cancelled'),
//      do NOT charge.
//   2. Sanity check the row has a card token + amount; else status='failed'.
//   3. Compute orderId. Call mitChargeRenewal() — which on first run will
//      exchange the stored VCN for an RPG MultiToken, and on subsequent runs
//      will MIT-charge the existing Token directly.
//   4a. RPG env not configured → safe no-op (skipped_rpg_stub). The cron
//       returns this in its results array so it's visible in Vercel logs.
//   4b. Success → advance next_charge_at by one month off the previous
//       anchor (stable day-of-month), reset failed_charge_count.
//   4c. Failure → classifyDecline + retry schedule. Hard-fail or exhausted
//       attempts → status='failed'; soft-fail → push next_charge_at out
//       by RETRY_OFFSETS_DAYS[attempts] days.
//
// No emails sent in this v1 — see W3 punch-list note. Vercel logs are the
// audit trail until first real subscription exists.

import {
  addOneMonth,
  classifyDecline,
  mitChargeRenewal,
  newOrderId,
} from "@/lib/membershipTeya";

// Same shape as membership: two retries, then terminal failure.
//   day 0 fail → +3 days → +4 days = 7 days total grace window
export const RETRY_OFFSETS_DAYS = [3, 4];

/**
 * Process a single Private Space subscription renewal.
 *
 * @param {object} supabase  service-role Supabase client
 * @param {object} sub       full row from private_space_subscriptions
 * @param {Date}   now       reference clock (cron passes one Date for the whole batch)
 * @returns {Promise<object>} action result for the cron's results array
 */
export async function renewPrivateSpaceOne(supabase, sub, now = new Date()) {
  // ─── 1. Scheduled cancellation reached → finalise, do not charge ──────────
  if (
    sub.cancellation_effective_at &&
    new Date(sub.cancellation_effective_at) <= now
  ) {
    await supabase
      .from("private_space_subscriptions")
      .update({
        status: "cancelled",
        cancelled_at: sub.cancelled_at || now.toISOString(),
      })
      .eq("id", sub.id);
    return { subscriptionId: sub.id, action: "cancelled_at_period_end" };
  }

  // ─── 2. Need a card token + a non-zero amount to even attempt ────────────
  if (!sub.rpg_multitoken || !sub.monthly_amount_isk) {
    await supabase
      .from("private_space_subscriptions")
      .update({ status: "failed" })
      .eq("id", sub.id);
    return { subscriptionId: sub.id, action: "no_card" };
  }

  // ─── 3. Charge via the shared MIT orchestrator ───────────────────────────
  // metadata.multitoken_minted_at tells us whether rpg_multitoken is the raw
  // SecurePay VCN (first-run bootstrap needed) or an actual RPG MultiToken.
  const minted = Boolean(sub.metadata?.multitoken_minted_at);
  const orderId = newOrderId();

  const charge = await mitChargeRenewal({
    amountIsk: sub.monthly_amount_isk,
    orderId,
    rpgMultiToken: minted ? sub.rpg_multitoken : null,
    virtualCardNumber: minted ? null : sub.rpg_multitoken,
    virtualCardExpiration: sub.metadata?.virtualcardexpiration || null,
    initialTransactionId: sub.metadata?.initial_transaction_id || null,
  });

  // ─── 3a. Persist a freshly minted MultiToken if mitChargeRenewal made one ─
  // We do this regardless of charge outcome — if the token exchange worked
  // but the subsequent charge declined, we still want the Token for next run.
  if (charge.newRpgMultiToken) {
    await supabase
      .from("private_space_subscriptions")
      .update({
        rpg_multitoken: charge.newRpgMultiToken,
        metadata: {
          ...(sub.metadata || {}),
          multitoken_minted_at: now.toISOString(),
        },
      })
      .eq("id", sub.id);
  }

  // ─── 4a. RPG not configured yet (dev/prelaunch) → safe stub ──────────────
  if (charge.notImplemented) {
    return {
      subscriptionId: sub.id,
      action: "skipped_rpg_stub",
      reason: charge.reason,
    };
  }

  // ─── 4b. Success — advance next_charge_at, reset failure counter ─────────
  if (charge.ok) {
    // Anchor off the previous next_charge_at (or now as fallback) so the
    // billing day-of-month stays stable across months and across retries.
    const anchor =
      sub.next_charge_at && new Date(sub.next_charge_at) > new Date(0)
        ? new Date(sub.next_charge_at)
        : now;
    const nextCharge = addOneMonth(anchor);

    await supabase
      .from("private_space_subscriptions")
      .update({
        status: "active",
        last_charge_at: now.toISOString(),
        next_charge_at: nextCharge.toISOString(),
        failed_charge_count: 0,
        metadata: {
          ...(sub.metadata || {}),
          // Soft audit trail without a separate events table for v1.
          last_charge_attempt: {
            order_id: orderId,
            outcome: "success",
            action_code: charge.actionCode,
            transaction_id: charge.transactionId,
            at: now.toISOString(),
          },
          // Promote multitoken_minted_at if we minted it this run (already set above).
          multitoken_minted_at:
            sub.metadata?.multitoken_minted_at ||
            (charge.newRpgMultiToken ? now.toISOString() : undefined),
        },
      })
      .eq("id", sub.id);

    return {
      subscriptionId: sub.id,
      action: "renewed",
      nextChargeAt: nextCharge.toISOString(),
      orderId,
      transactionId: charge.transactionId,
    };
  }

  // ─── 4c. Failure — retry schedule or terminal failure ────────────────────
  const classification = classifyDecline(charge.actionCode);
  const attempts = Number(sub.failed_charge_count || 0) + 1;
  const exhausted = attempts > RETRY_OFFSETS_DAYS.length;

  if (classification === "hard_fail" || exhausted) {
    await supabase
      .from("private_space_subscriptions")
      .update({
        status: "failed",
        failed_charge_count: attempts,
        metadata: {
          ...(sub.metadata || {}),
          last_charge_attempt: {
            order_id: orderId,
            outcome: "failed_terminal",
            action_code: charge.actionCode,
            message: charge.message,
            at: now.toISOString(),
          },
        },
      })
      .eq("id", sub.id);

    return {
      subscriptionId: sub.id,
      action: "failed_terminal",
      reason: charge.actionCode || classification,
    };
  }

  // Soft fail — push next_charge_at out, keep status='active' so we retry.
  const retryDays = RETRY_OFFSETS_DAYS[attempts - 1];
  const retryDate = new Date(now);
  retryDate.setDate(retryDate.getDate() + retryDays);

  await supabase
    .from("private_space_subscriptions")
    .update({
      status: "active",
      next_charge_at: retryDate.toISOString(),
      failed_charge_count: attempts,
      metadata: {
        ...(sub.metadata || {}),
        last_charge_attempt: {
          order_id: orderId,
          outcome: "failed_retry",
          action_code: charge.actionCode,
          message: charge.message,
          retry_on: retryDate.toISOString(),
          at: now.toISOString(),
        },
      },
    })
    .eq("id", sub.id);

  return {
    subscriptionId: sub.id,
    action: "retry_scheduled",
    retryOn: retryDate.toISOString(),
    reason: charge.actionCode,
    attempts,
  };
}
