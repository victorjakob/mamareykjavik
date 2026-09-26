// POST /api/tickets/checkout — the one entry point for booking event tickets.
//
// The browser sends only what the buyer chose. The server:
//   1. prices the order from the database (variant / sliding scale / early
//      bird / promo) — see lib/tickets/pricing.js
//   2. reserves the seats atomically (reserve_tickets() in Postgres), so two
//      buyers can never take the last seat
//   3. free / door tickets → confirmed right away + confirmation emails
//      online tickets      → held for HOLD_MINUTES, returns the payment URL
//
// Replaces: the browser-side insert into `tickets`, POST /api/saltpay and the
// /api/sendgrid/{ticket,free-ticket} email routes.

import crypto from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";
import { hasEventEnded } from "@/util/event-capacity-util";
import { priceTicketOrder, TicketOrderError } from "@/lib/tickets/pricing";
import { buildTicketPaymentUrl } from "@/lib/tickets/saltpay";
import { sendReservedTicketEmails } from "@/lib/ticketEmails";
import { enrolAndWelcome } from "@/lib/newsletter";

// How long an online checkout keeps its seats while the buyer is on the
// payment page. A payment that lands later is still accepted (see
// confirm_ticket_payment); the hold only decides who gets the last seats.
const HOLD_MINUTES = 10;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fail(message, status = 400) {
  return NextResponse.json({ message }, { status });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const session = await getServerSession(authOptions);

    const buyerEmail = String(session?.user?.email || body.buyerEmail || "").trim();
    const buyerName = String(session?.user?.name || body.buyerName || "").trim();
    if (!EMAIL_RE.test(buyerEmail)) return fail("Please enter a valid email");
    if (!buyerName) return fail("Please enter your name");

    const eventId = Number(body.eventId);
    if (!Number.isInteger(eventId)) return fail("Invalid event");

    const supabase = createServerSupabase();
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .maybeSingle();
    if (eventError) throw eventError;
    if (!event) return fail("Event not found", 404);
    if (hasEventEnded(event)) return fail("This event has already ended");

    const order = await priceTicketOrder(supabase, {
      event,
      quantity: body.quantity,
      variantId: body.variantId || null,
      slidingPrice: body.slidingPrice,
      promoCode: body.promoCode,
      userId: session?.user?.id,
    });

    // Same rule as before: anything that comes to 0 is a free ticket;
    // otherwise the event's payment method decides.
    const status =
      order.total === 0
        ? "free"
        : event.payment === "online"
          ? "pending"
          : event.payment === "door"
            ? "door"
            : "free";

    const orderId = crypto.randomBytes(6).toString("hex");
    const subscribe = body.subscribeToNewsletter === true;

    const { data: reserved, error: reserveError } = await supabase.rpc(
      "reserve_tickets",
      {
        p_event_id: event.id,
        p_hold_minutes: HOLD_MINUTES,
        p_ticket: {
          order_id: orderId,
          status,
          buyer_email: buyerEmail,
          buyer_name: buyerName,
          quantity: order.quantity,
          price: order.unitPrice,
          total_price: order.total,
          ticket_variant_id: order.variant?.id || null,
          variant_name: order.variant?.name || null,
          event_coupon: order.promoCode,
          subscribe_to_newsletter: subscribe,
          price_breakdown: order.breakdown,
        },
      }
    );
    if (reserveError) throw reserveError;

    if (!reserved?.ok) {
      if (reserved?.reason === "sold_out") {
        const remaining = reserved.remaining ?? 0;
        return fail(
          remaining > 0
            ? `Only ${remaining} ticket${remaining === 1 ? "" : "s"} available`
            : "Event is sold out",
          409
        );
      }
      return fail("Could not reserve tickets");
    }

    const ticket = reserved.ticket;

    // ── Free / door: confirmed now ────────────────────────────────────
    if (status !== "pending") {
      try {
        await sendReservedTicketEmails({ event, ticket });
      } catch (err) {
        // The ticket exists; a mail hiccup must not tell the buyer it failed.
        console.error("[tickets/checkout] confirmation email failed", err);
      }
      if (subscribe) {
        enrolAndWelcome({
          email: buyerEmail,
          name: buyerName,
          source: "ticket_buyer",
          consentBasis: "soft_optin_customer",
        }).catch((err) =>
          console.error("[tickets/checkout] enrolAndWelcome failed", err)
        );
      }
      return NextResponse.json({ confirmed: true, status });
    }

    // ── Online: send the buyer to the payment page ────────────────────
    const url = buildTicketPaymentUrl({
      orderId,
      amount: order.total,
      buyerName,
      buyerEmail,
      description: `${event.name}${order.variant ? ` - ${order.variant.name}` : ""}${
        order.promoCode ? ` (${order.promoCode} applied)` : ""
      }`,
      count: order.quantity,
      unitPrice: order.unitPrice,
    });

    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof TicketOrderError) return fail(error.message, error.status);
    console.error("[tickets/checkout] error", error);
    return fail("Something went wrong. Please try again.", 500);
  }
}
