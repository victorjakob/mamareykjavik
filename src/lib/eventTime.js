// Single source of truth for event date/time handling.
//
// Rule: every event time in Mama is ICELAND time (Atlantic/Reykjavik), no
// matter where the visitor or the admin happens to be in the world.
//
// Why this file exists: `events.date` used to be a `timestamp without time
// zone`, so Supabase returned strings like "2026-08-20T18:00:00" with no
// offset. Browsers parse that as *local* time, so a visitor in Chicago saw a
// 6pm Reykjavík event as 11pm. The column is now `timestamptz`, and every
// parse/format in the app goes through these helpers so it cannot drift again.

import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export const ICELAND_TZ = "Atlantic/Reykjavik";

const HAS_OFFSET = /(Z|[+-]\d{2}:?\d{2})$/i;

/**
 * Parse anything that represents an event instant into a Date.
 * A string without a timezone offset (legacy Supabase `timestamp` output,
 * or a datetime-local input value) is treated as Iceland wall-clock time,
 * NEVER as the device's local time.
 */
export function parseEventDate(value) {
  if (value == null || value === "") return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === "number") return new Date(value);
  const str = String(value).trim();
  let d;
  if (HAS_OFFSET.test(str)) {
    d = new Date(str);
  } else {
    // "2026-08-20T18:00:00" or "2026-08-20 18:00:00" or "2026-08-20T18:00"
    d = fromZonedTime(str.replace(" ", "T"), ICELAND_TZ);
  }
  return isNaN(d.getTime()) ? null : d;
}

/** Format an event instant in Iceland time with a date-fns pattern. */
export function formatIceland(value, pattern) {
  const d = parseEventDate(value);
  if (!d) return "";
  return formatInTimeZone(d, ICELAND_TZ, pattern);
}

/**
 * Format with Intl options (for the locale-aware places, e.g. Icelandic
 * month names). Always pinned to Iceland time.
 */
export function formatIcelandIntl(value, locale = "en-GB", options = {}) {
  const d = parseEventDate(value);
  if (!d) return "";
  return d.toLocaleString(locale, { ...options, timeZone: ICELAND_TZ });
}

/** Value for an <input type="datetime-local">, expressed in Iceland time. */
export function toIcelandDateTimeLocal(value) {
  const d = parseEventDate(value);
  if (!d) return "";
  return formatInTimeZone(d, ICELAND_TZ, "yyyy-MM-dd'T'HH:mm");
}

/**
 * Read an <input type="datetime-local"> value ("YYYY-MM-DDTHH:mm") as Iceland
 * wall-clock time and return the real instant as an ISO string (UTC).
 * Returns null when invalid.
 */
export function icelandDateTimeLocalToIso(value) {
  if (!value || !String(value).trim()) return null;
  const d = fromZonedTime(String(value).trim(), ICELAND_TZ);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/** Short label appended where the audience may be abroad. */
export const ICELAND_TIME_LABEL = "Iceland time";
