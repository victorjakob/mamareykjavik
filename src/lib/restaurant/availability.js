/**
 * Whether the restaurant can seat a party at a given time.
 *
 * Mama's capacity is its tables, not a covers-per-slot number, so this works
 * the answer out from the room. But a booking does not hold a table: the floor
 * staff decide where people sit when they arrive (Victor, 15 Nov). So the
 * question asked here is the till's question, in the till's words — could the
 * room seat everyone booked across this time, and this party as well. It is
 * answered from party sizes; `table_ids` is not read at all, and is only ever
 * filled in by the till when a party is actually seated.
 *
 * This replaced a version that counted the tables each booking held. Once the
 * till stopped giving bookings tables, that version could not see a booking
 * taken at the till, nor the ones imported from Dineout, and would have sold
 * the same seats again. Both ends must ask the same question or one of them
 * overbooks the other; the rules below are `lib/availability.ts` in the POS
 * repo, ported line for line, and must change together with it.
 *
 * `floorplan.json` is generated from the till's own floor plan — see
 * `tools/export-floorplan.mjs` in the POS repo — so the two cannot disagree
 * about how many people fit in the restaurant. Do not edit it by hand.
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

/** The parties booked across [start, end), as sizes. Who sits where is not known. */
export function partiesDuring(bookings, date, start, end) {
  const parties = [];
  for (const b of bookings) {
    if (b.booking_date !== date) continue;
    if (["cancelled", "no_show"].includes(b.status)) continue;
    const from = minutesOf(String(b.booking_time).slice(0, 5));
    const to = from + (b.duration_minutes ?? 90);
    if (from < end && to > start) parties.push(b.party);
  }
  return parties;
}

/**
 * Whether the room could seat all of these parties at once.
 *
 * Nothing is assigned: the parties are fitted onto the room only to find out
 * whether they fit at all, and the arrangement is thrown away. It has to be
 * done on tables rather than a seat count, because four parties of two are not
 * one party of eight.
 *
 * Biggest party first onto the smallest seating that takes it. That can refuse
 * an arrangement a cleverer search would find, which is the right way to be
 * wrong: it under-books rather than over-books.
 */
export function roomFits(parties) {
  const taken = new Set();
  const options = seatingOptions();
  for (const party of [...parties].sort((a, b) => b - a)) {
    const option = options
      .filter((o) => o.seats >= party && o.tableIds.every((id) => !taken.has(id)))
      .sort((a, b) => a.seats - b.seats || a.tableIds.length - b.tableIds.length)[0];

    if (option) {
      option.tableIds.forEach((id) => taken.add(id));
      continue;
    }

    // Nothing single takes them, so join whole free tables until they fit.
    // One-seat halves are left out: seating somebody alone at half a table to
    // make the arithmetic work is not seating them.
    let seats = 0;
    const joined = [];
    for (const o of options
      .filter((o) => o.seats > 1 && o.tableIds.every((id) => !taken.has(id)))
      .sort((a, b) => b.seats - a.seats)) {
      if (o.tableIds.some((id) => joined.includes(id))) continue;
      joined.push(...o.tableIds);
      seats += o.seats;
      if (seats >= party) break;
    }
    if (seats < party) return false;
    joined.forEach((id) => taken.add(id));
  }
  return true;
}

/**
 * Whether the room takes this party at this time, on top of everyone booked.
 *
 * `bookings` must not include the booking being moved, or it blocks itself.
 */
export function roomTakes(bookings, settings, date, time, party, duration) {
  const start = minutesOf(time);
  const end = start + (duration ?? settings.default_duration_minutes);
  return roomFits([...partiesDuring(bookings, date, start, end), party]);
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
  const slots = [];

  for (let m = open; m <= last; m += settings.slot_minutes) {
    slots.push({
      time: hhmm(m),
      free: roomTakes(bookings, settings, date, hhmm(m), party),
    });
  }
  return slots;
}
