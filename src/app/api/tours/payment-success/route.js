import { createServerSupabase } from "@/util/supabase/server";
import crypto from "crypto";

// This route handles SaltPay's server-to-server confirmation
export async function POST(req) {
  try {
    const supabase = createServerSupabase();

    // SaltPay sends form data (not JSON)
    const body = await req.formData();

    const status = body.get("status"); // Should be "Ok"
    const orderId = body.get("orderid");
    const amount = body.get("amount");
    const currency = body.get("currency");
    const orderhash = body.get("orderhash");

    console.log("body", body);
    console.log("status", status);
    console.log("orderId", orderId);
    console.log("amount", amount);
    console.log("currency", currency);
    console.log("orderhash", orderhash);

    // Double-check required fields
    if (!status || !orderId || !amount || !currency || !orderhash) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Initialize SaltPay payment
    const merchantId = process.env.SALTPAY_MERCHANT_ID;
    const secretKey = process.env.SALTPAY_SECRET_KEY;
    const paymentGatewayId = process.env.SALTPAY_PAYMENT_GATEWAY_ID;
    const baseUrl = process.env.SALTPAY_BASE_URL;

    // Debug log all environment variables (without sensitive data)
    console.log("Environment check:", {
      hasMerchantId: !!merchantId,
      hasSecretKey: !!secretKey,
      hasPaymentGatewayId: !!paymentGatewayId,
      baseUrl,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    });

    const baseReturnUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseReturnUrl) {
      throw new Error("NEXT_PUBLIC_BASE_URL environment variable is not set");
    }

    // Construct URLs
    const returnUrlSuccess = process.env.SALTPAY_TOURS_RETURN_URL_SUCCESS;
    const returnUrlCancel = process.env.SALTPAY_TOURS_RETURN_URL_CANCEL;
    const returnUrlError = process.env.SALTPAY_TOURS_RETURN_URL_ERROR;
    const returnUrlSuccessServer =
      process.env.SALTPAY_TOURS_RETURN_URL_SUCCESS_SERVER;

    // Debug log constructed URLs
    console.log("Constructed URLs:", {
      returnUrlSuccess,
      returnUrlCancel,
      returnUrlError,
      returnUrlSuccessServer,
    });

    // Validate URLs with better error messages
    [
      { name: "returnUrlSuccess", url: returnUrlSuccess },
      { name: "returnUrlCancel", url: returnUrlCancel },
      { name: "returnUrlError", url: returnUrlError },
      { name: "returnUrlSuccessServer", url: returnUrlSuccessServer },
    ].forEach(({ name, url }) => {
      if (!url || url.includes("null") || url.includes("undefined")) {
        throw new Error(`Invalid URL for ${name}: ${url}`);
      }
      try {
        new URL(url);
      } catch (err) {
        console.error(`Failed to construct URL for ${name}:`, url);
        throw new Error(`Invalid URL for ${name}: ${url}`);
      }
    });

    // Rebuild the hash to confirm authenticity
    const hashString = `${orderId}|${amount}|${currency}`;
    const expectedHash = crypto
      .createHmac("sha256", secretKey)
      .update(hashString, "utf8")
      .digest("hex");

    if (orderhash !== expectedHash) {
      console.error("Invalid SaltPay hash. Possible spoofing attempt.");
      return new Response("Invalid hash", { status: 400 });
    }

    if (status !== "OK") {
      console.error("Payment status was not OK");
      return new Response("Payment failed or was cancelled", { status: 400 });
    }

    // ✅ Update the booking in Supabase
    const { error } = await supabase
      .from("tour_bookings")
      .update({ payment_status: "paid" })
      .eq("order_id", orderId);

    if (error) {
      console.error("Failed to update booking as paid:", error);
      return new Response("Failed to update booking", { status: 500 });
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: `${process.env.NEXT_PUBLIC_BASE_URL}/tours/success`,
      },
    });
  } catch (err) {
    console.error("Unexpected error in payment confirmation:", err);
    return new Response("Internal server error", { status: 500 });
  }
}
