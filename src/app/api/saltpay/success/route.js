import crypto from "crypto";
import { supabase } from "@/lib/supabase";
import sgMail from "@sendgrid/mail";

export async function POST(req) {
  try {
    // Parse the body as URL-encoded data
    const bodyText = await req.text();
    console.log("Raw Request Body:", bodyText);

    const params = new URLSearchParams(bodyText);
    const body = Object.fromEntries(params);
    console.log("Parsed Request Body:", body);

    const { status, orderid, amount, currency, orderhash } = body;

    if (status !== "OK") {
      console.log("Payment status not OK:", status);
      throw new Error("Payment not successful");
    }

    // Verify the `orderhash`
    const secretKey = process.env.SALTPAY_SECRET_KEY;
    const orderHashMessage = `${orderid}|${amount}|${currency}`;
    console.log("Order Hash Message:", orderHashMessage);

    const calculatedHash = crypto
      .createHmac("sha256", secretKey)
      .update(orderHashMessage, "utf8")
      .digest("hex");

    console.log("Calculated Hash:", calculatedHash);
    console.log("Received Order Hash:", orderhash);

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
    console.log("Updating ticket status and buyer email in the database...");
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

    console.log("Ticket status and buyer email updated successfully!");

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
      from: "viggijakob@gmail.com",
      subject: "Your Ticket for the Event 🎟️",
      html: `
    <div style="font-family: Arial, sans-serif; text-align: center; border: 1px solid #ddd; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto;">
      <h1 style="color: #4caf50;">Hey, ${body.buyername}!</h1>
      <h2 style="color: #4caf50;">Thank You for Your Purchase!</h2>
      <p style="font-size: 16px;">Your ticket details are below:</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <td style="text-align: right; font-weight: bold;">Event Name:</td>
          <td style="text-align: left;">${ticketData.events.name}</td>
        </tr>
        <tr>
          <td style="text-align: right; font-weight: bold;">Date:</td>
          <td style="text-align: left;">${eventDate}</td>
        </tr>
        <tr>
          <td style="text-align: right; font-weight: bold;">Duration:</td>
          <td style="text-align: left;">${
            ticketData.events.duration
          } hour/s</td>
        </tr>
        <tr>
          <td style="text-align: right; font-weight: bold;">Quantity:</td>
          <td style="text-align: left;">${ticketData.quantity} ticket/s</td>
        </tr>
        <tr>
          <td style="text-align: right; font-weight: bold;">Location:</td>
          <td style="text-align: left;">Bankastræti 2, 101 Reykjavik - second floor, White Lotus Venue</td>
        </tr>
        
        <tr>
          <td style="text-align: right; font-weight: bold;">Email:</td>
          <td style="text-align: left;">${body.buyeremail}</td>
        </tr>
        <tr>
          <td style="text-align: right; font-weight: bold;">Amount:</td>
          <td style="text-align: left;">${Math.round(amount)} ${currency}</td>
        </tr>
      </table>
      <p style="margin-top: 20px; font-size: 14px;">We look forward to seeing you at the event!</p>
      <p style="margin-top: 10px; font-size: 14px;">Enjoy 15% discount at Mama Restaurant before or after the event</p>
      <p style="margin-top: 5px; font-size: 14px;">Located in the same house as White Lotus</p>
    </div>
      `,
    };

    // Send notification email to host
    const hostMsg = {
      to: ticketData.events.host,
      from: "viggijakob@gmail.com",
      subject: "New Ticket Purchase for Your Event 🎫",
      html: `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>New Ticket Purchase!</h2>
      <p>A new ticket has been purchased for your event "${ticketData.events.name}".</p>
      <p><strong>Buyer Details:</strong></p>
      <ul>
        <li>Name: ${body.buyername}</li>
        <li>Email: ${body.buyeremail}</li>
        <li>Quantity: ${ticketData.quantity} ticket(s)</li>
        <li>Amount: ${Math.round(amount)} ${currency}</li>
      </ul>
      <p>The event is scheduled for ${eventDate}.</p>
    </div>
      `,
    };

    try {
      await sgMail.send(buyerMsg);
      console.log("Confirmation email sent successfully to buyer");
      await sgMail.send(hostMsg);
      console.log("Notification email sent successfully to host");
    } catch (emailError) {
      console.error("Error sending emails:", emailError);
      // Continue with the process even if emails fail
    }

    // Redirect to success page
    console.log("Redirecting to payment success page...");
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
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
