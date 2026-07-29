// POST /api/newsletter/save/[draftId]
// Save the editable fields of a draft (subject, masthead kicker + title, intro
// line, event order, and per-event sensory line + optional image override).
// Re-renders the HTML and stores it back on the draft row.
//
// Admin or host session required.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";
import { renderNewsletterHtml } from "@/lib/newsletter-template";

function isAdminOrHost(session) {
  return (
    session &&
    session.user &&
    (session.user.role === "admin" || session.user.role === "host")
  );
}

export async function POST(req, ctx) {
  const session = await getServerSession(authOptions);
  if (!isAdminOrHost(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { draftId } = await ctx.params;
  if (!draftId) {
    return NextResponse.json(
      { error: "Missing draft id" },
      { status: 400 },
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const { data: draft, error: draftError } = await supabase
    .from("newsletter_drafts")
    .select(
      "id, status, subject, events_json, highlight_event_id, header_kicker, header_title",
    )
    .eq("id", draftId)
    .maybeSingle();

  if (draftError || !draft) {
    return NextResponse.json(
      { error: draftError?.message || "Draft not found" },
      { status: 404 },
    );
  }
  if (draft.status === "sent") {
    return NextResponse.json(
      { error: "This draft has already been sent. Edits will not change what was delivered." },
      { status: 409 },
    );
  }

  const introNote =
    typeof body.intro_note === "string" ? body.intro_note : "";
  const events = Array.isArray(body.events) ? body.events : draft.events_json;
  const subject =
    typeof body.subject === "string" && body.subject.trim()
      ? body.subject.trim()
      : draft.subject;
  // highlight_event_id: explicit null clears the hero; a string OR number sets
  // it (event ids are integers — store as text); absent keeps the current one.
  const rawHighlight = body.highlight_event_id;
  const highlightId =
    rawHighlight === null
      ? null
      : rawHighlight === undefined
        ? (draft.highlight_event_id ?? null)
        : String(rawHighlight);

  // Masthead lines: a string (including "") is stored as-is so the line can be
  // blanked out; absent keeps whatever the draft already has.
  const headerKicker =
    typeof body.header_kicker === "string"
      ? body.header_kicker
      : (draft.header_kicker ?? null);
  const headerTitle =
    typeof body.header_title === "string"
      ? body.header_title
      : (draft.header_title ?? null);

  // Re-render HTML from the new content.
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mama.is";
  const html = renderNewsletterHtml({
    introNote,
    events,
    appUrl,
    highlightId,
    headerKicker,
    headerTitle,
    showApproveBar: false,
  });

  const { error: updateError } = await supabase
    .from("newsletter_drafts")
    .update({
      intro_note: introNote,
      events_json: events,
      subject,
      highlight_event_id: highlightId,
      header_kicker: headerKicker,
      header_title: headerTitle,
      html,
    })
    .eq("id", draftId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, html });
}
