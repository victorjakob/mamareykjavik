// Membership lifecycle emails — powered by Resend + React Email templates.
// -----------------------------------------------------------------------------
// All HTML rendering now happens in src/emails/templates/. This file is the
// thin adapter between the membership state machine and Resend: it knows
// the FROM address, the formatting helpers, the friendly decline-reason map,
// and which template to render for each lifecycle event.
//
// Every send* function returns:
//   { ok: true, id }              — Resend accepted it
//   { ok: false, error }          — Resend rejected it
//   { skipped: true }             — RESEND_API_KEY missing (no-op)

import { createResend } from "@/lib/resend";
import { renderEmail } from "@/emails/render.server";

const FROM = "Mama Reykjavik <team@mama.is>";
const resend = createResend();

// Base URL for CTAs — falls back to the production domain so emails remain
// useful even when called from a cron that doesn't know the request origin.
function membershipUrl() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://mama.is";
  return `${base.replace(/\/$/, "")}/membership`;
}

function eventsUrl() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://mama.is";
  return `${base.replace(/\/$/, "")}/events`;
}

// First name for the welcome templates — they greet by first name only.
function firstNameOf(name) {
  return String(name || "").trim().split(/\s+/)[0] || "friend";
}

// Format a number as ISK / EUR / etc. with Icelandic thousands separators.
export function formatMoney(amount, currency = "ISK") {
  const n = Number(amount || 0);
  const pretty = new Intl.NumberFormat("is-IS").format(n).replace(/,/g, ".");
  const cur = String(currency || "ISK").toUpperCase();
  if (cur === "ISK") return `${pretty} kr.`;
  return `${pretty} ${cur}`;
}

// Format a date as "20 May 2026".
export function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// Map Teya RPG ActionCodes to a member-facing reason. We stay vague on fraud /
// security codes so we don't leak fraud heuristics to the customer — the
// framing is always "please contact your bank or try another card".
export function friendlyDeclineReason(actionCode) {
  const c = String(actionCode || "").padStart(3, "0");
  const map = {
    "100": "Your card was declined — possibly not enough available balance.",
    "101": "Your card has expired.",
    "102": "Your card was declined by your bank.",
    "104": "Your card is restricted from this kind of charge.",
    "111": "Your card number appears to be invalid.",
    "116": "Your card doesn't have enough available balance.",
    "119": "Your card is temporarily restricted.",
    "120": "Your card doesn't allow this kind of transaction.",
    "121": "You've reached your card's transaction limit.",
    "125": "Your card couldn't be verified.",
    "129": "Additional authentication is required from your bank.",
    "131": "Your card is restricted by your bank.",
    "200": "Your bank has asked us to stop using this card.",
    "201": "Your bank has asked us to stop using this card.",
    "202": "Your card has been reported lost.",
    "203": "Your card has been reported stolen.",
    "907": "Your bank is temporarily unreachable.",
    "909": "A system issue interrupted the charge.",
  };
  return map[c] || "Your bank declined the renewal charge.";
}

// Shared send helper — renders the template, calls Resend, returns a tagged
// result object.
async function sendTemplated({ to, subject, templateId, props }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[membershipEmails] RESEND_API_KEY missing — skipping:", subject);
    return { skipped: true };
  }
  try {
    const { html, text } = await renderEmail(templateId, props);
    const result = await resend.emails.send({
      from: FROM,
      to: [to],
      subject,
      html,
      text,
    });
    return { ok: true, id: result?.data?.id || null };
  } catch (err) {
    console.error("[membershipEmails] resend send error:", subject, err);
    return { ok: false, error: err?.message || String(err) };
  }
}

// ─── 1. Successful renewal receipt ──────────────────────────────────────────
export async function sendRenewalSucceededEmail({
  to, name, amount, currency, nextBillingDate, tier, transactionId,
}) {
  return sendTemplated({
    to,
    subject: `Your Mama Tribe renewal · ${formatMoney(amount, currency)}`,
    templateId: "membership-renewal-succeeded",
    props: {
      name, amount, currency, nextBillingDate, tier, transactionId,
      manageUrl: membershipUrl(),
    },
  });
}

// ─── 2. Renewal failed with a retry scheduled (soft decline) ────────────────
export async function sendRenewalSoftFailedEmail({
  to, name, amount, currency, retryDate, attemptNumber, actionCode,
}) {
  return sendTemplated({
    to,
    subject: "We couldn't renew your Mama Tribe membership — we'll try again",
    templateId: "membership-renewal-soft-failed",
    props: {
      name, amount, currency, retryDate, attemptNumber,
      reason: friendlyDeclineReason(actionCode),
      manageUrl: membershipUrl(),
    },
  });
}

// ─── 3. Renewal permanently failed (past_due) ───────────────────────────────
export async function sendRenewalFinalFailedEmail({
  to, name, amount, currency, actionCode,
}) {
  return sendTemplated({
    to,
    subject: "Your Mama Tribe membership is paused",
    templateId: "membership-renewal-final-failed",
    props: {
      name, amount, currency,
      reason: friendlyDeclineReason(actionCode),
      manageUrl: membershipUrl(),
    },
  });
}

// ─── 4. No card on file ─────────────────────────────────────────────────────
export async function sendRenewalNoCardEmail({ to, name, amount, currency }) {
  return sendTemplated({
    to,
    subject: "Please add a card to continue your Mama Tribe membership",
    templateId: "membership-renewal-no-card",
    props: { name, amount, currency, manageUrl: membershipUrl() },
  });
}

// ─── 5. Cancel-at-period-end confirmation ───────────────────────────────────
export async function sendCancellationScheduledEmail({ to, name, activeUntil, tier }) {
  return sendTemplated({
    to,
    subject: "Your Mama Tribe cancellation is scheduled",
    templateId: "membership-cancellation-scheduled",
    props: { name, activeUntil, tier, manageUrl: membershipUrl() },
  });
}

// ─── 6. Refund issued — admin comped or refunded a charge ───────────────────
export async function sendRefundIssuedEmail({
  to, name, amount, currency, isPartial, originalOrderId, refundTransactionId, reason,
}) {
  return sendTemplated({
    to,
    subject: `${isPartial ? "Partial refund" : "Refund"} from Mama Reykjavik · ${formatMoney(amount, currency)}`,
    templateId: "membership-refund-issued",
    props: {
      name, amount, currency, isPartial, originalOrderId, refundTransactionId,
      reason, manageUrl: membershipUrl(),
    },
  });
}

// ─── 7. Final cancellation / subscription ended ─────────────────────────────
export async function sendCancellationFinalEmail({ to, name, tier }) {
  return sendTemplated({
    to,
    subject: "Your Mama Tribe membership has ended",
    templateId: "membership-cancellation-final",
    props: { name, tier, manageUrl: membershipUrl() },
  });
}

// ─── 8. Welcome — free Community tier ───────────────────────────────────────
export async function sendWelcomeCommunityEmail({ to, name }) {
  return sendTemplated({
    to,
    subject: "Welcome to Mama — a small note about what's next",
    templateId: "welcome-community",
    props: {
      firstName: firstNameOf(name),
      membershipUrl: membershipUrl(),
      eventsUrl: eventsUrl(),
    },
  });
}

// ─── 9. Welcome — paid Tribe / Patron tier ──────────────────────────────────
// The template has no tier prop — Patron members get the same Tribe welcome
// (the Tribe is the umbrella brand for paid membership).
export async function sendWelcomeTribeEmail({ to, name }) {
  return sendTemplated({
    to,
    subject: "Welcome to the Tribe — here's what's now yours",
    templateId: "welcome-tribe",
    props: { firstName: firstNameOf(name), manageUrl: membershipUrl() },
  });
}

// ─── 10. First-payment receipt ──────────────────────────────────────────────
// Deliberately distinct from the renewal receipt — "thank you for joining",
// not "thank you for continuing".
export async function sendFirstReceiptEmail({
  to, name, amount, currency, nextBillingDate, tier, transactionId,
}) {
  return sendTemplated({
    to,
    subject: `Your Mama Tribe receipt · ${formatMoney(amount, currency)}`,
    templateId: "membership-first-receipt",
    props: {
      name, amount, currency, nextBillingDate, tier, transactionId,
      manageUrl: membershipUrl(),
    },
  });
}
