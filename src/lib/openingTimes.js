// Single source of truth for restaurant opening hours.
//
// Mama opens at 9:00 daily (breakfast 9:00–11:30, full menu until 21:00).
// Iceland runs on GMT all year, so UTC calendar dates match Reykjavík.
// Edit OPEN_HOUR / CLOSE_HOUR here and every page + structured data follows.

export const OPEN_HOUR = 9;
export const CLOSE_HOUR = 21;

const pad = (h) => String(h).padStart(2, "0");

export function opensDisplay() {
  return `${OPEN_HOUR}:00`;
}

export function opensSchema() {
  return `${pad(OPEN_HOUR)}:00`;
}

export function closesDisplay() {
  return `${CLOSE_HOUR}:00`;
}

export function closesSchema() {
  return `${pad(CLOSE_HOUR)}:00`;
}

export function hoursRange() {
  return `${opensDisplay()} – ${closesDisplay()}`;
}

export function openMinutes() {
  return OPEN_HOUR * 60;
}
