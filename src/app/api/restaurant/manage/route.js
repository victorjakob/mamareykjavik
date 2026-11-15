// The guest's own booking, reached by the token in their email.
//
// No account and no password: the token is the key, which is why it is 32
// hex characters of gen_random_bytes and why this returns only the booking it
// belongs to. There is deliberately no way to list bookings here and no way
// to look one up by name, email or reference — those are all guessable, and a
// token is not.
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { assignTables, minutesOf } from "@/lib/restaurant/availability";

export const dynamic = "force-dynamic";

const FIELDS =
  "reference_id, booking_date, booking_time, duration_minutes, party, contact_name, request, status, language";

const looksLikeToken = (t) => typeof t === "string" && /^[0-9a-f]{32}$/.test(t);

/** GET /api/restaurant/manage?token=… */
export async function GET(request) {
  try {
    const token = new URL(request.url).searchParams.get("token");
    if (!looksLikeToken(token)) {
      return NextResponse.json({ error: "notFound" }, { status: 404 });
    }
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("restaurant_bookings")
      .select(FIELDS)
      .eq("access_token", token)
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "notFound" }, { status: 404 });
    return NextResponse.json({ booking: data });
  } catch (err) {
    console.error("manage read failed", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

/**
 * PATCH /api/restaurant/manage — the guest changes or cancels.
 *
 * A guest may move their own booking and may cancel it. They may not seat
 * themselves, mark themselves a no-show, or choose a table; those belong to
 * the restaurant.
 */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const token = body.token;
    if (!looksLikeToken(token)) {
      return NextResponse.json({ error: "notFound" }, { status: 404 });
    }

    const supabase = createServerSupabase();
    const { data: existing, error: readError } = await supabase
      .from("restaurant_bookings")
      .select("id, booking_date, booking_time, party, status")
      .eq("access_token", token)
      .maybeSingle();
    if (readError) throw readError;
    if (!existing) return NextResponse.json({ error: "notFound" }, { status: 404 });

    if (["seated", "no_show", "cancelled"].includes(existing.status)) {
      // Already been and gone, or already called off.
      return NextResponse.json({ error: "closed", status: existing.status }, { status: 409 });
    }

    if (body.cancel === true) {
      const { error } = await supabase
        .from("restaurant_bookings")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString(), table_ids: [] })
        .eq("id", existing.id);
      if (error) throw error;
      return NextResponse.json({ cancelled: true });
    }

    const date = body.date ?? existing.booking_date;
    const time = body.time ?? String(existing.booking_time).slice(0, 5);
    const party = Number(body.party ?? existing.party);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time) || !(party > 0)) {
      return NextResponse.json({ error: "Please check the details" }, { status: 400 });
    }

    const { data: settings } = await supabase
      .from("booking_settings")
      .select("*")
      .eq("id", 1)
      .single();

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

    // The room, minus this booking — it must not block itself when moving.
    const { data: others } = await supabase
      .from("restaurant_bookings")
      .select("booking_date, booking_time, duration_minutes, table_ids, status")
      .eq("booking_date", date)
      .neq("id", existing.id)
      .not("status", "in", "(cancelled,no_show)");

    const chosen = assignTables(
      others ?? [],
      settings,
      date,
      time,
      party,
      settings.default_duration_minutes
    );
    if (!chosen) return NextResponse.json({ error: "taken" }, { status: 409 });

    const { data, error } = await supabase
      .from("restaurant_bookings")
      .update({
        booking_date: date,
        booking_time: time,
        party,
        table_ids: chosen.tableIds,
        // Changed by the guest, so the restaurant should look at it again.
        status: "new",
      })
      .eq("id", existing.id)
      .select(FIELDS)
      .single();
    if (error) throw error;

    return NextResponse.json({ booking: data });
  } catch (err) {
    console.error("manage update failed", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
