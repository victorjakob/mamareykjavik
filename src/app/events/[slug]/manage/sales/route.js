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

  return NextResponse.json({
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
