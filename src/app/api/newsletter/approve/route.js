// GET /api/newsletter/approve?draft=<id>&token=<approval_token>
//
// Hit by the "Send it" button in the Monday preview email. Stateless: no
// session needed, the secret token is what gates the send. Works from any
// device, including a phone.
//
// Flow:
//   1. Validate draft id + token.
//   2. If draft is already sent/sending, render a short page explaining.
//   3. Mark status='sending'.
//   4. Call Resend Broadcasts API: create a broadcast with the draft's html,
//      schedule it for immediate send.
//   5. Mark status='sent', store the resend_broadcast_id.
//   6. Render a small "Sent. Thank you." confirmation page.
//
// On error: mark status='failed', store the error message, render a small
// page with the failure. The Edit page can be opened to retry from there.

import { createServerSupabase } from "@/util/supabase/server";
import { sendNewsletterBroadcast } from "@/lib/newsletter-send";

function confirmationPage({ title, message, accent = "#ff914d" }) {
  const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,600&family=Inter:wght@400;600&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#1a1208; min-height:100vh; display:flex; align-items:center; justify-content:center; font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
  <div style="text-align:center; padding:60px 24px; max-width:480px;">
    <div style="font-family:Georgia,serif; font-size:24px; color:${accent}; margin-bottom:24px;">&#10022;</div>
    <h1 style="font-family:'Cormorant Garamond',Georgia,serif; font-style:italic; font-weight:600; font-size:38px; color:#f0ebe3; margin:0 0 18px; line-height:1.2;">${title}</h1>
    <p style="font-size:16px; line-height:1.7; color:#c0b4a8; margin:0 0 32px;">${message}</p>
    <a href="https://mama.is" style="display:inline-block; padding:13px 30px; background:${accent}; color:#1a1208; text-decoration:none; font-weight:600; border-radius:4px; font-size:14px;">Back to mama.is</a>
  </div>
</body></html>`;
  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(req) {
  const url = new URL(req.url);
  const draftId = url.searchParams.get("draft");
  const token = url.searchParams.get("token");

  if (!draftId || !token) {
    return confirmationPage({
      title: "Missing details",
      message:
        "The link is missing a draft id or a token. Open the preview email again and tap the button from there.",
    });
  }

  const supabase = createServerSupabase();

  // 1. Look up the draft.
  const { data: draft, error: draftError } = await supabase
    .from("newsletter_drafts")
    .select(
      "id, status, subject, html, approval_token, send_date, resend_broadcast_id",
    )
    .eq("id", draftId)
    .maybeSingle();

  if (draftError) {
    console.error("[newsletter/approve] draft lookup error", draftError);
    return confirmationPage({
      title: "Something went wrong",
      message:
        "We could not look up that draft. The team has been notified. Please try again in a minute.",
    });
  }

  if (!draft) {
    return confirmationPage({
      title: "Draft not found",
      message:
        "This draft does not exist any more. Open the latest preview email and try from there.",
    });
  }

  if (draft.approval_token !== token) {
    return confirmationPage({
      title: "This link is no longer valid",
      message:
        "The token does not match. Open the latest preview email for a fresh link.",
    });
  }

  // 2. Already sent or in flight?
  if (draft.status === "sent" || draft.status === "sending") {
    return confirmationPage({
      title: "Already on its way",
      message:
        "This Monday's letter has already gone out. No need to send it again.",
    });
  }
  if (draft.status === "approved") {
    // Means a previous click made it past validation but the broadcast call
    // didn't complete. Fall through and try the send again.
  }

  // 3. Send via the shared helper. It handles status transitions and errors.
  const result = await sendNewsletterBroadcast({ draft, supabase });

  if (!result.ok) {
    return confirmationPage({
      title: "We could not send it",
      message: `Something went wrong sending the broadcast. ${escapeHtml(result.error || "")} Open the edit page to try again.`,
    });
  }

  return confirmationPage({
    title: "Sent",
    message:
      "Your letter is on its way to your subscribers. Thank you. You can close this page.",
  });
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
