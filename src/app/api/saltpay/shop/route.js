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

    // Debug: log the shipping_info received
    console.log("shipping_info received:", shipping_info);

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
    const returnUrlSuccess = process.env.SALTPAY_SHOP_RETURN_URL_SUCCESS;
    const returnUrlSuccessServer =
      process.env.SALTPAY_SHOP_RETURN_URL_SUCCESS_SERVER;
    const returnUrlCancel = process.env.SALTPAY_SHOP_RETURN_URL_CANCEL;
    const returnUrlError = process.env.SALTPAY_SHOP_RETURN_URL_ERROR;

    // Validate URLs
    [returnUrlSuccess, returnUrlCancel, returnUrlError].forEach((url) => {
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
