// GET /api/cron/renew-private-space
// -----------------------------------------------------------------------------
// Daily Vercel Cron. Finds Private Space recurring-weekly subscriptions whose
// next_charge_at is today-or-earlier and charges them via Teya's RPG REST API
// (MIT) using the MultiToken minted at the first cron run from the SecurePay
// VCN. Per-row state-machine lives in renewPrivateSpaceOne() so any future
// admin "Retry now" surface can reuse it.
//
// Auth: Bearer {CRON_SECRET} — same as /api/cron/renew-memberships and
// /api/cron/process-monthly-credits.
//
// Wired in vercel.json. Schedule offset from renew-memberships (03:00) by an
// hour to avoid concurrent RPG load.

import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { renewPrivateSpaceOne } from "@/lib/private-space/renew";

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

  // Active subscriptions whose next_charge_at has come due.
  // We deliberately do NOT include status='failed' here — once a subscription
  // has hit terminal failure, an admin needs to revive it manually (or the
  // renter rebooks). 'paused' is also excluded so a manual hold actually holds.
  const { data: due, error } = await supabase
    .from("private_space_subscriptions")
    .select(
      "id, booking_id, contact_name, contact_email, contact_phone, weekday, start_time, duration_minutes, monthly_amount_isk, rpg_multitoken, next_charge_at, last_charge_at, failed_charge_count, status, cancelled_at, cancellation_effective_at, language, metadata"
    )
    .eq("status", "active")
    .lte("next_charge_at", now.toISOString())
    .limit(200);

  if (error) {
    console.error("[renew-private-space] fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = [];
  for (const sub of due || []) {
    try {
      results.push(await renewPrivateSpaceOne(supabase, sub, now));
    } catch (err) {
      console.error(
        "[renew-private-space] renewPrivateSpaceOne crashed for",
        sub.id,
        err
      );
      results.push({
        subscriptionId: sub.id,
        action: "error",
        error: String(err?.message || err),
      });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
