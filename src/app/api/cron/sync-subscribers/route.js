// Scheduled task: keep the subscriber master list in lock-step, automatically.
//
// Runs nightly and:
//   1. imports the current Resend audience (captures any new unsubscribes from
//      broadcasts and reflects them in the master list),
//   2. consolidates every business email (new ticket buyers, members, etc.)
//      into the list — skipping anyone who has unsubscribed,
//   3. pushes a few batches of new contacts to the Resend audience.
//
// This is the safety net that means nobody has to press anything: new
// customers flow onto the list and opt-outs stay off, every single day.
//
// Schedule: 03:30 UTC daily (Iceland is on UTC year-round). Auth: Bearer
// ${CRON_SECRET}.

import {
  importFromResend,
  consolidateSubscribers,
  reconcileUnsubscribes,
  pushBatchToResend,
} from "@/lib/subscribers";
import { runWithLogging } from "@/lib/cronLog";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(req) {
  const authHeader = req.headers.get("authorization");
  return (
    !!process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`
  );
}

async function syncAll(req) {
  if (!isAuthorized(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const imported = await importFromResend({ commit: true });
  const consolidated = await consolidateSubscribers({ commit: true });
  const reconciled = await reconcileUnsubscribes({ commit: true });

  // Drain a few batches to Resend (incremental day-to-day volume is small).
  // The dashboard handles the big one-time backfill; this keeps it topped up.
  let pushed = 0;
  for (let i = 0; i < 6; i += 1) {
    const r = await pushBatchToResend({ limit: 50 });
    pushed += r.processed || 0;
    if (r.done || r.remaining === 0 || (r.processed || 0) === 0) break;
  }

  return Response.json({ ok: true, imported, consolidated, reconciled, pushed });
}

export async function GET(req) {
  return runWithLogging("cron-sync-subscribers", req, () => syncAll(req));
}

export async function POST(req) {
  return runWithLogging("cron-sync-subscribers", req, () => syncAll(req));
}
