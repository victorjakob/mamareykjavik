// POST /api/membership/update-card
// -----------------------------------------------------------------------------
// Self-service "my renewal card failed / expired — here's a new one".
//
// Body:
//   {
//     singleToken: string,                   // from browser POST to /api/token/single
//     last4?: string, brand?: string,        // UX hints from the form
//     expMonth?: string, expYear?: string,   // stored as MMYY for display only
//     language?: "IS" | "EN"
//   }
//
// Flow:
//   1. Auth: NextAuth session, and the caller must own a non-terminal PAID
//      subscription (active / grace_period / past_due — a member who chose
//      cancel-at-period-end is still status "active" until the cron finalises,
//      so they're covered implicitly). Free tier → 400.
//   2. exchangeSingleForMultiToken(singleToken) → MultiToken.
//   3. mpiEnroll(MultiToken, renewal amount, …) — SCA without moving money.
//      We enrol at the subscription's renewal amount so the bank shows the
//      member the figure their card will actually be charged.
//      - Frictionless / attempt → store the card immediately (no charge).
//      - MdStatus 9 (challenge) → stash state on the subscription row with
//        flow: "card_update"; the browser completes the ACS challenge via
//        /api/membership/rpg-3ds-return and calls /api/membership/rpg-verify,
//        which recognises the flow flag and finalises via applyCardUpdate().
//   4. applyCardUpdate(): replace the default membership_payment_methods row,
//      audit 'card_updated', and if the subscription is grace_period /
//      past_due, retry the outstanding renewal via renewOne() right away.
//
// Why no charge: see the header of src/lib/membershipCardUpdate.js. RPG's MIT
// renewals only need the MultiToken; membershipTeya.js has no zero-amount
// verify endpoint, and charging an active member just to swap a card would
// double-bill them mid-period.
//
// Idempotency / double-submit: the SingleToken is single-use at Teya, so a
// replayed request dies at the token exchange with a clean 402. A finalised
// 3DS challenge clears metadata.threeds, so a replayed rpg-verify 409s.
//
// SECURITY: This route NEVER sees a PAN or CVC — the browser tokenizes the
// card directly against Teya, exactly like rpg-signup.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";
import {
  newOrderId,
  exchangeSingleForMultiToken,
  mpiEnroll,
} from "@/lib/membershipTeya";
import { applyCardUpdate } from "@/lib/membershipCardUpdate";

// Statuses allowed to swap their card. Terminal rows (canceled) and
// pending_payment signups (which re-run the signup flow instead) are out.
const UPDATABLE_STATUSES = ["active", "grace_period", "past_due"];

// ─── TermUrl helper ──────────────────────────────────────────────────────────
// Same rules as rpg-signup: Teya rejects TermUrls with query parameters for
// some schemes, so keep this path-only. The shared rpg-3ds-return page is a
// pure postMessage relay, so signup and card-update challenges use one URL.
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
      return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    }
    const email = String(session.user.email).trim().toLowerCase();

    const body = await req.json().catch(() => ({}));
    const singleToken = String(body.singleToken || "").trim();
    const hintedLast4 = body.last4 ? String(body.last4).slice(-4) : null;
    const hintedBrand = body.brand ? String(body.brand).slice(0, 32) : null;
    const expMonth    = body.expMonth ? String(body.expMonth).replace(/\D/g, "").padStart(2, "0").slice(-2) : null;
    const expYear     = body.expYear  ? String(body.expYear).replace(/\D/g, "").slice(-2) : null;
    // MMYY — same convention SecurePay used, so parseExpiration keeps working.
    const expiration  = expMonth && expYear ? `${expMonth}${expYear}` : null;
    const language    = String(body.language || "EN").toUpperCase() === "IS" ? "IS" : "EN";

    if (!singleToken) {
      return NextResponse.json({ error: "Card token missing. Please try again." }, { status: 400 });
    }

    const supabase = createServerSupabase();

    const { data: sub } = await supabase
      .from("membership_subscriptions")
      .select(`
        id, member_email, tier, price_amount, currency, status,
        cancel_at_period_end, current_period_end, next_billing_date, metadata
      `)
      .eq("member_email", email)
      .in("status", UPDATABLE_STATUSES)
      .maybeSingle();

    if (!sub) {
      return NextResponse.json({ error: "No active membership found." }, { status: 404 });
    }
    if (sub.tier === "free") {
      return NextResponse.json(
        { error: "Free membership has no card on file — nothing to update." },
        { status: 400 },
      );
    }

    const orderId = newOrderId();
    const amount  = Number(sub.price_amount) || 2000;

    // ─── Step 1: SingleToken → MultiToken ────────────────────────────────────
    const multi = await exchangeSingleForMultiToken({ singleToken });
    if (!multi.ok) {
      await supabase.from("membership_payment_events").insert({
        subscription_id: sub.id,
        member_email:    email,
        event_type:      "initial_charge_failed",
        order_id:        orderId,
        message:         `card_update token_multi_failed: ${multi.reason} — ${multi.message}`,
        raw:             { flow: "rpg_card_update", ...(multi.raw || {}) },
      });
      return NextResponse.json(
        { error: "Could not create a card token. Please try a different card or contact support.", details: multi.reason },
        { status: 402 },
      );
    }

    const last4 = hintedLast4 || (multi.raw?.last4 || null);
    const brand = hintedBrand || null;

    // ─── Step 2: MPI enrollment (3DS) — SCA without moving money ────────────
    const termUrl = termUrlFor();
    const enroll = await mpiEnroll({
      multiToken:  multi.token,
      amountIsk:   amount,
      orderId,
      termUrl,
      description: "Mama Reykjavik — membership card update",
      md:          `subupd:${sub.id}`,
    });

    if (!enroll.ok) {
      await supabase.from("membership_payment_events").insert({
        subscription_id: sub.id,
        member_email:    email,
        event_type:      "initial_charge_failed",
        order_id:        orderId,
        message:         `card_update mpi_enroll_failed: ${enroll.reason} — ${enroll.message}`,
        raw:             { flow: "rpg_card_update", ...(enroll.raw || {}) },
      });
      // MPI not configured at all (sandbox) → store the card without 3DS so
      // the test flow still works — mirrors rpg-signup's notImplemented
      // fallback, minus the charge (a card update never charges directly).
      if (enroll.notImplemented) {
        const result = await applyCardUpdate({
          supabase, subscriptionId: sub.id, email,
          multiToken: multi.token, last4, brand, expiration, orderId,
        });
        return NextResponse.json({
          ok:              true,
          cardUpdated:     true,
          subscriptionId:  sub.id,
          renewal:         result.renewal,
          nextBillingDate: result.renewal?.nextBillingDate || sub.next_billing_date || null,
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
        subscription_id: sub.id,
        member_email:    email,
        event_type:      "initial_charge_failed",
        order_id:        orderId,
        action_code:     enroll.mdStatus,
        message:         `card_update 3ds_blocked_mdstatus_${enroll.mdStatus}`,
        raw:             { flow: "rpg_card_update", ...(enroll.raw || {}) },
      });
      return NextResponse.json(
        { error: "Your bank declined the authentication. Please try a different card.",
          mdStatus: enroll.mdStatus },
        { status: 402 },
      );
    }

    // MdStatus 50 = 3DS "Method" pre-step — not implemented (see rpg-signup).
    if (enroll.mdStatus === "50") {
      await supabase.from("membership_payment_events").insert({
        subscription_id: sub.id,
        member_email:    email,
        event_type:      "initial_charge_failed",
        order_id:        orderId,
        action_code:     "50",
        message:         "card_update 3ds_method_required_not_implemented",
        raw:             { flow: "rpg_card_update", ...(enroll.raw || {}) },
      });
      return NextResponse.json(
        { error: "This card needs a pre-check we don't support yet. Please try a different card.",
          mdStatus: "50" },
        { status: 402 },
      );
    }

    // ─── Challenge required: redirect the cardholder to ACS ────────────────
    if (enroll.challenge) {
      // Stash everything rpg-verify will need. flow: "card_update" is what
      // tells rpg-verify to finalise via applyCardUpdate() instead of the
      // signup charge + activate path. Unlike rpg-signup we must PRESERVE the
      // live subscription's existing metadata keys, so spread before setting.
      const metadata = { ...(sub.metadata || {}) };
      metadata.threeds = {
        stage:       "awaiting_challenge",
        flow:        "card_update",
        mpi_token:   enroll.mpiToken,
        multi_token: multi.token,
        md:          enroll.md,
        last4,
        brand,
        expiration,
        language,
        order_id:    orderId,
        amount,
        started_at:  new Date().toISOString(),
        // MpiTokens live up to an hour per Teya spec — we allow 20 min.
        expires_at:  new Date(Date.now() + 20 * 60 * 1000).toISOString(),
      };
      await supabase.from("membership_subscriptions")
        .update({ metadata })
        .eq("id", sub.id);

      await supabase.from("membership_payment_events").insert({
        subscription_id: sub.id,
        member_email:    email,
        event_type:      "3ds_challenge_issued",
        order_id:        orderId,
        message:         `card_update MdStatus=${enroll.mdStatus} — redirecting cardholder to ACS.`,
        raw:             { flow: "rpg_card_update", ...(enroll.raw || {}) },
      });

      return NextResponse.json({
        ok: true,
        needs3ds: true,
        subscriptionId: sub.id,
        challenge: {
          actionUrl: enroll.redirect.actionUrl,
          paReq:     enroll.redirect.paReq,
          md:        enroll.redirect.md,
          termUrl:   enroll.redirect.termUrl || termUrl,
        },
      });
    }

    // ─── Frictionless / attempt — store the verified card. No charge. ───────
    const result = await applyCardUpdate({
      supabase, subscriptionId: sub.id, email,
      multiToken: multi.token, last4, brand, expiration, orderId,
    });

    return NextResponse.json({
      ok:              true,
      cardUpdated:     true,
      subscriptionId:  sub.id,
      renewal:         result.renewal,
      nextBillingDate: result.renewal?.nextBillingDate || sub.next_billing_date || null,
    });
  } catch (err) {
    console.error("POST /api/membership/update-card failed:", err);
    return NextResponse.json(
      { error: err?.message || "Card update failed." },
      { status: 500 },
    );
  }
}
