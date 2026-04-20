// GET /api/events/gatekeeper/[slug]/report
//
// Returns the latest reconciliation payload for the host. Safe to call
// repeatedly — it just sums tickets.

import { resolveGatekeeperContext, jsonResponse } from "../../_lib";
import { buildReport } from "./buildReport";

export async function GET(_req, { params }) {
  const { slug } = await params;
  const ctx = await resolveGatekeeperContext(slug);
  if (ctx.unauthenticated) return jsonResponse({ message: "Unauthorized" }, 401);
  if (ctx.notFound) return jsonResponse({ message: "Event not found" }, 404);
  if (!ctx.allowed) return jsonResponse({ message: "Forbidden" }, 403);

  try {
    const report = await buildReport(ctx.supabase, ctx.event);
    return jsonResponse({ report });
  } catch (err) {
    return jsonResponse({ message: err.message }, 500);
  }
}
