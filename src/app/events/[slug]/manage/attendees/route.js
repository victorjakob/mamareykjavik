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
      "id, order_id, buyer_name, buyer_email, quantity, status, used, variant_name, created_at, gatekeeper, price, total_price, gatekeeper_tip, transaction_id, refund_status, refund_amount, refunded_at"
    )
    .eq("event_id", access.event.id)
    .in("status", ACTIVE)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Never send the raw Teya id to the browser — only whether one exists, so
  // the panel knows if an automatic refund is possible.
  const tickets = (data || []).map(({ transaction_id, ...t }) => ({
    ...t,
    has_transaction: Boolean(transaction_id),
  }));
  return NextResponse.json({ tickets });
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

  // Cancel / remove an attendee. Sets status='cancelled' (the same status the
  // checkout uses for abandoned holds), which every guest list, sales stat and
  // capacity count already excludes — so the guest disappears everywhere and
  // the seat frees up. Does NOT move money: refund first if needed. Logged-in
  // host/admin only — the no-login manage link can check in but not cancel.
  if (body.action === "cancel") {
    if (access.mode !== "session")
      return NextResponse.json(
        { error: "Log in as the host or an admin to remove attendees." },
        { status: 403 }
      );
    const { data: t, error: tErr } = await supabase
      .from("tickets")
      .select("id, event_id, status")
      .eq("id", ticketId)
      .maybeSingle();
    if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 });
    if (!t || t.event_id !== access.event.id)
      return NextResponse.json({ error: "Ticket not found for this event" }, { status: 404 });
    if (!ACTIVE.includes(t.status))
      return NextResponse.json({ error: `Ticket is already ${t.status}.` }, { status: 400 });
    const { error: cErr } = await supabase
      .from("tickets")
      .update({ status: "cancelled", used: false })
      .eq("id", ticketId);
    if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });
    return NextResponse.json({ ok: true, cancelled: ticketId });
  }

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
