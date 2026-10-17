// Records a promo code use (event_promo_redemptions, status APPLIED) once a
// ticket order is actually confirmed: online payment confirmed by Teya, a
// free ticket confirmed at checkout, or a pay-at-door reservation marked paid.
// Applying a code in the browser no longer counts as a use.
//
// Idempotent: the row is keyed by cart_id = "ticket:<order_id>", so a second
// callback / retry for the same order finds the existing row and does nothing.
// Never throws: a telemetry hiccup must not fail a confirmed payment.

export function promoCartIdForOrder(orderId) {
  return `ticket:${orderId}`;
}

export async function recordPromoRedemption(supabase, { orderId, ticketId } = {}) {
  try {
    let query = supabase
      .from("tickets")
      .select("order_id, event_coupon, price_breakdown");
    query = orderId ? query.eq("order_id", orderId) : query.eq("id", ticketId);
    const { data: ticket, error } = await query.maybeSingle();
    if (error) throw error;
    if (!ticket?.event_coupon || !ticket.order_id) return { recorded: false };

    const breakdown = ticket.price_breakdown || {};
    let promoId = breakdown.promo_id || null;
    if (!promoId) {
      // Orders priced before promo_id was stored: look it up by code.
      const { data: promo } = await supabase
        .from("event_promo_codes")
        .select("id")
        .eq("code", String(ticket.event_coupon).toUpperCase())
        .maybeSingle();
      promoId = promo?.id || null;
    }
    if (!promoId) return { recorded: false };

    const cartId = promoCartIdForOrder(ticket.order_id);
    const { data: existing, error: exErr } = await supabase
      .from("event_promo_redemptions")
      .select("id")
      .eq("cart_id", cartId)
      .eq("status", "APPLIED")
      .limit(1);
    if (exErr) throw exErr;
    if (existing?.length) return { recorded: false, alreadyRecorded: true };

    const { error: insErr } = await supabase.from("event_promo_redemptions").insert({
      promo_id: promoId,
      user_id: breakdown.user_id || null,
      cart_id: cartId,
      amount_discounted: Number(breakdown.discount) || 0,
      status: "APPLIED",
      redeemed_at: new Date().toISOString(),
    });
    if (insErr) throw insErr;
    return { recorded: true };
  } catch (err) {
    console.error("[promoRedemption] failed to record promo use", { orderId, ticketId }, err);
    return { recorded: false, error: err?.message || String(err) };
  }
}
