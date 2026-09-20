// Membership alerts for the house.
// ────────────────────────────────
// Everything in membershipEmails.js is addressed to the member. This is the
// one that comes to us: someone joined, a renewal was declined, someone
// cancelled.
//
// Deliberately best-effort. A notification must never be the reason a
// signup, a renewal or a cancellation fails, so every send is wrapped and
// failures are logged and swallowed. Same shape as the other senders:
//   { ok: true, id } | { ok: false, error } | { skipped: true }

import { createResend } from "@/lib/resend";
import { renderEmail } from "@/emails/render.server";
import { formatMoney, formatDate } from "@/lib/membershipEmails";

const FROM = "Mama.is <team@mama.is>";

// Where the alerts land. Set MEMBERSHIP_ALERT_EMAIL to send them somewhere
// else (a personal inbox, a shared alias) without touching this file.
const TO = process.env.MEMBERSHIP_ALERT_EMAIL || "team@mama.is";

const SUBJECTS = {
  paid_joined: (name) => `New Tribe member — ${name}`,
  free_joined: (name) => `New community member — ${name}`,
  renewal_failed: (name) => `Renewal failed — ${name}`,
  cancelled: (name) => `Membership cancelled — ${name}`,
};

function adminUrl(subscriptionId) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://mama.is";
  const root = `${base.replace(/\/$/, "")}/admin/memberships`;
  return subscriptionId ? `${root}?subscription=${subscriptionId}` : root;
}

/**
 * @param {object} opts
 * @param {"paid_joined"|"free_joined"|"renewal_failed"|"cancelled"} opts.kind
 * @param {string} [opts.name]
 * @param {string} opts.email
 * @param {string} [opts.tier]
 * @param {number} [opts.amount]        raw number; formatted here
 * @param {string} [opts.currency]
 * @param {string} [opts.activeUntil]   ISO date; formatted here
 * @param {string} [opts.reason]        decline reason, cancellation note…
 * @param {string} [opts.subscriptionId]
 */
export async function notifyAdminMembership({
  kind,
  name,
  email,
  tier,
  amount,
  currency = "ISK",
  activeUntil,
  reason,
  subscriptionId,
} = {}) {
  try {
    // createResend() returns a stub that throws when the key is missing, so
    // check the key rather than the client — no noise in local dev.
    if (!process.env.RESEND_API_KEY) return { skipped: true };
    const resend = createResend();

    const who = (name || "").trim() || email || "someone";
    const subject = (SUBJECTS[kind] || SUBJECTS.paid_joined)(who);

    const { html, text } = await renderEmail("membership-admin-notification", {
      kind,
      name: name || "—",
      email: email || "—",
      tier: tier || null,
      amount: amount != null ? formatMoney(amount, currency) : null,
      activeUntil: activeUntil ? formatDate(activeUntil) : null,
      reason: reason || null,
      adminUrl: adminUrl(subscriptionId),
    });

    const { data, error } = await resend.emails.send({
      from: FROM,
      to: TO,
      // Hitting reply goes to the member, not into a void.
      replyTo: email || undefined,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("notifyAdminMembership rejected:", error);
      return { ok: false, error };
    }
    return { ok: true, id: data?.id };
  } catch (err) {
    // Never let an alert break the thing it is reporting on.
    console.error("notifyAdminMembership failed:", err);
    return { ok: false, error: err };
  }
}
