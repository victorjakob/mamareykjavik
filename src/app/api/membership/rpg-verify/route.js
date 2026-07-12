// POST /api/membership/rpg-verify
// -----------------------------------------------------------------------------
// Finalises an RPG signup OR a card update after the 3DS challenge completes.
// Called by the browser with the PaRes / CRes harvested via
// /api/membership/rpg-3ds-return.
//
// Body:
//   { subscriptionId: string,
//     paRes?: string,  cRes?: string,
//     md?:   string }
//
// Flow:
//   1. Auth: NextAuth session must match the subscription owner.
//   2. Read the subscription — metadata.threeds.stage must be
//      "awaiting_challenge" and unexpired. The stashed threeds.flow decides
//      the mode:
//        - (default, signup)      → status must be pending_payment.
//        - flow === "card_update" → status must be active / grace_period /
//                                   past_due (see /api/membership/update-card).
//   3. Call mpiValidate(PaRes) — if MdStatus is not 1/2/3/4/5/6, fail.
//   4. Signup: chargeRpgCit(MultiToken, MpiToken) then
//      activateSubscriptionFromCharge(), exactly as the frictionless path.
//      Card update: NO charge — applyCardUpdate() stores the verified token
//      and retries any outstanding renewal (see membershipCardUpdate.js).
//   5. Return the same JSON shape as the originating route's direct-success
//      response so the client flows straight into its SuccessView.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";
import {
  mpiValidate,
  chargeRpgCit,
  classifyDecline,
  redactTeyaPayload,
} from "@/lib/membershipTeya";
import { activateSubscriptionFromCharge } from "@/lib/membershipActivate";
import { applyCardUpdate } from "@/lib/membershipCardUpdate";

const CARD_UPDATE_STATUSES = ["active", "grace_period", "past_due"];

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    }
    const email = String(session.user.email).trim().toLowerCase();
    const name  = session.user.name || "";

    const body = await req.json().catch(() => ({}));
    const subscriptionId = String(body.subscriptionId || "").trim();
    const paRes = body.paRes ? String(body.paRes) : null;
    const cRes  = body.cRes  ? String(body.cRes)  : null;
    const md    = body.md    ? String(body.md)    : null;

    if (!subscriptionId) {
      return NextResponse.json({ error: "Missing subscription id." }, { status: 400 });
    }
    if (!paRes && !cRes) {
      return NextResponse.json({ error: "Missing PaRes from authentication." }, { status: 400 });
    }

    const supabase = createServerSupabase();

    const { data: sub, error: subErr } = await supabase
      .from("membership_subscriptions")
      .select("id, member_email, user_id, member_name, tier, price_amount, status, next_billing_date, metadata")
      .eq("id", subscriptionId)
      .maybeSingle();

    if (subErr || !sub) {
      return NextResponse.json({ error: "Subscription not found." }, { status: 404 });
    }
    if (String(sub.member_email).toLowerCase() !== email) {
      return NextResponse.json({ error: "Not your subscription." }, { status: 403 });
    }

    const threeds = sub.metadata?.threeds || null;
    const isCardUpdate = threeds?.flow === "card_update";

    // Card updates run against a live subscription; signups against a pending
    // one. Anything else means the row moved on — tell the client to restart.
    if (isCardUpdate) {
      if (!CARD_UPDATE_STATUSES.includes(sub.status)) {
        return NextResponse.json(
          { error: "This membership can no longer update its card.", status: sub.status },
          { status: 409 },
        );
      }
    } else if (sub.status !== "pending_payment") {
      return NextResponse.json(
        { error: "This subscription is no longer waiting for verification.", status: sub.status },
        { status: 409 },
      );
    }

    if (!threeds || threeds.stage !== "awaiting_challenge") {
      return NextResponse.json(
        { error: "No 3DS challenge is active for this signup. Please start again." },
        { status: 409 },
      );
    }
    const now = Date.now();
    if (threeds.expires_at && new Date(threeds.expires_at).getTime() < now) {
      await supabase.from("membership_payment_events").insert({
        subscription_id: subscriptionId,
        member_email:    email,
        event_type:      "initial_charge_failed",
        order_id:        threeds.order_id || null,
        message:         isCardUpdate ? "card_update 3ds_challenge_expired" : "3ds_challenge_expired",
      });
      return NextResponse.json(
        { error: "The verification window expired. Please start again." },
        { status: 410 },
      );
    }

    const multiToken = threeds.multi_token;
    const mpiToken   = threeds.mpi_token;
    const orderId    = threeds.order_id;
    const amount     = Number(threeds.amount || sub.price_amount);
    const tier       = sub.tier;
    const last4      = threeds.last4 || null;
    const brand      = threeds.brand || null;
    const language   = threeds.language || "EN";
    const userId     = sub.user_id || null;
    const fullName   = name || sub.member_name || "";

    // ─── Validate PaRes via MPI ─────────────────────────────────────────────
    const validation = await mpiValidate({ pares: paRes, cres: cRes, md: md || threeds.md });

    if (!validation.ok) {
      await supabase.from("membership_payment_events").insert({
        subscription_id: subscriptionId,
        member_email:    email,
        event_type:      "initial_charge_failed",
        order_id:        orderId,
        action_code:     validation.mdStatus || null,
        message:         `${isCardUpdate ? "card_update " : ""}3ds_validation_failed:${validation.reason} — ${validation.message}`,
        raw:             validation.raw || {},
      });
      return NextResponse.json(
        { error: "Your bank did not authenticate the payment. Please try again or use a different card.",
          mdStatus: validation.mdStatus || null },
        { status: 402 },
      );
    }

    await supabase.from("membership_payment_events").insert({
      subscription_id: subscriptionId,
      member_email:    email,
      event_type:      "3ds_challenge_validated",
      order_id:        orderId,
      message:         `${isCardUpdate ? "card_update " : ""}MdStatus=${validation.mdStatus || "?"} — authenticated=${validation.authenticated}`,
      raw:             validation.raw || {},
    });

    // ─── Card update: no charge — store the verified card, retry renewal ────
    // The SCA the member just completed covers the card swap; money only
    // moves via the immediate renewOne() retry (grace_period / past_due) or
    // the next scheduled cron renewal. See src/lib/membershipCardUpdate.js.
    if (isCardUpdate) {
      const result = await applyCardUpdate({
        supabase,
        subscriptionId,
        email,
        multiToken,
        last4,
        brand,
        expiration: threeds.expiration || null,
        orderId,
      });
      return NextResponse.json({
        ok:              true,
        cardUpdated:     true,
        subscriptionId,
        renewal:         result.renewal,
        nextBillingDate: result.renewal?.nextBillingDate || sub.next_billing_date || null,
      });
    }

    // ─── Final CIT charge with MpiToken ─────────────────────────────────────
    const charge = await chargeRpgCit({
      multiToken,
      amountIsk: amount,
      orderId,
      mpiToken,
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

    const result = await activateSubscriptionFromCharge({
      supabase, email, userId, fullName, tier, amount, orderId,
      multiToken, charge, last4, brand, language,
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
  } catch (err) {
    console.error("POST /api/membership/rpg-verify failed:", err);
    return NextResponse.json(
      { error: err?.message || "Verification failed." },
      { status: 500 },
    );
  }
}
