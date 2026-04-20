// POST /api/admin/memberships/[id]/refund
// -----------------------------------------------------------------------------
// Admin action — refund a successful charge on a subscription (fully or
// partially). Uses Teya RPG's PUT /api/payment/{transactionId}/refund endpoint.
//
// Body: {
//   amount?:  number,   // ISK. Omit → full refund of the target charge.
//   reason?:  string,   // optional note (audit event + member email).
//   orderId?: string,   // optional — target a specific charge by its
//                       // membership_payment_events.order_id. If omitted,
//                       // we refund the most recent successful charge.
// }
//
// Flow:
//   1. Auth: admin only.
//   2. Load the sub.
//   3. Locate the charge:
//        • if body.orderId → fetch THAT charge event
//        • else            → fetch the most recent successful charge
//      (renewal_succeeded OR initial_charge_succeeded).
//   4. Call refundRpgCharge() — Teya actually moves the money.
//   5. Log a `refund_issued` event with the refund ref + reason.
//   6. Email the member.
//
// Non-goals (explicit):
//   - Does NOT change subscription status. The member keeps their current
//     period end. If we ever want "refund + immediately expire the card"
//     semantics, that's a follow-up.
//   - One refund call targets ONE charge. To refund several historical
//     charges, call the endpoint once per order_id.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";
import { refundRpgCharge, newOrderId } from "@/lib/membershipTeya";
import { sendRefundIssuedEmail } from "@/lib/membershipEmails";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") return { ok: false };
  return { ok: true, session };
}

export async function POST(req, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const requestedAmount = body?.amount != null ? Number(body.amount) : null;
  const reason = (body?.reason || "").toString().trim().slice(0, 300) || null;
  const targetOrderId = (body?.orderId || "").toString().trim() || null;

  if (requestedAmount != null && (!Number.isFinite(requestedAmount) || requestedAmount <= 0)) {
    return NextResponse.json({ error: "Refund amount must be a positive number." }, { status: 400 });
  }

  const supabase = createServerSupabase();

  // ─── 1. Load sub ────────────────────────────────────────────────────────
  const { data: sub } = await supabase
    .from("membership_subscriptions")
    .select("id, member_email, member_name, tier, price_amount, currency, status")
    .eq("id", id)
    .maybeSingle();
  if (!sub) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  if (sub.tier === "free") {
    return NextResponse.json({ error: "Free memberships have no charges to refund." }, { status: 400 });
  }

  // ─── 2. Find the target charge ──────────────────────────────────────────
  //
  // If the admin passed an `orderId`, we refund that specific charge. This is
  // what the Payments list in the drawer uses — each row's Refund button
  // targets its own order. If `orderId` is omitted we fall back to the most
  // recent successful charge (legacy "refund last charge" button).
  let lastChargeQuery = supabase
    .from("membership_payment_events")
    .select("id, order_id, transaction_id, amount, currency, created_at, event_type")
    .eq("subscription_id", id)
    .in("event_type", ["renewal_succeeded", "initial_charge_succeeded"]);

  if (targetOrderId) {
    lastChargeQuery = lastChargeQuery.eq("order_id", targetOrderId);
  }

  const { data: lastCharge } = await lastChargeQuery
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!lastCharge || !lastCharge.transaction_id) {
    return NextResponse.json(
      {
        error: targetOrderId
          ? `No successful charge with order_id ${targetOrderId} found for this subscription.`
          : "No successful charge with a Teya transaction id found for this subscription.",
      },
      { status: 400 },
    );
  }

  const originalAmount = Number(lastCharge.amount || sub.price_amount || 0);
  if (!originalAmount) {
    return NextResponse.json({ error: "Original charge amount is zero — nothing to refund." }, { status: 400 });
  }

  // ─── 3. Compute how much has already been refunded against this charge
  //        — so we don't try to exceed the original amount. ───────────────
  const { data: priorRefunds } = await supabase
    .from("membership_payment_events")
    .select("amount")
    .eq("subscription_id", id)
    .eq("event_type", "refund_issued")
    .eq("order_id", lastCharge.order_id);
  const alreadyRefunded = (priorRefunds || []).reduce(
    (sum, row) => sum + Number(row.amount || 0), 0,
  );
  const maxRefundable = originalAmount - alreadyRefunded;
  if (maxRefundable <= 0) {
    return NextResponse.json(
      { error: "This charge has already been fully refunded." },
      { status: 400 },
    );
  }

  const refundAmount = requestedAmount == null
    ? maxRefundable
    : Math.min(requestedAmount, maxRefundable);
  const isPartial = refundAmount < originalAmount;

  // ─── 4. Log the attempt so we have a paper trail even on Teya crashes ──
  //
  // Historical note: Supabase .insert() returns { error } rather than
  // throwing, so if this row is rejected (e.g. a CHECK constraint we haven't
  // updated) we used to lose the audit trail silently and the user would see
  // a bare 502 with nothing in the DB. We now surface any insert error to the
  // server logs so the Vercel function log always says *something*.
  const refundOrderId = newOrderId();
  {
    const { error: attemptLogError } = await supabase
      .from("membership_payment_events")
      .insert({
        subscription_id: sub.id,
        member_email:    sub.member_email,
        event_type:      "refund_attempted",
        order_id:        refundOrderId,
        amount:          refundAmount,
        currency:        lastCharge.currency || sub.currency || "ISK",
        message:         `Admin ${auth.session.user?.email || "unknown"} initiated ${
          isPartial ? "partial" : "full"
        } refund${reason ? ` — ${reason}` : ""}. Source txn ${lastCharge.transaction_id}.`,
      });
    if (attemptLogError) {
      console.error(
        "[refund] refund_attempted log insert failed for sub",
        sub.id,
        attemptLogError,
      );
    }
  }

  // ─── 5. Call Teya ───────────────────────────────────────────────────────
  //
  // Teya's /refund endpoint distinguishes full vs partial by BODY SHAPE:
  //   - Full refund → no body.
  //   - Partial refund → { PartialAmount: <integer> }.
  // So we only pass amountIsk when this is a partial; otherwise the helper
  // omits the body entirely (which is what Teya wants for "refund the whole
  // original transaction").
  const result = await refundRpgCharge({
    originalTransactionId: lastCharge.transaction_id,
    amountIsk:             isPartial ? refundAmount : undefined,
    orderId:               refundOrderId,
    currency:              lastCharge.currency || sub.currency || "ISK",
  });

  if (!result.ok) {
    // Always log to the server console first — if the DB insert below ever
    // fails silently again, we still have the Teya response somewhere we can
    // read (Vercel function logs).
    console.error("[refund] Teya refund failed for sub", sub.id, {
      actionCode: result.actionCode,
      message:    result.message,
      raw:        result.raw,
    });

    const { error: failLogError } = await supabase
      .from("membership_payment_events")
      .insert({
        subscription_id: sub.id,
        member_email:    sub.member_email,
        event_type:      "refund_failed",
        order_id:        refundOrderId,
        action_code:     result.actionCode || null,
        message:         result.message || "Refund declined by Teya",
        raw:             result.raw || {},
      });
    if (failLogError) {
      console.error(
        "[refund] refund_failed log insert failed for sub",
        sub.id,
        failLogError,
      );
    }
    return NextResponse.json(
      { error: result.message || "Refund failed", actionCode: result.actionCode },
      { status: 502 },
    );
  }

  // ─── 6. Log success + email member ──────────────────────────────────────
  {
    const { error: issuedLogError } = await supabase
      .from("membership_payment_events")
      .insert({
        subscription_id: sub.id,
        member_email:    sub.member_email,
        event_type:      "refund_issued",
        order_id:        lastCharge.order_id,        // link back to the original
        transaction_id:  result.transactionId,
        amount:          refundAmount,
        currency:        lastCharge.currency || sub.currency || "ISK",
        message:         `Refunded ${refundAmount} ${lastCharge.currency || "ISK"}${
          isPartial ? ` (partial of ${originalAmount})` : " (full)"
        }${reason ? ` — ${reason}` : ""}. Refund txn ${result.transactionId || "?"}.`,
        raw:             result.raw || {},
      });
    if (issuedLogError) {
      console.error(
        "[refund] refund_issued log insert failed for sub",
        sub.id,
        issuedLogError,
      );
    }
  }

  try {
    await sendRefundIssuedEmail({
      to:                  sub.member_email,
      name:                sub.member_name,
      amount:              refundAmount,
      currency:            lastCharge.currency || sub.currency || "ISK",
      isPartial,
      originalOrderId:     lastCharge.order_id,
      refundTransactionId: result.transactionId,
      reason,
    });
  } catch (mailErr) {
    console.error("sendRefundIssuedEmail failed for", sub.id, mailErr);
  }

  return NextResponse.json({
    ok: true,
    refundAmount,
    isPartial,
    refundTransactionId: result.transactionId,
    originalTransactionId: lastCharge.transaction_id,
    originalOrderId:     lastCharge.order_id,
  });
}
