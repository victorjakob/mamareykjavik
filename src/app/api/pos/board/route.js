// The till's notice board: the announcement and the soup of the week.
//
// Written on a tablet, read on every tablet. Kept in `pos_board`, a row per
// notice (see `database-migrations/006-pos-board.sql` in the POS repo).
// Behind the till's bearer token, like the rest of /api/pos.
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";

export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
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

const clip = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** What each kind of notice may hold; anything else sent is dropped. */
const SHAPES = {
  announcement: (b) => ({ text: clip(b?.text, 800) }),
  soup: (b) => ({ name: clip(b?.name, 80), ingredients: clip(b?.ingredients, 800) }),
};

/** GET /api/pos/board — { announcement, soup }, each null or { ...body, at } */
export async function GET(request) {
  if (!authorised(request)) return json({ error: "Not authorised" }, { status: 401 });
  try {
    const supabase = createServerSupabase();
    const { data, error } = await supabase.from("pos_board").select("kind, body, updated_at").eq("venue", "mama");
    if (error) throw error;
    const out = { announcement: null, soup: null };
    for (const row of data) {
      if (!(row.kind in SHAPES)) continue;
      const empty = Object.values(row.body ?? {}).every((v) => !v);
      out[row.kind] = empty ? null : { ...row.body, at: row.updated_at };
    }
    return json({ ok: true, ...out });
  } catch (err) {
    console.error("pos board read failed", err);
    return json({ error: "Could not read" }, { status: 500 });
  }
}

/** PUT /api/pos/board — { kind, body }. An empty body takes the notice down. */
export async function PUT(request) {
  if (!authorised(request)) return json({ error: "Not authorised" }, { status: 401 });
  try {
    const { kind, body } = await request.json();
    const shape = SHAPES[kind];
    if (!shape) return json({ error: "Unknown kind of notice" }, { status: 400 });
    const clean = shape(body);
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("pos_board")
      .upsert({ venue: "mama", kind, body: clean, updated_at: new Date().toISOString() }, { onConflict: "venue,kind" })
      .select("updated_at")
      .single();
    if (error) throw error;
    return json({ ok: true, at: data.updated_at });
  } catch (err) {
    console.error("pos board write failed", err);
    return json({ error: "Could not save" }, { status: 500 });
  }
}
