// Single source of truth for the breakfast launch.
//
// Opening hours flip themselves on launch day: 11:30 before, 9:00 from then on.
// Deploy once — no manual change needed on the 28th.
//
// Iceland runs on GMT all year, so the UTC calendar date equals the Reykjavík
// date. Comparing the UTC date string makes server render and client hydration
// agree (both use UTC), avoiding hydration mismatches. Every route is rendered
// per-request (the root layout reads headers()), so this re-evaluates live.

export const BREAKFAST_LAUNCH_ISO = "2026-06-28";

export function breakfastLive(now = new Date()) {
  return now.toISOString().slice(0, 10) >= BREAKFAST_LAUNCH_ISO;
}

// Display open time (no leading zero) — for human-facing copy.
export function opensDisplay(now = new Date()) {
  return breakfastLive(now) ? "9:00" : "11:30";
}

// Schema open time (HH:MM) — for JSON-LD openingHours.
export function opensSchema(now = new Date()) {
  return breakfastLive(now) ? "09:00" : "11:30";
}

// Full display range, close stays 21:00.
export function hoursRange(now = new Date()) {
  return `${opensDisplay(now)} – 21:00`;
}

// Minutes-since-midnight of the open time — for the live "open now" widget.
export function openMinutes(now = new Date()) {
  return breakfastLive(now) ? 9 * 60 : 11 * 60 + 30;
}
