import crypto from "crypto";
import { createServerSupabase } from "@/util/supabase/server";
import { formatPrice } from "@/util/IskFormat";
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

    const { status, orderid, amount, currency, orderhash, buyeremail } = body;

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

    // Find gift card
    const { data: giftCard, error: cardError } = await supabase
      .from("gift_cards")
      .select("*")
      .eq("order_id", orderid)
      .single();

    if (cardError || !giftCard) {
      console.error(
        "[Gift Card Success-Server] Gift card not found for order_id:",
        orderid
      );
      throw new Error("Gift card not found");
    }

    // Update card
    const updateData = { status: "paid" };
    if (buyeremail) updateData.buyer_email = buyeremail;
    if (giftCard.delivery_method === "email") {
      updateData.sent_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from("gift_cards")
      .update(updateData)
      .eq("order_id", orderid);

    if (updateError) {
      console.error(
        "[Gift Card Success-Server] Failed to update gift card:",
        updateError
      );
      throw updateError;
    }

    // Get updated card with token
    const { data: updatedGiftCard } = await supabase
      .from("gift_cards")
      .select("*")
      .eq("order_id", orderid)
      .single();

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mama.is";
    const magicLinkUrl = `${baseUrl}/gift-card/${updatedGiftCard.access_token}`;
    const buyerEmailAddress = updatedGiftCard.buyer_email || buyeremail;
    const buyerDisplayName = updatedGiftCard.buyer_name || "Valued guest";
    const formattedPrice = updatedGiftCard.price
      ? formatPrice(Number(updatedGiftCard.price))
      : `${Number(amount) / 100} kr`;
    const formattedAmount = formatPrice(Number(updatedGiftCard.amount));

    // Buyer confirmation
    try {
      const { html, text } = await renderEmail("giftcard-purchase-buyer-confirmation", {
        buyerName: buyerDisplayName,
        formattedAmount,
        deliveryMethod: updatedGiftCard.delivery_method,
        magicLinkUrl,
      });

      await resend.emails.send({
        from: "Mama Reykjavik <noreply@mama.is>",
        to: buyerEmailAddress,
        subject: "Your Gift Card is Ready",
        html,
        text,
      });
    } catch (emailError) {
      console.error("Failed to send buyer confirmation:", emailError);
    }

    // Admin notification
    try {
      const { html, text } = await renderEmail("giftcard-purchase-admin-notification", {
        buyerName: buyerDisplayName,
        buyerEmail: buyerEmailAddress,
        formattedAmount,
        formattedPrice,
        deliveryMethod: updatedGiftCard.delivery_method,
        orderId: orderid,
        magicLinkUrl,
        adminUrl: `${baseUrl}/admin/cards/giftcards`,
      });

      await resend.emails.send({
        from: "Mama Giftcard <alerts@mama.is>",
        to: "team@mama.is",
        subject: `New Gift Card purchase – ${buyerDisplayName}`,
        html,
        text,
      });
    } catch (internalEmailError) {
      console.error(
        "[Gift Card Success-Server] Failed to send internal notification:",
        internalEmailError
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Gift Card Success-Server] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
