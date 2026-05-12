import crypto from "crypto";
import { createServerSupabase } from "@/util/supabase/server";
import { formatPrice } from "@/util/IskFormat";
import { createResend } from "@/lib/resend";
import { renderEmail } from "@/emails/render.server";

const resend = createResend();

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

    // Find meal card
    const { data: mealCard, error: cardError } = await supabase
      .from("meal_cards")
      .select("*")
      .eq("order_id", orderid)
      .single();

    if (cardError || !mealCard) {
      console.error(
        "[5-Meals Success-Server] Meal card not found for order_id:",
        orderid
      );
      throw new Error("Meal card not found");
    }

    // Update card
    const updateData = { status: "paid" };
    if (buyeremail) updateData.buyer_email = buyeremail;

    const { error: updateError } = await supabase
      .from("meal_cards")
      .update(updateData)
      .eq("order_id", orderid);

    if (updateError) {
      console.error(
        "[5-Meals Success-Server] Failed to update meal card:",
        updateError
      );
      throw updateError;
    }

    // Existing-account check
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, email, name")
      .eq("email", mealCard.buyer_email || buyeremail)
      .single();

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mama.is";
    const magicLinkUrl = `${baseUrl}/meal-card/${mealCard.access_token}`;
    const buyerEmailAddress = mealCard.buyer_email || buyeremail;
    const buyerDisplayName =
      mealCard.buyer_name || existingUser?.name || "Valued guest";
    const formattedPrice = mealCard.price
      ? formatPrice(Number(mealCard.price))
      : `${Number(amount) / 100} kr`;
    const existingAccountStatus = existingUser ? "Yes" : "No";

    // Buyer confirmation
    try {
      const { html, text } = await renderEmail("5meals-card-buyer-confirmation", {
        buyerName: buyerDisplayName,
        magicLinkUrl,
        mealsRemaining: mealCard.meals_remaining ?? 5,
        validFrom: "December 1, 2025",
        validUntil: "May 31, 2026",
      });

      await resend.emails.send({
        from: "Mama Reykjavik <noreply@mama.is>",
        to: buyerEmailAddress,
        subject: "Your 5 Meals for Winter Card is Ready",
        html,
        text,
      });
    } catch (emailError) {
      console.error("Failed to send buyer confirmation:", emailError);
    }

    // Admin notification
    try {
      const { html, text } = await renderEmail("5meals-card-admin-notification", {
        buyerName: buyerDisplayName,
        buyerEmail: buyerEmailAddress,
        existingAccount: existingAccountStatus,
        orderId: orderid,
        formattedPrice,
        currency,
        mealsRemaining: mealCard.meals_remaining ?? 5,
        validFrom: mealCard.valid_from || "December 1, 2025",
        validUntil: mealCard.valid_until || "May 31, 2026",
        magicLinkUrl,
        adminUrl: `${baseUrl}/admin/manage-meal-cards`,
      });

      await resend.emails.send({
        from: "Mama Alerts <alerts@mama.is>",
        to: "team@mama.is",
        subject: `New 5 Meals purchase – ${buyerDisplayName}`,
        html,
        text,
      });
    } catch (internalEmailError) {
      console.error(
        "[5-Meals Success-Server] Failed to send internal notification:",
        internalEmailError
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[5-Meals Success-Server] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
