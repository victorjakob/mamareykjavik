// GET /api/events/gatekeeper/[slug]/tickets
//   Returns the list of tickets for the kiosk's "I already have a ticket"
//   picker + the reconciliation totals. We intentionally scope to a small
//   field set to keep payloads tiny for tablet use.

import { resolveGatekeeperContext, jsonResponse } from "../../_lib";

export async function GET(_req, { params }) {
  const { slug } = await params;
  const ctx = await resolveGatekeeperContext(slug);
  if (ctx.unauthenticated) return jsonResponse({ message: "Unauthorized" }, 401);
  if (ctx.notFound) return jsonResponse({ message: "Event not found" }, 404);
  if (!ctx.allowed) return jsonResponse({ message: "Forbidden" }, 403);

  try {
    const { data: tickets, error } = await ctx.supabase
      .from("tickets")
      .select(
        "id, buyer_name, buyer_email, quantity, status, used, created_at, variant_name, price, total_price, gatekeeper, gatekeeper_tip, gatekeeper_note, gatekeeper_receipt_requested"
      )
      .eq("event_id", ctx.event.id)
      .in("status", ["paid", "door", "cash", "card", "transfer", "exchange"])
      .order("buyer_name", { ascending: true });

    if (error) throw error;

    return jsonResponse({ tickets: tickets || [] });
  } catch (err) {
    return jsonResponse({ message: err.message }, 500);
  }
}
