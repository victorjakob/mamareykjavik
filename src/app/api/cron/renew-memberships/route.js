// GET /api/cron/renew-memberships
// -----------------------------------------------------------------------------
// Daily Vercel Cron. Finds memberships due for renewal (or in grace with a
// retry due) and charges them via Teya's RPG REST API (MIT, merchant-initiated)
// using the SaveCard token we captured on signup.
//
// Auth: Bearer {CRON_SECRET} — matches the pattern used by the existing
// /api/cron/process-monthly-credits and /api/cron/gatekeeper-wraps routes.
//
// Two-step RPG flow (handled inside mitChargeRenewal):
//   1. First renewal for a subscription: convert the SaveCard VCN into an
//      RPG MultiToken (/api/token/multi) — we persist it on the payment
//      method row so future renewals skip the conversion.
//   2. Every renewal: charge the MultiToken via /api/payment with
//      PaymentType:"TokenMulti". No CVC, no 3DS — clean MIT.
//
// If SALTPAY_RPG_PRIVATE_KEY is blank, mitChargeRenewal() returns
// notImplemented:true and we safely skip — no rows flipped to past_due.

import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { mitChargeRenewal, classifyDecline, newOrderId } from "@/lib/membershipTeya";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const isAuthorizedRequest = (req) =>
  req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;

// Retry schedule (days after a failed renewal). After the last entry, we move
// to past_due. Tunable without changing logic.
const RETRY_OFFSETS_DAYS = [3, 4];   // day 0 fail → retry +3 days → retry +7 days

export async function GET(req) {
  if (!isAuthorizedRequest(req)) {
    return new NextResponse("forbidden", { status: 403 });
  }

  const supabase = createServerSupabase();
  const now = new Date();

  // Pick up every membership whose next_billing_date is today-or-before and
  // whose status could still be charged (active = standard renewal;
  // grace_period = retry).
  const { data: due, error } = await supabase
    .from("membership_subscriptions")
    .select(`
      id, member_email, member_name, user_id, tier, price_amount, currency, status,
      current_period_start, current_period_end, next_billing_date,
      cancel_at_period_end, tribe_card_id
    `)
    .in("status", ["active", "grace_period"])
    .lte("next_billing_date", now.toISOString())
    .limit(200);

  if (error) {
    console.error("renew-memberships fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = [];
  for (const sub of due || []) {
    try {
      results.push(await renewOne(supabase, sub, now));
    } catch (err) {
      console.error("renewOne crashed for", sub.id, err);
      results.push({ subscriptionId: sub.id, action: "error", error: String(err?.message || err) });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}

async function renewOne(supabase, sub, now) {
  // ─── 1. Cancel-at-period-end → finalise, don't charge ─────────────────────
  if (sub.cancel_at_period_end && sub.current_period_end && new Date(sub.current_period_end) <= now) {
    await supabase.from("membership_subscriptions")
      .update({ status: "canceled", canceled_at: now.toISOString() })
      .eq("id", sub.id);

    // Don't revoke the tribe card mid-period; it naturally expires at
    // current_period_end. If you want to flip it to 'expired' immediately on
    // cancel, uncomment:
    // if (sub.tribe_card_id) {
    //   await supabase.from("tribe_cards")
    //     .update({ status: "expired" }).eq("id", sub.tribe_card_id);
    // }

    await supabase.from("membership_payment_events").insert({
      subscription_id: sub.id,
      member_email:    sub.member_email,
      event_type:      "subscription_canceled",
      message:         "Finalised at period end via cron.",
    });

    return { subscriptionId: sub.id, action: "canceled_at_period_end" };
  }

  // ─── 2. Fetch the stored card token ──────────────────────────────────────
  // rpg_multi_token is populated on the first successful charge; subsequent
  // renewals reuse it. If it's null, mitChargeRenewal() will bootstrap from
  // the SaveCard virtual_card_number on this call and return the new token.
  const { data: pm } = await supabase
    .from("membership_payment_methods")
    .select("id, virtual_card_number, card_expiration, rpg_multi_token, initial_transaction_id, is_default")
    .eq("subscription_id", sub.id)
    .eq("is_default", true)
    .maybeSingle();

  if (!pm?.virtual_card_number && !pm?.rpg_multi_token) {
    // No token on file — push to past_due so we can email them to re-add a card.
    await supabase.from("membership_subscriptions")
      .update({ status: "past_due" }).eq("id", sub.id);
    await supabase.from("membership_payment_events").insert({
      subscription_id: sub.id,
      member_email:    sub.member_email,
      event_type:      "renewal_failed",
      message:         "No card token on file.",
    });
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

  // Persist the freshly minted RPG multi-token so we skip the token-create
  // step on every future renewal. Safe to run even if the charge later fails;
  // the token itself is already created on Teya's side.
  if (charge.newRpgMultiToken && pm.id) {
    await supabase.from("membership_payment_methods")
      .update({ rpg_multi_token: charge.newRpgMultiToken })
      .eq("id", pm.id);
  }

  // ─── 4a. RPG not yet configured → safe default ───────────────────────────
  // Don't move anyone to past_due on the stub reason. Log and bail so an
  // operator can see renewals are piling up. Once SALTPAY_RPG_PRIVATE_KEY
  // is populated in Vercel env, this branch goes away automatically.
  if (charge.notImplemented) {
    return {
      subscriptionId: sub.id,
      action: "skipped_rpg_stub",
      reason: charge.reason,
    };
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

    // Push tribe card expiry forward in lockstep.
    if (sub.tribe_card_id) {
      await supabase.from("tribe_cards").update({
        status:     "active",
        expires_at: nextEnd.toISOString(),
      }).eq("id", sub.tribe_card_id);
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

    return { subscriptionId: sub.id, action: "renewed", nextBillingDate: nextEnd.toISOString() };
  }

  // ─── 4c. Failure — dunning state machine ─────────────────────────────────
  const classification = classifyDecline(charge.actionCode);

  // Count previous renewal failures within this period to decide retry #.
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

    // Expire the tribe card — no discount for past-due.
    if (sub.tribe_card_id) {
      await supabase.from("tribe_cards")
        .update({ status: "expired" }).eq("id", sub.tribe_card_id);
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

  return {
    subscriptionId: sub.id,
    action: "retry_scheduled",
    retryOn: retryDate.toISOString(),
    reason:  charge.actionCode,
  };
}
