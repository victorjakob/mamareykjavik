// Scheduled task: build a draft of the weekly Mama newsletter and email a
// preview to team@mama.is with two action buttons (Send it / Edit first).
//
// Schedule: Mondays at 11:00 UTC. Iceland sits on UTC year-round so this is
// 11:00 Reykjavik wall-clock time.
//
// Authorization: Bearer ${CRON_SECRET}.

import { createServerSupabase } from "@/util/supabase/server";
import { createResend } from "@/lib/resend";
import { runWithLogging } from "@/lib/cronLog";
import {
  renderNewsletterHtml,
  dedupeRecurringSeries,
  nextMondayIso,
  pickDefaultHighlightId,
  NEWSLETTER_WINDOW_DAYS,
} from "@/lib/newsletter-template";

const FROM = "Mama Reykjavík <hello@mail.mama.is>";
const REPLY_TO = "team@mama.is";
// Monday preview goes to the shared team inbox AND Mama's personal inbox, so
// it lands somewhere it's actually seen.
const PREVIEW_TO = ["team@mama.is", "mama.reykjavik@gmail.com"];

const isAuthorizedRequest = (req) => {
  const authHeader = req.headers.get("authorization");
  return (
    !!process.env.CRON_SECRET &&
    authHeader === `Bearer ${process.env.CRON_SECRET}`
  );
};

export async function GET(req) {
  return runWithLogging("cron-draft-weekly-newsletter", req, () =>
    draftAndPreview(req),
  );
}

export async function POST(req) {
  return runWithLogging("cron-draft-weekly-newsletter", req, () =>
    draftAndPreview(req),
  );
}

async function draftAndPreview(req) {
  if (!isAuthorizedRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabase();
  const resend = createResend();
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mama.is";

  // 1. Pull events for the coming week.
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
    return Response.json({ error: eventsError.message }, { status: 500 });
  }

  const featured = dedupeRecurringSeries(rawEvents || []);
  const sendDate = nextMondayIso();
  // Default the hero to the weekend event (else the first); an existing draft
  // keeps its own chosen highlight.
  let highlightId = pickDefaultHighlightId(featured);
  const introNote =
    featured.length > 0
      ? "Music, cacao, workshops. Here is what is coming up\nat Bankastræti 2 this week."
      : "Quiet week ahead. The kitchen is warm and the door is open. Come for what calls you.";

  // 2. Find or create the draft row for this Monday.
  let draftId;
  let approvalToken;

  const { data: existing, error: existingError } = await supabase
    .from("newsletter_drafts")
    .select("id, approval_token, status, highlight_event_id")
    .eq("send_date", sendDate)
    .maybeSingle();

  if (existingError) {
    return Response.json({ error: existingError.message }, { status: 500 });
  }

  if (existing && existing.status === "sent") {
    // Don't re-preview a draft that's already been sent to subscribers.
    return Response.json(
      {
        skipped: true,
        reason: "already_sent",
        draftId: existing.id,
        sendDate,
      },
      { status: 200 },
    );
  }

  if (existing) {
    draftId = existing.id;
    approvalToken = existing.approval_token;
    highlightId = existing.highlight_event_id ?? null;
  } else {
    const ins = await supabase
      .from("newsletter_drafts")
      .insert({
        send_date: sendDate,
        status: "draft",
        subject: "This Monday at Mama",
        preheader: "A small letter from our table at Bankastræti 2.",
        intro_note: introNote,
        events_json: featured,
        highlight_event_id: highlightId,
        html: "",
      })
      .select("id, approval_token")
      .single();
    if (ins.error) {
      return Response.json({ error: ins.error.message }, { status: 500 });
    }
    draftId = ins.data.id;
    approvalToken = ins.data.approval_token;
  }

  const approveUrl = `${appUrl}/api/newsletter/approve?draft=${draftId}&token=${approvalToken}`;
  const editUrl = `${appUrl}/newsletters/${draftId}`;

  // 3. Render the FINAL newsletter HTML (no approve bar — the version
  //    subscribers will see). Store on the draft.
  const finalHtml = renderNewsletterHtml({
    introNote,
    events: featured,
    appUrl,
    highlightId,
    showApproveBar: false,
  });

  await supabase
    .from("newsletter_drafts")
    .update({
      html: finalHtml,
      intro_note: introNote,
      events_json: featured,
    })
    .eq("id", draftId);

  // 4. Render the PREVIEW HTML (with the approve bar) and send to team@mama.is.
  const previewHtml = renderNewsletterHtml({
    introNote,
    events: featured,
    appUrl,
    highlightId,
    approveUrl,
    editUrl,
    showApproveBar: true,
  });

  try {
    await resend.emails.send({
      from: FROM,
      to: PREVIEW_TO,
      replyTo: REPLY_TO,
      subject: `Monday preview: ${sendDate}`,
      html: previewHtml,
    });
  } catch (err) {
    return Response.json(
      {
        error: `preview send failed: ${err?.message || err}`,
        draftId,
        sendDate,
      },
      { status: 500 },
    );
  }

  return Response.json({
    ok: true,
    draftId,
    sendDate,
    eventsCount: featured.length,
    approveUrl,
    editUrl,
  });
}
