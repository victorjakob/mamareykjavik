import crypto from "crypto";
import { createServerSupabase } from "@/util/supabase/server";
import { Resend } from "resend";
import { renderEmail } from "@/emails/render.server";

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

    // Find order
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

    // Mark order paid
    const { error: updateOrderError } = await supabase
      .from("orders")
      .update({ payment_status: "paid" })
      .eq("saltpay_order_id", orderid);
    if (updateOrderError) {
      console.error(
        "[SaltPay Success-Server] Failed to update order status:",
        updateOrderError
      );
      throw updateOrderError;
    }

    // Mark cart paid
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
      }
    }

    // Get cart items
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

    // Insert order_items
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
      }
    }

    // Update product stock
    for (const item of cartItems) {
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

    const isDelivery = !!order.delivery;
    const contactEmail =
      order.user_email ||
      order.shipping_info?.contactEmail ||
      order.shipping_info?.email ||
      null;

    // Shape items for templates
    const items = cartItems.map((item) => ({
      name: item.products?.name || "Product",
      quantity: item.quantity,
      unitPrice: item.products?.price ?? item.price ?? 0,
    }));

    // Buyer email
    if (contactEmail) {
      const { html: buyerHtml, text: buyerText } = await renderEmail(
        "shop-order-buyer-confirmation",
        {
          contactEmail,
          isDelivery,
          items,
          amount: Number(amount),
          currency,
          shippingInfo: order.shipping_info,
          orderId: orderid,
        }
      );

      await resend.emails.send({
        from: "Mama.is <team@mama.is>",
        replyTo: "team@mama.is",
        to: [contactEmail],
        subject: "Your Mama Reykjavík Order Confirmation",
        html: buyerHtml,
        text: buyerText,
      });
    }

    // Admin email
    const { html: adminHtml, text: adminText } = await renderEmail(
      "shop-order-admin-notification",
      {
        contactEmail,
        isDelivery,
        items,
        amount: Number(amount),
        currency,
        shippingInfo: order.shipping_info,
        orderId: orderid,
        adminUrl: "https://mama.is/admin/manage-store/orders",
      }
    );

    await resend.emails.send({
      from: "Mama.is <team@mama.is>",
      replyTo: "team@mama.is",
      to: "team@mama.is",
      subject: `New Order: ${orderid}`,
      html: adminHtml,
      text: adminText,
    });

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
