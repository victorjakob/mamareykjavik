// communityLink — tiny shared helpers for the per-event community link
// (WhatsApp / Telegram / Facebook group…). Used by the public event and
// series pages, the create/edit event forms, and the ticket confirmation
// email templates. Pure functions, safe on server and client.

const PLATFORMS = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    match: ["chat.whatsapp.com", "whatsapp.com", "wa.me"],
  },
  {
    id: "telegram",
    name: "Telegram",
    match: ["t.me", "telegram.me", "telegram.org"],
  },
  {
    id: "facebook",
    name: "Facebook",
    match: ["facebook.com", "fb.com", "fb.me", "m.me"],
  },
  {
    id: "discord",
    name: "Discord",
    match: ["discord.gg", "discord.com"],
  },
  {
    id: "instagram",
    name: "Instagram",
    match: ["instagram.com", "ig.me"],
  },
];

/**
 * Detect which platform a community link points at.
 * Returns { id, name } or null when the url is empty.
 * Unknown hosts return { id: "link", name: null }.
 */
export function detectCommunityPlatform(url) {
  const u = String(url || "")
    .trim()
    .toLowerCase();
  if (!u) return null;
  for (const platform of PLATFORMS) {
    if (platform.match.some((host) => u.includes(host))) {
      return { id: platform.id, name: platform.name };
    }
  }
  return { id: "link", name: null };
}

/**
 * Call-to-action text for a community link button,
 * e.g. "Join on WhatsApp" / "Join the community".
 */
export function communityJoinCta(url) {
  const platform = detectCommunityPlatform(url);
  if (platform && platform.name) return `Join on ${platform.name}`;
  return "Join the community";
}
