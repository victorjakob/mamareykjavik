/**
 * Whether the restaurant can seat a party at a given time.
 *
 * Mama's capacity is its tables, not a covers-per-slot number, so this works
 * the answer out from the room: which tables are already held by a booking
 * that overlaps, what is left, and whether what is left can seat the party.
 *
 * `floorplan.json` is generated from the till's own floor plan — see
 * `tools/export-floorplan.mjs` in the POS repo — so the two cannot disagree
 * about how many people fit in the restaurant. Do not edit it by hand. The
 * rules below are ported once; they are short and they do not change.
 */
import plan from "./floorplan.json";

/** Only real tables take bookings. No-table and takeaway slots are not seats. */
const BOOKABLE = plan.tables.filter((t) => t.kind === "table");
const byId = new Map(plan.tables.map((t) => [t.id, t]));

export const TOTAL_SEATS = plan.totalSeats;

export const minutesOf = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const hhmm = (minutes) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

/**
 * Every way the room can seat a party, as a set of tables with a capacity.
 *
 * A joined pair is not the sum of its halves. Tables 1 and 5 seat five
 * together but only one a side when split, so the pair carries its own number
 * and a half that seats one is never offered to a group — putting one person
 * alone at half a table to make the arithmetic work is not seating them.
 */
export function seatingOptions() {
  const options = [];
  const paired = new Set(plan.pairs.flatMap((p) => p.tableIds));

  for (const t of BOOKABLE) {
    if (paired.has(t.id)) continue;
    options.push({ tableIds: [t.id], seats: t.seats });
  }
  for (const p of plan.pairs) {
    options.push({ tableIds: [...p.tableIds], seats: p.seats });
    for (const id of p.tableIds) {
      const half = byId.get(id);
      if (half) options.push({ tableIds: [id], seats: half.seats });
    }
  }
  return options;
}

/** Tables held by a booking that overlaps [start, end). */
export function heldTables(bookings, date, start, end) {
  const held = new Set();
  for (const b of bookings) {
    if (b.booking_date !== date) continue;
    if (["cancelled", "no_show"].includes(b.status)) continue;
    const from = minutesOf(String(b.booking_time).slice(0, 5));
    const to = from + (b.duration_minutes ?? 90);
    if (from < end && to > start) for (const id of b.table_ids ?? []) held.add(id);
  }
  return held;
}

const freeSeatings = (held) =>
  seatingOptions().filter((o) => o.tableIds.every((id) => !held.has(id)));

/**
 * The smallest seating that finishes the job, and never a one-seat half for a
 * group. Combining is allowed and deliberately unclever: keep adding whole
 * free tables until the party fits. Nobody is trying to optimise the room from
 * a web form.
 */
export function pickSeating(free, party) {
  const single = free
    .filter((o) => o.seats >= party)
    .sort((a, b) => a.seats - b.seats || a.tableIds.length - b.tableIds.length)[0];
  if (single) return single;

  const usable = free
    .filter((o) => o.seats > 1)
    .sort((a, b) => b.seats - a.seats);
  const taken = new Set();
  const chosen = [];
  let seats = 0;
  for (const o of usable) {
    if (o.tableIds.some((id) => taken.has(id))) continue;
    chosen.push(...o.tableIds);
    o.tableIds.forEach((id) => taken.add(id));
    seats += o.seats;
    if (seats >= party) return { tableIds: chosen, seats };
  }
  return null;
}

/** How many the room could still seat, were everyone to arrive at once. */
export function capacityOf(held) {
  const taken = new Set(held);
  let seats = 0;
  for (const o of seatingOptions().sort((a, b) => b.seats - a.seats)) {
    if (o.tableIds.some((id) => taken.has(id))) continue;
    o.tableIds.forEach((id) => taken.add(id));
    seats += o.seats;
  }
  return seats;
}

/**
 * The bookable slots for a day, each saying whether this party fits.
 *
 * The last slot is `lastBookingBeforeClose` minutes before closing, because a
 * booking that starts ten minutes before the door shuts is not a booking.
 */
export function availability(bookings, settings, date, party) {
  const open = minutesOf(String(settings.open_from).slice(0, 5));
  const close = minutesOf(String(settings.open_to).slice(0, 5));
  const last = close - settings.last_booking_before_close;
  const duration = settings.default_duration_minutes;
  const slots = [];

  for (let m = open; m <= last; m += settings.slot_minutes) {
    const held = heldTables(bookings, date, m, m + duration);
    const seating = pickSeating(freeSeatings(held), party);
    slots.push({
      time: hhmm(m),
      free: Boolean(seating),
      seatsLeft: capacityOf(held),
      tableIds: seating?.tableIds ?? [],
    });
  }
  return slots;
}

/** What the till would put this party on, if anything. */
export function assignTables(bookings, settings, date, time, party, duration) {
  const start = minutesOf(time);
  const held = heldTables(bookings, date, start, start + (duration ?? settings.default_duration_minutes));
  return pickSeating(freeSeatings(held), party);
}
