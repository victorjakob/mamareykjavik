// Apple Wallet pass generator for Mama Tribe Cards.
// ────────────────────────────────────────────────────
// Builds a signed .pkpass buffer for a tribe_cards row. The buffer is
// attached to the welcome email so iOS users see "Add to Wallet" right
// inside the email.
//
// Visual style: a bright, porcelain-warm VIP counter card. The pass is
// intentionally simple: brand, discount, cardholder, expiry, and clear
// counter-use copy.
//
// Pass type is "storeCard" — Apple's recommended style for loyalty /
// discount membership cards.
//
// Required env vars:
//   APPLE_PASS_TYPE_ID         e.g. "pass.is.mama.tribe"
//   APPLE_TEAM_ID              10-char Apple Developer team ID
//   APPLE_PASS_CERT_PASSWORD   password protecting the .p12
//
// Cert source — exactly ONE of each pair must be set:
//   APPLE_PASS_CERT_BASE64     base64-encoded .p12 (recommended for prod)
//   APPLE_PASS_CERT_PATH       path to .p12 file    (recommended for local dev)
//
//   APPLE_WWDR_CERT_BASE64     base64-encoded AppleWWDRCAG3.cer (prod)
//   APPLE_WWDR_CERT_PATH       path to AppleWWDRCAG3.cer        (local dev)
//
// Optional env var:
//   NEXT_PUBLIC_SITE_URL       used for "view online" link on the back
//                              of the pass. Defaults to https://mama.is

import { PKPass } from "passkit-generator";
import forge from "node-forge";
import fs from "node:fs/promises";
import path from "node:path";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mama.is";
const PROJECT_ROOT = process.cwd();

// ─── helpers ───────────────────────────────────────────────────────────────

function resolveCertPath(p) {
  if (!p) return null;
  return path.isAbsolute(p) ? p : path.join(PROJECT_ROOT, p);
}

// Convert a DER-encoded .cer (what Apple ships) into a PEM string that
// passkit-generator can ingest.
function derToPem(buffer, label) {
  const base64 = buffer.toString("base64");
  const lines = base64.match(/.{1,64}/g).join("\n");
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----\n`;
}

// Extract the signer cert (PEM) and private key (PEM) from a .p12 buffer
// using node-forge. The same .p12 contains both — protected by the
// password the user set during Keychain export.
function extractCertAndKeyFromP12(p12Buffer, password) {
  const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString("binary"));
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password || "");

  // Find the certificate bag
  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
  const certBag = certBags[forge.pki.oids.certBag]?.[0];
  if (!certBag) throw new Error("No certificate found in .p12 file");

  // Find the private key bag (PKCS#8 first, then plain key)
  let keyBag =
    p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0] ||
    p12.getBags({ bagType: forge.pki.oids.keyBag })[forge.pki.oids.keyBag]?.[0];
  if (!keyBag) throw new Error("No private key found in .p12 file");

  const certPem = forge.pki.certificateToPem(certBag.cert);
  const keyPem = forge.pki.privateKeyToPem(keyBag.key);
  return { certPem, keyPem };
}

// Read wallet-pass image files from /public/wallet-pass.
//
// Do not include strip images. Without a strip, Apple Wallet renders the pass
// as a brighter membership card instead of a photo-backed promo card.
async function loadPassImages() {
  const dir = path.join(PROJECT_ROOT, "public", "wallet-pass");
  const files = [
    "icon.png", "icon@2x.png", "icon@3x.png",
    "logo.png", "logo@2x.png", "logo@3x.png",
  ];
  const buffers = {};
  for (const file of files) {
    buffers[file] = await fs.readFile(path.join(dir, file));
  }
  return buffers;
}

// "27 April 2026" or "No expiration"
function formatExpiry(d) {
  if (!d) return "No expiration";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// W3C date-time (ISO) for Apple's expirationDate field.
// For unlimited cards, push out 10 years so the pass never auto-greys.
function expirationDateForPass(card) {
  if (card.expires_at) return new Date(card.expires_at).toISOString();
  const farFuture = new Date();
  farFuture.setFullYear(farFuture.getFullYear() + 10);
  return farFuture.toISOString();
}

// ─── module-level cert cache ───────────────────────────────────────────────
//
// Reading + parsing the .p12 is moderately expensive (~50ms). We do it
// once per process and cache the PEM strings. Next.js dev mode reloads
// the module on edits, so this also re-reads on hot reload.

let certCache = null;

// Read a cert from either a base64 env var (preferred for serverless) or
// a file path (preferred for local dev). Returns a Buffer either way.
async function loadCertBuffer({ base64Var, pathVar, label }) {
  const base64 = process.env[base64Var];
  if (base64) {
    // Strip whitespace; Vercel's env var UI sometimes pastes with trailing
    // newlines that break Buffer.from base64 decoding.
    return Buffer.from(base64.replace(/\s+/g, ""), "base64");
  }
  const filePath = process.env[pathVar];
  if (filePath) {
    return fs.readFile(resolveCertPath(filePath));
  }
  throw new Error(
    `Apple Wallet ${label} cert not configured. Set ${base64Var} (production) or ${pathVar} (local dev).`,
  );
}

async function loadCerts() {
  if (certCache) return certCache;

  const [p12Buffer, wwdrBuffer] = await Promise.all([
    loadCertBuffer({
      base64Var: "APPLE_PASS_CERT_BASE64",
      pathVar: "APPLE_PASS_CERT_PATH",
      label: "signer",
    }),
    loadCertBuffer({
      base64Var: "APPLE_WWDR_CERT_BASE64",
      pathVar: "APPLE_WWDR_CERT_PATH",
      label: "WWDR",
    }),
  ]);

  // .p12 → cert + key (PEM)
  const { certPem, keyPem } = extractCertAndKeyFromP12(
    p12Buffer,
    process.env.APPLE_PASS_CERT_PASSWORD,
  );

  // .cer (DER) → PEM. Some Apple cer files are already PEM; detect that.
  const wwdrPem = wwdrBuffer.toString("utf-8").includes("-----BEGIN")
    ? wwdrBuffer.toString("utf-8")
    : derToPem(wwdrBuffer, "CERTIFICATE");

  certCache = { certPem, keyPem, wwdrPem };
  return certCache;
}

// ─── main API ──────────────────────────────────────────────────────────────

/**
 * Generate a signed .pkpass buffer for a tribe card.
 *
 * @param {Object} card - row from the tribe_cards table.
 *   Required: id, holder_name, holder_email, discount_percent, access_token, status
 *   Optional: expires_at, duration_type
 * @returns {Promise<Buffer>} the binary .pkpass file
 */
export async function generateTribePass(card) {
  const { APPLE_PASS_TYPE_ID, APPLE_TEAM_ID } = process.env;
  if (!APPLE_PASS_TYPE_ID || !APPLE_TEAM_ID) {
    throw new Error("Set APPLE_PASS_TYPE_ID and APPLE_TEAM_ID env vars.");
  }

  const { certPem, keyPem, wwdrPem } = await loadCerts();
  const images = await loadPassImages();

  const passData = {
    formatVersion: 1,
    passTypeIdentifier: APPLE_PASS_TYPE_ID,
    teamIdentifier: APPLE_TEAM_ID,
    organizationName: "Mama Reykjavík",
    description: `Mama Tribe Card — ${card.discount_percent}% off`,
    serialNumber: `tribe-${card.id}`, // deterministic, lets us update later

    // Porcelain-warm VIP palette. Apple Wallet applies these colors globally
    // to all visible fields, so keep contrast high and labels calm.
    backgroundColor: "rgb(255, 247, 236)",
    foregroundColor: "rgb(46, 30, 22)",
    labelColor: "rgb(127, 94, 69)",

    // No logoText — the colored wreath logo on the left already says "Mama".

    storeCard: {
      // Bright VIP counter-card layout:
      //   1. Header      → Mama logo + "Mama Reykjavík".
      //   2. Primary     → large discount as the visual centerpiece.
      //   3. Secondary   → cardholder + expiry for staff verification.
      //   4. Auxiliary   → simple counter-use instruction and brand line.
      //   5. Back fields → longer usage copy, link, support, and terms.
      headerFields: [
        {
          key: "brand",
          label: "",
          value: "Mama Reykjavík",
        },
      ],
      primaryFields: [
        {
          key: "discount",
          label: "Mama VIP",
          value: `${card.discount_percent}%`,
        },
      ],
      secondaryFields: [
        {
          key: "holder",
          label: "Cardholder",
          value: card.holder_name,
        },
        {
          key: "expiry",
          label: "Valid until",
          value: formatExpiry(card.expires_at),
          textAlignment: "PKTextAlignmentRight",
        },
      ],
      auxiliaryFields: [
        {
          key: "counter_note",
          label: "",
          value: "Show this card at the counter before paying.",
          textAlignment: "PKTextAlignmentCenter",
        },
        {
          key: "tagline",
          label: "",
          value: "Plant-based · Reykjavík · Made with love",
          textAlignment: "PKTextAlignmentCenter",
        },
      ],
      backFields: [
        {
          key: "how",
          label: "How to use your card",
          value:
            "Show this pass at Mama Reykjavík when you order. Your discount is applied at the till. Card is personal to the named member.",
        },
        {
          key: "view",
          label: "View your card online",
          value: `${SITE_URL}/tribe-card/${card.access_token}`,
        },
        {
          key: "support",
          label: "Questions?",
          value: "Email team@mama.is and we'll sort it out.",
        },
        {
          key: "terms",
          label: "Terms",
          value:
            "Discount applies to food and drinks at Mama Reykjavík. Not transferable. Mama may revoke the card if misused.",
        },
      ],
    },

    // Apple greys out / hides the pass once expirationDate passes — this
    // is exactly the auto-expiry behaviour the user asked for.
    expirationDate: expirationDateForPass(card),

    // If the card was already revoked or expired in our DB, mark it
    // voided so the wallet shows it as inactive immediately.
    voided: card.status === "revoked" || card.status === "expired",

    // Pass auto-update web service. Tells iOS where to phone home for
    // updates when our APNs ping wakes it up. The authenticationToken
    // is the per-card secret stored on tribe_cards.authentication_token —
    // Apple echoes it back via Authorization header on every request,
    // so we can confirm the device is allowed to read this pass.
    //
    // Both fields must be present together for iOS to register the
    // pass for updates. If either is missing, the pass is "static"
    // (works fine, just doesn't auto-refresh).
    ...(card.authentication_token
      ? {
          webServiceURL: `${SITE_URL}/api/wallet`,
          authenticationToken: card.authentication_token,
        }
      : {}),
  };

  const pass = new PKPass(
    {
      "pass.json": Buffer.from(JSON.stringify(passData)),
      ...images,
    },
    {
      signerCert: certPem,
      signerKey: keyPem,
      wwdr: wwdrPem,
      // signerKeyPassphrase intentionally omitted — node-forge already
      // decrypted the key during P12 extraction.
    },
  );

  return pass.getAsBuffer();
}
