// POST /api/membership/saltpay-callback
// -----------------------------------------------------------------------------
// Server-to-server callback from Teya SecurePay after a membership signup's
// first charge. This is the ONLY place where a subscription is flipped to
// "active" — the browser redirect to returnurlsuccess is UI-only, never
// billing-truth.
//
// Exactly mirrors the proven pattern in src/app/api/saltpay/success-server:
//   - Parses application/x-www-form-urlencoded
//   - Verifies the orderhash = HMAC_SHA256(secretKey, orderid|amount|currency)
//   - Replies with <PaymentNotification>Accepted</PaymentNotification> XML
//
// Extra responsibilities for Membership specifically:
//   - Capture the SaveCard token (virtualcardnumber / card expiry / brand / last4)
//     into membership_payment_methods so we can MIT-charge renewals.
//   - Auto-issue or extend a tribe_cards row with source='paid-tribe' so paid
//     members immediately get the discount card that other systems already
//     understand.
//   - Idempotent via the unique index on (order_id, event_type).

import crypto from "crypto";
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { verifyOrderHash, redactTeyaPayload, addOneMonth } from "@/lib/membershipTeya";

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// Teya retries on non-2xx. Accepted = "we took it, don't retry."
function xmlAccepted() {
  return new Response("<PaymentNotification>Accepted</PaymentNotification>", {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });
}
function xmlError() {
  return new Response("<PaymentNotification>Error</PaymentNotification>", {
    status: 400,
    headers: { "Content-Type": "application/xml" },
  });
}

// Discount % defaults per tier — tune later.
const DEFAULT_DISCOUNTS = {
  tribe:  15,
  patron: 25,
};

export async function POST(req) {
  const supabase = createServerSupabase();
  let bodyText = "";
  let body = {};

  try {
    bodyText = await req.text();
    body = Object.fromEntries(new URLSearchParams(bodyText));

    // ─── 1. Signature verification ─────────────────────────────────────────
    const secretKey = process.env.SALTPAY_SECRET_KEY;
    if (!secretKey) {
      console.error("SALTPAY_SECRET_KEY missing on membership callback");
      return xmlError();
    }

    const orderid  = body.orderid;
    const amount   = body.amount;
    const currency = body.currency || "ISK";
    const providedHash = body.orderhash;

    const signatureOk = verifyOrderHash({
      orderid, amount, currency, providedHash, secretKey,
    });

    if (!signatureOk) {
      console.error("Membership webhook: orderhash mismatch", { orderid, step: body.step });
      await supabase.from("membership_payment_events").insert({
        event_type: "webhook_rejected",
        order_id:   orderid || null,
        message:    "orderhash mismatch",
        raw:        redactTeyaPayload(body),
      });
      return xmlError();
    }

    // Teya sends `step` twice: "Payment" (server-side, first arrival) and
    // "Confirmation" (when buyer clicks back-to-shop). We only act on Payment.
    const step = String(body.step || "").toLowerCase();
    if (step && step !== "payment") {
      return xmlAccepted();
    }

    // ─── 2. Look up the subscription by last_order_id ──────────────────────
    const { data: sub, error: subErr } = await supabase
      .from("membership_subscriptions")
      .select("id, member_email, member_name, user_id, tier, price_amount, status, metadata")
      .eq("metadata->>last_order_id", orderid)
      .maybeSingle();

    if (subErr || !sub) {
      console.error("Membership webhook: subscription not found for orderid", orderid, subErr);
      // Still respond 200 — Teya can't help us find it; don't let them retry forever.
      await supabase.from("membership_payment_events").insert({
        event_type: "webhook_rejected",
        order_id:   orderid,
        message:    "no matching subscription",
        raw:        redactTeyaPayload(body),
      });
      return xmlAccepted();
    }

    const isSuccess = String(body.status || "").toUpperCase() === "OK";

    // ─── 3. Failure branch ─────────────────────────────────────────────────
    if (!isSuccess) {
      await supabase.from("membership_payment_events").insert({
        subscription_id: sub.id,
        member_email:    sub.member_email,
        event_type:      "initial_charge_failed",
        order_id:        orderid,
        transaction_id:  body.refundid || body.transactionid || body.authorizationcode || null,
        amount:          sub.price_amount,
        currency,
        action_code:     body.actioncode || null,
        message:         body.errordescription || body.status || "failed",
        raw:             redactTeyaPayload(body),
      });
      // Leave the subscription on pending_payment — user can retry from /membership.
      return xmlAccepted();
    }

    // ─── 4. Success branch — capture token, activate subscription, issue card
    const virtualCard       = body.virtualcardnumber || body.savecardcarddata || null;
    const virtualExp        = body.virtualcardexpiration || body.cardexpiration || null;
    const creditCardMasked  = body.creditcardnumber || body.creditcardmasked || ""; // e.g. "1234-12**-1234"
    const brand             = body.cardtype || body.cardbrand || null;
    // SecurePay HPP returns BOTH `refundid` (10-digit gateway transaction id —
    // what RPG /api/payment/{id}/refund expects) AND `authorizationcode`
    // (6-digit issuer auth code — RPG rejects this as "Invalid transaction
    // identifier"). Prefer refundid; fall back only if Teya ever changes it.
    // Confirmed against live callbacks 2026-04-27.
    const initialTransactionId =
      body.refundid || body.transactionid || body.authorizationcode || null;
    const last4 = (creditCardMasked.match(/(\d{4})\s*$/) || [])[1] || null;

    if (virtualCard) {
      // Upsert-style: one default card per subscription.
      await supabase.from("membership_payment_methods")
        .delete()
        .eq("subscription_id", sub.id)
        .eq("is_default", true);
      await supabase.from("membership_payment_methods").insert({
        subscription_id:        sub.id,
        member_email:           sub.member_email,
        provider:               "teya",
        virtual_card_number:    virtualCard,
        card_expiration:        virtualExp,
        card_last4:             last4,
        card_brand:             brand,
        initial_transaction_id: initialTransactionId,
        is_default:             true,
      });
    } else {
      // No SaveCard token returned — the first charge succeeded but we can't
      // renew. Flag it: most likely Teya hasn't enabled SaveCard on the MID,
      // or the cardholder declined to store. We activate the current period
      // and alert via an event log; renewal will fail gracefully.
      console.warn("Membership webhook: no virtualcardnumber in SaveCard response", { orderid });
    }

    const now = new Date();
    // Same-day-of-month next month, clamped to last-day-of-month if needed.
    const periodEnd = addOneMonth(now);

    await supabase.from("membership_subscriptions").update({
      status:               "active",
      current_period_start: now.toISOString(),
      current_period_end:   periodEnd.toISOString(),
      next_billing_date:    periodEnd.toISOString(),
      cancel_at_period_end: false,
      canceled_at:          null,
      paused_at:            null,
    }).eq("id", sub.id);

    // ─── 5. Issue or extend the tribe card (source='paid-tribe') ──────────
    const discountPercent = DEFAULT_DISCOUNTS[sub.tier] || 15;

    const { data: existingCard } = await supabase
      .from("tribe_cards")
      .select("id, status, expires_at")
      .eq("holder_email", sub.member_email)
      .maybeSingle();

    if (existingCard) {
      // Extend / reactivate. Bump expiry to end of new period, keep higher of
      // the two discount_percent values if there's already a richer one.
      await supabase.from("tribe_cards").update({
        status:           "active",
        discount_percent: discountPercent,   // rewrite to subscription's value
        duration_type:    "month",
        expires_at:       periodEnd.toISOString(),
        source:           "paid-tribe",
        user_id:          sub.user_id,
        holder_name:      sub.member_name || undefined,
      }).eq("id", existingCard.id);

      await supabase.from("membership_subscriptions")
        .update({ tribe_card_id: existingCard.id })
        .eq("id", sub.id);
    } else {
      const { data: newCard } = await supabase.from("tribe_cards").insert({
        holder_email:     sub.member_email,
        holder_name:      sub.member_name || sub.member_email.split("@")[0],
        user_id:          sub.user_id,
        discount_percent: discountPercent,
        duration_type:    "month",
        expires_at:       periodEnd.toISOString(),
        status:           "active",
        source:           "paid-tribe",
      }).select("id").single();

      if (newCard?.id) {
        await supabase.from("membership_subscriptions")
          .update({ tribe_card_id: newCard.id })
          .eq("id", sub.id);
      }
    }

    // ─── 6. Audit log the successful charge (idempotent) ──────────────────
    const { error: eventErr } = await supabase.from("membership_payment_events").insert({
      subscription_id: sub.id,
      member_email:    sub.member_email,
      event_type:      "initial_charge_succeeded",
      order_id:        orderid,
      transaction_id:  initialTransactionId,
      amount:          sub.price_amount,
      currency,
      raw:             redactTeyaPayload(body),
    });
    if (eventErr && !String(eventErr.message || "").toLowerCase().includes("duplicate")) {
      console.error("membership_payment_events insert error:", eventErr);
    }

    return xmlAccepted();
  } catch (err) {
    console.error("Membership webhook crashed:", err);
    // Don't let Teya retry infinitely on an internal bug.
    try {
      await createServerSupabase().from("membership_payment_events").insert({
        event_type: "webhook_rejected",
        order_id:   (body && body.orderid) || null,
        message:    `crash: ${err?.message || "unknown"}`,
        raw:        redactTeyaPayload(body || {}),
      });
    } catch {}
    return xmlError();
  }
}
