// GET /api/admin/email/sent-stats
// Past newsletters (newsletter_drafts with status "sent") joined with their
// Resend stats from newsletter_stats (saved monthly). Matched by Resend
// broadcast id; falls back to same send day. Stats rows with no draft
// (e.g. broadcasts sent outside the drafts flow) are listed too.
// Admin or host session required.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";

export const dynamic = "force-dynamic";

const day = (v) => (v ? String(v).slice(0, 10) : null);

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (role !== "admin" && role !== "host") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createServerSupabase();
  const [draftsRes, statsRes] = await Promise.all([
    db
      .from("newsletter_drafts")
      .select("id, subject, send_date, sent_at, resend_broadcast_id")
      .eq("status", "sent")
      .order("sent_at", { ascending: false })
      .limit(30),
    db
      .from("newsletter_stats")
      .select("broadcast_id, name, sent_at, delivered, open_rate, click_rate, captured_at"),
  ]);
  if (draftsRes.error) {
    return NextResponse.json({ error: draftsRes.error.message }, { status: 500 });
  }

  const stats = statsRes.data || [];
  const used = new Set();
  const pick = (s) =>
    s
      ? {
          delivered: s.delivered,
          openRate: s.open_rate == null ? null : Number(s.open_rate),
          clickRate: s.click_rate == null ? null : Number(s.click_rate),
          capturedAt: s.captured_at,
        }
      : null;

  const items = (draftsRes.data || []).map((d) => {
    let s =
      (d.resend_broadcast_id &&
        stats.find((x) => x.broadcast_id === d.resend_broadcast_id)) ||
      null;
    if (!s) {
      const dd = day(d.sent_at || d.send_date);
      s = stats.find((x) => !used.has(x.broadcast_id) && day(x.sent_at) === dd) || null;
    }
    if (s) used.add(s.broadcast_id);
    return {
      id: d.id,
      title: d.subject || "Newsletter",
      sentAt: d.sent_at || d.send_date,
      editorHref: `/newsletters/${d.id}`,
      stats: pick(s),
    };
  });

  for (const s of stats) {
    if (used.has(s.broadcast_id)) continue;
    items.push({
      id: s.broadcast_id,
      title: s.name || "Newsletter",
      sentAt: s.sent_at,
      editorHref: null,
      stats: pick(s),
    });
  }

  items.sort((a, b) => String(b.sentAt || "").localeCompare(String(a.sentAt || "")));
  return NextResponse.json({ items });
}
