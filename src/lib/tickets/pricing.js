// Server-side ticket pricing. The browser only says WHAT it wants (event,
// variant, quantity, chosen sliding-scale amount, promo code); the price is
// always worked out here from the database. The result is stored on the
// ticket as `price_breakdown`, so every order keeps an exact record of how
// its total was reached.

import {
  calculateTicketsSold,
  isEarlyBirdActive,
} from "@/util/event-capacity-util";
import { validatePromoCode } from "@/lib/promo-server";

export const MAX_TICKETS_PER_ORDER = 8;

export class TicketOrderError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function toInt(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : NaN;
}

export async function priceTicketOrder(
  supabase,
  { event, quantity, variantId, slidingPrice, promoCode, userId }
) {
  const qty = toInt(quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_TICKETS_PER_ORDER) {
    throw new TicketOrderError("Invalid ticket quantity");
  }

  let unitPrice;
  let source;
  let variant = null;
  let earlyBird = false;

  if (variantId) {
    const { data, error } = await supabase
      .from("ticket_variants")
      .select("id, name, price")
      .eq("id", variantId)
      .eq("event_id", event.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new TicketOrderError("This ticket type is not available");
    variant = data;
    unitPrice = toInt(data.price);
    source = "variant";
  } else if (event.has_sliding_scale) {
    const chosen =
      slidingPrice === null || slidingPrice === undefined || slidingPrice === ""
        ? toInt(event.price)
        : toInt(slidingPrice);
    const min = toInt(event.sliding_scale_min);
    const max = toInt(event.sliding_scale_max);
    const inRange = chosen >= min && chosen <= max;
    if (!Number.isInteger(chosen) || (!inRange && chosen !== toInt(event.price))) {
      throw new TicketOrderError(
        `Please choose an amount between ${min} and ${max} ISK`
      );
    }
    unitPrice = chosen;
    source = "sliding_scale";
  } else {
    const { data: tickets, error } = await supabase
      .from("tickets")
      .select("quantity, status")
      .eq("event_id", event.id);
    if (error) throw error;
    earlyBird = isEarlyBirdActive(event, calculateTicketsSold(tickets || []));
    unitPrice = toInt(earlyBird ? event.early_bird_price : event.price);
    source = earlyBird ? "early_bird" : "standard";
  }

  if (!Number.isInteger(unitPrice) || unitPrice < 0) unitPrice = 0;

  const subtotal = unitPrice * qty;
  let discount = 0;
  let appliedCode = null;

  if (promoCode && String(promoCode).trim()) {
    const result = await validatePromoCode(
      supabase,
      String(promoCode).trim().toUpperCase(),
      event.id,
      subtotal,
      userId || null,
      { skipUsageLimits: true }
    );
    if (!result.success) throw new TicketOrderError(result.error);
    discount = Math.min(toInt(result.promoCode.discountAmount) || 0, subtotal);
    appliedCode = result.promoCode.code;
  }

  const total = subtotal - discount;

  return {
    quantity: qty,
    unitPrice,
    subtotal,
    discount,
    total,
    promoCode: appliedCode,
    variant,
    breakdown: {
      currency: "ISK",
      source,
      list_price: toInt(event.price) || 0,
      unit_price: unitPrice,
      quantity: qty,
      subtotal,
      early_bird: earlyBird,
      variant: variant ? { id: variant.id, name: variant.name } : null,
      sliding_scale: event.has_sliding_scale && !variant
        ? {
            min: toInt(event.sliding_scale_min),
            max: toInt(event.sliding_scale_max),
            chosen: unitPrice,
          }
        : null,
      promo_code: appliedCode,
      discount,
      total,
      priced_at: new Date().toISOString(),
    },
  };
}
