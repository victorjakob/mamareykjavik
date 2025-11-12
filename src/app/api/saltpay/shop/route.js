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

    const normalizedEmail = buyer_email?.trim().toLowerCase() || null;

    let linkedUserEmail = null;
    if (normalizedEmail) {
      const { data: profileMatch, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (profileError) {
        if (profileError.code === "42P01") {
          console.warn(
            "[SaltPay Shop] profiles table not found; proceeding without linking user_email"
          );
        } else if (profileError.code !== "PGRST116") {
          throw profileError;
        }
      }

      if (profileMatch?.email) {
        linkedUserEmail = profileMatch.email;
      }
    }

    const shippingPayload =
      shipping_info || normalizedEmail || buyer_name
        ? {
            ...(shipping_info || {}),
            contactEmail: normalizedEmail,
            contactName: buyer_name?.trim() || null,
          }
        : null;

    // Generate a random 12 character SaltPay order ID
    const saltpayOrderId = crypto.randomBytes(6).toString("hex");

    // Create pending order in database (let id auto-increment)
    const { data: orderInsert, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_email: linkedUserEmail,
        price: amount,
        delivery: shipping_info?.method === "delivery",
        shipping_info: shippingPayload,
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

    const ensureUrl = (label, value) => {
      const trimmed = typeof value === "string" ? value.trim() : value;
      if (!trimmed) {
        throw new Error(`${label} is required`);
      }
      try {
        return new URL(trimmed).toString();
      } catch {
        throw new Error(`${label} must be a valid absolute URL (${trimmed})`);
      }
    };

    const resolveUrl = (
      primaryValue,
      primaryLabel,
      fallbackValue,
      fallbackLabel
    ) => {
      if (primaryValue) {
        return ensureUrl(primaryLabel, primaryValue);
      }
      if (fallbackValue) {
        return ensureUrl(fallbackLabel ?? primaryLabel, fallbackValue);
      }
      throw new Error(
        fallbackLabel
          ? `${primaryLabel} or ${fallbackLabel} must be set`
          : `${primaryLabel} must be set`
      );
    };

    const returnUrlSuccess = resolveUrl(
      process.env.SALTPAY_SHOP_RETURN_URL_SUCCESS,
      "SALTPAY_SHOP_RETURN_URL_SUCCESS",
      process.env.SALTPAY_RETURN_URL_SUCCESS,
      "SALTPAY_RETURN_URL_SUCCESS"
    );

    const returnUrlSuccessServer = resolveUrl(
      process.env.SALTPAY_SHOP_RETURN_URL_SUCCESS_SERVER,
      "SALTPAY_SHOP_RETURN_URL_SUCCESS_SERVER",
      process.env.SALTPAY_RETURN_URL_SUCCESS_SERVER,
      "SALTPAY_RETURN_URL_SUCCESS_SERVER"
    );

    const returnUrlCancel = resolveUrl(
      process.env.SALTPAY_SHOP_RETURN_URL_CANCEL,
      "SALTPAY_SHOP_RETURN_URL_CANCEL",
      process.env.SALTPAY_RETURN_URL_CANCEL,
      "SALTPAY_RETURN_URL_CANCEL"
    );

    const returnUrlError = resolveUrl(
      process.env.SALTPAY_SHOP_RETURN_URL_ERROR,
      "SALTPAY_SHOP_RETURN_URL_ERROR",
      process.env.SALTPAY_RETURN_URL_ERROR,
      "SALTPAY_RETURN_URL_ERROR"
    );

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
