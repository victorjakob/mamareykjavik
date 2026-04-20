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
//   3. Upsert a `pending_payment` row in membership_subscriptions.
//   4. exchangeSingleForMultiToken(singleToken) → MultiToken.
//   5. mpiEnroll(MultiToken, amount, …) → {MdStatus, MpiToken, redirect?}.
//      - MdStatus 1 / 2-6 with MpiToken → chargeRpgCit immediately, activate.
//      - MdStatus 9 (challenge required) → stash state, return the redirect
//        payload to the browser. The frontend renders the ACS in an iframe,
//        collects PaRes via /api/membership/rpg-3ds-return, and calls
//        /api/membership/rpg-verify to finalise.
//      - Anything else → log + return error.
//   6. On direct success: insert payment_method row, flip subscription to
//      "active", set period, issue/extend tribe_cards row.
//
// SECURITY: This route NEVER sees a PAN or CVC. The browser tokenizes the
// card directly against Teya. We only see the SingleToken string.
// The MultiToken + MpiToken are stored on the subscription row (not the
// client) during a 3DS challenge so the browser can't forge them.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";
import {
  newOrderId,
  exchangeSingleForMultiToken,
  chargeRpgCit,
  mpiEnroll,
  classifyDecline,
  redactTeyaPayload,
} from "@/lib/membershipTeya";
import { activateSubscriptionFromCharge } from "@/lib/membershipActivate";

const TIER_PRICES = {
  tribe:  2000,
  patron: 20000,
};
const PATRON_MAX_ISK = 200_000;

// ─── TermUrl helper ──────────────────────────────────────────────────────────
// Teya rejects TermUrls that contain query parameters for some schemes, so keep
// this path-only. Prefer SALTPAY_RPG_TERM_URL if set (useful for ngrok/staging
// redirect testing); otherwise derive from NEXTAUTH_URL.
function termUrlFor() {
  const explicit = (process.env.SALTPAY_RPG_TERM_URL || "").trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const base = (process.env.NEXTAUTH_URL || "").trim().replace(/\/+$/, "");
  if (!base) return null;
  return `${base}/api/membership/rpg-3ds-return`;
}

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
    const language    = String(body.language || "EN").toUpperCase() === "IS" ? "IS" : "EN";

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

    // ─── Step 1: SingleToken → MultiToken ────────────────────────────────────
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

    const last4 = hintedLast4 || (multi.raw?.last4 || null);
    const brand = hintedBrand || null;

    // ─── Step 2: MPI enrollment (3DS) ────────────────────────────────────────
    // PSD2/SCA requires Strong Customer Authentication for EEA consumer CIT
    // transactions, so this is mandatory in production. In the sandbox the
    // MPI endpoint works with the test PAN — we rely on it, since RPG will
    // otherwise reject live cards without a 3DS challenge.
    const termUrl = termUrlFor();
    const enroll = await mpiEnroll({
      multiToken:  multi.token,
      amountIsk:   amount,
      orderId,
      termUrl,
      description: tier === "patron"
        ? "Mama Reykjavik — Patron gift"
        : "Mama Reykjavik — Tribe membership",
      md:          `sub:${subscriptionId}`,
    });

    if (!enroll.ok) {
      await supabase.from("membership_payment_events").insert({
        subscription_id: subscriptionId,
        member_email:    email,
        event_type:      "initial_charge_failed",
        order_id:        orderId,
        message:         `mpi_enroll_failed: ${enroll.reason} — ${enroll.message}`,
        raw:             enroll.raw || {},
      });
      // If MPI is not configured at all, fall through to a no-3DS CIT so the
      // sandbox test card still works. `mpiEnroll` only returns notImplemented
      // when the env vars aren't set — same shape as chargeRpgCit's early out.
      if (enroll.notImplemented) {
        const charge = await chargeRpgCit({ multiToken: multi.token, amountIsk: amount, orderId });
        return await finaliseSignup({
          supabase, email, userId, fullName, tier, amount, orderId,
          multi, charge, last4, brand,
          subscriptionId, language,
        });
      }
      return NextResponse.json(
        { error: "Couldn't verify the card with your bank. Please try another card or contact support.",
          details: enroll.reason },
        { status: 402 },
      );
    }

    // Hard fail from the card scheme — stop here.
    if (["0", "8"].includes(enroll.mdStatus || "")) {
      await supabase.from("membership_payment_events").insert({
        subscription_id: subscriptionId,
        member_email:    email,
        event_type:      "initial_charge_failed",
        order_id:        orderId,
        action_code:     enroll.mdStatus,
        message:         `3ds_blocked_mdstatus_${enroll.mdStatus}`,
        raw:             enroll.raw || {},
      });
      return NextResponse.json(
        { error: "Your bank declined the authentication. Please try a different card.",
          mdStatus: enroll.mdStatus },
        { status: 402 },
      );
    }

    // MdStatus 50 = a 3DS "Method" pre-step is needed. We don't implement the
    // iframe method call yet — fall back to clean decline so we don't silently
    // skip SCA. Modern issuers usually go straight to 9.
    if (enroll.mdStatus === "50") {
      await supabase.from("membership_payment_events").insert({
        subscription_id: subscriptionId,
        member_email:    email,
        event_type:      "initial_charge_failed",
        order_id:        orderId,
        action_code:     "50",
        message:         "3ds_method_required_not_implemented",
        raw:             enroll.raw || {},
      });
      return NextResponse.json(
        { error: "This card needs a pre-check we don't support yet. Please try a different card.",
          mdStatus: "50" },
        { status: 402 },
      );
    }

    // ─── Challenge required: redirect the cardholder to ACS ────────────────
    if (enroll.challenge) {
      // Stash everything rpg-verify will need. These tokens are per-signup and
      // only live on the pending_payment row until verify finalises or the
      // row is cleaned up.
      await supabase.from("membership_subscriptions")
        .update({
          metadata: {
            last_order_id: orderId,
            last_order_at: new Date().toISOString(),
            flow:          "rpg_direct",
            threeds: {
              stage:        "awaiting_challenge",
              mpi_token:    enroll.mpiToken,
              multi_token:  multi.token,
              md:           enroll.md,
              last4,
              brand,
              language,
              order_id:     orderId,
              amount,
              started_at:   new Date().toISOString(),
              // MpiTokens live up to an hour per Teya spec — we allow 20 min.
              expires_at:   new Date(Date.now() + 20 * 60 * 1000).toISOString(),
            },
          },
        })
        .eq("id", subscriptionId);

      await supabase.from("membership_payment_events").insert({
        subscription_id: subscriptionId,
        member_email:    email,
        event_type:      "3ds_challenge_issued",
        order_id:        orderId,
        message:         `MdStatus=${enroll.mdStatus} — redirecting cardholder to ACS.`,
        raw:             enroll.raw || {},
      });

      return NextResponse.json({
        ok: true,
        needs3ds: true,
        subscriptionId,
        challenge: {
          actionUrl: enroll.redirect.actionUrl,
          paReq:     enroll.redirect.paReq,
          md:        enroll.redirect.md,
          termUrl:   enroll.redirect.termUrl || termUrl,
        },
      });
    }

    // ─── Frictionless / attempt — charge immediately with MpiToken ──────────
    const charge = await chargeRpgCit({
      multiToken: multi.token,
      amountIsk:  amount,
      orderId,
      mpiToken:   enroll.mpiToken || null,
    });

    return await finaliseSignup({
      supabase, email, userId, fullName, tier, amount, orderId,
      multi, charge, last4, brand,
      subscriptionId, language,
    });
  } catch (err) {
    console.error("POST /api/membership/rpg-signup failed:", err);
    return NextResponse.json(
      { error: err?.message || "Signup failed." },
      { status: 500 },
    );
  }
}

// ─── finaliseSignup ──────────────────────────────────────────────────────────
// Shared tail between the frictionless path (no 3DS challenge) and the
// MPI-notImplemented fallback. The challenge-completed path runs through
// /api/membership/rpg-verify, which calls the same activateSubscriptionFromCharge
// helper so we only have one place that knows how to light up a subscription.
async function finaliseSignup({
  supabase, email, userId, fullName, tier, amount, orderId,
  multi, charge, last4, brand, subscriptionId, language,
}) {
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

  const result = await activateSubscriptionFromCharge({
    supabase, email, userId, fullName, tier, amount, orderId,
    multiToken: multi.token, charge, last4, brand, language,
    subscriptionId,
  });

  return NextResponse.json({
    ok:              true,
    subscriptionId,
    tier,
    amount,
    nextBillingDate: result.nextBillingDate,
    transactionId:   charge.transactionId || null,
  });
}
