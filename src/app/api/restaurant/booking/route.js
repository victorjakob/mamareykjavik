// POST /api/restaurant/booking — take a table booking from mama.is.
//
// Not linked from the site yet: the Book a table button still goes to Dineout
// until cut-over.
//
// The service role is used because restaurant_bookings is closed to anon and
// authenticated, as every booking table here is. A booking carries a name, an
// email and a phone number, so nothing about it is readable from the browser.
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { assignTables, minutesOf } from "@/lib/restaurant/availability";
import { notifyBooking } from "@/lib/restaurant/notify";
import { bookingOpen } from "@/lib/restaurant/open";

export const dynamic = "force-dynamic";

/**
 * The reference a guest reads out: MR-7K2Q.
 *
 * No I, O, 0 or 1 — this gets spelled down a phone line in a noisy room, and
 * those four are where that goes wrong.
 */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const makeReference = () =>
  "MR-" + Array.from({ length: 4 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");

const clean = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request) {
  try {
    // Closed until cut-over. Checked here and not only on the page, because a
    // page is not a gate: this endpoint is reachable on its own.
    if (!bookingOpen()) {
      return NextResponse.json({ error: "notOpenYet" }, { status: 503 });
    }

    const body = await request.json();

    const date = clean(body.date, 10);
    const time = clean(body.time, 5);
    const party = Number(body.party);
    const name = clean(body.name, 120);
    const email = clean(body.email, 200).toLowerCase();
    const phone = clean(body.phone, 40);
    const request_ = clean(body.request, 1000);
    const language = body.language === "is" ? "is" : "en";

    const problems = [];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) problems.push("date");
    if (!/^\d{2}:\d{2}$/.test(time)) problems.push("time");
    if (!Number.isInteger(party) || party < 1) problems.push("party");
    if (name.length < 2) problems.push("name");
    // One way to reach them, or the booking cannot be confirmed or chased.
    if (!email && !phone) problems.push("contact");
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) problems.push("email");
    if (problems.length) {
      return NextResponse.json({ error: "Please check these", fields: problems }, { status: 400 });
    }

    const supabase = createServerSupabase();

    const { data: settings, error: settingsError } = await supabase
      .from("booking_settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (settingsError) throw settingsError;

    if ((settings.closed_dates ?? []).includes(date)) {
      return NextResponse.json({ error: "The restaurant is closed that day" }, { status: 409 });
    }
    if (party > settings.online_party_limit) {
      return NextResponse.json(
        { error: "tooLarge", onlinePartyLimit: settings.online_party_limit },
        { status: 409 }
      );
    }

    const open = minutesOf(String(settings.open_from).slice(0, 5));
    const last = minutesOf(String(settings.open_to).slice(0, 5)) - settings.last_booking_before_close;
    const at = minutesOf(time);
    if (at < open || at > last) {
      return NextResponse.json({ error: "The restaurant is not open then" }, { status: 409 });
    }

    // Check the room again here rather than trusting what the form was shown.
    // Two people can be on the booking page at once, and the one who presses
    // second must not get the same table.
    const { data: bookings, error: readError } = await supabase
      .from("restaurant_bookings")
      .select("booking_date, booking_time, duration_minutes, table_ids, status")
      .eq("booking_date", date)
      .not("status", "in", "(cancelled,no_show)");
    if (readError) throw readError;

    const chosen = assignTables(
      bookings ?? [],
      settings,
      date,
      time,
      party,
      settings.default_duration_minutes
    );
    if (!chosen) {
      return NextResponse.json({ error: "taken" }, { status: 409 });
    }

    // A booking from the website is "new": nobody at Mama has looked at it.
    // The till is where it becomes confirmed.
    const row = {
      reference_id: makeReference(),
      booking_date: date,
      booking_time: time,
      duration_minutes: settings.default_duration_minutes,
      party,
      contact_name: name,
      contact_email: email || null,
      contact_phone: phone || null,
      request: request_ || null,
      status: "new",
      source: "website",
      // Held from the moment it is taken, or two guests get the same table.
      table_ids: chosen.tableIds,
      language,
    };

    let inserted = null;
    // reference_id is unique and random; on the rare clash, try again.
    for (let attempt = 0; attempt < 5 && !inserted; attempt++) {
      const { data, error } = await supabase
        .from("restaurant_bookings")
        .insert(attempt === 0 ? row : { ...row, reference_id: makeReference() })
        .select("reference_id, booking_date, booking_time, party, access_token")
        .single();
      if (!error) inserted = data;
      else if (error.code !== "23505") throw error;
    }
    if (!inserted) throw new Error("could not allocate a reference");

    // After the insert, never before: the booking is real whatever the post
    // does, and notifyBooking swallows its own failures for that reason.
    await notifyBooking(
      { ...row, ...inserted, access_token: inserted.access_token },
      { notifyTeam: true },
    );

    return NextResponse.json({
      reference: inserted.reference_id,
      date: inserted.booking_date,
      time: String(inserted.booking_time).slice(0, 5),
      party: inserted.party,
      // The guest manages their booking with this, with no account.
      manageToken: inserted.access_token,
    });
  } catch (err) {
    console.error("booking failed", err);
    return NextResponse.json({ error: "Could not take the booking" }, { status: 500 });
  }
}
