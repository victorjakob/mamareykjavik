// Ticket-related lifecycle emails — Resend + React Email templates.
// ───────────────────────────────────────────────────────────────────
// Currently exposes:
//   - sendTicketRefundEmail  → buyer-facing "your refund is on its way"
//
// Uses createResend() from @/lib/resend — the helper returns a graceful
// stub when RESEND_API_KEY is missing so imports never crash.

import { createResend } from "@/lib/resend";
import { renderEmail } from "@/emails/render.server";

const FROM = "White Lotus <team@mama.is>";
const REPLY_TO = "team@mama.is";

const resend = createResend();

function fmtIsk(amount) {
  const n = Number(amount || 0);
  return new Intl.NumberFormat("is-IS").format(Math.round(n));
}

// ─── Ticket refund — admin refunded a ticket purchase ──────────────────────
export async function sendTicketRefundEmail({
  to,
  buyerName,
  eventName,
  eventDate,
  amount,
  currency = "ISK",
  isPartial = false,
  originalOrderId,
  refundTransactionId,
  reason,
}) {
  if (!process.env.RESEND_API_KEY)
    return { skipped: true, reason: "RESEND_API_KEY missing" };
  if (!to) return { skipped: true, reason: "no recipient" };

  const subject = `${isPartial ? "Partial refund" : "Refund"} for ${eventName || "your ticket"} · ${fmtIsk(amount)} ${currency}`;

  const { html, text } = await renderEmail("ticket-refund", {
    buyerName,
    eventName,
    eventDate,
    amount,
    currency,
    isPartial,
    originalOrderId,
    refundTransactionId,
    reason,
  });

  return resend.emails.send({
    from: FROM,
    to: [to],
    replyTo: REPLY_TO,
    subject,
    html,
    text,
  });
}
