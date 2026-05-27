// Shared helper that sends the weekly newsletter broadcast through Resend.
// Used by both the token-protected /api/newsletter/approve and the
// admin-session-protected /api/newsletter/send so the two paths can never
// drift apart.

import "server-only";
import { createResend } from "@/lib/resend";

const FROM = "Mama Reykjavík <hello@mail.mama.is>";
const REPLY_TO = "team@mama.is";

/**
 * Send a newsletter draft as a Resend broadcast.
 *
 * @param {object} draft   - Row from public.newsletter_drafts.
 * @param {object} supabase - createServerSupabase() instance.
 * @returns {Promise<{ ok: boolean, broadcastId?: string, error?: string }>}
 */
export async function sendNewsletterBroadcast({ draft, supabase }) {
  if (!draft) return { ok: false, error: "draft missing" };
  if (draft.status === "sent" || draft.status === "sending") {
    return { ok: true, broadcastId: draft.resend_broadcast_id || null };
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    await supabase
      .from("newsletter_drafts")
      .update({
        status: "failed",
        error_message: "RESEND_AUDIENCE_ID is not configured",
      })
      .eq("id", draft.id);
    return { ok: false, error: "RESEND_AUDIENCE_ID is not configured" };
  }

  await supabase
    .from("newsletter_drafts")
    .update({ status: "sending", approved_at: new Date().toISOString() })
    .eq("id", draft.id);

  const resend = createResend();

  try {
    const created = await resend.broadcasts.create({
      audienceId,
      from: FROM,
      subject: draft.subject || "This Monday at Mama",
      html: draft.html,
      replyTo: REPLY_TO,
      name: `Weekly · ${draft.send_date}`,
    });

    if (created?.error) {
      throw new Error(created.error?.message || "Resend create failed");
    }
    const broadcastId = created?.data?.id;
    if (!broadcastId) throw new Error("Resend did not return a broadcast id");

    const sent = await resend.broadcasts.send(broadcastId, {});
    if (sent?.error) {
      throw new Error(sent.error?.message || "Resend send failed");
    }

    await supabase
      .from("newsletter_drafts")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        resend_broadcast_id: broadcastId,
        error_message: null,
      })
      .eq("id", draft.id);

    return { ok: true, broadcastId };
  } catch (err) {
    await supabase
      .from("newsletter_drafts")
      .update({
        status: "failed",
        error_message: String(err?.message || err),
      })
      .eq("id", draft.id);
    return { ok: false, error: String(err?.message || err) };
  }
}
