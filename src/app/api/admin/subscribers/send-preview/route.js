// POST /api/admin/subscribers/send-preview
// Re-send the Monday preview email (with Accept & send / Change buttons) for a
// given draft — to the logged-in admin AND team@mama.is — on demand.
//   body: { draftId }
//
// Admin or host session required.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";
import { createResend } from "@/lib/resend";
import { renderNewsletterHtml } from "@/lib/newsletter-template";

export const dynamic = "force-dynamic";

const FROM = "Mama Reykjavík <hello@mail.mama.is>";
const REPLY_TO = "team@mama.is";

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
  const { data: draft, error } = await supabase
    .from("newsletter_drafts")
    .select("id, send_date, status, intro_note, events_json, highlight_event_id, approval_token")
    .eq("id", draftId)
    .maybeSingle();

  if (error || !draft) {
    return NextResponse.json({ error: error?.message || "Draft not found" }, { status: 404 });
  }
  if (draft.status === "sent") {
    return NextResponse.json({ error: "This draft has already been sent." }, { status: 409 });
  }

  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mama.is";
  const approveUrl = `${appUrl}/api/newsletter/approve?draft=${draft.id}&token=${draft.approval_token}`;
  const editUrl = `${appUrl}/newsletters/${draft.id}`;

  const html = renderNewsletterHtml({
    introNote: draft.intro_note,
    events: Array.isArray(draft.events_json) ? draft.events_json : [],
    appUrl,
    highlightId: draft.highlight_event_id,
    approveUrl,
    editUrl,
    showApproveBar: true,
  });

  // Send to whoever asked, plus the shared team inbox. De-duplicated.
  const recipients = Array.from(
    new Set([session.user.email, "team@mama.is"].filter(Boolean)),
  );

  try {
    const resend = createResend();
    const res = await resend.emails.send({
      from: FROM,
      to: recipients,
      replyTo: REPLY_TO,
      subject: `Monday preview: ${draft.send_date}`,
      html,
    });
    if (res?.error) throw new Error(res.error?.message || "Send failed");
  } catch (err) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sent_to: recipients });
}
