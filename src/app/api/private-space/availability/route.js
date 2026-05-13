// GET /api/private-space/availability
// Two query modes:
//   ?year=2026&month=5     → returns {fullyBooked: ISO[]} for the public calendar
//   ?date=2026-05-12       → returns {busyHours: number[]} for the hour picker
//
// "Busy" = there exists a booking with status in (approved, paid, confirmed)
// or a row in private_space_blocked_dates that overlaps.

import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";

const ACTIVE_STATUSES = ["approved", "paid"];

function startOfDayLocal(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfDayLocal(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

async function getBookingsInRange(supabase, fromIso, toIso) {
  const { data, error } = await supabase
    .from("private_space_bookings")
    .select("start_at, end_at, status")
    .in("status", ACTIVE_STATUSES)
    .gte("start_at", fromIso)
    .lte("end_at", toIso);
  if (error) throw error;
  return data || [];
}

async function getBlocksInRange(supabase, fromIso, toIso) {
  const { data, error } = await supabase
    .from("private_space_blocked_dates")
    .select("start_at, end_at")
    .gte("start_at", fromIso)
    .lte("end_at", toIso);
  if (error) throw error;
  return data || [];
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const year = url.searchParams.get("year");
    const month = url.searchParams.get("month");
    const dateStr = url.searchParams.get("date");

    const supabase = createServerSupabase();

    // Mode B — single day → busy hours
    if (dateStr) {
      const day = new Date(dateStr + "T00:00:00");
      const from = startOfDayLocal(day).toISOString();
      const to = endOfDayLocal(day).toISOString();

      const [bookings, blocks] = await Promise.all([
        getBookingsInRange(supabase, from, to),
        getBlocksInRange(supabase, from, to),
      ]);

      const busy = new Set();
      const markRange = (startAt, endAt) => {
        const s = new Date(startAt);
        const e = new Date(endAt);
        const startHour = Math.max(0, s.getDate() === day.getDate() ? s.getHours() : 0);
        const endHour = Math.min(24, e.getDate() === day.getDate() ? Math.ceil((e - s) > 0 ? e.getHours() + (e.getMinutes() > 0 ? 1 : 0) : 0) : 24);
        for (let h = startHour; h < endHour; h++) busy.add(h);
      };
      bookings.forEach((b) => markRange(b.start_at, b.end_at));
      blocks.forEach((b) => markRange(b.start_at, b.end_at));

      return NextResponse.json({ busyHours: Array.from(busy).sort((a, b) => a - b) });
    }

    // Mode A — month → fully-booked dates
    if (year && month) {
      const y = parseInt(year, 10);
      const m = parseInt(month, 10) - 1;
      const monthStart = new Date(y, m, 1, 0, 0, 0, 0);
      const monthEnd = new Date(y, m + 1, 0, 23, 59, 59, 999);

      const [bookings, blocks] = await Promise.all([
        getBookingsInRange(supabase, monthStart.toISOString(), monthEnd.toISOString()),
        getBlocksInRange(supabase, monthStart.toISOString(), monthEnd.toISOString()),
      ]);

      // For v1: if a date has any booking/block, it's NOT fully booked yet —
      // we only treat a date as "fullyBooked" when ≥10 hours of the operating window are taken.
      const OPERATING_HOURS = 14; // 8am–10pm
      const FULL_THRESHOLD = 10;
      const dayBusyHours = new Map();

      const accumulate = (startAt, endAt) => {
        const s = new Date(startAt);
        const e = new Date(endAt);
        let cursor = new Date(s);
        while (cursor < e) {
          const dayKey = cursor.toISOString().slice(0, 10);
          const prev = dayBusyHours.get(dayKey) || 0;
          const dayEnd = new Date(cursor);
          dayEnd.setHours(23, 59, 59, 999);
          const segEnd = e < dayEnd ? e : dayEnd;
          const hours = (segEnd - cursor) / (1000 * 60 * 60);
          dayBusyHours.set(dayKey, prev + hours);
          cursor = new Date(dayEnd.getTime() + 1);
        }
      };
      bookings.forEach((b) => accumulate(b.start_at, b.end_at));
      blocks.forEach((b) => accumulate(b.start_at, b.end_at));

      const fullyBooked = [];
      for (const [key, hours] of dayBusyHours.entries()) {
        if (hours >= FULL_THRESHOLD) fullyBooked.push(key);
      }
      return NextResponse.json({ fullyBooked, operatingHours: OPERATING_HOURS, fullThreshold: FULL_THRESHOLD });
    }

    return NextResponse.json({ error: "Pass either ?date=YYYY-MM-DD or ?year=YYYY&month=MM" }, { status: 400 });
  } catch (err) {
    console.error("[private-space/availability] error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
