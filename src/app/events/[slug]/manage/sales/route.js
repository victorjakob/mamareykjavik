import { NextResponse } from "next/server";
import { resolveEventAccess } from "@/lib/eventAccess";
import { createServerSupabase } from "@/util/supabase/server";

export const dynamic = "force-dynamic";

// Payment methods, matching the existing sales-stats screen (door walk-ins are
// recorded under cash/card/transfer, so there's no separate "door" bucket).
const METHODS = [
  { key: "paid", label: "Online card" },
  { key: "cash", label: "Cash" },
  { key: "card", label: "Card reader" },
  { key: "transfer", label: "Bank transfer" },
];

export async function GET(req, { params }) {
  const { slug } = await params;
  const access = await resolveEventAccess(slug, {});
  if (access.notFound)
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (!access.allowed)
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("tickets")
    .select("status, quantity, total_price, created_at")
    .eq("event_id", access.event.id)
    .in("status", METHODS.map((m) => m.key));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const acc = {};
  for (const m of METHODS) acc[m.key] = { tickets: 0, revenue: 0 };
  let tickets = 0;
  let revenue = 0;
  const daily = {};

  for (const t of data || []) {
    if (!acc[t.status]) continue;
    const q = t.quantity || 0;
    const rev = Number(t.total_price || 0);
    acc[t.status].tickets += q;
    acc[t.status].revenue += rev;
    tickets += q;
    revenue += rev;
    const d = (t.created_at || "").slice(0, 10);
    if (d) daily[d] = (daily[d] || 0) + rev;
  }

  const { data: ev } = await supabase
    .from("events")
    .select("fee_online_enabled, fee_card_enabled")
    .eq("id", access.event.id)
    .single();

  // Row breakdown for the panel's main list. Separate query so the totals and
  // method buckets above (which drive the host/venue split) are untouched.
  //  - online:  status "paid"
  //  - door:    walk-ins registered by gatekeeper (gatekeeper = true), any
  //             payment incl. "exchange" (free / barter, price 0); prices listed
  //  - pos:     status "card" (card reader / POS)
  //  - cash:    status "cash"
  //  - transfer: status "transfer"
  const { data: rowsData } = await supabase
    .from("tickets")
    .select("status, quantity, price, total_price, gatekeeper")
    .eq("event_id", access.event.id)
    .in("status", ["paid", "cash", "card", "transfer", "exchange"]);
  const bucket = () => ({ tickets: 0, revenue: 0 });
  const rows = { online: bucket(), door: bucket(), pos: bucket(), cash: bucket(), transfer: bucket() };
  const doorPrices = {};
  let doorExchange = 0;
  for (const t of rowsData || []) {
    const q = t.quantity || 0;
    const rev = Number(t.total_price || 0);
    const add = (k) => { rows[k].tickets += q; rows[k].revenue += rev; };
    if (t.status === "paid") add("online");
    if (t.status === "card") add("pos");
    if (t.status === "cash") add("cash");
    if (t.status === "transfer") add("transfer");
    if (t.gatekeeper) {
      add("door");
      if (t.status === "exchange") doorExchange += q;
      else {
        const p = Number(t.price || 0);
        doorPrices[p] = (doorPrices[p] || 0) + q;
      }
    }
  }
  rows.door.prices = Object.entries(doorPrices)
    .map(([price, count]) => ({ price: Number(price), count }))
    .sort((a, b) => a.price - b.price);
  rows.door.exchange = doorExchange;

  // White Lotus door sales, hand-entered in Mama Manager (manage_whitelotus_reports).
  // Read-only and kept separate from ticket totals / split. Only entries linked
  // by event_id are shown; free-typed event names are not matched.
  let doorSales = { entries: [], total: 0, error: null };
  const { data: wl, error: wlErr } = await supabase
    .from("manage_whitelotus_reports")
    .select("id, report_date, event_name, terminal_amount, cash_amount, notes, submitted_by")
    .eq("event_id", String(access.event.id))
    .order("report_date", { ascending: true });
  if (wlErr) {
    doorSales.error = wlErr.message;
  } else {
    doorSales.entries = wl || [];
    doorSales.total = doorSales.entries.reduce(
      (sum, e) => sum + Number(e.terminal_amount || 0) + Number(e.cash_amount || 0),
      0
    );
  }

  return NextResponse.json({
    doorSales,
    rows,
    totals: { tickets, revenue },
    methods: METHODS.map((m) => ({ ...m, ...acc[m.key] })),
    daily: Object.entries(daily)
      .map(([date, rev]) => ({ date, revenue: rev }))
      .sort((a, b) => (a.date < b.date ? -1 : 1)),
    feeConfig: {
      paid: ev?.fee_online_enabled ?? true,
      card: ev?.fee_card_enabled ?? true,
    },
  });
}

// POST — persist a fee toggle so it sticks across loads and is inherited by a
// no-login host opening the same private link. Body: { online?: bool, card?: bool }
export async function POST(req, { params }) {
  const { slug } = await params;
  const access = await resolveEventAccess(slug, {});
  if (access.notFound)
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (!access.allowed)
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const update = {};
  if (typeof body.online === "boolean") update.fee_online_enabled = body.online;
  if (typeof body.card === "boolean") update.fee_card_enabled = body.card;
  if (Object.keys(update).length === 0)
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("events")
    .update(update)
    .eq("id", access.event.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
