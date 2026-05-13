// GET /api/admin/automations/last-runs
// -----------------------------------------------------------------------------
// Returns the most recent run for every automation that has any cron_runs
// history. Used by the automations hub to show "Last ran X ago" on each entry.
//
// Response shape:
//   { runs: { [automationId]: { started_at, finished_at, status, result, error, triggered_by } } }

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") return { ok: false };
  return { ok: true };
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServerSupabase();

  // Pull the most recent 200 rows ordered desc — easily enough to find the
  // "last run" for every automation given they run at most once per day.
  // Doing one query + reducing in JS is cheaper than 18 per-automation
  // SELECT-with-LIMIT-1 queries, and the table itself stays small.
  const { data, error } = await supabase
    .from("cron_runs")
    .select("automation_id, started_at, finished_at, status, result, error, triggered_by")
    .order("started_at", { ascending: false })
    .limit(200);

  if (error) {
    // Common reason: cron_runs table not migrated yet. Return empty so the
    // hub keeps working without the "last ran" column.
    console.warn("[automations/last-runs] supabase error:", error.message);
    return NextResponse.json({ runs: {} });
  }

  const runs = {};
  for (const row of data || []) {
    if (!runs[row.automation_id]) {
      runs[row.automation_id] = row;
    }
  }
  return NextResponse.json({ runs });
}
