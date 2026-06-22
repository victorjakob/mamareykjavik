// POST /api/admin/subscribers/regenerate-draft
// Re-pull the coming week's events into an existing (unsent) weekly draft and
// rebuild its HTML — WITHOUT sending any preview email. Use after adding an
// event so it appears in the letter before you approve & send.
//
// Non-destructive: keeps your intro wording, your featured pick (if that event
// is still in the window), and any per-event sensory-line / image tweaks.
//   body: { draftId }
//
// Admin or host session required.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";
import {
  renderNewsletterHtml,
  dedupeRecurringSeries,
  pickDefaultHighlightId,
  NEWSLETTER_WINDOW_DAYS,
} from "@/lib/newsletter-template";

export const dynamic = "force-dynamic";

const INTRO_DEFAULT =
  "Music, cacao, workshops. Here is what is coming up\nat Bankastræti 2 this week.";
const INTRO_QUIET =
  "Quiet week ahead. The kitchen is warm and the door is open. Come for what calls you.";

function isAdminOrHost(session) {
  return (
    session &&
    session.user &&
    (session.user.role === "admin" || session.user.role === "host")
  );
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!isAdminOrHost(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const draftId = body.draftId;
  if (!draftId) {
    return NextResponse.json({ error: "Missing draftId" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const { data: draft, error: draftError } = await supabase
    .from("newsletter_drafts")
    .select("id, status, intro_note, events_json, highlight_event_id")
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
      { error: "This letter has already been sent." },
      { status: 409 },
    );
  }

  // 1. Pull the coming week's events fresh.
  const nowIso = new Date().toISOString();
  const cutoff = new Date(
    Date.now() + NEWSLETTER_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: rawEvents, error: eventsError } = await supabase
    .from("events")
    .select(
      "id,name,shortdescription,date,duration,price,slug,image,host,location,sold_out,series_id",
    )
    .gte("date", nowIso)
    .lt("date", cutoff)
    .order("date", { ascending: true });

  if (eventsError) {
    return NextResponse.json({ error: eventsError.message }, { status: 500 });
  }

  const fresh = dedupeRecurringSeries(rawEvents || []);

  // 2. Carry over any per-event tweaks the user already made (matched by id).
  const oldById = new Map(
    (Array.isArray(draft.events_json) ? draft.events_json : []).map((e) => [
      String(e.id),
      e,
    ]),
  );
  const events = fresh.map((ev) => {
    const prev = oldById.get(String(ev.id));
    if (!prev) return ev;
    const merged = { ...ev };
    if (prev.sensory_line) merged.sensory_line = prev.sensory_line;
    if (prev.image) merged.image = prev.image;
    return merged;
  });

  // 3. Keep the featured pick if it's still in the window, else default.
  const keptHighlight =
    draft.highlight_event_id != null &&
    events.some((e) => String(e.id) === String(draft.highlight_event_id));
  const highlightId = keptHighlight
    ? String(draft.highlight_event_id)
    : pickDefaultHighlightId(events);

  // 4. Keep the intro wording the user already has; only fill a sensible
  //    default if it's empty.
  let introNote = (draft.intro_note || "").trim();
  if (!introNote) introNote = events.length ? INTRO_DEFAULT : INTRO_QUIET;

  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mama.is";
  const html = renderNewsletterHtml({
    introNote,
    events,
    appUrl,
    highlightId,
    showApproveBar: false,
  });

  const { error: updateError } = await supabase
    .from("newsletter_drafts")
    .update({
      events_json: events,
      highlight_event_id: highlightId,
      intro_note: introNote,
      html,
    })
    .eq("id", draftId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    eventsCount: events.length,
    draft: {
      events_json: events,
      highlight_event_id: highlightId,
      intro_note: introNote,
      html,
    },
  });
}
