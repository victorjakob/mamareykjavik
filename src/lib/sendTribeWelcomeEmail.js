// Shared sender for the Tribe Card welcome email.
// ────────────────────────────────────────────────
// Used by both manual admin creation (/api/admin/tribe-cards POST)
// and request approval (/api/admin/tribe-cards/requests/[id]).
//
// HTML rendering is now handled by the React Email template
// "tribe-card-welcome" in src/emails/templates/TribeCardWelcome.jsx.
// This file's responsibility is the around-the-edges work that the template
// can't do:
//   1. Generate the Apple Wallet .pkpass attachment when certs are configured.
//   2. Build the Google Wallet save URL when service account is configured.
//   3. Pass the resulting walletPassUrl + googleSaveUrl to the template so
//      the buttons render only when their respective integrations are live.
//
// The template renders styled "Add to Apple Wallet" / "Save to Google Wallet"
// buttons rather than the official Apple/Google badge images. Sending the
// .pkpass as an attachment still gives iOS Mail the native Add-to-Wallet UI.

import { Resend } from "resend";
import { generateTribePass } from "@/lib/applePass";
import { buildGoogleWalletSaveUrl } from "@/lib/googleWallet";
import { renderEmail } from "@/emails/render.server";

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mama.is";

// Best-effort Apple Wallet pass — returns Buffer on success, null on any error.
async function tryBuildApplePass(card) {
  const hasCert =
    !!process.env.APPLE_PASS_CERT_BASE64 || !!process.env.APPLE_PASS_CERT_PATH;
  if (!process.env.APPLE_PASS_TYPE_ID || !hasCert) {
    return null; // Apple Wallet not configured — fine, skip
  }
  try {
    return await generateTribePass(card);
  } catch (err) {
    console.error("[tribe wallet pass] Apple generation failed:", err?.message || err);
    return null;
  }
}

// Best-effort Google Wallet save URL — returns string on success, null on any error.
async function tryBuildGoogleSaveUrl(card) {
  if (
    !process.env.GOOGLE_WALLET_ISSUER_ID ||
    !process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_JSON
  ) {
    return null; // Google Wallet not configured yet — fine, skip
  }
  try {
    return await buildGoogleWalletSaveUrl(card);
  } catch (err) {
    console.error("[tribe wallet pass] Google save URL build failed:", err?.message || err);
    return null;
  }
}

/**
 * Send the welcome card email to the holder.
 * @param {Object} card - tribe_cards row
 * @returns {Promise<{ ok: boolean, withWallet: boolean, error?: any }>}
 */
export async function sendTribeWelcomeEmail(card) {
  const publicCardUrl = `${SITE_URL}/tribe-card/${card.access_token}`;
  const profileUrl = `${SITE_URL}/profile/my-tribe-card`;

  // Best-effort wallet integrations — show each button only when the
  // backing infrastructure is configured. If neither is set up, the
  // email goes without wallet buttons (still functional).
  const [passBuffer, googleSaveUrl] = await Promise.all([
    tryBuildApplePass(card),
    tryBuildGoogleSaveUrl(card),
  ]);

  const appleEnabled = !!passBuffer;
  const googleEnabled = !!googleSaveUrl;

  // The Apple Wallet "Add" button needs a URL the device can fetch the
  // .pkpass from. Even though we attach the .pkpass to the email itself
  // (so iOS Mail offers Add-to-Wallet on tap), this URL is the fallback
  // for clients that strip attachments.
  const walletPassUrl = appleEnabled
    ? `${SITE_URL}/api/tribe-cards/by-token/${card.access_token}/pkpass`
    : undefined;

  const { html, text } = await renderEmail("tribe-card-welcome", {
    holderName: card.holder_name,
    discountPercent: card.discount_percent,
    expiresAt: card.expires_at,
    durationType: card.duration_type,
    publicCardUrl,
    profileUrl,
    walletPassUrl,
    googleSaveUrl: googleEnabled ? googleSaveUrl : undefined,
  });

  // Attachments — the .pkpass enables Apple Mail's native Add-to-Wallet UI.
  const attachments = [];
  if (passBuffer) {
    attachments.push({
      filename: "MamaTribeCard.pkpass",
      content: passBuffer,
      contentType: "application/vnd.apple.pkpass",
    });
  }

  try {
    await resend.emails.send({
      from: "Mama.is <team@mama.is>",
      to: card.holder_email,
      subject: "Welcome to the tribe — your card is ready",
      text,
      html,
      ...(attachments.length ? { attachments } : {}),
    });
    return { ok: true, withWallet: appleEnabled || googleEnabled };
  } catch (error) {
    console.error("[tribe welcome email] send failed:", error);
    return { ok: false, withWallet: appleEnabled || googleEnabled, error };
  }
}
