import { NextResponse } from "next/server";
import { resolveEventAccess } from "@/lib/eventAccess";
import { createServerSupabase } from "@/util/supabase/server";

export const dynamic = "force-dynamic";

// Tickets that count as a real, attending registration.
const ACTIVE = ["paid", "door", "cash", "card", "transfer"];

// GET — the guest list for the hub's Attendees tab.
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
    .select(
      "id, order_id, buyer_name, buyer_email, quantity, status, used, variant_name, created_at, gatekeeper, price, total_price, gatekeeper_tip"
    )
    .eq("event_id", access.event.id)
    .in("status", ACTIVE)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tickets: data || [] });
}

// POST — toggle a guest's check-in. This writes the same `tickets.used` flag
// the door kiosk uses, so the two check-in surfaces stay in lockstep. Unlike
// the old page (which hit Supabase straight from the browser) this authorises
// server-side via resolveEventAccess, so a no-login host with the link works
// too — and a leaked link still can't touch another event's tickets.
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
  const ticketId = body?.ticketId;
  if (!ticketId)
    return NextResponse.json({ error: "ticketId is required" }, { status: 400 });

  const supabase = createServerSupabase();
  const { data: ticket, error: fetchErr } = await supabase
    .from("tickets")
    .select("id, event_id, used")
    .eq("id", ticketId)
    .maybeSingle();
  if (fetchErr)
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  if (!ticket || ticket.event_id !== access.event.id)
    return NextResponse.json({ error: "Ticket not found for this event" }, { status: 404 });

  const next = body.used === undefined ? !ticket.used : !!body.used;
  const { data: updated, error: updateErr } = await supabase
    .from("tickets")
    .update({ used: next })
    .eq("id", ticketId)
    .select("id, used")
    .single();
  if (updateErr)
    return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json({ ticket: updated });
}
