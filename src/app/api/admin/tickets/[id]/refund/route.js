// POST /api/admin/tickets/[id]/refund
// -----------------------------------------------------------------------------
// Refund an event ticket that was paid through Teya's hosted payment page
// (the /api/saltpay path). Mirrors the membership refund route — same helper,
// same Teya endpoint (PUT /api/payment/{transactionId}/refund) — but keyed
// against the `tickets` row rather than a membership subscription.
//
// Gating:
//   - Admins always pass.
//   - Event hosts pass if the session email matches the event's `host` or
//     `host_secondary` column. Same rule the attendance page implicitly uses
//     today for everything else.
//
// Body: {
//   amount?: number,  // ISK. Omit → full refund of the ticket's total_price.
//   reason?: string,  // optional note (surfaced in the buyer email).
// }
//
// Flow:
//   1. Auth (admin OR event host).
//   2. Load the ticket + parent event.
//   3. Guard rails:
//        • must have a transaction_id on file (legacy tickets bought before
//          we started capturing it → 400 "refund via Teya portal").
//        • can't refund a ticket already marked refund_status='refunded'.
//        • partial refunds can't exceed remaining refundable.
//   4. Call refundRpgCharge() — Teya moves the money.
//   5. Update the ticket row (refunded_at, refund_amount, refund_status,
//      refund_transaction_id).
//   6. Email the buyer.
//
// Non-goals: we do NOT change the ticket's `status` field. `status='paid'`
// still describes what the buyer originally did; the refund state lives in
// refund_status so reports can tell "paid → fully refunded" apart from
// "never paid".

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";
import { refundRpgCharge } from "@/lib/membershipTeya";
import { sendTicketRefundEmail } from "@/lib/ticketEmails";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email || null;
  const role  = session?.user?.role  || null;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing ticket id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const requestedAmount = body?.amount != null ? Number(body.amount) : null;
  const reason = (body?.reason || "").toString().trim().slice(0, 300) || null;

  if (requestedAmount != null && (!Number.isFinite(requestedAmount) || requestedAmount <= 0)) {
    return NextResponse.json(
      { error: "Refund amount must be a positive number." },
      { status: 400 },
    );
  }

  const supabase = createServerSupabase();

  // ─── 1. Load ticket + its parent event ──────────────────────────────────
  const { data: ticket, error: loadErr } = await supabase
    .from("tickets")
    .select(`
      id, order_id, buyer_email, buyer_name, quantity, total_price, price,
      status, transaction_id, refund_status, refund_amount, refund_transaction_id,
      refunded_at, event_id,
      events ( id, name, date, host, host_secondary )
    `)
    .eq("id", id)
    .maybeSingle();

  if (loadErr || !ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  // ─── 2. Auth: admin OR event host ───────────────────────────────────────
  const ev = ticket.events || {};
  const isHost =
    (typeof ev.host === "string" && ev.host.trim().toLowerCase() === email.toLowerCase()) ||
    (typeof ev.host_secondary === "string" && ev.host_secondary.trim().toLowerCase() === email.toLowerCase());
  if (role !== "admin" && !isHost) {
    return NextResponse.json({ error: "Not authorized to refund this ticket." }, { status: 403 });
  }

  // ─── 3. Guard rails ─────────────────────────────────────────────────────
  if (!["paid", "card"].includes(ticket.status)) {
    return NextResponse.json(
      { error: `Only card-paid tickets can be refunded here (current status: "${ticket.status}").` },
      { status: 400 },
    );
  }
  if (!ticket.transaction_id) {
    return NextResponse.json(
      {
        error:
          "This ticket was purchased before we started capturing the Teya " +
          "transaction id, so it can't be refunded automatically. Please refund " +
          "it in the Teya merchant portal and then mark it manually.",
      },
      { status: 400 },
    );
  }
  if (ticket.refund_status === "refunded") {
    return NextResponse.json(
      { error: "This ticket has already been fully refunded." },
      { status: 400 },
    );
  }

  const originalAmount = Number(ticket.total_price || (ticket.price * ticket.quantity) || 0);
  if (!originalAmount) {
    return NextResponse.json(
      { error: "Ticket total is zero — nothing to refund." },
      { status: 400 },
    );
  }

  const alreadyRefunded = Number(ticket.refund_amount || 0);
  const maxRefundable   = originalAmount - alreadyRefunded;
  if (maxRefundable <= 0) {
    return NextResponse.json(
      { error: "This ticket has already been fully refunded." },
      { status: 400 },
    );
  }

  const refundAmount = requestedAmount == null
    ? maxRefundable
    : Math.min(requestedAmount, maxRefundable);
  const isPartial = refundAmount < originalAmount;

  // ─── 4. Call Teya ───────────────────────────────────────────────────────
  const result = await refundRpgCharge({
    originalTransactionId: ticket.transaction_id,
    amountIsk:             isPartial ? refundAmount : undefined,
    currency:              "ISK",
  });

  if (!result.ok) {
    console.error("[ticket-refund] Teya refund failed for ticket", ticket.id, {
      actionCode: result.actionCode,
      message:    result.message,
      raw:        result.raw,
    });
    return NextResponse.json(
      { error: result.message || "Refund failed at Teya", actionCode: result.actionCode },
      { status: 502 },
    );
  }

  // ─── 5. Update the ticket row ───────────────────────────────────────────
  const newTotalRefunded = alreadyRefunded + refundAmount;
  const newRefundStatus  = newTotalRefunded >= originalAmount ? "refunded" : "partial";

  const { error: saveErr } = await supabase
    .from("tickets")
    .update({
      refund_status:         newRefundStatus,
      refund_amount:         newTotalRefunded,
      refund_transaction_id: result.transactionId || ticket.refund_transaction_id || null,
      refunded_at:           new Date().toISOString(),
    })
    .eq("id", ticket.id);

  if (saveErr) {
    // Teya already moved the money — we must not 502 here or the admin will
    // think the refund failed and try again. Log loudly and report OK with a
    // warning field so the UI can surface it.
    console.error(
      "[ticket-refund] Teya refund SUCCEEDED but DB update failed for ticket",
      ticket.id,
      saveErr,
    );
  }

  // ─── 6. Email the buyer ─────────────────────────────────────────────────
  try {
    await sendTicketRefundEmail({
      to:                  ticket.buyer_email,
      buyerName:           ticket.buyer_name,
      eventName:           ev.name,
      eventDate:           ev.date,
      amount:              refundAmount,
      currency:            "ISK",
      isPartial,
      originalOrderId:     ticket.order_id,
      refundTransactionId: result.transactionId,
      reason,
    });
  } catch (mailErr) {
    console.error("sendTicketRefundEmail failed for ticket", ticket.id, mailErr);
  }

  return NextResponse.json({
    ok: true,
    refundAmount,
    isPartial,
    refundStatus:         newRefundStatus,
    refundTotal:          newTotalRefunded,
    refundTransactionId:  result.transactionId,
    originalTransactionId: ticket.transaction_id,
    originalOrderId:      ticket.order_id,
    dbWarning:            saveErr ? "Refund completed at Teya, but the ticket row update failed — please refresh." : null,
  });
}
