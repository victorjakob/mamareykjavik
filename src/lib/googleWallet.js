// Google Wallet integration for Mama Tribe Cards.
// ──────────────────────────────────────────────────
// Counterpart to applePass.js — same data, different vendor.
//
// How Google Wallet differs from Apple Wallet:
//   1. No .pkpass file. Google uses an API model:
//        a. Define a "loyalty class" once (the visual template)
//        b. Create a "loyalty object" per customer (the personalized
//           instance — name, member ID, discount, expiry)
//        c. Sign a JWT containing the object + a save URL
//        d. User clicks the JWT-encoded link → saves to their Wallet
//   2. Updates happen via PATCH calls to Google's API. No APNs needed —
//      Google's wallet client polls for changes automatically.
//   3. Auth is a Google Cloud service-account JSON key. We sign JWTs
//      with the service-account private key.
//
// Required env vars (set in Vercel after Google approves the Issuer):
//   GOOGLE_WALLET_ISSUER_ID                 — long numeric ID from
//                                             pay.google.com/business
//   GOOGLE_WALLET_SERVICE_ACCOUNT_JSON     — full JSON of the service
//                                             account key (paste into
//                                             Vercel as one env var)
//   GOOGLE_WALLET_CLASS_ID                 — defaults to
//                                             {issuer}.tribe-card-v1
//
// Optional env var:
//   NEXT_PUBLIC_SITE_URL                    — used in pass links (back
//                                             of card)
//
// Spec references:
//   https://developers.google.com/wallet/generic
//   https://developers.google.com/wallet/loyalty/web (we use loyalty)
//   https://developers.google.com/wallet/generic/web/jwt

import jwt from "jsonwebtoken";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mama.is";

// Google's APIs.
const WALLET_API_BASE = "https://walletobjects.googleapis.com/walletobjects/v1";
const SAVE_URL_PREFIX = "https://pay.google.com/gp/v/save/";

// ─── service account ────────────────────────────────────────────────────────

let serviceAccountCache = null;

function getServiceAccount() {
  if (serviceAccountCache) return serviceAccountCache;
  const raw = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error("GOOGLE_WALLET_SERVICE_ACCOUNT_JSON env var not set");
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error("GOOGLE_WALLET_SERVICE_ACCOUNT_JSON is not valid JSON");
  }
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("GOOGLE_WALLET_SERVICE_ACCOUNT_JSON missing client_email or private_key");
  }
  // Vercel sometimes mangles \n in pasted env vars. The service account
  // private_key is multiline PEM — restore real newlines if needed.
  parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  serviceAccountCache = parsed;
  return parsed;
}

function getIssuerId() {
  const id = process.env.GOOGLE_WALLET_ISSUER_ID;
  if (!id) throw new Error("GOOGLE_WALLET_ISSUER_ID env var not set");
  return id;
}

function getClassId() {
  const issuer = getIssuerId();
  return process.env.GOOGLE_WALLET_CLASS_ID || `${issuer}.tribe-card-v1`;
}

// Mint a short-lived OAuth2 access token from the service account. Used
// for direct REST calls to walletobjects API (create/update class + object).
async function getAccessToken() {
  const sa = getServiceAccount();
  const now = Math.floor(Date.now() / 1000);
  const assertion = jwt.sign(
    {
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/wallet_object.issuer",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    },
    sa.private_key,
    { algorithm: "RS256" },
  );

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google OAuth token exchange failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.access_token;
}

// ─── pass class (template) ──────────────────────────────────────────────────
//
// The class defines the visual template + branding. We register it once
// per Google Wallet account. Subsequent passes (objects) reference the
// class by id. If we ever change the design, update CLASS_VERSION below
// and migrate the class id (existing passes stick to the old class).

function buildClassDefinition() {
  const issuerId = getIssuerId();
  const classId = getClassId();
  return {
    id: classId,
    issuerName: "Mama Reykjavík",
    programName: "Mama VIP",
    programLogo: {
      sourceUri: {
        // Public URL — Google fetches this when rendering the pass.
        // Must be a square logo on transparent or solid background.
        uri: `${SITE_URL}/wallet-pass/icon@3x.png`,
      },
      contentDescription: { defaultValue: { language: "en", value: "Mama Tribe Card" } },
    },
    hexBackgroundColor: "#fff7ec",
    countryCode: "IS",
    reviewStatus: "UNDER_REVIEW", // becomes "APPROVED" after Google reviews
    homepageUri: {
      uri: SITE_URL,
      description: "Mama Reykjavík",
    },
  };
}

// Idempotent — creates the class on first call, no-op (or PATCH) after.
async function ensureClass(accessToken) {
  const classId = getClassId();
  const def = buildClassDefinition();

  // Check if it already exists.
  const head = await fetch(`${WALLET_API_BASE}/loyaltyClass/${encodeURIComponent(classId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (head.status === 200) {
    // Keep the visual template aligned with the current app design. This is
    // best-effort because Google may require re-review for some class changes.
    const res = await fetch(`${WALLET_API_BASE}/loyaltyClass/${encodeURIComponent(classId)}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(def),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(`[googleWallet] class design patch skipped: ${res.status} ${text}`);
    }
    return;
  }

  if (head.status === 404) {
    // Create it.
    const res = await fetch(`${WALLET_API_BASE}/loyaltyClass`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(def),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Google Wallet class create failed: ${res.status} ${text}`);
    }
    return;
  }

  const text = await head.text().catch(() => "");
  throw new Error(`Google Wallet class lookup failed: ${head.status} ${text}`);
}

// ─── pass object (per-card instance) ────────────────────────────────────────

function formatExpiryReadable(d) {
  if (!d) return "No expiration";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Build the loyalty object payload for a single card. Used both at JWT
// creation time AND when PATCH-updating after a renewal.
function buildLoyaltyObject(card) {
  const issuerId = getIssuerId();
  const classId = getClassId();
  const objectId = `${issuerId}.tribe-${card.id}`;

  // Map status → Google's state enum.
  let state = "ACTIVE";
  if (card.status === "expired") state = "EXPIRED";
  else if (card.status === "revoked") state = "INACTIVE";

  const expiresAt = card.expires_at ? new Date(card.expires_at) : null;

  return {
    id: objectId,
    classId,
    state,
    accountId: card.access_token, // any string we control
    accountName: card.holder_name,

    // Top-line fields shown big on the pass face
    barcode: undefined, // no QR per user spec — staff verifies visually
    loyaltyPoints: {
      label: "Mama VIP",
      balance: { string: `${card.discount_percent}%` },
    },
    secondaryLoyaltyPoints: {
      label: "Valid until",
      balance: { string: formatExpiryReadable(card.expires_at) },
    },

    // Detail rows — show on expand
    textModulesData: [
      {
        id: "counter_note",
        header: "Show at the counter",
        body: "Show this card at the counter before paying.",
      },
      {
        id: "valid_until",
        header: "Valid until",
        body: formatExpiryReadable(card.expires_at),
      },
      {
        id: "how_to_use",
        header: "How to use your card",
        body: "Show this pass at Mama Reykjavík before paying. Your discount is applied at the till. Card is personal to the named cardholder.",
      },
    ],

    linksModuleData: {
      uris: [
        {
          uri: `${SITE_URL}/tribe-card/${card.access_token}`,
          description: "View your card online",
          id: "view_online",
        },
        {
          uri: "mailto:team@mama.is",
          description: "Contact Mama",
          id: "contact",
        },
      ],
    },

    // Brand reinforcement on the back of the card
    infoModuleData: {
      labelValueRows: [
        {
          columns: [
            { label: "Cardholder", value: card.holder_name },
            { label: "Brand", value: "Mama Reykjavík" },
          ],
        },
        {
          columns: [
            { label: "Discount", value: `${card.discount_percent}%` },
            {
              label: "Valid until",
              value: formatExpiryReadable(card.expires_at),
            },
          ],
        },
      ],
    },

    // Auto-grey on expiry (Google handles like Apple's expirationDate)
    ...(expiresAt
      ? {
          validTimeInterval: {
            end: { date: expiresAt.toISOString() },
          },
        }
      : {}),
  };
}

// ─── public API ─────────────────────────────────────────────────────────────

/**
 * Build the "Save to Google Wallet" URL for a tribe card.
 *
 * The returned URL is a normal HTTPS link the user clicks (in email or
 * web). Google's servers parse the JWT, look up or create the loyalty
 * object, and add it to the user's wallet.
 *
 * On first call ever for this Wallet account, this also creates the
 * loyalty class with Google. Subsequent calls reuse the class.
 *
 * @param {Object} card - tribe_cards row
 * @returns {Promise<string>} Save-to-Google-Wallet URL
 */
export async function buildGoogleWalletSaveUrl(card) {
  const sa = getServiceAccount();

  // Ensure the loyalty class exists (idempotent).
  const accessToken = await getAccessToken();
  await ensureClass(accessToken);

  // Build the JWT payload. The JWT can either reference an existing
  // object by id OR embed the object inline — we embed inline so the
  // first save creates the object atomically.
  const loyaltyObject = buildLoyaltyObject(card);

  const claims = {
    iss: sa.client_email,
    aud: "google",
    typ: "savetowallet",
    iat: Math.floor(Date.now() / 1000),
    payload: {
      loyaltyObjects: [loyaltyObject],
    },
    origins: [SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "")],
  };

  const token = jwt.sign(claims, sa.private_key, { algorithm: "RS256" });
  return `${SAVE_URL_PREFIX}${token}`;
}

/**
 * PATCH the loyalty object server-side after a card update (renewal,
 * cancellation, revocation). Google's wallet client picks this up
 * automatically — no equivalent of APNs is needed.
 *
 * Best-effort: never throws. Logs failures.
 *
 * @param {Object} card - tribe_cards row (must include at least: id,
 *   discount_percent, expires_at, status, holder_name, access_token)
 * @returns {Promise<{ok: boolean, status?: number, error?: string}>}
 */
export async function updateGoogleWalletObject(card) {
  // If env isn't set, silently no-op — same pattern as Apple side.
  if (!process.env.GOOGLE_WALLET_ISSUER_ID || !process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_JSON) {
    return { ok: false, error: "google-wallet-not-configured" };
  }

  try {
    const accessToken = await getAccessToken();
    const issuerId = getIssuerId();
    const objectId = `${issuerId}.tribe-${card.id}`;
    const body = buildLoyaltyObject(card);

    const res = await fetch(
      `${WALLET_API_BASE}/loyaltyObject/${encodeURIComponent(objectId)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      // 404 = object hasn't been created yet (user never clicked Save).
      // That's fine — nothing to update.
      if (res.status === 404) return { ok: true, status: 404, note: "not-yet-saved" };
      const text = await res.text().catch(() => "");
      console.error("[googleWallet] update failed:", res.status, text);
      return { ok: false, status: res.status, error: text };
    }
    return { ok: true, status: res.status };
  } catch (err) {
    console.error("[googleWallet] update threw:", err?.message || err);
    return { ok: false, error: String(err?.message || err) };
  }
}
