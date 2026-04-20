// Shared renewal engine.
// -----------------------------------------------------------------------------
// The monthly Vercel cron (/api/cron/renew-memberships) and the admin
// "Retry now" button (/api/admin/memberships/[id]/retry) both call renewOne()
// so the state machine lives in exactly one place. Changing retry behaviour,
// tribe-card side effects or dunning emails here updates both paths.
//
// The single-source-of-truth also means the admin button produces the same
// membership_payment_events audit trail as the cron, which makes per-member
// debugging much easier.

import {
  mitChargeRenewal,
  classifyDecline,
  newOrderId,
  mergeTribeCardExtension,
  restoreTribeCardFromPrevious,
} from "@/lib/membershipTeya";
import {
  sendRenewalSucceededEmail,
  sendRenewalSoftFailedEmail,
  sendRenewalFinalFailedEmail,
  sendRenewalNoCardEmail,
  sendCancellationFinalEmail,
} from "@/lib/membershipEmails";

// Retry schedule (days after a failed renewal). After the last entry, we move
// to past_due. Tunable without touching logic.
export const RETRY_OFFSETS_DAYS = [3, 4]; // day 0 fail → retry +3 days → retry +7 days

/**
 * Run a single renewal cycle for one subscription.
 *
 * @param {object}  supabase  service-role Supabase client
 * @param {object}  sub       full subscription row
 * @param {Date}    now       the reference "now" (cron passes a single Date so
 *                            every sub in a batch is processed against the
 *                            same clock)
 * @returns one of the action objects documented in the cron route
 */
export async function renewOne(supabase, sub, now = new Date()) {
  // ─── 1. Cancel-at-period-end → finalise, don't charge ─────────────────────
  if (sub.cancel_at_period_end && sub.current_period_end && new Date(sub.current_period_end) <= now) {
    await supabase.from("membership_subscriptions")
      .update({ status: "canceled", canceled_at: now.toISOString() })
      .eq("id", sub.id);

    // Now that the paid period is over, try to restore any underlying tribe
    // card (e.g. legacy 15% unlimited) that was snapshotted into previous_state
    // when the paid subscription boosted them to 20% monthly. If nothing is
    // snapshotted, or the underlying grant itself has expired, the card is
    // simply expired.
    let cardAction = null;
    if (sub.tribe_card_id) {
      const { data: cardRow } = await supabase
        .from("tribe_cards")
        .select("id, status, source, discount_percent, duration_type, expires_at, holder_name, previous_state")
        .eq("id", sub.tribe_card_id)
        .maybeSingle();
      if (cardRow) {
        const res = restoreTribeCardFromPrevious(cardRow);
        if (res.type !== "noop") {
          const { error: restoreErr } = await supabase
            .from("tribe_cards")
            .update(res.update)
            .eq("id", sub.tribe_card_id);
          if (restoreErr) console.error("restore tribe card after cancel failed:", restoreErr);
          cardAction = res.type; // "restore" | "expire"
        }
      }
    }

    await supabase.from("membership_payment_events").insert({
      subscription_id: sub.id,
      member_email:    sub.member_email,
      event_type:      "subscription_canceled",
      message:         cardAction === "restore"
        ? "Finalised at period end — underlying tribe card restored."
        : "Finalised at period end via cron.",
    });

    try {
      await sendCancellationFinalEmail({
        to:   sub.member_email,
        name: sub.member_name,
        tier: sub.tier,
      });
    } catch (mailErr) {
      console.error("sendCancellationFinalEmail failed for", sub.id, mailErr);
    }

    return { subscriptionId: sub.id, action: "canceled_at_period_end", cardAction };
  }

  // ─── 2. Fetch the stored card token ──────────────────────────────────────
  const { data: pm } = await supabase
    .from("membership_payment_methods")
    .select("id, virtual_card_number, card_expiration, rpg_multi_token, initial_transaction_id, is_default")
    .eq("subscription_id", sub.id)
    .eq("is_default", true)
    .maybeSingle();

  if (!pm?.virtual_card_number && !pm?.rpg_multi_token) {
    await supabase.from("membership_subscriptions")
      .update({ status: "past_due" }).eq("id", sub.id);
    await supabase.from("membership_payment_events").insert({
      subscription_id: sub.id,
      member_email:    sub.member_email,
      event_type:      "renewal_failed",
      message:         "No card token on file.",
    });
    try {
      await sendRenewalNoCardEmail({
        to:       sub.member_email,
        name:     sub.member_name,
        amount:   sub.price_amount,
        currency: sub.currency || "ISK",
      });
    } catch (mailErr) {
      console.error("sendRenewalNoCardEmail failed for", sub.id, mailErr);
    }
    return { subscriptionId: sub.id, action: "no_card" };
  }

  // ─── 3. Attempt the MIT charge via RPG ──────────────────────────────────
  const orderId = newOrderId();
  await supabase.from("membership_payment_events").insert({
    subscription_id: sub.id,
    member_email:    sub.member_email,
    event_type:      "renewal_attempted",
    order_id:        orderId,
    amount:          sub.price_amount,
    currency:        sub.currency || "ISK",
  });

  const charge = await mitChargeRenewal({
    amountIsk:             sub.price_amount,
    orderId,
    rpgMultiToken:         pm.rpg_multi_token,
    virtualCardNumber:     pm.virtual_card_number,
    virtualCardExpiration: pm.card_expiration,
    initialTransactionId:  pm.initial_transaction_id,
  });

  if (charge.newRpgMultiToken && pm.id) {
    await supabase.from("membership_payment_methods")
      .update({ rpg_multi_token: charge.newRpgMultiToken })
      .eq("id", pm.id);
  }

  // ─── 4a. RPG not yet configured → safe default ───────────────────────────
  if (charge.notImplemented) {
    return { subscriptionId: sub.id, action: "skipped_rpg_stub", reason: charge.reason };
  }

  // ─── 4b. Success — extend period, extend tribe card ──────────────────────
  if (charge.ok) {
    const nextEnd = new Date(now);
    nextEnd.setMonth(nextEnd.getMonth() + 1);

    await supabase.from("membership_subscriptions").update({
      status:               "active",
      current_period_start: now.toISOString(),
      current_period_end:   nextEnd.toISOString(),
      next_billing_date:    nextEnd.toISOString(),
    }).eq("id", sub.id);

    if (sub.tribe_card_id) {
      const { data: existingCard } = await supabase
        .from("tribe_cards")
        .select("id, status, source, discount_percent, duration_type, expires_at, previous_state")
        .eq("id", sub.tribe_card_id)
        .maybeSingle();
      if (existingCard) {
        const merged = mergeTribeCardExtension(
          existingCard,
          { expires_at: nextEnd.toISOString() },
          { operation: "renew" },
        );
        if (merged.update) {
          await supabase.from("tribe_cards").update(merged.update).eq("id", sub.tribe_card_id);
        }
      }
    }

    await supabase.from("membership_payment_events").insert({
      subscription_id: sub.id,
      member_email:    sub.member_email,
      event_type:      "renewal_succeeded",
      order_id:        orderId,
      transaction_id:  charge.transactionId || null,
      amount:          sub.price_amount,
      currency:        sub.currency || "ISK",
      raw:             charge.raw || {},
    });

    try {
      await sendRenewalSucceededEmail({
        to:              sub.member_email,
        name:            sub.member_name,
        amount:          sub.price_amount,
        currency:        sub.currency || "ISK",
        nextBillingDate: nextEnd.toISOString(),
        tier:            sub.tier,
        orderId,
        transactionId:   charge.transactionId || null,
      });
    } catch (mailErr) {
      console.error("sendRenewalSucceededEmail failed for", sub.id, mailErr);
    }

    return { subscriptionId: sub.id, action: "renewed", nextBillingDate: nextEnd.toISOString() };
  }

  // ─── 4c. Failure — dunning state machine ─────────────────────────────────
  const classification = classifyDecline(charge.actionCode);

  const { count } = await supabase
    .from("membership_payment_events")
    .select("id", { count: "exact", head: true })
    .eq("subscription_id", sub.id)
    .eq("event_type", "renewal_failed")
    .gte("created_at", sub.current_period_end || new Date(0).toISOString());

  const attemptIndex = count ?? 0;

  await supabase.from("membership_payment_events").insert({
    subscription_id: sub.id,
    member_email:    sub.member_email,
    event_type:      "renewal_failed",
    order_id:        orderId,
    amount:          sub.price_amount,
    currency:        sub.currency || "ISK",
    action_code:     charge.actionCode || null,
    message:         charge.message || "decline",
    raw:             charge.raw || {},
  });

  if (classification === "hard_fail" || attemptIndex >= RETRY_OFFSETS_DAYS.length) {
    await supabase.from("membership_subscriptions")
      .update({ status: "past_due" }).eq("id", sub.id);

    if (sub.tribe_card_id) {
      const { data: cardRow } = await supabase
        .from("tribe_cards")
        .select("id, status, source, discount_percent, duration_type, expires_at, holder_name, previous_state")
        .eq("id", sub.tribe_card_id)
        .maybeSingle();
      if (cardRow) {
        const res = restoreTribeCardFromPrevious(cardRow);
        if (res.type !== "noop") {
          await supabase.from("tribe_cards")
            .update(res.update)
            .eq("id", sub.tribe_card_id);
        }
      }
    }

    try {
      await sendRenewalFinalFailedEmail({
        to:         sub.member_email,
        name:       sub.member_name,
        amount:     sub.price_amount,
        currency:   sub.currency || "ISK",
        actionCode: charge.actionCode,
      });
    } catch (mailErr) {
      console.error("sendRenewalFinalFailedEmail failed for", sub.id, mailErr);
    }

    return { subscriptionId: sub.id, action: "past_due", reason: charge.actionCode };
  }

  const retryIn = RETRY_OFFSETS_DAYS[attemptIndex];
  const retryDate = new Date(now);
  retryDate.setDate(retryDate.getDate() + retryIn);

  await supabase.from("membership_subscriptions").update({
    status:            "grace_period",
    next_billing_date: retryDate.toISOString(),
  }).eq("id", sub.id);

  try {
    await sendRenewalSoftFailedEmail({
      to:            sub.member_email,
      name:          sub.member_name,
      amount:        sub.price_amount,
      currency:      sub.currency || "ISK",
      retryDate:     retryDate.toISOString(),
      attemptNumber: attemptIndex + 1,
      actionCode:    charge.actionCode,
    });
  } catch (mailErr) {
    console.error("sendRenewalSoftFailedEmail failed for", sub.id, mailErr);
  }

  return {
    subscriptionId: sub.id,
    action: "retry_scheduled",
    retryOn: retryDate.toISOString(),
    reason:  charge.actionCode,
  };
}
