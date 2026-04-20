// POST /api/membership/rpg-signup
// -----------------------------------------------------------------------------
// RPG-direct subscription signup — the fix for the SecurePay SaveCard blocker.
//
// Body:
//   {
//     tier: "tribe" | "patron",
//     patronAmount?: number,                 // required if tier==="patron"
//     language?: "IS" | "EN",
//     singleToken: string,                   // from browser POST to /api/token/single
//     last4?: string, brand?: string         // optional UX hints from the form
//   }
//
// Flow:
//   1. Auth: NextAuth session required.
//   2. Validate tier + amount.
//   3. Upsert a `pending_payment` row in membership_subscriptions (same rules
//      as /api/membership/checkout for existing active rows).
//   4. exchangeSingleForMultiToken(singleToken) → MultiToken.
//   5. chargeRpgCit(MultiToken, amount) → first CIT payment.
//   6. On success: insert membership_payment_methods row (rpg_multi_token,
//      card_last4, card_brand), flip subscription to "active", set period,
//      issue/extend tribe_cards row.
//   7. Return JSON with subscriptionId + status so the browser can route to
//      the success page.
//
// SECURITY: This route NEVER sees a PAN or CVC. The browser tokenizes the
// card directly against Teya. We only see the SingleToken string.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";
import {
  newOrderId,
  exchangeSingleForMultiToken,
  chargeRpgCit,
  classifyDecline,
  redactTeyaPayload,
  mergeTribeCardExtension,
} from "@/lib/membershipTeya";

const TIER_PRICES = {
  tribe:  2000,
  patron: 20000,
};
const PATRON_MAX_ISK = 200_000;

const DEFAULT_DISCOUNTS = {
  tribe:  15,
  patron: 25,
};

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Please sign in to join." }, { status: 401 });
    }
    const email = String(session.user.email).trim().toLowerCase();
    const name  = session.user.name || "";

    const body = await req.json().catch(() => ({}));
    const tier = String(body.tier || "").toLowerCase();
    const singleToken = String(body.singleToken || "").trim();
    const hintedLast4 = body.last4 ? String(body.last4).slice(-4) : null;
    const hintedBrand = body.brand ? String(body.brand).slice(0, 32) : null;

    if (!["tribe", "patron"].includes(tier)) {
      return NextResponse.json({ error: "Invalid tier." }, { status: 400 });
    }
    if (!singleToken) {
      return NextResponse.json({ error: "Card token missing. Please try again." }, { status: 400 });
    }

    let amount = TIER_PRICES[tier];
    if (tier === "patron") {
      const n = Number(body.patronAmount);
      if (!Number.isFinite(n) || n < TIER_PRICES.patron || n > PATRON_MAX_ISK) {
        return NextResponse.json(
          { error: `High Ticket is a one-time payment between ${TIER_PRICES.patron.toLocaleString("is-IS")} and ${PATRON_MAX_ISK.toLocaleString("is-IS")} ISK.` },
          { status: 400 },
        );
      }
      amount = Math.round(n);
    }

    const supabase = createServerSupabase();

    // Look up user_id for foreign-key linking.
    const { data: userRow } = await supabase
      .from("users")
      .select("id, name")
      .eq("email", email)
      .maybeSingle();
    const userId   = userRow?.id || null;
    const fullName = name || userRow?.name || "";

    // Handle any existing live subscription (identical policy to
    // /api/membership/checkout — keep behaviour aligned).
    const { data: existingActive } = await supabase
      .from("membership_subscriptions")
      .select("id, status, tier, price_amount, current_period_end")
      .eq("member_email", email)
      .in("status", ["active", "grace_period", "paused"])
      .maybeSingle();

    if (existingActive) {
      const sameTier = existingActive.tier === tier;
      const samePaidAmount =
        sameTier && existingActive.tier !== "free" &&
        Number(existingActive.price_amount) === Number(amount);

      if (existingActive.tier !== "free" && samePaidAmount) {
        return NextResponse.json(
          { error: "You already have an active membership on this tier.", subscriptionId: existingActive.id, tier: existingActive.tier },
          { status: 409 },
        );
      }
      if (existingActive.tier === "free") {
        await supabase.from("membership_subscriptions")
          .update({
            status: "canceled",
            canceled_at: new Date().toISOString(),
            metadata: { upgraded_to: tier, upgraded_at: new Date().toISOString() },
          })
          .eq("id", existingActive.id);

        await supabase.from("membership_payment_events").insert({
          subscription_id: existingActive.id,
          member_email:    email,
          event_type:      "subscription_upgraded_from_free",
          message:         `Free → ${tier} upgrade initiated (RPG signup).`,
        });
      } else {
        await supabase.from("membership_subscriptions")
          .update({ cancel_at_period_end: true })
          .eq("id", existingActive.id);

        await supabase.from("membership_payment_events").insert({
          subscription_id: existingActive.id,
          member_email:    email,
          event_type:      "subscription_tier_change_requested",
          message:         `Tier change requested: ${existingActive.tier} → ${tier}. Old row set to cancel at period end.`,
        });
      }
    }

    // Reuse a pending row or insert a fresh one.
    const { data: pending } = await supabase
      .from("membership_subscriptions")
      .select("id")
      .eq("member_email", email)
      .eq("status", "pending_payment")
      .maybeSingle();

    let subscriptionId = pending?.id;
    if (!subscriptionId) {
      const { data: inserted, error: insErr } = await supabase
        .from("membership_subscriptions")
        .insert({
          member_email: email,
          member_name:  fullName,
          user_id:      userId,
          tier,
          price_amount: amount,
          currency:     "ISK",
          interval_unit:"month",
          status:       "pending_payment",
        })
        .select("id")
        .single();
      if (insErr || !inserted) {
        console.error("rpg-signup subscriptions insert failed:", insErr);
        return NextResponse.json({ error: "Could not start signup." }, { status: 500 });
      }
      subscriptionId = inserted.id;
    } else {
      await supabase.from("membership_subscriptions")
        .update({ tier, price_amount: amount, user_id: userId, member_name: fullName })
        .eq("id", subscriptionId);
    }

    const orderId = newOrderId();

    // Audit: checkout_created (keeps parity with SecurePay path).
    await supabase.from("membership_payment_events").insert({
      subscription_id: subscriptionId,
      member_email:    email,
      event_type:      "checkout_created",
      order_id:        orderId,
      amount,
      currency: "ISK",
      raw: { flow: "rpg_direct", tier, patronAmount: tier === "patron" ? amount : null },
    });
    await supabase.from("membership_subscriptions")
      .update({ metadata: { last_order_id: orderId, last_order_at: new Date().toISOString(), flow: "rpg_direct" } })
      .eq("id", subscriptionId);

    // ─── Step 1: SingleToken → MultiToken (server-side, Private key) ─────────
    const multi = await exchangeSingleForMultiToken({ singleToken });
    if (!multi.ok) {
      await supabase.from("membership_payment_events").insert({
        subscription_id: subscriptionId,
        member_email:    email,
        event_type:      "initial_charge_failed",
        order_id:        orderId,
        message:         `token_multi_failed: ${multi.reason} — ${multi.message}`,
        raw:             multi.raw || {},
      });
      return NextResponse.json(
        { error: "Could not create a card token. Please try a different card or contact support.", details: multi.reason },
        { status: 402 },
      );
    }

    // ─── Step 2: First CIT charge with the MultiToken ───────────────────────
    const charge = await chargeRpgCit({
      multiToken: multi.token,
      amountIsk:  amount,
      orderId,
    });

    if (!charge.ok) {
      const classification = classifyDecline(charge.actionCode);
      await supabase.from("membership_payment_events").insert({
        subscription_id: subscriptionId,
        member_email:    email,
        event_type:      "initial_charge_failed",
        order_id:        orderId,
        amount,
        currency:        "ISK",
        action_code:     charge.actionCode || null,
        message:         charge.message || "decline",
        raw:             redactTeyaPayload(charge.raw || {}),
      });
      return NextResponse.json(
        {
          error:
            classification === "hard_fail"
              ? "Card was declined. Please try a different card."
              : "Payment didn't go through. Please try again.",
          actionCode: charge.actionCode || null,
        },
        { status: 402 },
      );
    }

    // ─── Step 3: Success — persist card + activate subscription ─────────────
    const last4 = charge.raw?.panLast4 || hintedLast4 || (multi.raw?.last4 || null);
    const brand = charge.raw?.cardType || hintedBrand || null;

    // One default card per subscription.
    await supabase.from("membership_payment_methods")
      .delete()
      .eq("subscription_id", subscriptionId)
      .eq("is_default", true);
    await supabase.from("membership_payment_methods").insert({
      subscription_id:        subscriptionId,
      member_email:           email,
      provider:               "teya",
      virtual_card_number:    null,                       // RPG flow uses multi-token only
      rpg_multi_token:        multi.token,
      card_expiration:        null,                       // not returned on CIT payload
      card_last4:             last4,
      card_brand:             brand,
      initial_transaction_id: charge.transactionId || null,
      is_default:             true,
    });

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await supabase.from("membership_subscriptions").update({
      status:               "active",
      current_period_start: now.toISOString(),
      current_period_end:   periodEnd.toISOString(),
      next_billing_date:    periodEnd.toISOString(),
      cancel_at_period_end: false,
      canceled_at:          null,
      paused_at:            null,
    }).eq("id", subscriptionId);

    // ─── Step 4: Issue or extend the tribe card ─────────────────────────────
    // Policy: never shrink a member's benefits. If they already had a lifetime
    // card (expires_at NULL / duration_type 'unlimited'), or an expires_at
    // further out than this subscription's period end, keep it. Same for
    // discount_percent — take whichever is higher. `mergeTribeCardExtension()`
    // lives in membershipTeya.js and is shared with the renewal cron.
    const discountPercent = DEFAULT_DISCOUNTS[tier] || 15;

    // Fetch the full row — we need every field to compute the merge, and
    // .maybeSingle() tolerates 0 rows (returns null) which is what we want.
    const { data: existingCard, error: existingCardErr } = await supabase
      .from("tribe_cards")
      .select("id, status, source, discount_percent, duration_type, expires_at, holder_name, user_id, previous_state")
      .eq("holder_email", email)
      .maybeSingle();
    if (existingCardErr) {
      console.error("rpg-signup tribe_cards lookup error:", existingCardErr);
    }

    const nextCardDefaults = {
      discount_percent: discountPercent,
      duration_type:    "month",
      expires_at:       periodEnd.toISOString(),
      source:           "paid-tribe",
      user_id:          userId,
      holder_name:      fullName || null,
    };

    const mergeResult = mergeTribeCardExtension(existingCard, nextCardDefaults, { operation: "upgrade" });

    let resolvedCardId = existingCard?.id || null;

    if (mergeResult.type === "noop") {
      // Existing card already richer — don't touch it, just make sure the
      // subscription points at it.
      if (existingCard?.id) {
        resolvedCardId = existingCard.id;
      }
    } else if (mergeResult.type === "upgrade") {
      const { error: updErr } = await supabase
        .from("tribe_cards")
        .update(mergeResult.update)
        .eq("id", existingCard.id);
      if (updErr) console.error("rpg-signup tribe_cards upgrade error:", updErr, mergeResult.update);
    } else if (mergeResult.type === "insert") {
      const insertCard = {
        ...mergeResult.update,
        holder_email: email,
        holder_name:  mergeResult.update.holder_name || email.split("@")[0],
      };
      const { data: newCard, error: newCardErr } = await supabase
        .from("tribe_cards")
        .insert(insertCard)
        .select("id")
        .single();
      if (newCardErr) console.error("rpg-signup tribe_cards insert error:", newCardErr, insertCard);
      if (newCard?.id) resolvedCardId = newCard.id;
    }

    if (resolvedCardId) {
      await supabase.from("membership_subscriptions")
        .update({ tribe_card_id: resolvedCardId })
        .eq("id", subscriptionId);
    }

    // ─── Step 5: Audit log the success (idempotent) ─────────────────────────
    const { error: eventErr } = await supabase.from("membership_payment_events").insert({
      subscription_id: subscriptionId,
      member_email:    email,
      event_type:      "initial_charge_succeeded",
      order_id:        orderId,
      transaction_id:  charge.transactionId || null,
      amount,
      currency:        "ISK",
      raw:             redactTeyaPayload({ ...charge.raw, flow: "rpg_direct" }),
    });
    if (eventErr && !String(eventErr.message || "").toLowerCase().includes("duplicate")) {
      console.error("rpg-signup events insert error:", eventErr);
    }

    return NextResponse.json({
      ok:             true,
      subscriptionId,
      tier,
      amount,
      nextBillingDate: periodEnd.toISOString(),
      transactionId:  charge.transactionId || null,
    });
  } catch (err) {
    console.error("POST /api/membership/rpg-signup failed:", err);
    return NextResponse.json(
      { error: err?.message || "Signup failed." },
      { status: 500 },
    );
  }
}
