// Live renderer for the weekly Monday letter (manifest id "weekly-newsletter").
// ─────────────────────────────────────────────────────────────────────────────
// The weekly letter isn't a React Email template: the cron writes a row into
// `newsletter_drafts` and src/lib/newsletter-template.js turns that row into
// HTML. So to preview it honestly in /admin/email we render the SAME function
// with the SAME data the next send will use.
//
// Order of preference:
//   1. the newest row still in status "draft"  → what is waiting for approval
//   2. the newest row of any status            → the last letter, sent or not
//   3. a small sample                          → only if the table is empty
//
// (Rows can also sit in status "sent" or "skipped", so "not sent" is not the
// same as "pending approval" — only "draft" is.)
//
// The approve bar is intentionally off here: the hub is for looking, the
// editor at /newsletters/[draftId] is for deciding.

import "server-only";
import { createServerSupabase } from "@/util/supabase/server";
import { renderNewsletterHtml } from "@/lib/newsletter-template";

const SAMPLE_EVENTS = [
  {
    id: 1,
    name: "Cacao & Sound Journey",
    shortdescription:
      "Ceremonial cacao, live instruments, and a long exhale in the middle of the week.",
    date: "2026-01-02T19:00:00.000Z",
    price: 6900,
    slug: "cacao-sound-journey",
    location: "Bankastræti 2, 101 Reykjavík",
    sold_out: false,
  },
  {
    id: 2,
    name: "Saturday Kitchen Table",
    shortdescription:
      "A long shared table, plant-based plates, and whoever walks in the door.",
    date: "2026-01-03T18:30:00.000Z",
    price: 0,
    slug: "saturday-kitchen-table",
    location: "Bankastræti 2, 101 Reykjavík",
    sold_out: false,
  },
];

/**
 * Render the weekly letter exactly as it will be sent.
 *
 * @returns {Promise<{ html: string, source: "draft"|"sent"|"sample", meta: object }>}
 */
export async function renderLive() {
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mama.is";
  let draft = null;

  try {
    const supabase = createServerSupabase();
    const cols =
      "id, send_date, status, intro_note, events_json, highlight_event_id, header_kicker, header_title";

    // 1. Newest row awaiting approval — what the next send will use.
    const pending = await supabase
      .from("newsletter_drafts")
      .select(cols)
      .eq("status", "draft")
      .order("send_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    draft = pending?.data || null;

    // 2. Fall back to the most recent letter of any status.
    if (!draft) {
      const latest = await supabase
        .from("newsletter_drafts")
        .select(cols)
        .order("send_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      draft = latest?.data || null;
    }
  } catch (err) {
    // A preview should never take the hub down — fall through to the sample.
    console.error("[weekly-newsletter preview] draft lookup failed:", err);
  }

  if (!draft) {
    return {
      html: renderNewsletterHtml({
        introNote:
          "Sample letter — no draft exists yet.\nThe Monday cron will create one for the coming week.",
        events: SAMPLE_EVENTS,
        appUrl,
        highlightId: SAMPLE_EVENTS[0].id,
        showApproveBar: false,
      }),
      source: "sample",
      meta: {},
    };
  }

  const events = Array.isArray(draft.events_json) ? draft.events_json : [];

  return {
    html: renderNewsletterHtml({
      introNote: draft.intro_note,
      events,
      appUrl,
      highlightId: draft.highlight_event_id,
      headerKicker: draft.header_kicker ?? null,
      headerTitle: draft.header_title ?? null,
      showApproveBar: false,
    }),
    source: draft.status === "draft" ? "draft" : draft.status || "unknown",
    meta: {
      draftId: draft.id,
      sendDate: draft.send_date,
      status: draft.status,
      eventsCount: events.length,
    },
  };
}
