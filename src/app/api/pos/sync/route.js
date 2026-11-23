// The till's own record: bills, their lines, their payments, and Z reports.
//
// The till ships as a static export inside a Capacitor app, so it has no
// server of its own and cannot hold the Supabase service role. It sends what
// it has here, with the same bearer token it uses for bookings, and this hands
// it to `pos_sync` in the database — see `database-migrations/002-pos-bills.sql`
// in the POS repo.
//
// A bill arrives as a whole snapshot, and the database replaces what it had
// with what it was given in one transaction. The same snapshot sent twice
// changes nothing, so the tablet retries freely on a bad connection and a sale
// is never counted twice. An older snapshot arriving late is ignored.
//
// About that token: it lives in the APK on a restaurant-owned tablet, so it is
// a key to the till's own tables and bookings and nothing else. It is not the
// service role.
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";

export const dynamic = "force-dynamic";

// The till is always a different origin from this server: the Mac's address
// on live reload, Capacitor's own in the shipped app. The bearer token is the
// gate, not the origin. The browser sends a preflight because of the
// Authorization header, which is why OPTIONS has to answer.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
  return (request.headers.get("authorization") ?? "") === `Bearer ${key}`;
}

// A batch is a handful of bills. Anything near this is a tablet catching up
// after a long time offline, and it sends in pieces.
const MAX_BILLS = 200;

/** POST /api/pos/sync — { device_id, bills: [...], day_closes: [...] } */
export async function POST(request) {
  if (!authorised(request)) return json({ error: "Not authorised" }, { status: 401 });
  try {
    const body = await request.json();
    const bills = Array.isArray(body.bills) ? body.bills : [];
    const dayCloses = Array.isArray(body.day_closes) ? body.day_closes : [];

    if (typeof body.device_id !== "string" || !body.device_id) {
      return json({ error: "device_id is required" }, { status: 400 });
    }
    if (bills.length > MAX_BILLS) {
      return json({ error: `At most ${MAX_BILLS} bills at a time` }, { status: 413 });
    }
    // Checked here so a malformed bill is refused with its reason, rather
    // than failing the whole batch inside the database with a cast error.
    for (const b of bills) {
      if (!b?.id || !b.table_id || !b.opened_at || !b.client_updated_at) {
        return json(
          { error: "Every bill needs id, table_id, opened_at and client_updated_at" },
          { status: 400 },
        );
      }
    }

    const supabase = createServerSupabase();
    const { data, error } = await supabase.rpc("pos_sync", {
      payload: { device_id: body.device_id, bills, day_closes: dayCloses },
    });
    if (error) throw error;

    return json({ ok: true, ...data });
  } catch (err) {
    console.error("pos sync failed", err);
    return json({ error: "Could not save" }, { status: 500 });
  }
}
