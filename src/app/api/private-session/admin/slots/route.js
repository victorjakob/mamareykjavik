// POST /api/private-session/admin/slots
//
// Two shapes:
//   1) { practitioner_id, starts_at, ends_at?, capacity?, offering_ids?,
//        published_area?, actual_location? }
//      → create a single slot. If ends_at is omitted, it auto-derives to
//        starts_at + max(linked offering duration). Capacity defaults to 1.
//   2) { practitioner_id, mode: "bulk", weekdays: number[], times: string[],
//        range_start, range_end, capacity?, offering_ids?,
//        published_area?, actual_location? }
//      → create slots on every chosen weekday/time inside the date range.
//        ends_at on each slot is auto-derived from the longest linked
//        offering — there's no "slot duration" because session length is a
//        property of the offering, not the time window.
//        weekdays: array of 0..6 with Monday=0..Sunday=6.
//        times: "HH:MM" strings.
//
// offering_ids defaults to every active offering of the practitioner.

import { NextResponse } from "next/server";
import { requireAdminAndSupabase } from "../_lib/auth";
import {
  pickString,
  pickPositiveInt,
  jsWeekdayFrom,
} from "@/app/private-session/_lib/admin-validation";

async function resolveOfferingIds(supabase, practitionerId, explicit) {
  if (Array.isArray(explicit) && explicit.length > 0) {
    return explicit.filter((x) => typeof x === "string");
  }
  const { data } = await supabase
    .from("private_session_offerings")
    .select("id")
    .eq("practitioner_id", practitionerId)
    .eq("is_active", true);
  return (data || []).map((o) => o.id);
}

// Fetch durations for the chosen offerings + return the longest one (in min).
// Defaults to 60 if nothing comes back, so we never end up with ends_at == starts_at.
async function maxOfferingDuration(supabase, offeringIds) {
  if (offeringIds.length === 0) return 60;
  const { data } = await supabase
    .from("private_session_offerings")
    .select("duration_minutes")
    .in("id", offeringIds);
  const durations = (data || []).map((o) => o.duration_minutes).filter(Boolean);
  if (durations.length === 0) return 60;
  return Math.max(...durations);
}

async function linkSlotOfferings(supabase, slotIds, offeringIds) {
  if (slotIds.length === 0 || offeringIds.length === 0) return;
  const rows = [];
  for (const slotId of slotIds) {
    for (const offeringId of offeringIds) {
      rows.push({ slot_id: slotId, offering_id: offeringId });
    }
  }
  const { error } = await supabase.from("private_session_slot_offerings").insert(rows);
  if (error) {
    console.error("[admin] link slot offerings failed", error);
    throw error;
  }
}

function buildBulkStarts({ rangeStart, rangeEnd, weekdays, times }) {
  // weekdays come in as Monday=0..Sunday=6; convert to JS getDay() Sun=0..Sat=6.
  const wantedJsDays = new Set(weekdays.map(jsWeekdayFrom));
  const starts = [];
  const cursor = new Date(rangeStart);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(rangeEnd);
  end.setHours(23, 59, 59, 999);

  while (cursor <= end) {
    if (wantedJsDays.has(cursor.getDay())) {
      for (const t of times) {
        const [hh, mm] = String(t).split(":").map((x) => Number.parseInt(x, 10));
        if (Number.isFinite(hh)) {
          const d = new Date(cursor);
          d.setHours(hh, Number.isFinite(mm) ? mm : 0, 0, 0);
          starts.push(d);
        }
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return starts;
}

export async function POST(request) {
  const gate = await requireAdminAndSupabase();
  if (!gate.ok) return gate.res;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const practitionerId = pickString(body.practitioner_id, 60);
  if (!practitionerId) {
    return NextResponse.json({ error: "practitioner_id_required" }, { status: 400 });
  }
  const offeringIds = await resolveOfferingIds(gate.supabase, practitionerId, body.offering_ids);
  if (offeringIds.length === 0) {
    return NextResponse.json({ error: "no_offerings_yet" }, { status: 400 });
  }

  const publishedArea = pickString(body.published_area, 200);
  const actualLocation = pickString(body.actual_location, 600);
  const capacity = Math.max(1, pickPositiveInt(body.capacity, 1) || 1);

  // ── Bulk-add ──────────────────────────────────────────────────────────────
  if (body.mode === "bulk") {
    const weekdays = Array.isArray(body.weekdays)
      ? body.weekdays
          .map((x) => pickPositiveInt(x, null))
          .filter((x) => x !== null && x >= 0 && x <= 6)
      : [];
    const times = Array.isArray(body.times)
      ? body.times.map((t) => String(t).slice(0, 5))
      : [];
    const rangeStart = pickString(body.range_start, 20);
    const rangeEnd = pickString(body.range_end, 20);
    if (!rangeStart || !rangeEnd || weekdays.length === 0 || times.length === 0) {
      return NextResponse.json({ error: "missing_bulk_fields" }, { status: 400 });
    }

    const startDates = buildBulkStarts({
      rangeStart,
      rangeEnd,
      weekdays,
      times,
    });
    if (startDates.length === 0) {
      return NextResponse.json({ ok: true, created: 0 });
    }

    // ends_at is derived from the longest linked offering — there is no
    // "slot duration" input; the session length is a property of the
    // offering chosen at booking time.
    const longestMin = await maxOfferingDuration(gate.supabase, offeringIds);

    const rows = startDates.map((d) => ({
      practitioner_id: practitionerId,
      starts_at: d.toISOString(),
      ends_at: new Date(d.getTime() + longestMin * 60_000).toISOString(),
      status: "available",
      published_area: publishedArea,
      actual_location: actualLocation,
      capacity,
    }));

    const { data, error } = await gate.supabase
      .from("private_session_slots")
      .insert(rows)
      .select("id");
    if (error) {
      console.error("[admin] bulk slots failed", error);
      return NextResponse.json({ error: "bulk_failed" }, { status: 500 });
    }
    try {
      await linkSlotOfferings(gate.supabase, (data || []).map((r) => r.id), offeringIds);
    } catch {
      return NextResponse.json({ error: "link_failed" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, created: data?.length || 0 });
  }

  // ── Single slot ───────────────────────────────────────────────────────────
  const startsAt = pickString(body.starts_at, 40);
  let endsAt = pickString(body.ends_at, 40);
  if (!startsAt) {
    return NextResponse.json({ error: "starts_required" }, { status: 400 });
  }
  // Auto-derive ends_at when the form skipped it, matching the bulk path.
  if (!endsAt) {
    const longestMin = await maxOfferingDuration(gate.supabase, offeringIds);
    endsAt = new Date(new Date(startsAt).getTime() + longestMin * 60_000).toISOString();
  }
  if (new Date(endsAt) <= new Date(startsAt)) {
    return NextResponse.json({ error: "ends_before_starts" }, { status: 400 });
  }

  const { data, error } = await gate.supabase
    .from("private_session_slots")
    .insert({
      practitioner_id: practitionerId,
      starts_at: startsAt,
      ends_at: endsAt,
      status: "available",
      published_area: publishedArea,
      actual_location: actualLocation,
      capacity,
    })
    .select("id")
    .single();
  if (error) {
    console.error("[admin] create slot failed", error);
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
  try {
    await linkSlotOfferings(gate.supabase, [data.id], offeringIds);
  } catch {
    return NextResponse.json({ error: "link_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: data.id });
}
