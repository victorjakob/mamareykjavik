import crypto from "crypto";

const HOST_INVITE_SECRET =
  process.env.HOST_INVITE_SECRET || process.env.NEXTAUTH_SECRET;

function getSecret() {
  if (!HOST_INVITE_SECRET) {
    throw new Error("Missing HOST_INVITE_SECRET or NEXTAUTH_SECRET");
  }
  return HOST_INVITE_SECRET;
}

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(value) {
  const padded = `${value}${"=".repeat((4 - (value.length % 4)) % 4)}`;
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64").toString("utf8");
}

function signHs256(input, secret) {
  return base64UrlEncode(
    crypto.createHmac("sha256", secret).update(input).digest()
  );
}

export function createHostInviteToken({ email, invitedBy }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error("Email is required for a host invite.");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    type: "host-invite",
    email: normalizedEmail,
    invitedBy: invitedBy || null,
    iat: now,
    exp: now + 14 * 24 * 60 * 60,
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  return `${signingInput}.${signHs256(signingInput, getSecret())}`;
}

export function verifyHostInviteToken(token) {
  if (!token) {
    throw new Error("Missing host invite token.");
  }

  const [encodedHeader, encodedPayload, signature] = String(token).split(".");
  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error("Invalid host invite token.");
  }

  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = signHs256(signingInput, getSecret());
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new Error("Invalid host invite token.");
  }

  const header = JSON.parse(base64UrlDecode(encodedHeader));
  if (header?.alg !== "HS256") {
    throw new Error("Invalid host invite token.");
  }

  const decoded = JSON.parse(base64UrlDecode(encodedPayload));
  if (decoded?.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Host invite token has expired.");
  }

  if (!decoded || decoded.type !== "host-invite" || !decoded.email) {
    throw new Error("Invalid host invite token.");
  }

  return {
    email: String(decoded.email).trim().toLowerCase(),
    invitedBy: decoded.invitedBy || null,
    exp: decoded.exp || null,
  };
}
