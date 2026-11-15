/**
 * Whether mama.is is taking table bookings yet.
 *
 * Off until cut-over. The booking page is built and reachable by anyone who
 * knows the URL — unlinked and noindex is not the same as closed — and a
 * booking taken before the restaurant is running on the new till would sit in
 * a table nobody is watching while Dineout, which staff are watching, knows
 * nothing about it.
 *
 * One variable turns it on, and the same variable is what gets flipped on
 * cut-over morning alongside pointing /restaurant/book-table here.
 *
 *   RESTAURANT_BOOKING_OPEN=true
 */
export const bookingOpen = () =>
  String(process.env.RESTAURANT_BOOKING_OPEN ?? "").toLowerCase() === "true";

/** Where a guest goes meanwhile. */
export const DINEOUT_URL = "https://www.dineout.is/mamareykjavik?isolation=true";
