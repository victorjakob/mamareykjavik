// POST /api/events/gatekeeper/[slug]/close
// Body: { pin: "1234" }
//
// Verifies the PIN (or master PIN 2323), then records closed_at on the
// config row. Returns the reconciliation report so the UI can show it
// immediately without a second round-trip.

import {
  resolveGatekeeperContext,
  jsonResponse,
  verifyPinAgainst,
} from "../../_lib";
import { buildReport } from "../report/buildReport";

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

  const pin = String(body.pin || "");
  if (!verifyPinAgainst(pin, ctx.config.pin_hash)) {
    return jsonResponse({ message: "Incorrect PIN" }, 401);
  }

  try {
    const { error } = await ctx.supabase
      .from("gatekeeper_configs")
      .update({ closed_at: new Date().toISOString() })
      .eq("event_id", ctx.event.id);
    if (error) throw error;

    const report = await buildReport(ctx.supabase, ctx.event);
    return jsonResponse({ report });
  } catch (err) {
    return jsonResponse({ message: err.message }, 500);
  }
}
