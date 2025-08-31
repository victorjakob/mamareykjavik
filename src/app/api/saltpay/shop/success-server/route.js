import crypto from "crypto";
import { createServerSupabase } from "@/util/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req) {
  try {
    const supabase = createServerSupabase();
    // Parse SaltPay callback (URL-encoded)
    const bodyText = await req.text();
    const params = new URLSearchParams(bodyText);
    const body = Object.fromEntries(params);

    const { status, orderid, amount, currency, orderhash } = body;
    if (status !== "OK") {
      throw new Error("Payment not successful");
    }

    // Validate HMAC
    const secretKey = process.env.SALTPAY_SECRET_KEY;
    const orderHashMessage = `${orderid}|${amount}|${currency}`;
    const calculatedHash = crypto
      .createHmac("sha256", secretKey)
      .update(orderHashMessage, "utf8")
      .digest("hex");
    if (calculatedHash !== orderhash) {
      throw new Error("Order hash validation failed");
    }

    // Find the order by saltpay_order_id
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "id, user_email, shipping_info, cart_id, price, saltpay_order_id, payment_status, delivery"
      )
      .eq("saltpay_order_id", orderid)
      .single();

    if (orderError || !order) {
      console.error(
        "[SaltPay Success-Server] Order not found for saltpay_order_id:",
        orderid
      );
      throw new Error("Order not found");
    }

    // Update order: set payment_status to 'paid' (do NOT update shipping_info)
    const { error: updateOrderError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
      })
      .eq("saltpay_order_id", orderid);
    if (updateOrderError) {
      console.error(
        "[SaltPay Success-Server] Failed to update order status:",
        updateOrderError
      );
      throw updateOrderError;
    }

    // Mark the cart as paid
    if (order.cart_id) {
      const { error: updateCartError } = await supabase
        .from("carts")
        .update({ status: "paid" })
        .eq("id", order.cart_id);
      if (updateCartError) {
        console.error(
          "[SaltPay Success-Server] Failed to update cart status:",
          updateCartError
        );
        // Not throwing here to avoid breaking the payment flow
      }
    }

    // Get cart items for this order
    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("id")
      .eq("id", order.cart_id)
      .single();
    if (cartError || !cart) {
      throw new Error("Cart not found");
    }
    const { data: cartItems, error: cartItemsError } = await supabase
      .from("cart_items")
      .select("product_id, quantity, price, products(name, price)")
      .eq("cart_id", cart.id);
    if (cartItemsError) {
      throw cartItemsError;
    }

    // Insert order_items for this order
    if (order.id && cartItems.length > 0) {
      const orderItemsToInsert = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.products?.name || null,
        product_price: item.products?.price || item.price || null,
        quantity: item.quantity,
        unit_price: item.products?.price || item.price || null,
        total_price: (item.products?.price || item.price || 0) * item.quantity,
      }));
      const { error: orderItemsError } = await supabase
        .from("order_items")
        .insert(orderItemsToInsert);
      if (orderItemsError) {
        console.error("Failed to insert order_items:", orderItemsError);
        // Not throwing to avoid breaking payment flow
      }
    }

    // Build order rows for email
    const orderRows = cartItems
      .map(
        (item) => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${
              item.products?.name || "Product"
            }</td>
            <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">${
              item.quantity
            }</td>
            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${
              item.products?.price || item.price
            } kr</td>
            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${
              (item.products?.price || item.price) * item.quantity
            } kr</td>
          </tr>`
      )
      .join("");

    const orderTable = `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Product</th>
            <th style="text-align: center; padding: 8px; border-bottom: 1px solid #ddd;">Qty</th>
            <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Unit Price</th>
            <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${orderRows}
        </tbody>
      </table>
    `;

    // Update product stock
    for (const item of cartItems) {
      // Get current stock
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.product_id)
        .single();
      if (!productError && product && product.stock !== null) {
        const newStock = Math.max(0, product.stock - item.quantity);
        await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", item.product_id);
      }
    }

    // Send emails
    const isDelivery = !!order.delivery;

    const pickupHtml = `
      <div style="margin-top:32px; color:#222; font-size:16px;">
        <strong>Pickup Information:</strong><br/>
        Your order will be ready for pickup at <b>Mama Reykjavik, Bankastræti 2</b> during our opening hours.<br/>
        We look forward to seeing you!
      </div>
    `;

    const shippingHtml =
      order.shipping_info && isDelivery
        ? `
        <h3 style="margin-top: 32px; color: #222; font-size: 18px;">Shipping Information</h3>
        <div style="color: #555; font-size: 15px; line-height: 1.6;">
          ${Object.entries(order.shipping_info)
            .map(([k, v]) => `<div><strong>${k}:</strong> ${v}</div>`)
            .join("")}
        </div>`
        : "";

    // Buyer email HTML
    const buyerHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">

          <h2 style="color: #222; font-size: 24px; margin-bottom: 8px;">Thank you for your order${
            order.user_email ? ", " + order.user_email : ""
          }!</h2>
          <p style="color: #555; font-size: 16px; margin: 0 0 24px;">
            We've received your order and are preparing it for ${
              isDelivery ? "delivery" : "pickup"
            }. Below is a summary for your records.
          </p>

          <h3 style="color: #222; font-size: 18px; margin-bottom: 8px;">Order Details</h3>
          ${orderTable}

          <div style="margin-top: 8px; font-size: 16px; color: #222;">
            <strong>Order Total:</strong> ${amount} ${currency}
          </div>

          ${isDelivery ? shippingHtml : pickupHtml}

          <div style="margin-top: 32px; color: #555; font-size: 15px; line-height: 1.6;">
            If you have any questions about your order, feel free to reply to this email. We're here to help.
          </div>

          <div style="margin-top: 40px; font-size: 13px; color: #aaa; text-align: center; border-top: 1px solid #eee; padding-top: 16px;">
            Mama Reykjavik · White Lotus · Bankastræti 2 · 101 RVK · Iceland<br/>
            <a href="mailto:team@mama.is" style="color: #888;">team@mama.is</a>
          </div>
        </div>
      </div>
    `;

    // Admin/store email HTML
    const adminHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto;">
          <h2 style="font-size: 20px; color: #222;">📦 New Order Received</h2>
          <p style="font-size: 16px; color: #555;">From: <strong>${
            order.user_email
          }</strong></p>
          ${orderTable}
          <div style="font-size: 16px; margin-top: 12px;">
            <strong>Total:</strong> ${amount} ${currency}
          </div>
          ${isDelivery ? shippingHtml : pickupHtml}
        </div>
      </div>
    `;

    // Send buyer email
    await resend.emails.send({
      from: "Mama.is <team@mama.is>",
      reply_to: "team@mama.is",
      to: [order.user_email],
      subject: "Your Mama Reykjavik Order Confirmation",
      html: buyerHtml,
    });

    // Send admin email
    await resend.emails.send({
      from: "Mama.is <team@mama.is>",
      reply_to: "team@mama.is",
      to: "team@mama.is",
      subject: `New Order: ${orderid}`,
      html: adminHtml,
    });

    // Return XML for SaltPay
    return new Response("<PaymentNotification>Accepted</PaymentNotification>", {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    });
  } catch (error) {
    console.error("Shop success-server error:", error);
    return new Response("<PaymentNotification>Error</PaymentNotification>", {
      status: 400,
      headers: { "Content-Type": "application/xml" },
    });
  }
}
