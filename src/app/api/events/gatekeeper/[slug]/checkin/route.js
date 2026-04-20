// POST /api/events/gatekeeper/[slug]/checkin
// Body: { ticket_id: uuid, used: boolean }
// Toggles the `used` flag on an existing ticket. This is what runs when a
// kiosk user picks themselves out of the list in "I already have a ticket".

import { resolveGatekeeperContext, jsonResponse } from "../../_lib";

export async function POST(req, { params }) {
  const { slug } = await params;
  const ctx = await resolveGatekeeperContext(slug);
  if (ctx.unauthenticated) return jsonResponse({ message: "Unauthorized" }, 401);
  if (ctx.notFound) return jsonResponse({ message: "Event not found" }, 404);
  if (!ctx.allowed) return jsonResponse({ message: "Forbidden" }, 403);
  if (!ctx.config?.activated_at) {
    return jsonResponse({ message: "Gatekeeper is not active." }, 400);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ message: "Invalid JSON" }, 400);
  }

  if (!body.ticket_id) return jsonResponse({ message: "ticket_id is required" }, 400);

  try {
    const { data: ticket, error: fetchErr } = await ctx.supabase
      .from("tickets")
      .select("id, event_id, used, buyer_name")
      .eq("id", body.ticket_id)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!ticket) return jsonResponse({ message: "Ticket not found" }, 404);
    // Prevent cross-event check-ins.
    if (ticket.event_id !== ctx.event.id) {
      return jsonResponse({ message: "Ticket does not belong to this event" }, 400);
    }

    const next = body.used === undefined ? !ticket.used : !!body.used;
    const { data: updated, error: updateErr } = await ctx.supabase
      .from("tickets")
      .update({ used: next })
      .eq("id", body.ticket_id)
      .select()
      .single();
    if (updateErr) throw updateErr;

    return jsonResponse({ ticket: updated });
  } catch (err) {
    return jsonResponse({ message: err.message }, 500);
  }
}
