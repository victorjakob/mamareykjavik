import crypto from "crypto";
import { supabase } from "@/lib/supabase";

export async function POST(req) {
  try {
    const body = await req.json();
    const { amount, eventId, items, buyer_email, buyer_name, quantity } = body;

    // Generate a random 12 character order ID
    const orderId = crypto.randomBytes(6).toString("hex");

    // Create pending ticket in database
    const { error: ticketError } = await supabase.from("tickets").insert({
      order_id: orderId,
      event_id: eventId,
      status: "pending",
      buyer_email: buyer_email,
      quantity: quantity,
    });

    if (ticketError) throw ticketError;

    const merchantId = process.env.SALTPAY_MERCHANT_ID;
    const secretKey = process.env.SALTPAY_SECRET_KEY;
    const paymentGatewayId = process.env.SALTPAY_PAYMENT_GATEWAY_ID;
    const baseUrl = process.env.SALTPAY_BASE_URL;

    const returnUrlSuccess = process.env.SALTPAY_RETURN_URL_SUCCESS;
    const returnUrlCancel = process.env.SALTPAY_RETURN_URL_CANCEL;
    const returnUrlError = process.env.SALTPAY_RETURN_URL_ERROR;

    // Validate URLs
    [returnUrlSuccess, returnUrlCancel, returnUrlError].forEach((url) => {
      try {
        new URL(url);
      } catch {
        throw new Error(`Invalid URL: ${url}`);
      }
    });

    // Generate HMAC `checkhash`
    const checkHashMessage = `${merchantId}|${returnUrlSuccess}|${returnUrlSuccess}|${orderId}|${amount.toFixed(
      2
    )}|ISK`;
    const checkHash = crypto
      .createHmac("sha256", secretKey)
      .update(checkHashMessage, "utf8")
      .digest("hex");

    const formData = {
      amount: amount.toFixed(2),
      merchantid: merchantId,
      paymentgatewayid: paymentGatewayId,
      checkhash: checkHash,
      orderid: orderId,
      currency: "ISK",
      language: "EN",
      returnurlsuccess: returnUrlSuccess,
      returnurlcancel: returnUrlCancel,
      returnurlerror: returnUrlError,
      buyername: buyer_name,
      buyeremail: buyer_email,
      itemdescription_0: items[0].description,
      itemcount_0: items[0].count,
      itemunitamount_0: items[0].unitPrice.toFixed(2),
      itemamount_0: items[0].totalPrice.toFixed(2),
    };

    return new Response(
      JSON.stringify({
        url: `${baseUrl}?${new URLSearchParams(formData).toString()}`,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}
