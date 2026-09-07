// GET /api/cron/tribe-card-lifecycle
// -----------------------------------------------------------------------------
// Daily Vercel Cron (see vercel.json). Expires gifted / legacy tribe cards
// whose expires_at has passed, pushes the "Expired" state to Apple / Google
// Wallet, and sends the 30-day warning, expired notice and 14-day follow-up
// emails. All logic lives in @/lib/tribeCardLifecycle so the admin "Run now"
// button reuses it.
//
// Auth: Bearer {CRON_SECRET}. Add ?dryRun=1 to preview without changing
// anything or sending mail.

import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { runTribeCardLifecycle } from "@/lib/tribeCardLifecycle";
import { runWithLogging } from "@/lib/cronLog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // APNs push + pass signing need Node APIs
export const maxDuration = 60;

const isAuthorizedRequest = (req) =>
  req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;

export async function GET(req) {
  if (!isAuthorizedRequest(req)) {
    return new NextResponse("forbidden", { status: 403 });
  }
  const dryRun = new URL(req.url).searchParams.get("dryRun") === "1";
  return runWithLogging("cron-tribe-card-lifecycle", req, async () => {
    const supabase = createServerSupabase();
    const report = await runTribeCardLifecycle(supabase, { dryRun });
    return NextResponse.json(report);
  });
}
