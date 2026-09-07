// Tribe-card lifecycle emails — expiry warning, expired notice, follow-up,
// and the one-off "join the paid Tribe" invitation for unlimited cards.
// -----------------------------------------------------------------------------
// Same adapter shape as membershipEmails.js: render a React Email template,
// hand it to Resend, return { ok, id } | { ok:false, error } | { skipped }.
// Kept separate because these are driven by tribe_cards (gifted / legacy
// cards), not by membership_subscriptions.

import { createResend } from "@/lib/resend";
import { renderEmail } from "@/emails/render.server";

const FROM = "Mama Reykjavik <team@mama.is>";
const resend = createResend();

function baseUrl() {
  return (process.env.NEXT_PUBLIC_BASE_URL || "https://mama.is").replace(/\/$/, "");
}

// ?ref= lets us see in analytics which email brought someone to /membership.
export function membershipUrl(ref) {
  return `${baseUrl()}/membership${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`;
}

export function cardUrl(card) {
  return `${baseUrl()}/tribe-card/${card.access_token}`;
}

function firstNameOf(name) {
  return String(name || "").trim().split(/\s+/)[0] || "friend";
}

export function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

async function sendTemplated({ to, subject, templateId, props }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[tribeCardLifecycleEmails] RESEND_API_KEY missing — skipping:", subject);
    return { skipped: true };
  }
  try {
    const { html, text } = await renderEmail(templateId, props);
    const result = await resend.emails.send({ from: FROM, to: [to], subject, html, text });
    return { ok: true, id: result?.data?.id || null };
  } catch (err) {
    console.error("[tribeCardLifecycleEmails] resend send error:", subject, err);
    return { ok: false, error: err?.message || String(err) };
  }
}

function commonProps(card, ref) {
  return {
    firstName: firstNameOf(card.holder_name),
    discountPercent: card.discount_percent,
    expiresAt: card.expires_at,
    cardUrl: cardUrl(card),
    membershipUrl: membershipUrl(ref),
  };
}

// 30 days before expires_at.
export async function sendTribeCardExpiringSoonEmail(card) {
  return sendTemplated({
    to: card.holder_email,
    subject: `Your Tribe Card ends on ${formatDate(card.expires_at)} — let's keep you close`,
    templateId: "tribe-card-expiring-soon",
    props: commonProps(card, "card-expiring"),
  });
}

// The day the card flips to expired.
export async function sendTribeCardExpiredEmail(card) {
  return sendTemplated({
    to: card.holder_email,
    subject: "Your Tribe Card has ended — here's how to keep the love going",
    templateId: "tribe-card-expired",
    props: commonProps(card, "card-expired"),
  });
}

// ~14 days after expiry, one gentle nudge and then we leave them be.
export async function sendTribeCardExpiredFollowUpEmail(card) {
  return sendTemplated({
    to: card.holder_email,
    subject: "We miss you at the table",
    templateId: "tribe-card-expired-followup",
    props: commonProps(card, "card-followup"),
  });
}

// One-off invitation for unlimited (never-expiring) cards: keep the perk,
// join the paid Tribe if you'd like to support Mama.
export async function sendTribeCardInviteEmail(card) {
  return sendTemplated({
    to: card.holder_email,
    subject: "A small invitation from Mama",
    templateId: "tribe-card-invite",
    props: commonProps(card, "card-invite"),
  });
}
