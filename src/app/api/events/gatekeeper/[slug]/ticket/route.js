// PATCH  /api/events/gatekeeper/[slug]/ticket
//   Body: { ticket_id, buyer_name?, buyer_email?, used? }
//   Edits a ticket on the event. Used by the in-kiosk Manage attendees
//   screen so the host can fix typos / swap an email / mark someone as
//   arrived without leaving the door.
//
// DELETE /api/events/gatekeeper/[slug]/ticket
//   Body: { ticket_id }
//   Removes a ticket completely (e.g. accidental walk-in, refund handled
//   elsewhere). The reconciliation totals will reflect the change next
//   time they're requested.

import { resolveGatekeeperContext, jsonResponse } from "../../_lib";

function cleanEmail(v) {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s : null;
}

async function loadTicketForEvent(supabase, ticketId, eventId) {
  const { data, error } = await supabase
    .from("tickets")
    .select("id, event_id, used, buyer_name, buyer_email")
    .eq("id", ticketId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return { notFound: true };
  if (data.event_id !== eventId) return { wrongEvent: true };
  return { ticket: data };
}

export async function PATCH(req, { params }) {
  const { slug } = await params;
  const ctx = await resolveGatekeeperContext(slug);
  if (ctx.unauthenticated) return jsonResponse({ message: "Unauthorized" }, 401);
  if (ctx.notFound) return jsonResponse({ message: "Event not found" }, 404);
  if (!ctx.allowed) return jsonResponse({ message: "Forbidden" }, 403);

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ message: "Invalid JSON" }, 400);
  }

  if (!body.ticket_id) {
    return jsonResponse({ message: "ticket_id is required" }, 400);
  }

  const lookup = await loadTicketForEvent(ctx.supabase, body.ticket_id, ctx.event.id);
  if (lookup.notFound) return jsonResponse({ message: "Ticket not found" }, 404);
  if (lookup.wrongEvent) {
    return jsonResponse({ message: "Ticket does not belong to this event" }, 400);
  }

  const update = {};

  if (typeof body.buyer_name === "string") {
    const name = body.buyer_name.trim().slice(0, 120);
    if (!name) return jsonResponse({ message: "Name cannot be empty" }, 400);
    update.buyer_name = name;
  }

  if (typeof body.buyer_email === "string") {
    const cleaned = cleanEmail(body.buyer_email);
    if (cleaned === null) {
      return jsonResponse({ message: "Email looks invalid" }, 400);
    }
    update.buyer_email = cleaned || null;
  }

  if (typeof body.used === "boolean") {
    update.used = body.used;
  }

  if (Object.keys(update).length === 0) {
    return jsonResponse({ message: "Nothing to update" }, 400);
  }

  try {
    const { data: updated, error } = await ctx.supabase
      .from("tickets")
      .update(update)
      .eq("id", body.ticket_id)
      .select()
      .single();
    if (error) throw error;
    return jsonResponse({ ticket: updated });
  } catch (err) {
    return jsonResponse({ message: err.message }, 500);
  }
}

export async function DELETE(req, { params }) {
  const { slug } = await params;
  const ctx = await resolveGatekeeperContext(slug);
  if (ctx.unauthenticated) return jsonResponse({ message: "Unauthorized" }, 401);
  if (ctx.notFound) return jsonResponse({ message: "Event not found" }, 404);
  if (!ctx.allowed) return jsonResponse({ message: "Forbidden" }, 403);

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ message: "Invalid JSON" }, 400);
  }

  if (!body.ticket_id) {
    return jsonResponse({ message: "ticket_id is required" }, 400);
  }

  const lookup = await loadTicketForEvent(ctx.supabase, body.ticket_id, ctx.event.id);
  if (lookup.notFound) return jsonResponse({ message: "Ticket not found" }, 404);
  if (lookup.wrongEvent) {
    return jsonResponse({ message: "Ticket does not belong to this event" }, 400);
  }

  try {
    const { error } = await ctx.supabase
      .from("tickets")
      .delete()
      .eq("id", body.ticket_id);
    if (error) throw error;
    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ message: err.message }, 500);
  }
}
