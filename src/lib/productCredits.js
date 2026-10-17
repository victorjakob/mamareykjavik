// Product credits — one-time credits for a menu item or category, separate
// from Mama coins. Table: public.product_credits (migration
// 20261017130000_product_credits.sql). Public claim URL: /claim/<id>.

import crypto from "crypto";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I/L

export function isCreditId(id) {
  return UUID_RE.test(String(id || ""));
}

export function newCreditCode(length = 6) {
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return out;
}

export function normalizeCode(code) {
  return String(code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function siteBaseUrl() {
  return (process.env.NEXT_PUBLIC_BASE_URL || "https://mama.is").replace(/\/$/, "");
}

export function claimUrl(id, base = siteBaseUrl()) {
  return `${base}/claim/${id}`;
}

/** "unclaimed" past its expiry is reported as "expired" (not stored). */
export function effectiveStatus(credit) {
  if (!credit) return "invalid";
  if (
    credit.status === "unclaimed" &&
    credit.expires_at &&
    Date.now() > new Date(credit.expires_at).getTime()
  ) {
    return "expired";
  }
  return credit.status;
}

/** Validates admin input; returns { ok, error?, value? }. */
export function parseCreditInput(body) {
  const itemLabel = String(body?.item_label || "").trim().slice(0, 120);
  const customerName = String(body?.customer_name || "").trim().slice(0, 100) || null;
  const customerContact = String(body?.customer_contact || "").trim().slice(0, 120) || null;
  const note = String(body?.note || "").trim().slice(0, 500) || null;
  const menuItemId = isCreditId(body?.menu_item_id) ? body.menu_item_id : null;
  const menuCategoryId = isCreditId(body?.menu_category_id) ? body.menu_category_id : null;
  let expiresAt = null;
  if (body?.expires_at) {
    const d = new Date(body.expires_at);
    if (Number.isNaN(d.getTime())) return { ok: false, error: "Invalid expiry date" };
    // A date-only value means "valid through that day" (Reykjavik = UTC).
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(body.expires_at))) d.setUTCHours(23, 59, 59, 0);
    if (d.getTime() <= Date.now()) return { ok: false, error: "Expiry must be in the future" };
    expiresAt = d.toISOString();
  } else {
    // No expiry given: new credits default to one year from creation.
    const d = new Date();
    d.setUTCFullYear(d.getUTCFullYear() + 1);
    expiresAt = d.toISOString();
  }
  if (!itemLabel) return { ok: false, error: "Say what the credit is for" };
  return {
    ok: true,
    value: { itemLabel, customerName, customerContact, note, menuItemId, menuCategoryId, expiresAt },
  };
}

// Columns safe to show on the public claim page (no note, no customer contact).
export const PUBLIC_CREDIT_COLUMNS =
  "id, code, item_label, customer_name, status, expires_at, claimed_at";
