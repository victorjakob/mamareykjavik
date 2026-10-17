// Browser return from SecurePay for payment links (success / cancel / error).
// "Paid" is only shown when the orderhash checks out; the server callback
// (/api/pay/callback) is what marks the link paid. Cancel / error mark an
// unpaid link cancelled / failed (the customer can still retry).
import { NextResponse } from "next/server";
import { verifyOrderHash } from "@/lib/tickets/saltpay";
import { createServerSupabase } from "@/util/supabase/server";

export const dynamic = "force-dynamic";

async function handle(req, { params }) {
  const url = new URL(req.url);
  let { status } = await params;
  let fields = Object.fromEntries(url.searchParams);
  if (req.method === "POST") {
    const text = await req.text();
    fields = { ...fields, ...Object.fromEntries(new URLSearchParams(text)) };
  }

  if (status === "success") {
    if (!verifyOrderHash(fields)) status = "unverified";
  } else if ((status === "cancel" || status === "error") && fields.orderid) {
    try {
      await createServerSupabase()
        .from("payment_links")
        .update({ status: status === "cancel" ? "cancelled" : "failed" })
        .eq("teya_order_id", String(fields.orderid))
        .neq("status", "paid");
    } catch (err) {
      console.error("[payment-links] return status update failed", err);
    }
  }

  if (!["success", "cancel", "error", "unverified"].includes(status)) status = "error";
  return NextResponse.redirect(new URL(`/pay/result?status=${status}`, req.url), 303);
}

export const GET = handle;
export const POST = handle;
