// Single source of truth for restaurant opening hours.
//
// Mama opens at 9:00 daily (breakfast 9:00–11:30, full menu until 22:00).
// Iceland runs on GMT all year, so UTC calendar dates match Reykjavík.

export const BREAKFAST_LAUNCH_ISO = "2026-06-28";

export function breakfastLive() {
  return true;
}

export function opensDisplay() {
  return "9:00";
}

export function opensSchema() {
  return "09:00";
}

export function hoursRange() {
  return "9:00 – 22:00";
}

export function openMinutes() {
  return 9 * 60;
}
