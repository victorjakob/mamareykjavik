// Scheduled task: send the Spotify-Wrapped-style gatekeeper recap email to
// each host whose event finished in the last ~24h AND whose gatekeeper was
// activated (i.e. they actually used the kiosk). Idempotent via
// gatekeeper_configs.wrap_sent_at.
//
// Expected schedule: daily at ~09:00 Reykjavik time.
//
// Authorization: Bearer ${CRON_SECRET}

import { createServerSupabase } from "@/util/supabase/server";

const isAuthorizedRequest = (req) => {
  const authHeader = req.headers.get("authorization");
  return !!process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`;
};

export async function GET(req) {
  return runWrapSweep(req);
}

export async function POST(req) {
  return runWrapSweep(req);
}

async function runWrapSweep(req) {
  if (!isAuthorizedRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabase();
  const now = new Date();
  // Look at events that ended in the last 36 hours — gives a wide window
  // so we catch late-night events reliably even if a cron run is skipped.
  const from = new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString();
  const to = now.toISOString();

  const { data: candidates, error } = await supabase
    .from("gatekeeper_configs")
    .select("event_id, activated_at, wrap_sent_at, events!inner(id, name, slug, date)")
    .not("activated_at", "is", null)
    .is("wrap_sent_at", null)
    .gte("events.date", from)
    .lte("events.date", to);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const results = [];
  const errors = [];

  for (const row of candidates || []) {
    try {
      const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://mama.is";
      const resp = await fetch(`${origin}/api/sendgrid/gatekeeper-wrap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CRON_SECRET}`,
        },
        body: JSON.stringify({ event_id: row.event_id }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.message || `HTTP ${resp.status}`);
      }
      results.push({ event_id: row.event_id, ok: true });
    } catch (err) {
      errors.push({ event_id: row.event_id, error: err.message });
    }
  }

  return Response.json({
    processed: results.length,
    errors,
    candidates: candidates?.length || 0,
  });
}
