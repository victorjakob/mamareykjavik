// Shared helpers for the Apple Wallet web service routes under
// /api/wallet/v1/...
//
// Apple's spec:
// https://developer.apple.com/documentation/walletpasses/adding_a_web_service_to_update_passes

import { createServerSupabase } from "@/util/supabase/server";

/**
 * Parse "Authorization: ApplePass <token>" header. Returns the token or null.
 * Apple's spec puts the per-card secret in this header on every request
 * except the public log endpoint.
 */
export function extractApplePassToken(req) {
  const header = req.headers.get("authorization") || "";
  const m = header.match(/^ApplePass\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

/**
 * Look up a tribe_card by its pass serial number. The serial is
 * "tribe-<uuid>" — we just strip the prefix.
 */
export async function lookupCardBySerial(supabase, serialNumber) {
  if (!serialNumber || !serialNumber.startsWith("tribe-")) return null;
  const id = serialNumber.slice("tribe-".length);
  const { data, error } = await supabase
    .from("tribe_cards")
    .select(
      "id, holder_name, holder_email, discount_percent, duration_type, issued_at, expires_at, status, source, access_token, authentication_token, updated_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[walletWS] card lookup failed:", error.message);
    return null;
  }
  return data;
}

/**
 * Verify the Authorization header matches the card's stored token.
 * Returns the card on success, null on auth failure or missing card.
 *
 * Note: passTypeIdentifier from the URL is also validated against the
 * env var so we don't accidentally serve a different pass type.
 */
export async function authenticateCardRequest(req, { passTypeIdentifier, serialNumber }) {
  if (passTypeIdentifier !== process.env.APPLE_PASS_TYPE_ID) {
    return { ok: false, reason: "wrong-pass-type" };
  }
  const token = extractApplePassToken(req);
  if (!token) return { ok: false, reason: "missing-token" };

  const supabase = createServerSupabase();
  const card = await lookupCardBySerial(supabase, serialNumber);
  if (!card) return { ok: false, reason: "card-not-found" };

  // Constant-time comparison would be ideal, but UUIDs aren't
  // user-controlled and the surface is tiny. Plain compare is fine.
  if (card.authentication_token !== token) {
    return { ok: false, reason: "bad-token" };
  }
  return { ok: true, card, supabase };
}
