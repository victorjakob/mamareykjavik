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

// ─── Booking confirmations (moved here from the saltpay/sendgrid routes) ────
// Same templates, subjects and senders as before; the difference is that the
// event data now comes from the database on the server, never the browser.

const DEFAULT_LOCATION = "Bankastræti 2, 101 Reykjavík";
const MANAGER_URL = "https://mama.is/events/manager";

function hostRecipientsFor(event) {
  return Array.from(
    new Set(
      [event?.host, event?.host_secondary]
        .map((e) => (typeof e === "string" ? e.trim() : ""))
        .filter(Boolean)
    )
  );
}

function communityFields(event) {
  return {
    communityLink: event?.community_link_in_email ? event.community_link : null,
    communityLinkLabel: event?.community_link_in_email
      ? event.community_link_label
      : null,
  };
}

/**
 * Confirmation for a ticket that is confirmed without online payment:
 * a free ticket (total 0) or a pay-at-the-door ticket.
 */
export async function sendReservedTicketEmails({ event, ticket }) {
  const isFree = Number(ticket.total_price || 0) === 0;
  const buyerName = ticket.buyer_name;
  const buyerEmail = ticket.buyer_email;

  const attendee = isFree
    ? await renderEmail("free-ticket-attendee-confirmation", {
        userName: buyerName,
        eventName: event.name,
        eventDate: event.date,
        duration: event.duration,
        location: event.location || DEFAULT_LOCATION,
        ...communityFields(event),
      })
    : await renderEmail("paid-ticket-attendee-confirmation", {
        userName: buyerName,
        eventName: event.name,
        eventDate: event.date,
        duration: event.duration,
        location: event.location || DEFAULT_LOCATION,
        price: ticket.price,
        hasSlidingScale: event.has_sliding_scale,
        slidingScaleMin: event.sliding_scale_min,
        slidingScaleMax: event.sliding_scale_max,
        ...communityFields(event),
      });

  await resend.emails.send({
    from: FROM,
    to: [buyerEmail],
    subject: isFree
      ? `Free Ticket Confirmed - ${event.name}`
      : `Event Ticket - ${event.name}`,
    html: attendee.html,
    text: attendee.text,
  });

  const hosts = hostRecipientsFor(event);
  if (hosts.length > 0) {
    const host = await renderEmail(
      isFree ? "free-ticket-host-notification" : "paid-ticket-host-notification",
      {
        eventName: event.name,
        attendeeName: buyerName,
        attendeeEmail: buyerEmail,
        managerUrl: MANAGER_URL,
      }
    );
    await resend.emails.send({
      from: FROM,
      to: hosts,
      subject: isFree
        ? `New Free Ticket Registration for ${event.name}`
        : `New Registration for ${event.name}`,
      html: host.html,
      text: host.text,
    });
  }
}

/** Confirmation after an online payment has been confirmed. */
export async function sendPaidTicketEmails({
  event,
  ticket,
  buyerName,
  buyerEmail,
  amount,
  currency = "ISK",
}) {
  const buyer = await renderEmail("paid-ticket-attendee-confirmation", {
    userName: buyerName,
    eventName: event.name,
    eventDate: event.date,
    duration: event.duration,
    location: event.location || DEFAULT_LOCATION,
    price: amount,
    currency,
    paid: true,
    quantity: ticket.quantity,
    variantName: ticket.variant_name,
    ...communityFields(event),
  });

  await resend.emails.send({
    from: FROM,
    to: [buyerEmail],
    replyTo: REPLY_TO,
    subject: `Your Ticket is Confirmed — ${event.name}`,
    html: buyer.html,
    text: buyer.text,
  });

  const hosts = hostRecipientsFor(event);
  if (hosts.length > 0) {
    const host = await renderEmail("paid-ticket-host-notification", {
      eventName: event.name,
      attendeeName: buyerName,
      attendeeEmail: buyerEmail,
      managerUrl: MANAGER_URL,
    });
    await resend.emails.send({
      from: FROM,
      to: hosts,
      replyTo: REPLY_TO,
      subject: `New Registration for ${event.name}`,
      html: host.html,
      text: host.text,
    });
  }
}

/**
 * Internal alert to the team when a payment needs a human: it arrived after
 * the event filled up (oversold), or the amount didn't match the order.
 */
export async function sendTicketAlert({ subject, lines }) {
  if (!process.env.RESEND_API_KEY) return { skipped: true };
  const text = lines.filter(Boolean).join("\n");
  await resend.emails.send({
    from: FROM,
    to: [REPLY_TO],
    subject: `[Tickets] ${subject}`,
    text,
    html: `<pre style="font-family:ui-monospace,monospace;font-size:13px;white-space:pre-wrap">${text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")}</pre>`,
  });
}
