// GET /api/pay/<id>/start — the Pay button. Gives the link a fresh SecurePay
// orderid (so a retry never reuses one) and redirects to Teya's hosted page.
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import {
  isPaymentLinkId,
  isExpired,
  newPaymentLinkOrderId,
  buildPaymentLinkCheckoutUrl,
} from "@/lib/paymentLinks";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const { id } = await params;
  const back = NextResponse.redirect(new URL(`/pay/${id}`, req.url), 303);
  if (!isPaymentLinkId(id)) return back;

  try {
    const supabase = createServerSupabase();
    const { data: link, error } = await supabase
      .from("payment_links")
      .select("id, amount_isk, reference, customer_name, customer_contact, status, expires_at")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!link || link.status === "paid" || isExpired(link)) return back;

    const orderId = newPaymentLinkOrderId();
    const { error: upErr } = await supabase
      .from("payment_links")
      .update({ teya_order_id: orderId })
      .eq("id", id)
      .neq("status", "paid");
    if (upErr) throw upErr;

    return NextResponse.redirect(buildPaymentLinkCheckoutUrl({ orderId, link }), 303);
  } catch (err) {
    console.error("[payment-links] could not start checkout", err);
    return NextResponse.redirect(new URL("/pay/result?status=error", req.url), 303);
  }
}
