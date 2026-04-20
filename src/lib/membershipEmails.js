// Membership lifecycle emails — powered by Resend.
// -----------------------------------------------------------------------------
// All helpers are no-ops (return { skipped: true }) if RESEND_API_KEY is
// missing, so the cron and cancel endpoints never crash on a missing env.
//
// Brand voice: warm, grounded, community-first. Short sentences, first-person
// plural ("we"), a tiny bit of soul. The only action we ever ask a member to
// take is "update your card" / "manage your subscription".
//
// Visual: soft orange #ff914d accent (matches the rest of the transactional
// mail in this codebase), centred card layout, no over-styling.

import { Resend } from "resend";

const FROM = "Mama Reykjavik <team@mama.is>";
const BRAND_ORANGE = "#ff914d";
const TEXT_DARK = "#2b2b2b";
const TEXT_MUTED = "#6b6b6b";

// Base URL for CTAs — falls back to the production domain so emails remain
// useful even when called from a cron that doesn't know the request origin.
function membershipUrl() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://mama.is";
  return `${base.replace(/\/$/, "")}/membership`;
}

// Lazily construct Resend so missing env doesn't crash imports.
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
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

// Shared chrome so each email feels like it belongs to the same family.
function renderShell({ subject, heading, bodyHtml, ctaHref, ctaLabel, footer }) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: ${TEXT_DARK};">
      <div style="background-color: ${BRAND_ORANGE}; padding: 22px 24px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.2px;">${heading}</h1>
      </div>
      <div style="background-color: #ffffff; padding: 28px 28px 20px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.06);">
        <div style="color: ${TEXT_DARK}; font-size: 15.5px; line-height: 1.65;">
          ${bodyHtml}
        </div>
        ${ctaHref && ctaLabel ? `
          <div style="text-align: center; margin: 28px 0 8px;">
            <a href="${ctaHref}"
               style="background-color: ${BRAND_ORANGE}; color: white; padding: 12px 26px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 15px;">
              ${ctaLabel}
            </a>
          </div>` : ""}
        <div style="margin-top: 28px; padding-top: 18px; border-top: 1px solid #eee; color: ${TEXT_MUTED}; font-size: 13.5px; line-height: 1.6;">
          ${footer || `
            With love,<br/>
            <strong>Mama Reykjavík &amp; The White Lotus Team</strong><br/>
            <span style="color: ${TEXT_MUTED}; font-size: 12.5px;">Bankastræti 2 · 101 Reykjavík</span>
          `}
        </div>
      </div>
    </div>
  `;
}

async function sendEmail({ to, subject, html }) {
  const resend = getResend();
  if (!resend) {
    console.warn("[membershipEmails] RESEND_API_KEY missing — skipping:", subject);
    return { skipped: true };
  }
  try {
    const result = await resend.emails.send({ from: FROM, to: [to], subject, html });
    return { ok: true, id: result?.data?.id || null };
  } catch (err) {
    console.error("[membershipEmails] resend send error:", subject, err);
    return { ok: false, error: err?.message || String(err) };
  }
}

// ─── 1. Successful renewal receipt ──────────────────────────────────────────
export async function sendRenewalSucceededEmail({
  to, name, amount, currency, nextBillingDate, tier, orderId, transactionId,
}) {
  const firstName = (name || "").split(" ")[0] || "there";
  const subject = `Your Mama Tribe renewal · ${formatMoney(amount, currency)}`;
  const html = renderShell({
    heading: "Your renewal went through 🌱",
    bodyHtml: `
      <p>Hi ${firstName},</p>
      <p>Thank you for continuing to be part of Mama Tribe — your support keeps this little community cooking.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 18px 0; width: 100%; font-size: 14.5px;">
        <tr><td style="color: ${TEXT_MUTED}; padding: 4px 0;">Tier</td><td style="text-align: right;">${tier || "Tribe"}</td></tr>
        <tr><td style="color: ${TEXT_MUTED}; padding: 4px 0;">Amount</td><td style="text-align: right;"><strong>${formatMoney(amount, currency)}</strong></td></tr>
        <tr><td style="color: ${TEXT_MUTED}; padding: 4px 0;">Next renewal</td><td style="text-align: right;">${formatDate(nextBillingDate)}</td></tr>
        ${transactionId ? `<tr><td style="color: ${TEXT_MUTED}; padding: 4px 0;">Receipt</td><td style="text-align: right; font-family: monospace; font-size: 12.5px;">${transactionId}</td></tr>` : ""}
      </table>
      <p style="color: ${TEXT_MUTED}; font-size: 13.5px;">You can manage your subscription or update your card anytime from your member page.</p>
    `,
    ctaHref: membershipUrl(),
    ctaLabel: "Manage subscription",
  });
  return sendEmail({ to, subject, html });
}

// ─── 2. Renewal failed with a retry scheduled (soft decline) ────────────────
export async function sendRenewalSoftFailedEmail({
  to, name, amount, currency, retryDate, attemptNumber, actionCode,
}) {
  const firstName = (name || "").split(" ")[0] || "there";
  const nth = attemptNumber === 1 ? "first" : attemptNumber === 2 ? "second" : `attempt ${attemptNumber}`;
  const reason = friendlyDeclineReason(actionCode);
  const subject = `We couldn't renew your Mama Tribe membership — we'll try again`;
  const html = renderShell({
    heading: "A little hiccup with your renewal",
    bodyHtml: `
      <p>Hi ${firstName},</p>
      <p>We just tried to renew your Mama Tribe membership (${formatMoney(amount, currency)}) and the charge didn't go through.</p>
      <p style="background: #fff5ec; padding: 12px 14px; border-radius: 6px; color: ${TEXT_DARK};"><strong>Reason:</strong> ${reason}</p>
      <p>This was our ${nth} attempt. We'll try again automatically on <strong>${formatDate(retryDate)}</strong>, so there's nothing you need to do if you don't want to.</p>
      <p>If you'd like to fix it now — update your card or check with your bank — the button below opens your member page.</p>
    `,
    ctaHref: membershipUrl(),
    ctaLabel: "Update my card",
  });
  return sendEmail({ to, subject, html });
}

// ─── 3. Renewal permanently failed (past_due) ───────────────────────────────
export async function sendRenewalFinalFailedEmail({
  to, name, amount, currency, actionCode,
}) {
  const firstName = (name || "").split(" ")[0] || "there";
  const reason = friendlyDeclineReason(actionCode);
  const subject = `Your Mama Tribe membership is paused`;
  const html = renderShell({
    heading: "Your membership is paused",
    bodyHtml: `
      <p>Hi ${firstName},</p>
      <p>We weren't able to renew your Mama Tribe membership (${formatMoney(amount, currency)}) — even after giving it a couple of extra tries.</p>
      <p style="background: #fff5ec; padding: 12px 14px; border-radius: 6px; color: ${TEXT_DARK};"><strong>Reason:</strong> ${reason}</p>
      <p>For now your membership is <strong>paused</strong>. You won't be charged again, and your Tribe benefits are on hold until you choose to restart.</p>
      <p>When you're ready, update your card or start fresh from your member page — it only takes a minute, and we'll pick up right where you left off.</p>
    `,
    ctaHref: membershipUrl(),
    ctaLabel: "Reactivate my membership",
  });
  return sendEmail({ to, subject, html });
}

// ─── 4. No card on file ─────────────────────────────────────────────────────
export async function sendRenewalNoCardEmail({ to, name, amount, currency }) {
  const firstName = (name || "").split(" ")[0] || "there";
  const subject = `Please add a card to continue your Mama Tribe membership`;
  const html = renderShell({
    heading: "We need a card to keep your membership going",
    bodyHtml: `
      <p>Hi ${firstName},</p>
      <p>It's time to renew your Mama Tribe membership (${formatMoney(amount, currency)}) but we don't have a card on file for you at the moment.</p>
      <p>Pop over to your member page and add a card when you have a minute — your benefits will pick back up automatically.</p>
    `,
    ctaHref: membershipUrl(),
    ctaLabel: "Add a card",
  });
  return sendEmail({ to, subject, html });
}

// ─── 5. Cancel-at-period-end confirmation ───────────────────────────────────
export async function sendCancellationScheduledEmail({ to, name, activeUntil, tier }) {
  const firstName = (name || "").split(" ")[0] || "there";
  const subject = `Your Mama Tribe cancellation is scheduled`;
  const html = renderShell({
    heading: "We've received your cancellation",
    bodyHtml: `
      <p>Hi ${firstName},</p>
      <p>We've noted your request to cancel your Mama Tribe ${tier ? `(${tier}) ` : ""}membership. You'll keep all of your benefits until <strong>${formatDate(activeUntil)}</strong> — no further charges after that.</p>
      <p>Thank you for the time you spent in the Tribe. You're welcome back anytime the door swings open, and there's always a cup of chai with your name on it.</p>
      <p style="color: ${TEXT_MUTED}; font-size: 13.5px;">Changed your mind? You can reactivate from your member page before your benefits end.</p>
    `,
    ctaHref: membershipUrl(),
    ctaLabel: "Manage subscription",
  });
  return sendEmail({ to, subject, html });
}

// ─── 6. Final cancellation / subscription ended ─────────────────────────────
export async function sendCancellationFinalEmail({ to, name, tier }) {
  const firstName = (name || "").split(" ")[0] || "there";
  const subject = `Your Mama Tribe membership has ended`;
  const html = renderShell({
    heading: "Until next time 🌿",
    bodyHtml: `
      <p>Hi ${firstName},</p>
      <p>Your Mama Tribe ${tier ? `(${tier}) ` : ""}membership has come to the end of its period. Thank you for being part of our little circle — it meant something.</p>
      <p>If you'd like to rejoin, the Tribe is always here. And if you'd just like to drop by for a stew and a hug, our door is open.</p>
    `,
    ctaHref: membershipUrl(),
    ctaLabel: "Come back to the Tribe",
  });
  return sendEmail({ to, subject, html });
}
