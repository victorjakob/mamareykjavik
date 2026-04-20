// GET /api/cron/renew-memberships
// -----------------------------------------------------------------------------
// Daily Vercel Cron. Finds memberships due for renewal (or in grace with a
// retry due) and charges them via Teya's RPG REST API (MIT, merchant-initiated)
// using the MultiToken we captured at signup. Delegates the actual per-sub
// state machine to renewOne() in @/lib/membershipRenew so the admin "Retry now"
// button in the CMS reuses the exact same logic.
//
// Auth: Bearer {CRON_SECRET} — matches /api/cron/process-monthly-credits etc.

import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { renewOne } from "@/lib/membershipRenew";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const isAuthorizedRequest = (req) =>
  req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;

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
