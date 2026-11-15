// Single source of truth for restaurant opening hours.
//
// Mama opens at 11:00 daily. Breakfast is no longer served. Full menu until 21:00.
// Iceland runs on GMT all year, so UTC calendar dates match Reykjavík.
// Edit OPEN_HOUR / CLOSE_HOUR here and every page + structured data follows.

export const OPEN_HOUR = 11;
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
