// Apple Push Notification helper for Wallet pass updates.
// ────────────────────────────────────────────────────────
// When a tribe_card changes server-side (renewal extended its expiry,
// cancel flipped its status, admin revoked it), we need to wake up
// every iPhone that has the pass and tell it to re-fetch.
//
// Apple's flow:
//   1. POST https://api.push.apple.com/3/device/{push_token}
//   2. With TLS client cert auth — same .p12 used to sign the pass.
//   3. apns-topic header = the Pass Type Identifier (pass.is.mama.tribe).
//   4. Body is `{}` — empty payload. The wake-up is the entire signal.
//   5. iOS then calls our web-service GET /v1/passes/{type}/{serial}
//      with If-Modified-Since headers and pulls the updated pass.json.
//
// We do this with Node's built-in `http2` module — no external deps —
// using the cert+key already extracted from the .p12 by applePass.js.
//
// Spec: https://developer.apple.com/documentation/UserNotifications/sending-notification-requests-to-apns
// Pass-update flavor: https://developer.apple.com/documentation/walletpasses/adding_a_web_service_to_update_passes

import http2 from "node:http2";
import forge from "node-forge";
import fs from "node:fs/promises";
import path from "node:path";

// Apple's APNs hosts. Production for both prod and sandbox apps when
// using cert auth — there's no separate sandbox host for Wallet pushes.
const APNS_HOST = "https://api.push.apple.com";

const PROJECT_ROOT = process.cwd();

// Reuse the same cert-extraction logic as applePass.js. Cached so we
// only parse the .p12 once per process.
let certCache = null;

function resolveCertPath(p) {
  if (!p) return null;
  return path.isAbsolute(p) ? p : path.join(PROJECT_ROOT, p);
}

async function loadCertBuffer({ base64Var, pathVar }) {
  const base64 = process.env[base64Var];
  if (base64) return Buffer.from(base64.replace(/\s+/g, ""), "base64");
  const filePath = process.env[pathVar];
  if (filePath) return fs.readFile(resolveCertPath(filePath));
  return null;
}

async function loadSignerCertAndKey() {
  if (certCache) return certCache;

  const p12Buffer = await loadCertBuffer({
    base64Var: "APPLE_PASS_CERT_BASE64",
    pathVar: "APPLE_PASS_CERT_PATH",
  });
  if (!p12Buffer) {
    throw new Error("APNs: pass cert not configured (APPLE_PASS_CERT_BASE64 / APPLE_PASS_CERT_PATH).");
  }

  const password = process.env.APPLE_PASS_CERT_PASSWORD || "";
  const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString("binary"));
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password);

  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
  const certBag = certBags[forge.pki.oids.certBag]?.[0];
  const keyBag =
    p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0] ||
    p12.getBags({ bagType: forge.pki.oids.keyBag })[forge.pki.oids.keyBag]?.[0];

  if (!certBag || !keyBag) {
    throw new Error("APNs: could not extract cert/key from .p12");
  }

  certCache = {
    certPem: forge.pki.certificateToPem(certBag.cert),
    keyPem: forge.pki.privateKeyToPem(keyBag.key),
  };
  return certCache;
}

// Cache the HTTP/2 session — APNs heavily prefers connection reuse.
// We rebuild it on close/error (Apple closes idle sessions after a
// while). Multiplexing many push requests over one session is the
// recommended pattern.
let sessionPromise = null;

async function getSession() {
  if (sessionPromise) {
    const sess = await sessionPromise;
    if (!sess.destroyed && !sess.closed) return sess;
    sessionPromise = null;
  }

  sessionPromise = (async () => {
    const { certPem, keyPem } = await loadSignerCertAndKey();
    const sess = http2.connect(APNS_HOST, {
      cert: certPem,
      key: keyPem,
    });

    sess.on("error", (err) => {
      console.error("[walletApns] session error:", err?.message || err);
      sessionPromise = null;
    });
    sess.on("close", () => {
      sessionPromise = null;
    });

    return sess;
  })();

  return sessionPromise;
}

// Single push to a single device. Returns
//   { ok: true } on 200,
//   { ok: false, status, reason } on any failure.
async function pushOne(pushToken) {
  if (!pushToken) return { ok: false, status: 0, reason: "MissingPushToken" };

  const passTypeId = process.env.APPLE_PASS_TYPE_ID;
  if (!passTypeId) {
    return { ok: false, status: 0, reason: "MissingPassTypeIdentifier" };
  }

  const session = await getSession();

  return new Promise((resolve) => {
    const req = session.request({
      ":method": "POST",
      ":path": `/3/device/${pushToken}`,
      "apns-topic": passTypeId,
      "apns-push-type": "background",
      "content-type": "application/json",
    });

    let respStatus = 0;
    let respBody = "";

    req.on("response", (headers) => {
      respStatus = Number(headers[":status"]) || 0;
    });

    req.setEncoding("utf8");
    req.on("data", (chunk) => (respBody += chunk));

    req.on("end", () => {
      if (respStatus >= 200 && respStatus < 300) {
        resolve({ ok: true, status: respStatus });
      } else {
        let reason = "UnknownReason";
        try {
          const parsed = JSON.parse(respBody);
          if (parsed?.reason) reason = parsed.reason;
        } catch {
          /* not JSON, leave reason as UnknownReason */
        }
        resolve({ ok: false, status: respStatus, reason });
      }
    });

    req.on("error", (err) => {
      resolve({ ok: false, status: 0, reason: err?.message || "RequestError" });
    });

    // Empty body — the push is a wake-up signal, not a content delivery.
    req.end(JSON.stringify({}));
  });
}

/**
 * Fan out a push to every device watching the given pass serial number.
 * Looks up registrations in Supabase, fires concurrently, and reports
 * per-token results. Stale push tokens (Apple returns "BadDeviceToken"
 * or 410 Unregistered) get cleaned out so we don't keep retrying them.
 *
 * Always best-effort — never throws. The DB write is the source of
 * truth; the push is just a wake-up nudge.
 *
 * @param {object} supabase - Supabase admin client
 * @param {string} serialNumber - e.g. "tribe-<uuid>"
 * @returns {Promise<{attempted: number, succeeded: number, removed: number}>}
 */
export async function pushPassUpdate(supabase, serialNumber) {
  const passTypeId = process.env.APPLE_PASS_TYPE_ID;
  if (!passTypeId) {
    console.warn("[walletApns] skipped — APPLE_PASS_TYPE_ID not set");
    return { attempted: 0, succeeded: 0, removed: 0 };
  }

  // Find every device registered for this serial.
  const { data: regs, error } = await supabase
    .from("wallet_pass_registrations")
    .select("device_library_identifier")
    .eq("pass_type_identifier", passTypeId)
    .eq("serial_number", serialNumber);

  if (error) {
    console.error("[walletApns] registration lookup failed:", error.message);
    return { attempted: 0, succeeded: 0, removed: 0 };
  }
  if (!regs?.length) return { attempted: 0, succeeded: 0, removed: 0 };

  // Fetch each device's push token.
  const deviceIds = regs.map((r) => r.device_library_identifier);
  const { data: devices, error: devErr } = await supabase
    .from("wallet_pass_devices")
    .select("device_library_identifier, push_token")
    .in("device_library_identifier", deviceIds);

  if (devErr) {
    console.error("[walletApns] device lookup failed:", devErr.message);
    return { attempted: 0, succeeded: 0, removed: 0 };
  }
  if (!devices?.length) return { attempted: 0, succeeded: 0, removed: 0 };

  // Push concurrently.
  const results = await Promise.all(
    devices.map(async (d) => ({ device: d, result: await pushOne(d.push_token) })),
  );

  let succeeded = 0;
  const stale = [];
  for (const { device, result } of results) {
    if (result.ok) {
      succeeded++;
    } else if (
      result.status === 410 ||
      result.reason === "BadDeviceToken" ||
      result.reason === "Unregistered" ||
      result.reason === "DeviceTokenNotForTopic"
    ) {
      stale.push(device.device_library_identifier);
    } else {
      console.warn(
        `[walletApns] push failed for ${serialNumber}: ${result.status} ${result.reason}`,
      );
    }
  }

  // Clean out devices Apple says are no longer reachable. ON DELETE
  // CASCADE on wallet_pass_registrations clears the registrations too.
  let removed = 0;
  if (stale.length) {
    const { error: delErr } = await supabase
      .from("wallet_pass_devices")
      .delete()
      .in("device_library_identifier", stale);
    if (delErr) {
      console.error("[walletApns] stale device cleanup failed:", delErr.message);
    } else {
      removed = stale.length;
    }
  }

  return { attempted: devices.length, succeeded, removed };
}

/**
 * Convenience wrapper — given a tribe_cards.id, build the serial
 * number and fire the push.
 */
export async function pushTribeCardUpdate(supabase, tribeCardId) {
  if (!tribeCardId) return { attempted: 0, succeeded: 0, removed: 0 };
  return pushPassUpdate(supabase, `tribe-${tribeCardId}`);
}
