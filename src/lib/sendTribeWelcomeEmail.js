// Shared sender for the Tribe Card welcome email.
// ────────────────────────────────────────────────
// Used by both manual admin creation (/api/admin/tribe-cards POST)
// and request approval (/api/admin/tribe-cards/requests/[id]).
//
// Attaches a signed Apple Wallet .pkpass when the cert env vars are
// configured. If they're missing (or pass generation throws for any
// other reason) the email is still sent — just without the wallet
// attachment. This keeps the welcome flow resilient: a wallet config
// problem in dev should never block a real customer's card email.

import { Resend } from "resend";
import { buildWelcomeCardEmail } from "@/lib/tribeCardEmail";
import { generateTribePass } from "@/lib/applePass";

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mama.is";

// Best-effort wallet pass — returns Buffer on success, null on any error.
// We swallow errors here on purpose; the email still goes.
async function tryBuildPass(card) {
  if (!process.env.APPLE_PASS_TYPE_ID || !process.env.APPLE_PASS_CERT_PATH) {
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
  const walletBadgeUrl = walletEnabled
    ? `${SITE_URL}/wallet-pass/add-to-apple-wallet@2x.png`
    : undefined;

  const { text, html } = buildWelcomeCardEmail({
    card,
    publicCardUrl,
    profileUrl,
    walletPassUrl,
    walletBadgeUrl,
  });

  const attachments = passBuffer
    ? [
        {
          filename: "MamaTribeCard.pkpass",
          content: passBuffer, // Resend accepts a Node Buffer directly
          contentType: "application/vnd.apple.pkpass",
        },
      ]
    : undefined;

  try {
    await resend.emails.send({
      from: "Mama.is <team@mama.is>",
      to: card.holder_email,
      subject: "Welcome to the tribe — your card is ready",
      text,
      html,
      ...(attachments ? { attachments } : {}),
    });
    return { ok: true, withWallet: !!passBuffer };
  } catch (error) {
    console.error("[tribe welcome email] send failed:", error);
    return { ok: false, withWallet: !!passBuffer, error };
  }
}
