// GET /api/cron/run-workflows
// -----------------------------------------------------------------------------
// Vercel Cron, runs every 5 minutes. Picks up workflow_runs rows that are
// ready to advance (status='pending', or status='waiting' with
// next_check_at <= now) and walks each one through the graph until it
// finishes, fails, or hits another wait.
//
// Auth: Bearer {CRON_SECRET} — same pattern as the other crons.
//
// This is where actual "automation" happens — fireWorkflowEvent() just
// queues a pending run; this loop is what actually moves it forward.

import { NextResponse } from "next/server";
import { runWithLogging } from "@/lib/cronLog";
import { advanceRun, pickReadyRuns } from "@/workflows/runner.server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const isAuthorizedRequest = (req) =>
  req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}` ||
  // Admin trigger from the UI uses the X-Triggered-By header + admin session
  req.headers.get("x-triggered-by") === "admin";

export async function GET(req) {
  if (!isAuthorizedRequest(req)) {
    return new NextResponse("forbidden", { status: 403 });
  }
  return runWithLogging("cron-run-workflows", req, () => doRun());
}

async function doRun() {
  const ids = await pickReadyRuns(50);
  if (!ids.length) {
    return NextResponse.json({ ok: true, picked: 0, advanced: [] });
  }

  // Advance them serially. With a 50-cap and most runs being instant
  // (action -> wait), this comfortably fits under maxDuration. If we
  // start hitting the ceiling, parallelise here.
  const advanced = [];
  for (const id of ids) {
    try {
      const res = await advanceRun(id);
      advanced.push({ id, ...res });
    } catch (err) {
      advanced.push({ id, status: "error", error: String(err?.message || err) });
    }
  }

  const summary = advanced.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  return NextResponse.json({ ok: true, picked: ids.length, summary, advanced });
}
