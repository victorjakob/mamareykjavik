import crypto from "crypto";
import { createServerSupabase } from "@/util/supabase/server";

export async function POST(req) {
  try {
    const supabase = createServerSupabase();
    const body = await req.json();
    const {
      amount,
      cart_id,
      items,
      buyer_email,
      buyer_name,
      shipping_info,
      delivery,
    } = body;

    // Defensive check
    if (!Array.isArray(items)) {
      throw new Error("items must be an array");
    }

    // Generate a random 12 character SaltPay order ID
    const saltpayOrderId = crypto.randomBytes(6).toString("hex");

    // Create pending order in database (let id auto-increment)
    const { data: orderInsert, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_email: buyer_email,
        price: amount,
        delivery: shipping_info?.method === "delivery",
        shipping_info: shipping_info || null,
        cart_id: cart_id,
        payment_status: "pending",
        saltpay_order_id: saltpayOrderId,
      })
      .select("id, saltpay_order_id")
      .single();
    if (orderError) throw orderError;

    // SaltPay config
    const merchantId = process.env.SALTPAY_MERCHANT_ID;
    const secretKey = process.env.SALTPAY_SECRET_KEY;
    const paymentGatewayId = process.env.SALTPAY_PAYMENT_GATEWAY_ID;
    const baseUrl = process.env.SALTPAY_BASE_URL;

    if (!baseUrl) {
      throw new Error("SaltPay base URL is not configured");
    }

    let paymentBaseUrl;
    try {
      paymentBaseUrl = new URL(baseUrl);
    } catch {
      throw new Error(`Invalid SaltPay base URL: ${baseUrl}`);
    }

    const callbackBase = process.env.NEXT_PUBLIC_BASE_URL || "https://mama.is";

    let callbackBaseUrl;
    try {
      callbackBaseUrl = new URL(callbackBase);
    } catch {
      throw new Error(`Invalid SaltPay callback base URL: ${callbackBase}`);
    }

    const buildUrl = (candidate, fallbackPath) => {
      if (candidate) {
        try {
          return new URL(candidate).toString();
        } catch {
          throw new Error(`Invalid URL: ${candidate}`);
        }
      }
      return new URL(fallbackPath, callbackBaseUrl).toString();
    };

    const returnUrlSuccess = buildUrl(
      process.env.SALTPAY_SHOP_RETURN_URL_SUCCESS ||
        process.env.SALTPAY_RETURN_URL_SUCCESS,
      "/shop/success"
    );

    const returnUrlSuccessServer = buildUrl(
      process.env.SALTPAY_SHOP_RETURN_URL_SUCCESS_SERVER ||
        process.env.SALTPAY_RETURN_URL_SUCCESS_SERVER,
      "/api/saltpay/shop/success-server"
    );

    const returnUrlCancel = buildUrl(
      process.env.SALTPAY_SHOP_RETURN_URL_CANCEL ||
        process.env.SALTPAY_RETURN_URL_CANCEL,
      "/shop/cancelled"
    );

    const returnUrlError = buildUrl(
      process.env.SALTPAY_SHOP_RETURN_URL_ERROR ||
        process.env.SALTPAY_RETURN_URL_ERROR,
      "/shop/error"
    );

    // Validate URLs
    [
      returnUrlSuccess,
      returnUrlSuccessServer,
      returnUrlCancel,
      returnUrlError,
    ].forEach((url) => {
      try {
        new URL(url);
      } catch {
        throw new Error(`Invalid URL: ${url}`);
      }
    });

    // Generate HMAC `checkhash`
    const checkHashMessage = `${merchantId}|${returnUrlSuccess}|${returnUrlSuccessServer}|${saltpayOrderId}|${amount.toFixed(
      2
    )}|ISK`;
    const checkHash = crypto
      .createHmac("sha256", secretKey)
      .update(checkHashMessage, "utf8")
      .digest("hex");

    // Prepare SaltPay form data
    const formData = {
      amount: amount.toFixed(2),
      merchantid: merchantId,
      paymentgatewayid: paymentGatewayId,
      checkhash: checkHash,
      orderid: saltpayOrderId,
      currency: "ISK",
      language: "EN",
      returnurlsuccess: returnUrlSuccess,
      returnurlsuccessserver: returnUrlSuccessServer,
      returnurlcancel: returnUrlCancel,
      returnurlerror: returnUrlError,
      buyername: buyer_name,
      buyeremail: buyer_email,
    };

    // Add all items to formData
    items.forEach((item, index) => {
      formData[`itemdescription_${index}`] = item.description;
      formData[`itemcount_${index}`] = item.count;
      formData[`itemunitamount_${index}`] = item.unitPrice.toFixed(2);
      formData[`itemamount_${index}`] = item.totalPrice.toFixed(2);
    });

    paymentBaseUrl.search = new URLSearchParams(formData).toString();

    return new Response(
      JSON.stringify({
        url: paymentBaseUrl.toString(),
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
