// GET /api/membership/me
// -----------------------------------------------------------------------------
// Returns the signed-in user's current membership state, if any. Consumed by:
//   - /membership landing      → to show "Current plan" / "Upgrade" CTAs
//   - /profile MembershipWidget → sidebar card with tier, next bill, cancel
//
// Shape:
//   { membership: null }                              // not a member
//   { membership: {
//       id, tier, status, priceAmount, currency,
//       currentPeriodStart, currentPeriodEnd, nextBillingDate,
//       cancelAtPeriodEnd, createdAt, canceledAt,
//       tribeCardId,
//       card: { last4, brand, expiration } | null,    // display-only summary
//     } }
//
// Auth: returns 401 if no session. Never returns payment-method tokens —
// `card` is the masked last4/brand/expiry only, for the "card on file" UI.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    }
    const email = String(session.user.email).trim().toLowerCase();

    const supabase = createServerSupabase();

    // Prefer a live (active / grace / paused / pending) subscription. Fall
    // back to the most recent row so the UI can still say "your membership
    // was canceled — rejoin" instead of pretending they've never been here.
    const LIVE_STATES = ["active", "grace_period", "paused", "pending_payment"];

    const { data: live } = await supabase
      .from("membership_subscriptions")
      .select(`
        id, tier, status, price_amount, currency,
        current_period_start, current_period_end, next_billing_date,
        cancel_at_period_end, created_at, canceled_at, tribe_card_id
      `)
      .eq("member_email", email)
      .in("status", LIVE_STATES)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let row = live;
    if (!row) {
      const { data: latest } = await supabase
        .from("membership_subscriptions")
        .select(`
          id, tier, status, price_amount, currency,
          current_period_start, current_period_end, next_billing_date,
          cancel_at_period_end, created_at, canceled_at, tribe_card_id
        `)
        .eq("member_email", email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      row = latest || null;
    }

    if (!row) {
      return NextResponse.json({ membership: null });
    }

    // Card-on-file summary for paid tiers — masked details only, never the
    // RPG multi-token or virtual card number.
    let card = null;
    if (row.tier !== "free") {
      const { data: pm } = await supabase
        .from("membership_payment_methods")
        .select("card_last4, card_brand, card_expiration")
        .eq("subscription_id", row.id)
        .eq("is_default", true)
        .maybeSingle();
      if (pm) {
        card = {
          last4:      pm.card_last4 || null,
          brand:      pm.card_brand || null,
          expiration: pm.card_expiration || null,   // MMYY, often null on RPG signups
        };
      }
    }

    return NextResponse.json({
      membership: {
        id:                 row.id,
        tier:               row.tier,
        status:             row.status,
        priceAmount:        row.price_amount,
        currency:           row.currency || "ISK",
        currentPeriodStart: row.current_period_start,
        currentPeriodEnd:   row.current_period_end,
        nextBillingDate:    row.next_billing_date,
        cancelAtPeriodEnd:  !!row.cancel_at_period_end,
        createdAt:          row.created_at,
        canceledAt:         row.canceled_at,
        tribeCardId:        row.tribe_card_id,
        card,
      },
    });
  } catch (err) {
    console.error("GET /api/membership/me failed:", err);
    return NextResponse.json({ error: err?.message || "Lookup failed." }, { status: 500 });
  }
}
