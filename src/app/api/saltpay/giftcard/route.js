import crypto from "crypto";
import { createServerSupabase } from "@/util/supabase/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      amount,
      gift_card_amount,
      buyer_email,
      buyer_name,
      recipient_email,
      recipient_name,
      delivery_method,
      shipping_address,
      shipping_cost,
    } = body;

    // Validate required fields
    if (
      !amount ||
      !gift_card_amount ||
      !buyer_email ||
      !buyer_name ||
      !delivery_method
    ) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Validate delivery method
    if (!["email", "pickup", "mail"].includes(delivery_method)) {
      return new Response(
        JSON.stringify({ message: "Invalid delivery method" }),
        { status: 400 }
      );
    }

    // Validate shipping address for mail delivery
    if (delivery_method === "mail" && !shipping_address) {
      return new Response(
        JSON.stringify({
          message: "Shipping address is required for mail delivery",
        }),
        { status: 400 }
      );
    }

    // Generate a random order ID
    const orderId = crypto.randomBytes(6).toString("hex");

    // Create pending gift card in database
    const supabaseClient = createServerSupabase();
    const { error: cardError } = await supabaseClient
      .from("gift_cards")
      .insert({
        order_id: orderId,
        status: "pending",
        buyer_email: buyer_email,
        buyer_name: buyer_name,
        recipient_email: recipient_email || null,
        recipient_name: recipient_name || null,
        amount: gift_card_amount,
        remaining_balance: gift_card_amount,
        delivery_method: delivery_method,
        shipping_address: shipping_address || null,
        shipping_cost: shipping_cost || 0,
        price: amount,
      });

    if (cardError) {
      console.error("Error creating gift card:", cardError);
      // If table doesn't exist, provide helpful error message
      if (
        cardError.code === "42P01" ||
        cardError.message?.includes("does not exist")
      ) {
        throw new Error(
          "Gift cards table not found. Please run the database migration: database-migrations/create-gift-cards-table.sql"
        );
      }
      throw cardError;
    }

    // SaltPay configuration
    const merchantId = process.env.SALTPAY_MERCHANT_ID;
    const secretKey = process.env.SALTPAY_SECRET_KEY;
    const paymentGatewayId = process.env.SALTPAY_PAYMENT_GATEWAY_ID;
    const baseUrl = process.env.SALTPAY_BASE_URL;

    // Use NEXT_PUBLIC_BASE_URL (set in .env) or fallback to production URL
    const baseUrlForCallbacks =
      process.env.NEXT_PUBLIC_BASE_URL || "https://mama.is";

    // Gift card return URLs
    const returnUrlSuccess =
      process.env.SALTPAY_GIFTCARD_RETURN_URL_SUCCESS ||
      `${baseUrlForCallbacks}/giftcard/success`;
    const returnUrlSuccessServer =
      process.env.SALTPAY_GIFTCARD_RETURN_URL_SUCCESS_SERVER ||
      `${baseUrlForCallbacks}/api/saltpay/giftcard/success-server`;
    const returnUrlCancel =
      process.env.SALTPAY_GIFTCARD_RETURN_URL_CANCEL ||
      `${baseUrlForCallbacks}/giftcard/cancelled`;
    const returnUrlError =
      process.env.SALTPAY_GIFTCARD_RETURN_URL_ERROR ||
      `${baseUrlForCallbacks}/giftcard/error`;

    // Validate URLs
    [returnUrlSuccess, returnUrlCancel, returnUrlError].forEach((url) => {
      try {
        new URL(url);
      } catch {
        throw new Error(`Invalid URL: ${url}`);
      }
    });

    // Debug log for testing (remove in production)
    if (process.env.NODE_ENV === "development") {
      console.log("[Gift Card Payment] Return URLs:", {
        success: returnUrlSuccess,
        successServer: returnUrlSuccessServer,
        cancel: returnUrlCancel,
        error: returnUrlError,
      });
    }

    // Generate HMAC `checkhash`
    const checkHashMessage = `${merchantId}|${returnUrlSuccess}|${returnUrlSuccessServer}|${orderId}|${amount.toFixed(
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
      returnurlsuccessserver: returnUrlSuccessServer,
      returnurlcancel: returnUrlCancel,
      returnurlerror: returnUrlError,
      buyername: buyer_name,
      buyeremail: buyer_email,
      itemdescription_0: `Gift Card - ${gift_card_amount} kr`,
      itemcount_0: 1,
      itemunitamount_0: amount.toFixed(2),
      itemamount_0: amount.toFixed(2),
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
