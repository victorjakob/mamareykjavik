// GET /api/restaurant/availability?date=2027-01-20&party=4
//
// Which times that day can seat this party. The answer comes from the room —
// the floor plan and the bookings already holding tables — not from a
// covers-per-slot number, because Mama does not have one.
//
// Not linked from the site yet: the Book a table button still goes to Dineout
// until cut-over.
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { availability, minutesOf } from "@/lib/restaurant/availability";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const party = Number(searchParams.get("party") ?? 2);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? "")) {
      return NextResponse.json({ error: "A date is required, as YYYY-MM-DD" }, { status: 400 });
    }
    if (!Number.isInteger(party) || party < 1) {
      return NextResponse.json({ error: "Party must be a whole number above zero" }, { status: 400 });
    }

    const supabase = createServerSupabase();

    const { data: settings, error: settingsError } = await supabase
      .from("booking_settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (settingsError) throw settingsError;

    if ((settings.closed_dates ?? []).includes(date)) {
      return NextResponse.json({ date, party, closed: true, slots: [] });
    }

    if (party > settings.online_party_limit) {
      return NextResponse.json({
        date,
        party,
        slots: [],
        // A party this size is a conversation, not a form.
        tooLarge: true,
        onlinePartyLimit: settings.online_party_limit,
      });
    }

    // Only what holds a table matters. A cancelled booking holds nothing, and
    // the column list is deliberately narrow: this runs for anyone on the
    // internet, so no name, email or phone is read here at all.
    const { data: bookings, error } = await supabase
      .from("restaurant_bookings")
      .select("booking_date, booking_time, duration_minutes, table_ids, status")
      .eq("booking_date", date)
      .not("status", "in", "(cancelled,no_show)");
    if (error) throw error;

    let slots = availability(bookings ?? [], settings, date, party);

    // Nothing in the past, and nothing inside the lead time.
    const now = new Date();
    const todayIso = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
      .toISOString()
      .slice(0, 10);
    if (date === todayIso) {
      const earliest = now.getHours() * 60 + now.getMinutes() + settings.lead_time_minutes;
      slots = slots.filter((s) => minutesOf(s.time) >= earliest);
    } else if (date < todayIso) {
      slots = [];
    }

    return NextResponse.json({
      date,
      party,
      // The tables a slot would use are the restaurant's business, not the
      // guest's, so they do not leave the server.
      slots: slots.map(({ time, free }) => ({ time, free })),
      onlinePartyLimit: settings.online_party_limit,
    });
  } catch (err) {
    console.error("availability failed", err);
    return NextResponse.json({ error: "Could not read availability" }, { status: 500 });
  }
}
