// POST /api/admin/memberships/[id]/resend-receipt
// -----------------------------------------------------------------------------
// Admin action — resend the most recent renewal_succeeded receipt for a sub.
// Useful when a member says "I never got the receipt." Does not charge; purely
// re-emails based on the most recent successful renewal event on file.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";
import { sendRenewalSucceededEmail } from "@/lib/membershipEmails";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") return { ok: false };
  return { ok: true, session };
}

export async function POST(_req, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = createServerSupabase();

  const { data: sub } = await supabase
    .from("membership_subscriptions")
    .select("id, member_email, member_name, tier, next_billing_date")
    .eq("id", id)
    .maybeSingle();

  if (!sub) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });

  const { data: lastEvent } = await supabase
    .from("membership_payment_events")
    .select("order_id, transaction_id, amount, currency, created_at")
    .eq("subscription_id", id)
    .in("event_type", ["renewal_succeeded", "initial_charge_succeeded"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!lastEvent) {
    return NextResponse.json(
      { error: "No successful charge on file for this subscription yet." },
      { status: 400 },
    );
  }

  try {
    const result = await sendRenewalSucceededEmail({
      to:              sub.member_email,
      name:            sub.member_name,
      amount:          lastEvent.amount,
      currency:        lastEvent.currency || "ISK",
      nextBillingDate: sub.next_billing_date,
      tier:            sub.tier,
      orderId:         lastEvent.order_id,
      transactionId:   lastEvent.transaction_id,
    });

    await supabase.from("membership_payment_events").insert({
      subscription_id: sub.id,
      member_email:    sub.member_email,
      event_type:      "admin_receipt_resent",
      message:         `Admin ${auth.session.user?.email || "unknown"} resent receipt for order ${lastEvent.order_id || "n/a"}.`,
    });

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("resend receipt crashed:", err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
