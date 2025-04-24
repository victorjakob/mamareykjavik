// app/api/saltpay/success/route.js
import { NextResponse } from "next/server";
import crypto from "crypto";

// (Optional) CORS preflight
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(request) {
  const form = await request.formData();
  const orderhash = form.get("orderhash");
  const orderId = form.get("orderid");
  const amount = form.get("amount");
  const currency = form.get("currency");

  console.log("🔑 Success client callback received");

  // HMAC verification
  const secretKey = process.env.SALTPAY_SECRET_KEY;
  const expected = crypto
    .createHmac("sha256", secretKey)
    .update(`${orderId}|${amount}|${currency}`, "utf8")
    .digest("hex");

  if (orderhash !== expected) {
    // Bad hash → send them back to tours listing
    return NextResponse.redirect(new URL("/tours", request.url), 303);
  }

  // Good hash → send them to your thank-you page as a GET
  console.log("🔑 Success client callback sent");
  return NextResponse.redirect(new URL("/tours/success", request.url), 303);
}
