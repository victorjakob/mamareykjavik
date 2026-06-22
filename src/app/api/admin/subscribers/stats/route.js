// GET /api/admin/subscribers/stats
// Everything the subscriber dashboard needs in one call: master-list totals,
// source breakdown, weekly growth, Resend sync state, pending weekly drafts,
// recent unsubscribes, and the live "reach" across the whole business.
//
// Admin or host session required.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";
import { gatherBusinessEmails, SOURCE_LABELS } from "@/lib/subscribers";

export const dynamic = "force-dynamic";

function isAdminOrHost(session) {
  return (
    session &&
    session.user &&
    (session.user.role === "admin" || session.user.role === "host")
  );
}

// Monday-start ISO date for the week containing `d`.
function weekStart(d) {
  const dt = new Date(d);
  const day = (dt.getUTCDay() + 6) % 7; // 0 = Monday
  dt.setUTCDate(dt.getUTCDate() - day);
  return dt.toISOString().slice(0, 10);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdminOrHost(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createServerSupabase();

  // 1. Pull the whole master list (small — at most a few thousand rows).
  const { data: subs, error: subsError } = await db
    .from("newsletter_subscribers")
    .select("status, sources, first_source, subscribed_at, created_at, unsubscribed_at, resend_synced_at");

  if (subsError) {
    return NextResponse.json({ error: subsError.message }, { status: 500 });
  }

  const rows = subs || [];
  const totals = { total: rows.length, subscribed: 0, unsubscribed: 0, other: 0 };
  const bySource = {};
  const growthMap = {};
  let syncedToResend = 0;
  let pendingResend = 0;

  for (const r of rows) {
    if (r.status === "subscribed") totals.subscribed += 1;
    else if (r.status === "unsubscribed") totals.unsubscribed += 1;
    else totals.other += 1;

    if (r.status === "subscribed") {
      for (const s of r.sources || []) {
        bySource[s] = (bySource[s] || 0) + 1;
      }
      if (r.resend_synced_at) syncedToResend += 1;
      else pendingResend += 1;

      const when = r.subscribed_at || r.created_at;
      if (when) {
        const wk = weekStart(when);
        growthMap[wk] = (growthMap[wk] || 0) + 1;
      }
    }
  }

  // Last 12 weeks of growth, oldest → newest.
  const growth = [];
  const thisMonday = weekStart(new Date());
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(`${thisMonday}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - i * 7);
    const wk = d.toISOString().slice(0, 10);
    growth.push({ week: wk, count: growthMap[wk] || 0 });
  }

  const sources = Object.entries(bySource)
    .map(([key, count]) => ({ key, label: SOURCE_LABELS[key] || key, count }))
    .sort((a, b) => b.count - a.count);

  // 2. Recent unsubscribes.
  const { data: recentUnsub } = await db
    .from("newsletter_subscribers")
    .select("email, unsubscribed_at, first_source")
    .eq("status", "unsubscribed")
    .order("unsubscribed_at", { ascending: false })
    .limit(10);

  // 3. Weekly drafts not yet sent (awaiting approval) + the latest sent one.
  const { data: drafts } = await db
    .from("newsletter_drafts")
    .select("id, send_date, status, subject, sent_at, events_json, highlight_event_id, created_at")
    .order("send_date", { ascending: false })
    .limit(8);

  const pendingDrafts = (drafts || [])
    .filter((d) => d.status !== "sent")
    .map((d) => ({
      id: d.id,
      send_date: d.send_date,
      status: d.status,
      subject: d.subject,
      n_events: Array.isArray(d.events_json) ? d.events_json.length : 0,
      has_highlight: Boolean(d.highlight_event_id),
      created_at: d.created_at,
    }));
  const lastSent = (drafts || []).find((d) => d.status === "sent") || null;

  // 4. Live business reach — distinct emails the business holds right now, and
  //    how many of those aren't on the master list yet.
  let reach = { business_total: null, not_in_master: null, by_source: {} };
  try {
    const business = await gatherBusinessEmails(db);
    const masterEmails = new Set();
    const { data: masterList } = await db
      .from("newsletter_subscribers")
      .select("email");
    for (const m of masterList || []) masterEmails.add((m.email || "").toLowerCase());

    let notInMaster = 0;
    const reachBySource = {};
    for (const entry of business.values()) {
      if (!masterEmails.has(entry.email)) notInMaster += 1;
      for (const s of entry.sources) reachBySource[s] = (reachBySource[s] || 0) + 1;
    }
    reach = {
      business_total: business.size,
      not_in_master: notInMaster,
      by_source: Object.entries(reachBySource)
        .map(([key, count]) => ({ key, label: SOURCE_LABELS[key] || key, count }))
        .sort((a, b) => b.count - a.count),
    };
  } catch (err) {
    console.error("[subscribers/stats] reach calc failed", err?.message || err);
  }

  return NextResponse.json({
    ok: true,
    totals,
    sources,
    growth,
    resend: { synced: syncedToResend, pending: pendingResend },
    recent_unsubscribes: recentUnsub || [],
    pending_drafts: pendingDrafts,
    last_sent: lastSent,
    reach,
  });
}
