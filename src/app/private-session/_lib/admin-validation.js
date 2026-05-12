// Shared validation + helpers for the admin API routes.
// Kept in the feature folder so no logic leaks into a shared util.

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(s) {
  return typeof s === "string" && SLUG_RE.test(s) && s.length >= 2 && s.length <= 80;
}

export function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['"`’ʼ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function makeReferenceId(prefix = "PSESS") {
  const ts = Math.floor(Date.now() / 1000).toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

export function pickString(v, max = 500) {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  return s.slice(0, max);
}

export function pickPositiveInt(v, def = null) {
  if (v == null || v === "") return def;
  const n = Number.parseInt(v, 10);
  if (Number.isNaN(n) || n < 0) return def;
  return n;
}

export function pickBool(v) {
  if (typeof v === "boolean") return v;
  if (v === "true" || v === "1" || v === 1) return true;
  if (v === "false" || v === "0" || v === 0) return false;
  return null;
}

// Weekday: 0=Mon..6=Sun (matches BookingPage convention).
export function jsWeekdayFrom(monday0) {
  // Convert Mon=0..Sun=6 to JS getDay() (Sun=0..Sat=6).
  return (monday0 + 1) % 7;
}
