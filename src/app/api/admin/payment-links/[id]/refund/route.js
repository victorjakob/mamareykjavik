// POST /api/admin/payment-links/[id]/refund — admin only. Full refund of a
// paid payment link through Teya, mirroring /api/admin/tickets/[id]/refund:
// payment links are SecurePay hosted-page payments like tickets, so the money
// moves via refundSecurePayCharge() using the SecurePay `refundid` captured in
// the callback (stored in payment_links.teya_transaction_id).
//
// No schema change: the table's status check only allows
// created/paid/failed/cancelled, so a refunded link keeps status 'paid' and
// the refund is recorded under callback_payload.refund
// { amount_isk, refunded_at, refund_transaction_id, by, reason }.
// The admin list shows such rows as "Refunded".
//
// Unlike ticket refunds, no email is sent to the customer (the contact may be
// a phone number); the team gets an internal alert instead.

import { NextResponse } from "next/server";
import { requireAdminSession, jsonError } from "@/lib/api/session";
import { createServerSupabase } from "@/util/supabase/server";
import { refundSecurePayCharge } from "@/lib/membershipTeya";
import { sendTicketAlert } from "@/lib/ticketEmails";
import { isPaymentLinkId } from "@/lib/paymentLinks";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req, { params }) {
  const session = await requireAdminSession();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  if (!isPaymentLinkId(id)) return jsonError("Payment link not found", 404);
  const body = await req.json().catch(() => ({}));
  const reason = (body?.reason || "").toString().trim().slice(0, 300) || null;

  const supabase = createServerSupabase();
  const { data: link, error: loadErr } = await supabase
    .from("payment_links")
    .select("id, amount_isk, reference, customer_name, customer_contact, status, teya_order_id, teya_transaction_id, callback_payload")
    .eq("id", id)
    .maybeSingle();
  if (loadErr) return jsonError(loadErr);
  if (!link) return jsonError("Payment link not found", 404);

  if (link.status !== "paid") {
    return jsonError(`Only paid links can be refunded (status: "${link.status}").`, 400);
  }
  if (link.callback_payload?.refund) {
    return jsonError("This payment link has already been refunded.", 400);
  }
  if (!link.teya_transaction_id) {
    return jsonError(
      "No Teya refund id on file for this payment — refund it in the Teya portal instead.",
      400
    );
  }

  const result = await refundSecurePayCharge({
    refundId: link.teya_transaction_id,
    amountIsk: link.amount_isk,
    orderId: link.teya_order_id,
  });
  if (!result.ok) {
    console.error("[payment-link-refund] Teya refund failed", link.id, {
      actionCode: result.actionCode,
      message: result.message,
      raw: result.raw,
    });
    return NextResponse.json(
      { error: result.message || "Refund failed at Teya", actionCode: result.actionCode },
      { status: 502 }
    );
  }

  const refund = {
    amount_isk: link.amount_isk,
    refunded_at: new Date().toISOString(),
    refund_transaction_id: result.transactionId || null,
    by: session.user?.email || null,
    reason,
  };
  const { error: saveErr } = await supabase
    .from("payment_links")
    .update({ callback_payload: { ...(link.callback_payload || {}), refund } })
    .eq("id", link.id);
  if (saveErr) {
    // Teya already moved the money — don't report failure (admin might retry).
    console.error("[payment-link-refund] refund SUCCEEDED but DB update failed", link.id, saveErr);
  }

  await sendTicketAlert({
    subject: `Payment link refunded — ${link.reference} (${link.amount_isk} ISK)`,
    lines: [
      `Reference: ${link.reference}`,
      `Customer: ${link.customer_name} ${link.customer_contact ? `<${link.customer_contact}>` : ""}`,
      `Refunded: ${link.amount_isk} ISK by ${refund.by || "-"}`,
      `Teya order: ${link.teya_order_id || "-"} · refund transaction: ${refund.refund_transaction_id || "-"}`,
      reason ? `Reason: ${reason}` : "",
    ],
  }).catch((err) => console.error("[payment-link-refund] alert failed", err));

  return NextResponse.json({
    ok: true,
    refund,
    dbWarning: saveErr ? "Refund completed at Teya, but saving it failed — please refresh." : null,
  });
}
