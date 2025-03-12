import crypto from "crypto";
import { supabase } from "@/util/supabase/client";
import sgMail from "@sendgrid/mail";

export async function POST(req) {
  try {
    // Parse the body as URL-encoded data
    const bodyText = await req.text();

    const params = new URLSearchParams(bodyText);
    const body = Object.fromEntries(params);

    const { status, orderid, amount, currency, orderhash } = body;

    if (status !== "OK") {
      throw new Error("Payment not successful");
    }

    // Verify the `orderhash`
    const secretKey = process.env.SALTPAY_SECRET_KEY;
    const orderHashMessage = `${orderid}|${amount}|${currency}`;

    const calculatedHash = crypto
      .createHmac("sha256", secretKey)
      .update(orderHashMessage, "utf8")
      .digest("hex");

    if (calculatedHash !== orderhash) {
      console.error("Order hash validation failed");
      throw new Error("Order hash validation failed");
    }

    // Get ticket and event details from database
    const { data: ticketData, error: ticketError } = await supabase
      .from("tickets")
      .select(
        `
        quantity,
        events (
          name,
          date,
          duration,
          host
        )
      `
      )
      .eq("order_id", orderid)
      .single();

    if (ticketError) {
      console.error("Error fetching ticket details:", ticketError);
      throw ticketError;
    }

    // Update ticket status and buyer email in the database
    const { error: updateError } = await supabase
      .from("tickets")
      .update({
        status: "paid",
        buyer_email: body.buyeremail,
      })
      .eq("order_id", orderid);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw updateError;
    }

    const eventDate = new Date(ticketData.events.date).toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );

    // Send confirmation email to buyer
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const buyerMsg = {
      to: body.buyeremail,
      from: process.env.SENDGRID_FROM_WL_EMAIL,
      subject: "🎉 Your Ticket Is Ready - Get Ready for an Amazing Experience!",
      html: `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #ffffff;">
      <div style="text-align: center; padding: 30px 0; background: linear-gradient(135deg, #FF914D 0%, #FF5733 100%); border-radius: 15px; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">Your Adventure Awaits!</h1>
      </div>
      
      <div style="background-color: #f8f9fa; border-radius: 15px; padding: 25px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #FF914D; font-size: 24px; margin-bottom: 20px; text-align: center;">Hello, ${
          body.buyername
        }! 🎊</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.6; text-align: center;">
          Your ticket has been confirmed and we're happy to have you join us!
        </p>
      </div>

      <div style="background-color: white; border: 2px solid #FF914D; border-radius: 15px; padding: 25px; margin-bottom: 30px;">
        <h3 style="color: #333; font-size: 20px; margin-bottom: 20px; text-align: center; border-bottom: 2px solid #FF914D; padding-bottom: 10px;">
          🎫 Event Details
        </h3>
        
        <table style="width: 100%; border-collapse: separate; border-spacing: 0 10px;">
          <tr>
            <td style="padding: 10px; color: #666; font-weight: bold; width: 140px;">🎭 Event:</td>
            <td style="padding: 10px; color: #333;">${
              ticketData.events.name
            }</td>
          </tr>
          <tr>
            <td style="padding: 10px; color: #666; font-weight: bold;">📅 Date:</td>
            <td style="padding: 10px; color: #333;">${eventDate}</td>
          </tr>
          <tr>
            <td style="padding: 10px; color: #666; font-weight: bold;">⏱️ Duration:</td>
            <td style="padding: 10px; color: #333;">${
              ticketData.events.duration
            } hour/s</td>
          </tr>
          <tr>
            <td style="padding: 10px; color: #666; font-weight: bold;">🎟️ Quantity:</td>
            <td style="padding: 10px; color: #333;">${
              ticketData.quantity
            } ticket/s</td>
          </tr>
          <tr>
            <td style="padding: 10px; color: #666; font-weight: bold;">📍 Location:</td>
            <td style="padding: 10px; color: #333;">White Lotus Venue<br>Bankastræti 2, 2nd Floor<br>101 Reykjavik</td>
          </tr>
          <tr>
            <td style="padding: 10px; color: #666; font-weight: bold;">💌 Email:</td>
            <td style="padding: 10px; color: #333;">${body.buyeremail}</td>
          </tr>
          <tr>
            <td style="padding: 10px; color: #666; font-weight: bold;">💰 Amount:</td>
            <td style="padding: 10px; color: #333;">${Math.round(
              amount
            )} ${currency}</td>
          </tr>
        </table>
        <p style="text-align: center; color: #FF914D; font-weight: bold; margin-top: 20px;">This is your ticket, show at the door</p>
      </div>

      <div style="background-color: #f8f9fa; border-radius: 15px; padding: 25px; margin-bottom: 30px;">
        <h3 style="color: #FF914D; font-size: 20px; margin-bottom: 15px;">🎁 Special Offer</h3>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Enhance your experience with a special 15% discount at Mama Restaurant!
          Valid before or after the event. Simply show this email to claim your discount.
        </p>
      </div>

      <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 15px;">
        <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
          Questions? Need assistance? We're here to help!
        </p>
        <p style="color: #666; font-size: 14px;">
          Press Reply to this email to contact us.
        </p>
        <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
          <p style="color: #999; font-size: 12px;">
            White Lotus Events<br>
            Bankastræti 2, 101 Reykjavik<br>
            Iceland
          </p>
        </div>
      </div>
    </div>
      `,
    };

    // Send notification email to host
    const hostMsg = {
      to: ticketData.events.host,
      from: process.env.SENDGRID_FROM_WL_EMAIL,
      subject: "🎫 New Ticket Sale Alert - Event Update",
      html: `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #ffffff;">
      <div style="text-align: center; padding: 30px 0; background: linear-gradient(135deg, #FF914D 0%, #FF5733 100%); border-radius: 15px; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">New Ticket Sale! 🎉</h1>
      </div>

      <div style="background-color: #f8f9fa; border-radius: 15px; padding: 25px; margin-bottom: 30px;">
        <h2 style="color: #FF914D; font-size: 24px; margin-bottom: 20px;">Event: "${
          ticketData.events.name
        }"</h2>
        
        <div style="background-color: white; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #333; font-size: 20px; margin-bottom: 15px;">Buyer Details:</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="padding: 8px 0; color: #666;">👤 Name: ${
              body.buyername
            }</li>
            <li style="padding: 8px 0; color: #666;">📧 Email: ${
              body.buyeremail
            }</li>
            <li style="padding: 8px 0; color: #666;">🎟️ Quantity: ${
              ticketData.quantity
            } ticket(s)</li>
            <li style="padding: 8px 0; color: #666;">💰 Amount: ${Math.round(
              amount
            )} ${currency}</li>
          </ul>
        </div>

        <p style="color: #666; font-size: 16px;">Event Date: ${eventDate}</p>
      </div>

      <div style="background-color: #f8f9fa; border-radius: 15px; padding: 25px; text-align: center;">
        <h3 style="color: #333; font-size: 20px; margin-bottom: 15px;">Manage Your Event</h3>
        <p style="color: #666; margin-bottom: 20px;">
          Access your event dashboard to view all attendees and manage details:
        </p>
        <a href="https://mama.is/events/manager" 
           style="display: inline-block; padding: 12px 25px; background-color: #FF914D; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Go to Event Dashboard
        </a>
        
        <p style="color: #666; margin-top: 20px; font-size: 14px;">
          Don't have an account yet? 
          <a href="https://mama.is/auth" style="color: #FF914D; text-decoration: none;">Create one here</a>
        </p>
      </div>
    </div>
      `,
    };

    try {
      await sgMail.send(buyerMsg);
      await sgMail.send(hostMsg);
    } catch (emailError) {
      console.error("Error sending emails:", emailError);
      // Continue with the process even if emails fail
    }

    // Redirect to success page
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
      },
    });
  } catch (error) {
    console.error("Error in success callback:", error);

    // Redirect to error page with the error message
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/error?message=${encodeURIComponent(error.message)}`,
      },
    });
  }
}
