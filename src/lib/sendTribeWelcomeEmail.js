// Shared sender for the Tribe Card welcome email.
// ────────────────────────────────────────────────
// Used by both manual admin creation (/api/admin/tribe-cards POST)
// and request approval (/api/admin/tribe-cards/requests/[id]).
//
// Attaches:
//   1. The signed Apple Wallet .pkpass (if certs are configured) — main
//      attachment, iOS Mail offers Add-to-Wallet on tap.
//   2. The "Add to Apple Wallet" badge PNG (always, when wallet enabled)
//      as an INLINE attachment with cid: reference. Inline attachments
//      embed the image inside the email itself, so it always shows
//      regardless of "block remote images" privacy settings.

import { Resend } from "resend";
import { buildWelcomeCardEmail } from "@/lib/tribeCardEmail";
import { generateTribePass } from "@/lib/applePass";
import { buildGoogleWalletSaveUrl } from "@/lib/googleWallet";
import { ADD_TO_APPLE_WALLET_BADGE_BUFFER } from "@/lib/walletBadge";
import { SAVE_TO_GOOGLE_WALLET_BADGE_BUFFER } from "@/lib/googleWalletBadge";

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

  // Best-effort wallet integrations — show each badge only when the
  // backing infrastructure is configured. If neither is set up, the
  // email goes without wallet buttons (still functional).
  const [passBuffer, googleSaveUrl] = await Promise.all([
    tryBuildApplePass(card),
    tryBuildGoogleSaveUrl(card),
  ]);

  const appleEnabled = !!passBuffer;
  const googleEnabled = !!googleSaveUrl;

  const walletPassUrl = appleEnabled
    ? `${SITE_URL}/api/tribe-cards/by-token/${card.access_token}/pkpass`
    : undefined;

  // Stable Content-IDs — the email HTML references these via cid:
  // so badge images embed inline (no remote loading needed).
  const APPLE_BADGE_CID = "wallet-badge";
  const GOOGLE_BADGE_CID = "google-wallet-badge";

  const walletBadgeCid = appleEnabled ? APPLE_BADGE_CID : undefined;
  const googleWalletBadgeCid = googleEnabled ? GOOGLE_BADGE_CID : undefined;
  const googleWalletSaveUrl = googleEnabled ? googleSaveUrl : undefined;

  const { text, html } = buildWelcomeCardEmail({
    card,
    publicCardUrl,
    profileUrl,
    walletPassUrl,
    walletBadgeCid,
    googleWalletSaveUrl,
    googleWalletBadgeCid,
  });

  const attachments = [];
  if (passBuffer) {
    attachments.push({
      filename: "MamaTribeCard.pkpass",
      content: passBuffer,
      contentType: "application/vnd.apple.pkpass",
    });
  }
  if (appleEnabled) {
    attachments.push({
      filename: "add-to-apple-wallet.png",
      content: ADD_TO_APPLE_WALLET_BADGE_BUFFER,
      contentType: "image/png",
      content_id: APPLE_BADGE_CID,
    });
  }
  if (googleEnabled) {
    attachments.push({
      filename: "save-to-google-wallet.png",
      content: SAVE_TO_GOOGLE_WALLET_BADGE_BUFFER,
      contentType: "image/png",
      content_id: GOOGLE_BADGE_CID,
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
