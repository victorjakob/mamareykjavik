// GET  /api/events/gatekeeper/[slug]/config
//   Returns the config row (creating it if missing) + current event shape.
//   Never returns the pin_hash — only a boolean { has_pin }.
//
// PUT  /api/events/gatekeeper/[slug]/config
//   Body: {
//     enabled_methods: string[],
//     bank_details: { kt, bank, explanation },
//     tip_enabled: bool, receipt_enabled: bool, upsell_enabled: bool,
//     pin?: "1234"           — if present AND 4 digits, sets pin_hash
//     activate?: true        — if true, sets activated_at = now()
//   }

import {
  resolveGatekeeperContext,
  ensureConfig,
  jsonResponse,
  sanitizeMethods,
  hashPin,
} from "../../_lib";

function maskConfig(config) {
  if (!config) return null;
  const { pin_hash, ...rest } = config;
  return { ...rest, has_pin: !!pin_hash };
}

export async function GET(_req, { params }) {
  const { slug } = await params;
  const ctx = await resolveGatekeeperContext(slug);
  if (ctx.unauthenticated) return jsonResponse({ message: "Unauthorized" }, 401);
  if (ctx.notFound) return jsonResponse({ message: "Event not found" }, 404);
  if (!ctx.allowed) return jsonResponse({ message: "Forbidden" }, 403);
  if (ctx.error) return jsonResponse({ message: ctx.error }, 500);

  try {
    const config = await ensureConfig(ctx.supabase, ctx.event.id);
    return jsonResponse({
      event: ctx.event,
      config: maskConfig(config),
    });
  } catch (err) {
    return jsonResponse({ message: err.message }, 500);
  }
}

export async function PUT(req, { params }) {
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

  try {
    const existing = await ensureConfig(ctx.supabase, ctx.event.id);

    const update = {
      enabled_methods: sanitizeMethods(body.enabled_methods),
      bank_details: body.bank_details && typeof body.bank_details === "object"
        ? {
            kt: String(body.bank_details.kt || "").slice(0, 40),
            bank: String(body.bank_details.bank || "").slice(0, 80),
            explanation: String(body.bank_details.explanation || "").slice(0, 200),
          }
        : {},
      tip_enabled: !!body.tip_enabled,
      receipt_enabled: !!body.receipt_enabled,
      upsell_enabled: !!body.upsell_enabled,
    };

    // Only update PIN if caller explicitly provided a 4-digit one.
    if (typeof body.pin === "string" && /^\d{4}$/.test(body.pin)) {
      update.pin_hash = hashPin(body.pin);
    }

    // Require a PIN (stored OR provided this request) before activation.
    if (body.activate === true) {
      if (!update.pin_hash && !existing.pin_hash) {
        return jsonResponse({ message: "A 4-digit PIN is required to activate." }, 400);
      }
      // At least one payment method must be enabled.
      if (!update.enabled_methods || update.enabled_methods.length === 0) {
        return jsonResponse({ message: "Enable at least one payment method." }, 400);
      }
      update.activated_at = new Date().toISOString();
      update.closed_at = null;
    }

    const { data: saved, error } = await ctx.supabase
      .from("gatekeeper_configs")
      .update(update)
      .eq("event_id", ctx.event.id)
      .select()
      .single();

    if (error) throw error;

    return jsonResponse({ config: maskConfig(saved) });
  } catch (err) {
    return jsonResponse({ message: err.message }, 500);
  }
}
