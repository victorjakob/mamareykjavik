import { NextResponse } from "next/server";
import crypto from "crypto";

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

  // HMAC verification
  const secretKey = process.env.SALTPAY_SECRET_KEY;
  const expected = crypto
    .createHmac("sha256", secretKey)
    .update(`${orderId}|${amount}|${currency}`, "utf8")
    .digest("hex");

  const resolveRedirect = (pathFallback) => {
    const baseCandidates = [
      process.env.SALTPAY_SHOP_RETURN_URL_SUCCESS,
      process.env.SALTPAY_RETURN_URL_SUCCESS,
      process.env.NEXT_PUBLIC_BASE_URL,
      "https://mama.is",
    ];

    for (const candidate of baseCandidates) {
      if (!candidate) continue;
      try {
        const url = new URL(candidate.trim());
        url.pathname = pathFallback;
        url.search = "";
        url.hash = "";
        return url.toString();
      } catch {
        continue;
      }
    }

    return new URL(pathFallback, request.url).toString();
  };

  if (orderhash !== expected) {
    // Bad hash → send them back to shop
    return NextResponse.redirect(resolveRedirect("/shop"), 303);
  }

  // Good hash → send them to your thank-you page as a GET
  return NextResponse.redirect(resolveRedirect("/shop/success"), 303);
}
