// Newsletter enrol-and-welcome helper.
// ─────────────────────────────────────
// Called from two places:
//   1. The account signup route, after the new user row is inserted, if the
//      "Subscribe to our newsletter" checkbox was ticked.
//   2. The SaltPay payment-success route, after the ticket is marked paid,
//      if the "Keep me in the loop" checkbox was ticked at checkout.
//
// Responsibilities, in one place so signup and checkout stay consistent:
//   - Skip if this email already has a welcomed_at row (we never welcome the
//     same address twice, no matter the source).
//   - Skip if Resend already marks this email as unsubscribed.
//   - Add the contact to the Resend Newsletter Audience.
//   - Send the WelcomeNewsletter email with the correct source variant.
//   - Record welcomed_at in newsletter_welcomes so future opt-ins know.
//
// All Resend / Supabase calls are wrapped in try/catch so a failure here
// never breaks the signup or payment flow. Errors are logged for review.
//
// Required env:
//   RESEND_API_KEY      — already used by src/lib/resend.js
//   RESEND_AUDIENCE_ID  — the one Mama Newsletter audience id in Resend
//
// Usage from signup or checkout:
//
//   import { enrolAndWelcome } from "@/lib/newsletter";
//
//   await enrolAndWelcome({
//     email,
//     name,
//     source: "account_optin",        // or "ticket_buyer"
//     consentBasis: "explicit_optin", // or "soft_optin_customer"
//   });

import "server-only";
import { createResend } from "@/lib/resend";
import { createServerSupabase } from "@/util/supabase/server";
import { renderEmail } from "@/emails/render.server";

const FROM = "Mama Reykjavík <hello@mail.mama.is>";
const REPLY_TO = "team@mama.is";

function normaliseEmail(raw) {
  return (raw || "").trim().toLowerCase();
}

function splitName(name) {
  const trimmed = (name || "").trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(/\s+/);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

/**
 * Enrol a contact in the Mama newsletter audience and send the welcome email.
 * Idempotent: safe to call multiple times for the same email; the welcome only
 * goes out once.
 *
 * @param {object} params
 * @param {string} params.email          - The contact's email address.
 * @param {string} [params.name]         - The contact's display name.
 * @param {("account_optin"|"ticket_buyer"|"rein_warmup")} params.source
 * @param {("explicit_optin"|"soft_optin_customer")} [params.consentBasis]
 * @returns {Promise<{ status: "welcomed"|"already_welcomed"|"unsubscribed"|"error", reason?: string }>}
 */
export async function enrolAndWelcome({
  email,
  name = "",
  source,
  consentBasis,
} = {}) {
  const normalised = normaliseEmail(email);
  if (!normalised || !normalised.includes("@")) {
    return { status: "error", reason: "invalid_email" };
  }
  if (!source) {
    return { status: "error", reason: "missing_source" };
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    console.warn(
      "[enrolAndWelcome] RESEND_AUDIENCE_ID is not set — skipping enrol.",
    );
    return { status: "error", reason: "missing_audience_id" };
  }

  let supabase;
  try {
    supabase = createServerSupabase();
  } catch (err) {
    console.error("[enrolAndWelcome] supabase init failed", err);
    return { status: "error", reason: "supabase_init_failed" };
  }

  // 1. Have we already welcomed this email? If yes, do nothing.
  try {
    const { data: existing, error: existingError } = await supabase
      .from("newsletter_welcomes")
      .select("email, welcomed_at, unsubscribed_at")
      .eq("email", normalised)
      .maybeSingle();

    if (existingError) {
      console.error(
        "[enrolAndWelcome] welcomed-lookup error",
        existingError,
      );
      // Fall through — better to try the welcome than to silently drop it.
    }

    if (existing) {
      if (existing.unsubscribed_at) {
        return { status: "unsubscribed", reason: "previously_unsubscribed" };
      }
      return { status: "already_welcomed" };
    }
  } catch (err) {
    console.error("[enrolAndWelcome] welcomed-lookup threw", err);
  }

  // 2. Add to Resend audience (or update if already there).
  const resend = createResend();
  const { firstName, lastName } = splitName(name);
  let resendContactId = null;
  let resendAlreadyUnsubscribed = false;

  try {
    const result = await resend.contacts.create({
      audienceId,
      email: normalised,
      firstName,
      lastName,
      unsubscribed: false,
    });

    // Resend SDK responses use `data` and `error` envelopes.
    if (result?.error) {
      // If the contact already exists, Resend returns an error; that is fine.
      const msg = String(result.error?.message || "");
      if (!/already exists|already a member/i.test(msg)) {
        console.warn("[enrolAndWelcome] resend.contacts.create error", msg);
      }
    } else {
      resendContactId = result?.data?.id || null;
    }
  } catch (err) {
    // Network or SDK error — log but continue; we may still want to record
    // the welcome attempt locally if Resend was just flaky.
    console.error("[enrolAndWelcome] resend.contacts.create threw", err);
  }

  // 3. Check Resend's view: if this contact is already unsubscribed there,
  //    do NOT send the welcome.
  try {
    const lookup = await resend.contacts.get({
      audienceId,
      email: normalised,
    });
    if (lookup?.data?.unsubscribed === true) {
      resendAlreadyUnsubscribed = true;
    }
  } catch (err) {
    // Older SDK versions or transient failures — fall through.
  }

  if (resendAlreadyUnsubscribed) {
    // Mirror Resend's state locally so future opt-ins also skip.
    try {
      await supabase.from("newsletter_welcomes").upsert(
        {
          email: normalised,
          source,
          consent_basis: consentBasis,
          unsubscribed_at: new Date().toISOString(),
          resend_contact_id: resendContactId,
          metadata: { name: name || null, suppressed_at_enrol: true },
        },
        { onConflict: "email" },
      );
    } catch (err) {
      console.error("[enrolAndWelcome] upsert-suppressed threw", err);
    }
    return { status: "unsubscribed", reason: "resend_marks_unsubscribed" };
  }

  // 4. Render and send the WelcomeNewsletter email.
  try {
    const { html, text, subject } = await renderEmail("welcome-newsletter", {
      source,
      eventsUrl: "https://mama.is/events",
      // The unsubscribe link is rendered as-is. Resend will swap in the real
      // suppression URL via the broadcast variable when this template is
      // ever used in a Broadcast; for transactional welcomes we point at our
      // own /unsubscribe page which forwards to Resend.
      unsubscribeUrl: "https://mama.is/unsubscribe",
    });

    await resend.emails.send({
      from: FROM,
      to: [normalised],
      replyTo: REPLY_TO,
      subject: subject || "A gentle hello from Mama",
      html,
      text,
    });
  } catch (err) {
    console.error("[enrolAndWelcome] welcome send failed", err);
    return { status: "error", reason: "send_failed" };
  }

  // 5. Record the welcome so we never send again to this address.
  try {
    await supabase.from("newsletter_welcomes").upsert(
      {
        email: normalised,
        source,
        consent_basis: consentBasis,
        welcomed_at: new Date().toISOString(),
        resend_contact_id: resendContactId,
        metadata: { name: name || null },
      },
      { onConflict: "email" },
    );
  } catch (err) {
    console.error("[enrolAndWelcome] welcomed-upsert threw", err);
    // The email already went out, so this is a "best effort" mark.
  }

  return { status: "welcomed" };
}
