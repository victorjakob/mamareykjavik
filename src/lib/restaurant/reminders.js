/**
 * When a booking's reminder is due, and whether it is worth sending at all.
 *
 * Kept apart from the cron route so the arithmetic can be read and tested on
 * its own. Everything here is pure: a row, a number of hours and a clock go
 * in, one of four words comes out.
 *
 *   "send"       — due now, and still useful.
 *   "early"      — not yet. Leave it; the next pass will look again.
 *   "late-booking" — booked inside its own reminder window, so the
 *                  confirmation is barely cold. Nothing to remind them of.
 *   "past"       — the table has already come and gone.
 *
 * Both "late-booking" and "past" get stamped as sent by the caller, because
 * they will never become due: leaving them would mean reconsidering the same
 * rows every hour forever.
 */

const HOUR = 60 * 60 * 1000;

/**
 * The instant a booking starts.
 *
 * The row keeps its date and its time apart from any timezone, which is what
 * makes 19:00 mean 19:00 whatever the server thinks. Iceland is UTC the whole
 * year round — no daylight saving — so reading the pair back as UTC is exact
 * here, and would not be anywhere else.
 */
export const bookingStart = (row) =>
  new Date(`${row.booking_date}T${String(row.booking_time).slice(0, 5)}:00Z`);

/**
 * @param {object} row   booking_date, booking_time, created_at
 * @param {number} hours booking_settings.reminder_hours_before
 * @param {number} now   milliseconds
 * @returns {"send"|"early"|"late-booking"|"past"}
 */
export function reminderDue(row, hours, now = Date.now()) {
  const start = bookingStart(row).getTime();
  if (!Number.isFinite(start)) return "past"; // Unreadable date: never chase it.
  if (start <= now) return "past";

  const dueAt = start - hours * HOUR;
  if (now < dueAt) return "early";
  if (new Date(row.created_at).getTime() >= dueAt) return "late-booking";
  return "send";
}

/**
 * Whether the table is today, tomorrow, or further off.
 *
 * The reminder reads "Tomorrow, Anna." which is true at the default 24 hours
 * and a lie at any other setting — and the setting is a column Victor can
 * change. So the wording follows the calendar rather than assuming it.
 *
 * Iceland is UTC year-round, so a UTC day boundary is the real one here.
 *
 * @returns {"today"|"tomorrow"|"later"}
 */
export function dayLabel(row, now = Date.now()) {
  const startOfDay = (ms) => {
    const d = new Date(ms);
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  };
  const days = Math.round(
    (startOfDay(bookingStart(row).getTime()) - startOfDay(now)) / 86400000,
  );
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  return "later";
}
