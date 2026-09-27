import crypto from "crypto";
import { createServerSupabase } from "@/util/supabase/server";
import { getCartOwner, fetchCartData, cartSubtotal } from "@/lib/shop/cart.server";
import { getShippingCost } from "@/lib/shop/shipping";

export async function POST(req) {
  try {
    const supabase = createServerSupabase();
    const body = await req.json();
    const { buyer_email, buyer_name, shipping_info } = body;

    // ── Price the order on the server ─────────────────────────────────
    // The cart is the caller's own pending cart (session email / guest_id
    // cookie); product prices come from the database; shipping from the
    // shared price table. Nothing price-related is taken from the browser.
    const owner = await getCartOwner();
    const { cart, items: cartItems } = await fetchCartData(owner);
    if (!cart || cartItems.length === 0) {
      return new Response(JSON.stringify({ message: "Your cart is empty" }), {
        status: 400,
      });
    }
    const cart_id = cart.id;
    const isDelivery = shipping_info?.method === "delivery";
    const shippingCost = isDelivery
      ? getShippingCost(shipping_info?.shippingOption, shipping_info?.zip)
      : 0;
    if (isDelivery && !shippingCost) {
      return new Response(
        JSON.stringify({ message: "Please choose a shipping option" }),
        { status: 400 }
      );
    }
    const subtotal = cartSubtotal(cartItems);
    const amount = subtotal + shippingCost;
    const items = [
      ...cartItems.map((item) => ({
        description: item.products?.name || "Item",
        count: item.quantity,
        unitPrice: Number(item.products?.price) || 0,
        totalPrice: (Number(item.products?.price) || 0) * item.quantity,
      })),
      ...(shippingCost > 0
        ? [{ description: "Shipping", count: 1, unitPrice: shippingCost, totalPrice: shippingCost }]
        : []),
    ];

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
            shippingCost,
            contactEmail: normalizedEmail,
            contactName: buyer_name?.trim() || null,
          }
        : null;

    // ── Free order (total 0): record it as paid, no payment page ──────
    if (amount === 0) {
      const { data: freeOrder, error: freeOrderError } = await supabase
        .from("orders")
        .insert({
          user_email: linkedUserEmail,
          price: 0,
          delivery: isDelivery,
          shipping_info: shippingPayload,
          cart_id,
          payment_status: "paid",
        })
        .select("id")
        .single();
      if (freeOrderError) throw freeOrderError;

      const { error: cartError } = await supabase
        .from("carts")
        .update({ status: "paid" })
        .eq("id", cart_id);
      if (cartError) console.error("[shop] Failed to update cart status:", cartError);

      const { error: orderItemsError } = await supabase.from("order_items").insert(
        cartItems.map((item) => ({
          order_id: freeOrder.id,
          product_id: item.product_id,
          product_name: item.products?.name || null,
          product_price: item.products?.price || item.price || null,
          quantity: item.quantity,
          unit_price: item.products?.price || item.price || null,
          total_price: (item.products?.price || item.price || 0) * item.quantity,
        }))
      );
      if (orderItemsError) console.error("[shop] Failed to insert order items:", orderItemsError);

      return new Response(JSON.stringify({ free: true }), { status: 200 });
    }

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
