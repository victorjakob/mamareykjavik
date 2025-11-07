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

    // Find the meal card by order_id (including access_token for magic link)
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

    // Update meal card: set status to 'paid' and update buyer_email if provided
    const updateData = {
      status: "paid",
    };

    if (buyeremail) {
      updateData.buyer_email = buyeremail;
    }

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

    // Check if user exists with this email, if not, we'll link by email when they create account
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, email, name")
      .eq("email", mealCard.buyer_email || buyeremail)
      .single();

    // Generate magic link URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mama.is';
    const magicLinkUrl = `${baseUrl}/meal-card/${mealCard.access_token}`;

    // Send confirmation email
    const emailHtml = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f0f0f0;">
          <h1 style="color: #2d3748; font-size: 28px; margin: 0;">Your 5 Meals Card is Ready! 🎉</h1>
        </div>

        <div style="padding: 30px 0;">
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
            Dear ${mealCard.buyer_name},
          </p>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
            Thank you for your purchase! Your 5 Meals for Winter card has been successfully added to your Mama account.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${magicLinkUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(to right, #ea580c, #f97316); color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            View & Use Your Card
          </a>
          <p style="color: #718096; font-size: 14px; margin-top: 15px; line-height: 1.5;">
            This link gives you instant access to your card.<br />
            No login required! Bookmark it for easy access.
          </p>
        </div>

        <div style="background-color: #f7fafc; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h2 style="color: #2d3748; font-size: 20px; margin: 0 0 15px 0;">Card Details</h2>
          <div style="display: grid; gap: 10px;">
            <p style="color: #4a5568; margin: 5px 0;">
              <strong>Meals Remaining:</strong> 5
            </p>
            <p style="color: #4a5568; margin: 5px 0;">
              <strong>Valid From:</strong> December 1, 2025
            </p>
            <p style="color: #4a5568; margin: 5px 0;">
              <strong>Valid Until:</strong> May 31, 2026
            </p>
            <p style="color: #4a5568; margin: 5px 0;">
              <strong>Special:</strong> 5th bowl = free Ceremonial Cacao, tea or coffee ☕
            </p>
          </div>
        </div>

        <div style="background-color: #f7fafc; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h2 style="color: #2d3748; font-size: 20px; margin: 0 0 15px 0;">How to Use</h2>
          <p style="color: #4a5568; margin: 5px 0; line-height: 1.6;">
            Click the button above to access your card anytime. Show your phone at the restaurant to redeem your meals. Each time you use a meal, it will be automatically deducted from your card.
          </p>
        </div>

        <div style="text-align: center; padding: 20px 0; margin-top: 30px;">
          <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">
            Made with big love 🌱 Mama
          </p>
        </div>
      </div>
    `;

    try {
      await resend.emails.send({
        from: "Mama Reykjavik <noreply@mama.is>",
        to: mealCard.buyer_email || buyeremail,
        subject: "Your 5 Meals for Winter Card is Ready! 🎉",
        html: emailHtml,
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't throw - payment is successful even if email fails
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[5-Meals Success-Server] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

