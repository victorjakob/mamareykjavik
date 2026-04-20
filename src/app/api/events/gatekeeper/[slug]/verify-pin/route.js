// POST /api/events/gatekeeper/[slug]/verify-pin
// Body: { pin: "1234" }
//
// Lightweight helper used by the kiosk to gate sensitive actions (e.g.
// opening the "already-have-a-ticket" picker, which exposes attendee
// names/emails). Does not change any state.

import { resolveGatekeeperContext, jsonResponse, verifyPinAgainst } from "../../_lib";

export async function POST(req, { params }) {
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

  const pin = String(body.pin || "");
  const ok = verifyPinAgainst(pin, ctx.config?.pin_hash);
  if (!ok) return jsonResponse({ ok: false, message: "Incorrect PIN" }, 401);

  return jsonResponse({ ok: true });
}
