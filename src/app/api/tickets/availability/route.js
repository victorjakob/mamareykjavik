// GET /api/tickets/availability?eventId=123 → { ticketsSold }
// Lets the ticket page show remaining capacity / early-bird status without
// reading the tickets table from the browser.

import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { calculateTicketsSold } from "@/util/event-capacity-util";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const eventId = Number(new URL(req.url).searchParams.get("eventId"));
  if (!Number.isInteger(eventId)) {
    return NextResponse.json({ message: "Invalid event" }, { status: 400 });
  }
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("tickets")
    .select("quantity, status")
    .eq("event_id", eventId);
  if (error) {
    console.error("[tickets/availability]", error);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
  return NextResponse.json(
    { ticketsSold: calculateTicketsSold(data || []) },
    { headers: { "Cache-Control": "no-store" } }
  );
}
