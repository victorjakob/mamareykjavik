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
import fs from "node:fs/promises";
import path from "node:path";
import { buildWelcomeCardEmail } from "@/lib/tribeCardEmail";
import { generateTribePass } from "@/lib/applePass";

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mama.is";
const PROJECT_ROOT = process.cwd();

// Best-effort wallet pass — returns Buffer on success, null on any error.
// We swallow errors here on purpose; the email still goes.
async function tryBuildPass(card) {
  const hasCert =
    !!process.env.APPLE_PASS_CERT_BASE64 || !!process.env.APPLE_PASS_CERT_PATH;
  if (!process.env.APPLE_PASS_TYPE_ID || !hasCert) {
    // Apple Wallet not configured for this environment — that's fine.
    return null;
  }
  try {
    return await generateTribePass(card);
  } catch (err) {
    console.error("[tribe wallet pass] generation failed:", err?.message || err);
    return null;
  }
}

// Read the badge PNG from /public so we can inline it in the email.
// Cached after first read.
let badgeBuffer = null;
async function loadBadgeBuffer() {
  if (badgeBuffer) return badgeBuffer;
  try {
    const p = path.join(PROJECT_ROOT, "public", "wallet-pass", "add-to-apple-wallet@2x.png");
    badgeBuffer = await fs.readFile(p);
    return badgeBuffer;
  } catch (err) {
    console.error("[tribe wallet badge] could not read badge image:", err?.message);
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

  // Best-effort pass build first — only show the wallet button if we
  // actually have signed bytes to back it (otherwise the user taps a
  // button that 500s server-side, worse UX than no button at all).
  const passBuffer = await tryBuildPass(card);

  const walletEnabled = !!passBuffer;
  const walletPassUrl = walletEnabled
    ? `${SITE_URL}/api/tribe-cards/by-token/${card.access_token}/pkpass`
    : undefined;

  // Stable Content-ID — the email HTML references this with src="cid:..."
  // so the badge image embeds inline (no remote loading).
  const WALLET_BADGE_CID = "wallet-badge.png";

  const badgeBytes = walletEnabled ? await loadBadgeBuffer() : null;
  const walletBadgeCid = walletEnabled && badgeBytes ? WALLET_BADGE_CID : undefined;

  const { text, html } = buildWelcomeCardEmail({
    card,
    publicCardUrl,
    profileUrl,
    walletPassUrl,
    walletBadgeCid,
  });

  const attachments = [];
  if (passBuffer) {
    attachments.push({
      filename: "MamaTribeCard.pkpass",
      content: passBuffer,
      contentType: "application/vnd.apple.pkpass",
    });
  }
  if (badgeBytes && walletEnabled) {
    // Inline badge image. Resend forwards `contentId` to the underlying
    // RFC 822 Content-ID header, which `cid:` refs in the HTML resolve to.
    attachments.push({
      filename: "add-to-apple-wallet.png",
      content: badgeBytes,
      contentType: "image/png",
      contentId: WALLET_BADGE_CID,
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
    return { ok: true, withWallet: walletEnabled };
  } catch (error) {
    console.error("[tribe welcome email] send failed:", error);
    return { ok: false, withWallet: walletEnabled, error };
  }
}
