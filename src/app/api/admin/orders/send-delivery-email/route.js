import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createResend } from "@/lib/resend";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";
import { renderEmail } from "@/emails/render.server";

const resend = createResend();

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "id, user_email, delivery, shipping_info, delivery_notification_sent_at, created_at, price, saltpay_order_id"
      )
      .eq("id", orderId)
      .maybeSingle();

    if (orderError) {
      throw orderError;
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.delivery) {
      return NextResponse.json(
        { error: "This order is pickup only" },
        { status: 400 }
      );
    }

    if (order.delivery_notification_sent_at) {
      return NextResponse.json(
        { error: "Delivery confirmation already sent" },
        { status: 409 }
      );
    }

    const shippingInfo = order.shipping_info || {};

    const contactEmail =
      order.user_email ??
      shippingInfo.contactEmail ??
      shippingInfo.email ??
      shippingInfo.contact_email ??
      shippingInfo.email_address ??
      null;

    if (!contactEmail) {
      return NextResponse.json(
        { error: "No contact email available for this order" },
        { status: 400 }
      );
    }

    const contactName =
      shippingInfo.contactName ??
      shippingInfo.name ??
      shippingInfo.customer_name ??
      "there";

    const friendlyName =
      typeof contactName === "string" && contactName.trim().length > 0
        ? contactName.trim()
        : "there";

    const { html, text, subject } = await renderEmail("order-delivery-notification", {
      customerName: friendlyName,
      shippingInfo,
    });

    await resend.emails.send({
      from: "Mama.is <team@mama.is>",
      replyTo: "team@mama.is",
      to: [contactEmail],
      subject: subject || "Your Mama Reykjavik order is on its way",
      html,
      text,
    });

    const sentAt = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("orders")
      .update({ delivery_notification_sent_at: sentAt })
      .eq("id", orderId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, sentAt });
  } catch (error) {
    console.error("[Admin] send delivery email error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
