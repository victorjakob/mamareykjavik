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
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

const BILL = "*, lines:pos_bill_lines(*), payments:pos_payments(*)";

/**
 * GET /api/pos/sync — what a tablet with nothing on it needs to carry on.
 *
 * For the day a tablet breaks and another takes its place: the tables that
 * are still open, the orders closed since the last Z (so tonight's Z still
 * adds up), and the recent Z reports themselves (so the next one knows where
 * its period starts). The till only asks when it holds no orders at all.
 */
export async function GET(request) {
  if (!authorised(request)) return json({ error: "Not authorised" }, { status: 401 });
  try {
    const supabase = createServerSupabase();

    const closes = await supabase
      .from("pos_day_closes")
      .select("*")
      .eq("venue", "mama")
      .order("closed_at", { ascending: false })
      .limit(30);
    if (closes.error) throw closes.error;
    const lastZ = closes.data[0]?.closed_at ?? null;

    const open = await supabase
      .from("pos_bills")
      .select(BILL)
      .eq("venue", "mama")
      .eq("status", "open")
      .order("opened_at", { ascending: true });
    if (open.error) throw open.error;

    let closedQuery = supabase
      .from("pos_bills")
      .select(BILL)
      .eq("venue", "mama")
      .in("status", ["closed", "deleted"])
      .order("closed_at", { ascending: false })
      .limit(500);
    if (lastZ) closedQuery = closedQuery.gt("closed_at", lastZ);
    const closed = await closedQuery;
    if (closed.error) throw closed.error;

    const lastSaved = [...open.data, ...closed.data]
      .map((b) => b.updated_at)
      .sort()
      .at(-1);

    // The till numbers its receipts in one unbroken series. A replacement
    // tablet has to carry on from the last number given out, whenever that
    // was, so the highest is looked for among the most recent bills. Numbers
    // of up to eight digits only: the ten-digit date-and-minute numbers from
    // before the series are not part of it.
    const numbered = await supabase
      .from("pos_bills")
      .select("receipt_number")
      .eq("venue", "mama")
      .not("receipt_number", "is", null)
      .order("updated_at", { ascending: false })
      .limit(200);
    if (numbered.error) throw numbered.error;
    const lastNumber = numbered.data
      .map((b) => b.receipt_number)
      .filter((n) => /^\d{1,8}$/.test(n ?? ""))
      .map(Number)
      .sort((a, b) => b - a)[0];

    return json({
      ok: true,
      last_receipt_number: lastNumber ? String(lastNumber) : null,
      open: open.data,
      closed: closed.data,
      day_closes: closes.data,
      last_saved_at: lastSaved ?? null,
    });
  } catch (err) {
    console.error("pos restore failed", err);
    return json({ error: "Could not read" }, { status: 500 });
  }
}

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
