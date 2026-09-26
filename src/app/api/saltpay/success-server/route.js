// SaltPay payment-success callback for ONLINE-PAID event tickets.
//
// Free / door tickets are confirmed in /api/tickets/checkout instead. Both
// use the same brand templates via lib/ticketEmails.js (`paid: true` here so
// the headline and price label adapt).

import { createServerSupabase } from "@/util/supabase/server";
import { verifyOrderHash } from "@/lib/tickets/saltpay";
import { sendPaidTicketEmails, sendTicketAlert } from "@/lib/ticketEmails";
import { enrolAndWelcome } from "@/lib/newsletter";
import { addToList } from "@/lib/subscribers";

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

    const { status, orderid, amount, currency } = body;
    if (status !== "OK") {
      throw new Error("Payment not successful");
    }

    if (!verifyOrderHash(body)) {
      console.error("Order hash validation failed");
      throw new Error("Order hash validation failed");
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

    const paidAmount = Number(String(amount ?? "").replace(",", "."));

    // One atomic, idempotent step in Postgres (confirm_ticket_payment):
    //   - a repeated callback for an already-paid order is a no-op
    //   - the amount must equal what the server priced the order at
    //   - a payment that arrives after its hold expired on a full event is
    //     still confirmed (the buyer paid) and flagged as oversold
    const { data: result, error: confirmError } = await supabase.rpc(
      "confirm_ticket_payment",
      {
        p_order_id: orderid,
        p_amount:
          currency === "ISK" && Number.isFinite(paidAmount) ? paidAmount : null,
        p_transaction_id: teyaTransactionId,
        p_payload: body,
        p_buyer_email: body.buyeremail || null,
      }
    );
    if (confirmError) throw confirmError;

    if (result?.result === "already_paid") {
      // Gateway retry — already handled, emails already sent.
      return accepted();
    }

    if (result?.result === "not_found") {
      throw new Error(`No ticket for order ${orderid}`);
    }

    if (result?.result === "amount_mismatch") {
      console.error("[saltpay/success-server] amount mismatch", result);
      await sendTicketAlert({
        subject: `Payment amount mismatch — order ${orderid}`,
        lines: [
          `Order: ${orderid}`,
          `Expected: ${result.expected} ISK`,
          `Received: ${amount} ${currency}`,
          `Buyer: ${body.buyername || ""} <${body.buyeremail || ""}>`,
          "The ticket was NOT confirmed. Check the payment in the Teya portal.",
        ],
      }).catch((err) => console.error("alert failed", err));
      throw new Error("Payment amount does not match the order");
    }

    if (!teyaTransactionId) {
      console.warn(
        "[saltpay/success-server] no transaction id found in HPP callback for order",
        orderid,
        "— refund will have to be done in the Teya portal. Keys received:",
        Object.keys(body)
      );
    }

    // Pull ticket + event metadata for the emails
    const { data: ticketData, error: ticketError } = await supabase
      .from("tickets")
      .select(
        `
        quantity,
        variant_name,
        event_id,
        subscribe_to_newsletter,
        buyer_name,
        buyer_email,
        events (
          id,
          name,
          date,
          duration,
          host,
          host_secondary,
          location,
          capacity,
          community_link,
          community_link_label,
          community_link_in_email
        )
      `
      )
      .eq("order_id", orderid)
      .single();

    if (ticketError) {
      console.error("Error fetching ticket details:", ticketError);
      throw ticketError;
    }

    const buyerEmail = body.buyeremail || ticketData.buyer_email;
    const buyerName = body.buyername || ticketData.buyer_name;

    if (result?.oversold) {
      await sendTicketAlert({
        subject: `Oversold: ${ticketData.events.name}`,
        lines: [
          `A payment arrived after the checkout hold expired and the event had filled up in the meantime.`,
          `The buyer HAS a confirmed ticket (they paid), so the event is now over capacity.`,
          ``,
          `Event: ${ticketData.events.name} (capacity ${ticketData.events.capacity})`,
          `Order: ${orderid} — ${ticketData.quantity} ticket(s), ${amount} ${currency}`,
          `Buyer: ${buyerName} <${buyerEmail}>`,
          ``,
          `Either make room, or contact the buyer and refund in the Teya portal.`,
        ],
      }).catch((err) => console.error("alert failed", err));
    }

    // ── Buyer confirmation + host notification ──────────────────────
    await sendPaidTicketEmails({
      event: ticketData.events,
      ticket: ticketData,
      buyerName,
      buyerEmail,
      amount,
      currency,
    });

    // ── Newsletter capture (every ticket buyer) ─────────────────────
    // Every buyer joins the subscriber list (soft opt-in as a customer). If
    // they kept the "weekly Mama letter" box ticked we also send the gentle
    // welcome email; otherwise we add them quietly. Either way this runs after
    // the confirmation email so a Resend hiccup never affects the receipt.
    // Anyone who has unsubscribed is skipped automatically downstream.
    if (buyerEmail) {
      if (ticketData.subscribe_to_newsletter) {
        enrolAndWelcome({
          email: buyerEmail,
          name: buyerName,
          source: "ticket_buyer",
          consentBasis: "soft_optin_customer",
        }).catch((err) =>
          console.error("[saltpay/success] enrolAndWelcome failed", err),
        );
      } else {
        addToList({
          email: buyerEmail,
          name: buyerName,
          source: "ticket_buyer",
        }).catch((err) =>
          console.error("[saltpay/success] addToList failed", err),
        );
      }
    }

    return accepted();
  } catch (error) {
    console.error("Error in success callback:", error);
    return new Response("<PaymentNotification>Error</PaymentNotification>", {
      status: 400,
      headers: { "Content-Type": "application/xml" },
    });
  }
}

function accepted() {
  return new Response("<PaymentNotification>Accepted</PaymentNotification>", {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });
}
