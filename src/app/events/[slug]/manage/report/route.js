// /events/[slug]/manage/report
//
// The host's online-sales report — every ticket sold through mama.is with
// the buyer's name, email and amount paid, plus the total. Cash / card
// reader / door sales are deliberately NOT included (that's the whole
// point of this email — accounting for the online money).
//
//   GET  → summary + default recipient, for the hub's "Email report" modal.
//   POST → { to } — render the "event-host-report" template and send it.
//
// Auth via resolveEventAccess, so it works for logged-in hosts/admins AND
// no-login hosts arriving through their private manage link — same rule as
// the attendees and sales endpoints beside it.

import { NextResponse } from "next/server";
import { resolveEventAccess } from "@/lib/eventAccess";
import { createServerSupabase } from "@/util/supabase/server";
import {
  buildHostReport,
  hostRecipients,
  sendHostReport,
} from "@/lib/hostReport.server";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Every email that has ever hosted an event, with their name when we know
// it — powers the "Send to" autocomplete in the modal. Cheap: two indexed
// queries against our own tables, deduped in JS. Admin-only, so a shared
// manage link can't harvest the full host address book.
async function loadHostSuggestions(supabase) {
  const { data: events } = await supabase
    .from("events")
    .select("host, host_secondary");

  const emails = new Set();
  for (const e of events || []) {
    for (const raw of [e.host, e.host_secondary]) {
      const email = (typeof raw === "string" ? raw : "").trim().toLowerCase();
      if (email && EMAIL_RE.test(email)) emails.add(email);
    }
  }
  if (emails.size === 0) return [];

  const nameByEmail = new Map();
  const { data: users } = await supabase
    .from("users")
    .select("email, name")
    .in("email", Array.from(emails));
  for (const u of users || []) {
    const email = (u.email || "").trim().toLowerCase();
    if (email && u.name) nameByEmail.set(email, u.name);
  }

  return Array.from(emails)
    .map((email) => ({ email, name: nameByEmail.get(email) || "" }))
    .sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email));
}

// GET — summary for the modal.
export async function GET(req, { params }) {
  const { slug } = await params;
  const access = await resolveEventAccess(slug, {});
  if (access.notFound)
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (!access.allowed)
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  try {
    const supabase = createServerSupabase();
    const report = await buildHostReport(supabase, access.event.id);

    const isAdmin = access.session?.user?.role === "admin";
    const suggestions = isAdmin ? await loadHostSuggestions(supabase) : [];

    return NextResponse.json({
      totals: report.totals,
      hasVariants: report.hasVariants,
      variants: report.variants,
      defaultRecipient: hostRecipients(access.event)[0] || "",
      suggestions,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST — send the report. Body: { to: "someone@example.com" }
export async function POST(req, { params }) {
  const { slug } = await params;
  const access = await resolveEventAccess(slug, {});
  if (access.notFound)
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (!access.allowed)
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const to = (body?.to || "").trim();
  if (!EMAIL_RE.test(to))
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });

  try {
    const supabase = createServerSupabase();
    const report = await buildHostReport(supabase, access.event.id);

    if (report.totals.orders === 0)
      return NextResponse.json(
        { error: "No online tickets sold yet — nothing to report" },
        { status: 400 }
      );

    await sendHostReport(supabase, access.event, [to], report);

    return NextResponse.json({ ok: true, to });
  } catch (err) {
    console.error("Host report email failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
