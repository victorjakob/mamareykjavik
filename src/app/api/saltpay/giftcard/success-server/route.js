import crypto from "crypto";
import { createServerSupabase } from "@/util/supabase/server";
import { formatPrice } from "@/util/IskFormat";
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

    // Find the gift card by order_id
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

    // Update gift card: set status to 'paid' and update buyer_email if provided
    const updateData = {
      status: "paid",
    };

    if (buyeremail) {
      updateData.buyer_email = buyeremail;
    }

    // If email delivery, mark as sent
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

    // Get updated gift card with access token
    const { data: updatedGiftCard } = await supabase
      .from("gift_cards")
      .select("*")
      .eq("order_id", orderid)
      .single();

    // Generate magic link URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mama.is";
    const magicLinkUrl = `${baseUrl}/gift-card/${updatedGiftCard.access_token}`;
    const buyerEmailAddress = updatedGiftCard.buyer_email || buyeremail;
    const buyerDisplayName =
      updatedGiftCard.buyer_name || "Valued guest";
    const formattedPrice = updatedGiftCard.price
      ? formatPrice(Number(updatedGiftCard.price))
      : `${Number(amount) / 100} kr`;
    const formattedAmount = formatPrice(Number(updatedGiftCard.amount));

    // Determine delivery instructions based on method
    let deliveryInstructions = "";
    if (updatedGiftCard.delivery_method === "email") {
      deliveryInstructions =
        "Your gift card has been sent to your email address. You can also access it using the link below.";
    } else if (updatedGiftCard.delivery_method === "pickup") {
      deliveryInstructions =
        "You can pick up your gift card at Mama Reykjavik. Show the link below as proof of purchase when you arrive.";
    } else if (updatedGiftCard.delivery_method === "mail") {
      deliveryInstructions =
        "Your gift card will be sent to the shipping address you provided. You can also access it digitally using the link below.";
    }

    // Send confirmation email to buyer
    const emailHtml = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f0f0f0;">
          <h1 style="color: #2d3748; font-size: 28px; margin: 0;">Your Gift Card is Ready! 🎉</h1>
        </div>

        <div style="padding: 30px 0;">
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
            Dear ${updatedGiftCard.buyer_name},
          </p>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
            Thank you for your purchase! Your gift card has been successfully created.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${magicLinkUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(to right, #ea580c, #f97316); color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            View Your Gift Card
          </a>
          <p style="color: #718096; font-size: 14px; margin-top: 15px; line-height: 1.5;">
            This link gives you instant access to your gift card.<br />
            No login required! Bookmark it for easy access.
          </p>
        </div>

        <div style="background-color: #f7fafc; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h2 style="color: #2d3748; font-size: 20px; margin: 0 0 15px 0;">Gift Card Details</h2>
          <div style="display: grid; gap: 10px;">
            <p style="color: #4a5568; margin: 5px 0;">
              <strong>Amount:</strong> ${formattedAmount}
            </p>
            <p style="color: #4a5568; margin: 5px 0;">
              <strong>Remaining Balance:</strong> ${formattedAmount}
            </p>
            <p style="color: #4a5568; margin: 5px 0;">
              <strong>Delivery Method:</strong> ${updatedGiftCard.delivery_method.charAt(0).toUpperCase() + updatedGiftCard.delivery_method.slice(1)}
            </p>
            <p style="color: #4a5568; margin: 5px 0;">
              <strong>Never Expires:</strong> Your gift card never expires
            </p>
          </div>
        </div>

        <div style="background-color: #f7fafc; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h2 style="color: #2d3748; font-size: 20px; margin: 0 0 15px 0;">Delivery Information</h2>
          <p style="color: #4a5568; margin: 5px 0; line-height: 1.6;">
            ${deliveryInstructions}
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
        to: buyerEmailAddress,
        subject: "Your Gift Card is Ready! 🎉",
        html: emailHtml,
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't throw - payment is successful even if email fails
    }

    // Send email to recipient if provided (for email delivery)
    if (
      updatedGiftCard.delivery_method === "email" &&
      updatedGiftCard.recipient_email
    ) {
      const recipientEmailHtml = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f0f0f0;">
            <h1 style="color: #2d3748; font-size: 28px; margin: 0;">You Received a Gift Card! 🎁</h1>
          </div>

          <div style="padding: 30px 0;">
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
              Dear ${updatedGiftCard.recipient_name || "Friend"},
            </p>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
              ${updatedGiftCard.buyer_name} has sent you a gift card for Mama Reykjavik!
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLinkUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(to right, #ea580c, #f97316); color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              View Your Gift Card
            </a>
          </div>

          <div style="background-color: #f7fafc; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h2 style="color: #2d3748; font-size: 20px; margin: 0 0 15px 0;">Gift Card Details</h2>
            <p style="color: #4a5568; margin: 5px 0;">
              <strong>Amount:</strong> ${formattedAmount}
            </p>
            <p style="color: #4a5568; margin: 5px 0;">
              <strong>Never Expires:</strong> Your gift card never expires
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
          to: updatedGiftCard.recipient_email,
          subject: `You Received a Gift Card from ${updatedGiftCard.buyer_name}! 🎁`,
          html: recipientEmailHtml,
        });
      } catch (recipientEmailError) {
        console.error("Failed to send recipient email:", recipientEmailError);
      }
    }

    // Send admin notification
    const internalEmailHtml = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.08);">
        <h1 style="color: #1f2937; font-size: 22px; margin-bottom: 12px;">🎁 New Gift Card Purchase</h1>
        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 8px 0;">
          A customer just purchased a gift card.
        </p>
        <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 12px 0;">Buyer Details</h2>
          <p style="color: #4b5563; margin: 6px 0;"><strong>Name:</strong> ${buyerDisplayName}</p>
          <p style="color: #4b5563; margin: 6px 0;"><strong>Email:</strong> ${buyerEmailAddress}</p>
        </div>

        <div style="background-color: #fef2f2; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #fee2e2;">
          <h2 style="color: #b91c1c; font-size: 18px; margin: 0 0 12px 0;">Gift Card Details</h2>
          <p style="color: #4b5563; margin: 6px 0;"><strong>Order ID:</strong> ${orderid}</p>
          <p style="color: #4b5563; margin: 6px 0;"><strong>Amount:</strong> ${formattedPrice}</p>
          <p style="color: #4b5563; margin: 6px 0;"><strong>Gift Card Value:</strong> ${formattedAmount}</p>
          <p style="color: #4b5563; margin: 6px 0;"><strong>Delivery Method:</strong> ${updatedGiftCard.delivery_method.charAt(0).toUpperCase() + updatedGiftCard.delivery_method.slice(1)}</p>
          <p style="color: #4b5563; margin: 6px 0;"><strong>Status:</strong> ${status}</p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 24px;">
          <a href="${magicLinkUrl}" style="display: inline-flex; align-items: center; justify-content: center; padding: 14px; border-radius: 10px; background: linear-gradient(to right, #ea580c, #f97316); color: #ffffff; text-decoration: none; font-weight: 600;">
            View Gift Card
          </a>
          <a href="${baseUrl}/admin/cards/giftcards" style="display: inline-flex; align-items: center; justify-content: center; padding: 12px; border-radius: 10px; border: 1px solid #d1d5db; color: #1f2937; text-decoration: none; font-weight: 500;">
            Open Gift Cards Dashboard
          </a>
        </div>

        <p style="color: #9ca3af; font-size: 13px; margin-top: 24px;">Sent automatically from the Mama payment system.</p>
      </div>
    `;

    try {
      await resend.emails.send({
        from: "Mama Alerts <alerts@mama.is>",
        to: "team@mama.is",
        subject: `New Gift Card purchase – ${buyerDisplayName}`,
        html: internalEmailHtml,
      });
    } catch (internalEmailError) {
      console.error(
        "[Gift Card Success-Server] Failed to send internal notification email:",
        internalEmailError
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[Gift Card Success-Server] Error:", error);
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

