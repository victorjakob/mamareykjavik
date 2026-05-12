// Ticket-related lifecycle emails — Resend + React Email templates.
// ───────────────────────────────────────────────────────────────────
// Currently exposes:
//   - sendTicketRefundEmail  → buyer-facing "your refund is on its way"
//
// Lazy Resend construction so a missing RESEND_API_KEY doesn't crash imports
// in build/preview environments that don't have it.

import { Resend } from "resend";
import { renderEmail } from "@/emails/render.server";

const FROM = "White Lotus <team@mama.is>";
const REPLY_TO = "team@mama.is";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

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
  const resend = getResend();
  if (!resend) return { skipped: true, reason: "RESEND_API_KEY missing" };
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
