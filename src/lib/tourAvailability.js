// Single source of truth for tour-session availability.
//
// A booking holds seats when it is PAID, or when it is PENDING and younger
// than PENDING_HOLD_MINUTES (the guest may still be on the payment page).
// Older pending bookings are abandoned card sessions and release their seats.
//
// Used by: /tours listing, /tours/[slug]/booking, /api/tours (booking
// creation) and the admin tour dashboard. Keep all seat math here — never
// re-implement it inline (see repo rule: one source of truth for copy/logic).

export const PENDING_HOLD_MINUTES = 30;

/**
 * Number of tickets currently holding seats in a list of bookings.
 * Bookings need: number_of_tickets, payment_status, created_at.
 */
export function ticketsHeld(bookings = [], now = Date.now()) {
  const holdCutoff = now - PENDING_HOLD_MINUTES * 60 * 1000;
  return bookings.reduce((acc, b) => {
    if (!b) return acc;
    const tickets = b.number_of_tickets || 0;
    if (b.payment_status === "paid") return acc + tickets;
    if (
      b.payment_status === "pending" &&
      b.created_at &&
      new Date(b.created_at).getTime() > holdCutoff
    ) {
      return acc + tickets;
    }
    return acc;
  }, 0);
}

/**
 * Seats still available on a session row that includes its tour_bookings.
 */
export function spotsLeft(session, now = Date.now()) {
  if (!session) return 0;
  const held = ticketsHeld(session.tour_bookings, now);
  return Math.max(0, (session.available_spots || 0) - held);
}

/** Supabase select fragment for sessions incl. what the seat math needs. */
export const SESSION_WITH_BOOKINGS_SELECT = `
  id,
  tour_id,
  start_time,
  available_spots,
  tour_bookings (
    number_of_tickets,
    payment_status,
    created_at
  )
`;
