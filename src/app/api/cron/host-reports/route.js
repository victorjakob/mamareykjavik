// Scheduled task: auto-send the online-sales host report once an event has
// actually finished (event date + duration — at that point nobody can buy
// another online ticket), to the event's host + co-host.
//
// Rules:
//   • Online tickets only (status "paid", bought through mama.is) — the
//     report exists to account for website money; cash/door/kiosk excluded.
//   • Only sends when at least one online ticket sold.
//   • Idempotent via events.host_report_sent_at (also stamped by manual
//     sends from the manage hub, so hosts never get the report twice).
//   • 72h lookback window so a skipped run still catches up.
//
// Expected schedule: hourly.
// Authorization: Bearer ${CRON_SECRET}

import { createServerSupabase } from "@/util/supabase/server";
import { runWithLogging } from "@/lib/cronLog";
import {
  buildHostReport,
  hostRecipients,
  sendHostReport,
} from "@/lib/hostReport.server";

const DEFAULT_DURATION_HOURS = 2; // when an event has no duration set

const isAuthorizedRequest = (req) => {
  const authHeader = req.headers.get("authorization");
  return !!process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`;
};

export async function GET(req) {
  return runWithLogging("cron-host-reports", req, () => runSweep(req));
}

export async function POST(req) {
  return runWithLogging("cron-host-reports", req, () => runSweep(req));
}

async function runSweep(req) {
  if (!isAuthorizedRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabase();
  const now = new Date();
  // Events that STARTED within the last 72h. Whether they've also ENDED
  // (start + duration) is checked per event below, so an hourly run sends
  // the report in the first run after the event wraps.
  const from = new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString();

  const { data: candidates, error } = await supabase
    .from("events")
    .select("id, name, slug, date, duration, host, host_secondary, host_report_sent_at")
    .is("host_report_sent_at", null)
    .gte("date", from)
    .lte("date", now.toISOString());

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const sent = [];
  const skipped = [];
  const errors = [];

  for (const event of candidates || []) {
    try {
      const durationHours = Number(event.duration) > 0 ? Number(event.duration) : DEFAULT_DURATION_HOURS;
      const endsAt = new Date(new Date(event.date).getTime() + durationHours * 60 * 60 * 1000);
      if (endsAt > now) {
        skipped.push({ event_id: event.id, reason: "still running" });
        continue;
      }

      const recipients = hostRecipients(event);
      if (recipients.length === 0) {
        skipped.push({ event_id: event.id, reason: "no host email" });
        continue;
      }

      const report = await buildHostReport(supabase, event.id);
      if (report.totals.orders === 0) {
        skipped.push({ event_id: event.id, reason: "no online tickets" });
        continue;
      }

      await sendHostReport(supabase, event, recipients, report);
      sent.push({ event_id: event.id, to: recipients, tickets: report.totals.guests });
    } catch (err) {
      errors.push({ event_id: event.id, error: err.message });
    }
  }

  return Response.json({
    candidates: candidates?.length || 0,
    sent: sent.length,
    sentDetails: sent,
    skipped,
    errors,
  });
}
