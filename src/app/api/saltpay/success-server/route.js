// SaltPay payment-success callback for ONLINE-PAID event tickets.
//
// Important nuance:
//   - This route is for tickets paid via SaltPay (online).
//   - api/sendgrid/ticket is for pay-at-the-door tickets.
// Both render the same brand template (paid-ticket-attendee-confirmation),
// but pass `paid: true` here so the headline and price label adapt.

import crypto from "crypto";
import { createServerSupabase } from "@/util/supabase/server";
import { createResend } from "@/lib/resend";
import {
  calculateTicketsSold,
  canPurchaseTickets,
} from "@/util/event-capacity-util";
import { renderEmail } from "@/emails/render.server";
import { enrolAndWelcome } from "@/lib/newsletter";

const resend = createResend();

// CORS preflight
export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req) {
  try {
    const supabase = createServerSupabase();

    // Parse SaltPay URL-encoded callback
    const bodyText = await req.text();
    const params = new URLSearchParams(bodyText);
    const body = Object.fromEntries(params);

    const { status, orderid, amount, currency, orderhash } = body;
    if (status !== "OK") {
      throw new Error("Payment not successful");
    }

    // Capture the gateway transaction id used for refunds later.
    // CRITICAL: this is the SecurePay HPP `refundid`, NOT `authorizationcode`.
    // (See note in src/app/api/payment/[id]/refund — RPG rejects the auth
    // code with "Invalid transaction identifier".)
    const teyaTransactionId =
      body.refundid ||
      body.RefundId ||
      body.transactionid ||
      body.TransactionId ||
      body.uniquereference ||
      body.UniqueReference ||
      body.authorizationcode ||
      body.AuthorizationCode ||
      body.t_id ||
      body.T_ID ||
      null;

    // Validate HMAC
    const secretKey = process.env.SALTPAY_SECRET_KEY;
    const orderHashMessage = `${orderid}|${amount}|${currency}`;
    const calculatedHash = crypto
      .createHmac("sha256", secretKey)
      .update(orderHashMessage, "utf8")
      .digest("hex");

    if (calculatedHash !== orderhash) {
      console.error("Order hash validation failed");
      throw new Error("Order hash validation failed");
    }

    // Pull ticket + event metadata
    const { data: ticketData, error: ticketError } = await supabase
      .from("tickets")
      .select(
        `
        quantity,
        variant_name,
        event_id,
        subscribe_to_newsletter,
        events (
          id,
          name,
          date,
          duration,
          host,
          host_secondary,
          location,
          capacity,
          sold_out
        )
      `
      )
      .eq("order_id", orderid)
      .single();

    if (ticketError) {
      console.error("Error fetching ticket details:", ticketError);
      throw ticketError;
    }

    // Capacity check (refund will be needed if oversold)
    const event = ticketData.events;
    const { data: allTickets, error: ticketsError } = await supabase
      .from("tickets")
      .select("quantity, status")
      .eq("event_id", event.id);

    if (ticketsError) {
      console.error("Error fetching tickets for capacity check:", ticketsError);
    } else {
      const ticketsSold = calculateTicketsSold(
        (allTickets || []).filter((t) => t.status !== "pending")
      );
      const purchaseCheck = canPurchaseTickets(event, ticketsSold, ticketData.quantity);

      if (!purchaseCheck.canPurchase) {
        const { error: cancelError } = await supabase
          .from("tickets")
          .update({
            status: "cancelled",
            buyer_email: body.buyeremail,
          })
          .eq("order_id", orderid);

        if (cancelError) {
          console.error("Error cancelling ticket:", cancelError);
        }

        return new Response(
          JSON.stringify({
            success: false,
            message:
              purchaseCheck.reason ||
              "Event is sold out. Payment will be refunded.",
          }),
          { status: 400 }
        );
      }
    }

    // Mark ticket paid + stamp transaction id + raw HPP payload
    const { error: updateError } = await supabase
      .from("tickets")
      .update({
        status:          "paid",
        buyer_email:     body.buyeremail,
        transaction_id:  teyaTransactionId,
        payment_payload: body,
      })
      .eq("order_id", orderid);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw updateError;
    }

    if (!teyaTransactionId) {
      console.warn(
        "[saltpay/success-server] no transaction id found in HPP callback for order",
        orderid,
        "— refund will have to be done in the Teya portal. Keys received:",
        Object.keys(body)
      );
    }

    // ── Buyer confirmation (paid online) ─────────────────────────────
    const buyer = await renderEmail("paid-ticket-attendee-confirmation", {
      userName: body.buyername,
      eventName: ticketData.events.name,
      eventDate: ticketData.events.date,
      duration: ticketData.events.duration,
      location: ticketData.events.location || "Bankastræti 2, 101 Reykjavík",
      price: amount,
      currency,
      paid: true,
      quantity: ticketData.quantity,
      variantName: ticketData.variant_name,
    });

    await resend.emails.send({
      from: "White Lotus <team@mama.is>",
      to: [body.buyeremail],
      replyTo: "team@mama.is",
      subject: `Your Ticket is Confirmed — ${ticketData.events.name}`,
      html: buyer.html,
      text: buyer.text,
    });

    // ── Host notification ────────────────────────────────────────────
    const hostRecipients = Array.from(
      new Set(
        [ticketData.events.host, ticketData.events.host_secondary]
          .map((e) => (typeof e === "string" ? e.trim() : ""))
          .filter(Boolean)
      )
    );

    if (hostRecipients.length > 0) {
      const host = await renderEmail("paid-ticket-host-notification", {
        eventName: ticketData.events.name,
        attendeeName: body.buyername,
        attendeeEmail: body.buyeremail,
        managerUrl: "https://mama.is/events/manager",
      });

      await resend.emails.send({
        from: "White Lotus <team@mama.is>",
        to: hostRecipients,
        replyTo: "team@mama.is",
        subject: `New Registration for ${ticketData.events.name}`,
        html: host.html,
        text: host.text,
      });
    }

    // ── Newsletter soft opt-in (ticket buyer) ───────────────────────
    // Fires only if the buyer kept the "weekly Mama letter" box ticked at
    // checkout. Runs after the confirmation email so a Resend hiccup here
    // never affects the buyer's ticket receipt.
    if (ticketData.subscribe_to_newsletter && body.buyeremail) {
      enrolAndWelcome({
        email: body.buyeremail,
        name: body.buyername,
        source: "ticket_buyer",
        consentBasis: "soft_optin_customer",
      }).catch((err) =>
        console.error("[saltpay/success] enrolAndWelcome failed", err),
      );
    }

    return new Response("<PaymentNotification>Accepted</PaymentNotification>", {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    });
  } catch (error) {
    console.error("Error in success callback:", error);
    return new Response("<PaymentNotification>Error</PaymentNotification>", {
      status: 400,
      headers: { "Content-Type": "application/xml" },
    });
  }
}
