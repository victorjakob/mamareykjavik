// app/api/saltpay/success-server/route.js
import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServerSupabase } from "@/util/supabase/server";

// 1️⃣ Respond to CORS preflight
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*", // allow all origins
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(request) {
  const form = await request.formData();
  const status = form.get("status"); // "Ok"
  const orderhash = form.get("orderhash"); // SaltPay’s signature
  const orderId = form.get("orderid");
  const amount = form.get("amount");
  const currency = form.get("currency");

  // 1) Verify HMAC
  const secretKey = process.env.SALTPAY_SECRET_KEY;
  const expected = crypto
    .createHmac("sha256", secretKey)
    .update(`${orderId}|${amount}|${currency}`, "utf8")
    .digest("hex");

  if (orderhash !== expected) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // 2) Mark booking as paid
  const supabase = createServerSupabase();
  await supabase
    .from("tour_bookings")
    .update({ payment_status: "paid" })
    .eq("order_id", orderId);

  // For server callbacks, return XML response
  return new Response("<PaymentNotification>Accepted</PaymentNotification>", {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });
}
