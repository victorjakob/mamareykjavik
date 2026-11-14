// The till's window onto restaurant_bookings.
//
// The till ships as a static export inside a Capacitor app, so it has no
// server of its own and cannot hold the Supabase service role. It calls here
// instead, with a bearer token, the same shape the cron-triggered routes in
// this codebase already use.
//
// About that token: it lives in the APK on a restaurant-owned tablet, so
// treat it as a key to bookings and nothing else. It is deliberately not the
// service role and cannot reach any other table. When the local hub lands, the
// register will hold it and the floor tablets will go through the register
// instead of carrying their own copy.
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";

export const dynamic = "force-dynamic";

const FIELDS =
  "id, reference_id, booking_date, booking_time, duration_minutes, party, contact_name, contact_email, contact_phone, request, status, source, table_ids, language, dineout_ref, seated_at, cancelled_at, created_at, updated_at";

/**
 * The till is always a different origin from this server: on live reload it is
 * the Mac's address and port 3000, and in the shipped app it is Capacitor's
 * own. The bearer token is the gate here, not the origin, so any origin may
 * ask — it still has to hold the key. The browser sends a preflight because of
 * the Authorization header, which is why OPTIONS has to answer.
 */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

const json = (body, init = {}) =>
  NextResponse.json(body, { ...init, headers: { ...CORS, ...(init.headers ?? {}) } });

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

function authorised(request) {
  const key = process.env.POS_API_KEY;
  if (!key) return false;
  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${key}`;
}

const deny = () => json({ error: "Not authorised" }, { status: 401 });

/** GET /api/pos/bookings?from=2026-11-14&to=2026-11-21 */
export async function GET(request) {
  if (!authorised(request)) return deny();
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to") ?? from;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from ?? "")) {
      return json({ error: "from is required, as YYYY-MM-DD" }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("restaurant_bookings")
      .select(FIELDS)
      .gte("booking_date", from)
      .lte("booking_date", to)
      .order("booking_date")
      .order("booking_time");
    if (error) throw error;

    return json({ bookings: data ?? [] });
  } catch (err) {
    console.error("pos bookings read failed", err);
    return json({ error: "Could not read bookings" }, { status: 500 });
  }
}

/** POST /api/pos/bookings — taken at the till, over the counter or the phone. */
export async function POST(request) {
  if (!authorised(request)) return deny();
  try {
    const b = await request.json();
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("restaurant_bookings")
      .insert({
        reference_id: b.reference_id,
        booking_date: b.booking_date,
        booking_time: b.booking_time,
        duration_minutes: b.duration_minutes ?? 90,
        party: b.party,
        contact_name: b.contact_name,
        contact_email: b.contact_email || null,
        contact_phone: b.contact_phone || null,
        request: b.request || null,
        // A booking taken at the till is already confirmed: nobody needs to
        // confirm one they just took over the counter.
        status: b.status ?? "confirmed",
        source: b.source ?? "pos",
        table_ids: b.table_ids ?? [],
        language: b.language === "is" ? "is" : "en",
        metadata: b.metadata ?? {},
      })
      .select(FIELDS)
      .single();
    if (error) throw error;
    return json({ booking: data });
  } catch (err) {
    console.error("pos booking create failed", err);
    return json({ error: "Could not take the booking" }, { status: 500 });
  }
}

/** PATCH /api/pos/bookings — amend one, by id or reference. */
export async function PATCH(request) {
  if (!authorised(request)) return deny();
  try {
    const { id, reference_id, ...patch } = await request.json();
    if (!id && !reference_id) {
      return json({ error: "id or reference_id is required" }, { status: 400 });
    }

    // Only these. A patch from a tablet must not be able to rewrite the
    // reference, the access token or when it was created.
    const allowed = [
      "booking_date", "booking_time", "duration_minutes", "party",
      "contact_name", "contact_email", "contact_phone", "request",
      "status", "table_ids", "hidden_at", "metadata",
    ];
    const update = {};
    for (const k of allowed) if (k in patch) update[k] = patch[k];
    if (Object.keys(update).length === 0) {
      return json({ error: "Nothing to change" }, { status: 400 });
    }

    // Stamp the moments worth knowing, rather than trusting the caller to.
    if (update.status === "seated") update.seated_at = new Date().toISOString();
    if (update.status === "cancelled") update.cancelled_at = new Date().toISOString();

    const supabase = createServerSupabase();
    const query = supabase.from("restaurant_bookings").update(update);
    const { data, error } = await (id
      ? query.eq("id", id)
      : query.eq("reference_id", reference_id)
    ).select(FIELDS).single();
    if (error) throw error;

    return json({ booking: data });
  } catch (err) {
    console.error("pos booking update failed", err);
    return json({ error: "Could not change the booking" }, { status: 500 });
  }
}
