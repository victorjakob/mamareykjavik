import jwt from "jsonwebtoken";

const HOST_INVITE_SECRET =
  process.env.HOST_INVITE_SECRET || process.env.NEXTAUTH_SECRET;

function getSecret() {
  if (!HOST_INVITE_SECRET) {
    throw new Error("Missing HOST_INVITE_SECRET or NEXTAUTH_SECRET");
  }
  return HOST_INVITE_SECRET;
}

export function createHostInviteToken({ email, invitedBy }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error("Email is required for a host invite.");
  }

  return jwt.sign(
    {
      type: "host-invite",
      email: normalizedEmail,
      invitedBy: invitedBy || null,
    },
    getSecret(),
    { expiresIn: "14d" }
  );
}

export function verifyHostInviteToken(token) {
  if (!token) {
    throw new Error("Missing host invite token.");
  }

  const decoded = jwt.verify(token, getSecret());

  if (!decoded || decoded.type !== "host-invite" || !decoded.email) {
    throw new Error("Invalid host invite token.");
  }

  return {
    email: String(decoded.email).trim().toLowerCase(),
    invitedBy: decoded.invitedBy || null,
    exp: decoded.exp || null,
  };
}
