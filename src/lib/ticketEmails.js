// Ticket-related lifecycle emails — powered by Resend.
// ─────────────────────────────────────────────────────
// Kept separate from membershipEmails.js so the two product lines (ticketed
// events vs. ongoing Mama Tribe subscriptions) don't tangle. The styling
// borrows the same warm Mama palette — soft cream card, orange accent, light
// muted copy — so the voice stays consistent.
//
// Currently exposes:
//   - sendTicketRefundEmail  → buyer-facing "your refund is on its way"
//
// Everything here is safe to import from a Next.js route handler; we lazy-
// construct the Resend client so a missing RESEND_API_KEY doesn't crash
// imports in build/preview environments that don't have it.

import { Resend } from "resend";

const FROM = "White Lotus <team@mama.is>";
const REPLY_TO = "team@mama.is";
const BG           = "#faf6f2";
const CARD         = "#ffffff";
const BORDER       = "#f0e6d8";
const TEXT_DARK    = "#2c1810";
const TEXT_MUTED   = "#9a7a62";
const ACCENT       = "#ff914d";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function fmtIsk(amount) {
  const n = Number(amount || 0);
  return new Intl.NumberFormat("is-IS").format(Math.round(n));
}

function fmtDateTime(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      hour: "2-digit",  minute: "2-digit",
    });
  } catch { return ""; }
}

// ─── Shared email shell ─────────────────────────────────────────────────────
function renderShell({ heading, bodyHtml }) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:${BG};font-family:'Helvetica Neue',Arial,sans-serif;color:${TEXT_DARK};">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${BG};padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:${CARD};border:1.5px solid ${BORDER};border-radius:16px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,${ACCENT} 0%,#ff5733 100%);padding:28px 24px;text-align:center;">
          <div style="color:#fff;font-size:13px;letter-spacing:0.3em;text-transform:uppercase;">Mama Reykjavik · White Lotus</div>
          <div style="color:#fff;font-size:26px;font-style:italic;font-weight:300;margin-top:6px;">${heading}</div>
        </td></tr>
        <tr><td style="padding:26px 28px 24px;font-size:15px;line-height:1.55;color:${TEXT_DARK};">
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:18px 28px 28px;border-top:1px solid ${BORDER};color:${TEXT_MUTED};font-size:12.5px;line-height:1.5;">
          Questions? Just hit reply — we read every email.<br/>
          With warmth from everyone at Mama Reykjavik.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
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

  const firstName = (buyerName || "").split(" ")[0] || "there";
  const scope = isPartial ? "A partial refund" : "A refund";
  const subject = `${isPartial ? "Partial refund" : "Refund"} for ${eventName || "your ticket"} · ${fmtIsk(amount)} ${currency}`;

  const bodyHtml = `
    <p style="margin:0 0 12px;">Hi ${firstName},</p>
    <p style="margin:0 0 14px;">${scope} of <strong>${fmtIsk(amount)} ${currency}</strong> has just been issued back to the card you used for <strong>${eventName || "your ticket"}</strong>${eventDate ? ` on ${fmtDateTime(eventDate)}` : ""}.</p>
    ${reason ? `<p style="margin:0 0 14px;background:#fff5ec;padding:12px 14px;border-radius:8px;color:${TEXT_DARK};"><strong>A note from us:</strong> ${reason}</p>` : ""}
    <p style="margin:0 0 14px;color:${TEXT_MUTED};font-size:14px;">Depending on your bank, it can take a few business days for the amount to show up on your statement. If you don't see it within a week, just reply to this email and we'll chase it with the bank.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;font-size:14px;">
      <tr><td style="color:${TEXT_MUTED};padding:4px 0;">Amount refunded</td><td style="text-align:right;"><strong>${fmtIsk(amount)} ${currency}</strong></td></tr>
      ${originalOrderId ? `<tr><td style="color:${TEXT_MUTED};padding:4px 0;">Original order</td><td style="text-align:right;font-family:monospace;font-size:12.5px;">${originalOrderId}</td></tr>` : ""}
      ${refundTransactionId ? `<tr><td style="color:${TEXT_MUTED};padding:4px 0;">Refund ref</td><td style="text-align:right;font-family:monospace;font-size:12.5px;">${refundTransactionId}</td></tr>` : ""}
    </table>
    <p style="margin:14px 0 0;color:${TEXT_MUTED};font-size:13.5px;">Thank you for being part of our little circle — we hope to see you again soon.</p>
  `;

  return resend.emails.send({
    from: FROM,
    to: [to],
    replyTo: REPLY_TO,
    subject,
    html: renderShell({ heading: "Your refund is on its way 🌿", bodyHtml }),
  });
}
