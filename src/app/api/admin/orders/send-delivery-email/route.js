import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Resend } from "resend";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    const shippingList = Object.entries(shippingInfo || {})
      .filter(
        ([key]) =>
          ![
            "contactEmail",
            "contactName",
            "contact_email",
            "email",
            "email_address",
            "customer_name",
          ].includes(key)
      )
      .map(
        ([key, value]) =>
          `<div><strong>${key.replace(/_/g, " ")}:</strong> ${
            value ?? "—"
          }</div>`
      )
      .join("");

    const deliveryHtml = `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f9f6; padding: 32px;">
        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 36px; box-shadow: 0 16px 40px rgba(27, 130, 102, 0.12);">
          <div style="text-align: center; margin-bottom: 28px;">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 72px; height: 72px; border-radius: 50%; background: rgba(16, 185, 129, 0.1); color: #047857; font-size: 36px;">🚚</div>
          </div>
          <h1 style="font-size: 28px; line-height: 1.3; color: #064e3b; margin: 0 0 16px; text-align: center;">
            Your Mama goodies are on their way! ✨
          </h1>
          <p style="font-size: 17px; line-height: 1.7; color: #065f46; margin: 0 0 16px;">
            Hi ${friendlyName},
          </p>
          <p style="font-size: 17px; line-height: 1.7; color: #065f46; margin: 0 0 16px;">
            Your order from Mama Reykjavik has been lovingly prepared, wrapped, and is heading to the address you shared with us. We cannot wait for you to enjoy the cozy magic inside!
          </p>
          <div style="margin: 28px 0; padding: 20px; border-radius: 14px; background: rgba(16, 185, 129, 0.08); color: #064e3b;">
            <div style="font-weight: 600; font-size: 16px; margin-bottom: 10px;">Delivery snapshot</div>
            <div style="font-size: 15px; line-height: 1.6;">
              ${shippingList || "Delivery details were not provided."}
            </div>
          </div>
          <p style="font-size: 16px; line-height: 1.6; color: #047857; margin: 0 0 18px;">
            We will hand everything over to our delivery partners right away.
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #047857; margin: 0 0 24px;">
            If you have any questions, simply reply to this email or reach out to <a href="mailto:team@mama.is" style="color: #047857; font-weight: 600;">team@mama.is</a>. We are always here for you.
          </p>
          <p style="font-size: 15px; line-height: 1.6; color: #047857; margin: 0 0 24px;">
            You can always revisit our <a href="https://mama.is/policies/store" style="color: #047857; font-weight: 600;">shop terms & policies</a> for delivery and returns info.
          </p>
          <div style="margin-top: 32px; text-align: center; color: #047857; font-size: 16px;">
            With warmth,<br/>Mama Reykjavik & White Lotus team 🌿
          </div>
          <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid rgba(16, 185, 129, 0.12); text-align: center; font-size: 13px; color: #6b7280;">
            Bankastræti 2 · 101 Reykjavík · Iceland<br/>
            <a href="https://mama.is" style="color: #047857; text-decoration: none;">mama.is</a>
          </div>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: "Mama.is <team@mama.is>",
      replyTo: "team@mama.is",
      to: [contactEmail],
      subject: "Your Mama Reykjavik order is on its way 💚",
      html: deliveryHtml,
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
