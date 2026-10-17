// SecurePay server-to-server success callback for payment links. Verifies the
// orderhash exactly like the ticket success-server route, then marks the
// payment_links row paid (idempotent) and emails the team. No tickets.
import { verifyOrderHash } from "@/lib/tickets/saltpay";
import { sendTicketAlert } from "@/lib/ticketEmails";
import { createServerSupabase } from "@/util/supabase/server";
import { isPaymentLinkId, formatIsk } from "@/lib/paymentLinks";

export const dynamic = "force-dynamic";

function xml(text, status = 200) {
  return new Response(`<PaymentNotification>${text}</PaymentNotification>`, {
    status,
    headers: { "Content-Type": "application/xml" },
  });
}

export async function POST(req) {
  try {
    const body = Object.fromEntries(new URLSearchParams(await req.text()));
    const { status, orderid, amount, currency, reference } = body;
    if (status !== "OK") throw new Error("Payment not successful");
    if (!verifyOrderHash(body)) throw new Error("Order hash validation failed");

    const supabase = createServerSupabase();
    // Find the link by its current orderid, else by the row id we sent as
    // `reference` (covers a customer who pressed Pay twice in two tabs).
    let { data: link } = await supabase
      .from("payment_links")
      .select("id, amount_isk, reference, customer_name, customer_contact, status, teya_order_id")
      .eq("teya_order_id", String(orderid))
      .maybeSingle();
    if (!link && isPaymentLinkId(reference)) {
      ({ data: link } = await supabase
        .from("payment_links")
        .select("id, amount_isk, reference, customer_name, customer_contact, status, teya_order_id")
        .eq("id", reference)
        .maybeSingle());
    }
    if (!link) throw new Error(`No payment link for order ${orderid}`);

    const paid = Number(String(amount ?? "").replace(",", "."));
    if (currency !== "ISK" || paid !== Number(link.amount_isk)) {
      console.error("[payment-links] amount mismatch", { orderid, amount, currency, expected: link.amount_isk });
    }

    const transactionId =
      body.refundid || body.RefundId || body.transactionid || body.authorizationcode || null;

    if (link.status === "paid") {
      // Gateway retry, or the link was paid a second time — alert either way.
      console.warn("[payment-links] callback for an already-paid link", { id: link.id, orderid });
      if (link.teya_order_id !== String(orderid)) {
        // Different orderid → a genuine second payment (e.g. two tabs).
        await sendTicketAlert({
          subject: `DUPLICATE payment link payment — ${link.reference}`,
          lines: [
            `The link for ${link.reference} (${link.amount_isk} ISK) was already paid,`,
            `and another payment just arrived: Teya order ${orderid}, ${amount} ${currency},`,
            `transaction id ${transactionId || "-"}. Refund one of them in the Teya portal.`,
          ],
        }).catch((err) => console.error("[payment-links] alert failed", err));
      }
    } else {
      const { error } = await supabase
        .from("payment_links")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          teya_order_id: String(orderid),
          teya_transaction_id: transactionId,
          callback_payload: body,
        })
        .eq("id", link.id)
        .neq("status", "paid");
      if (error) throw error;
      console.log("[payment-links] PAID", { id: link.id, orderid, amount, transactionId });

      await sendTicketAlert({
        subject: `Payment link paid — ${link.reference} (${formatIsk(link.amount_isk)} kr)`,
        lines: [
          `Reference: ${link.reference}`,
          `Amount: ${amount} ${currency} (link: ${link.amount_isk} ISK)`,
          `Customer: ${link.customer_name} ${link.customer_contact ? `<${link.customer_contact}>` : ""}`,
          `Teya order: ${orderid}`,
          `Teya refund/transaction id: ${transactionId || "-"}`,
          "",
          "Paid via a mama.is payment link. Update the related order manually if needed.",
        ],
      }).catch((err) => console.error("[payment-links] alert failed", err));
    }

    return xml("Accepted");
  } catch (err) {
    console.error("[payment-links] callback error", err?.message || err);
    return xml("Error", 400);
  }
}
