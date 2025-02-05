import sgMail from "@sendgrid/mail";
import { NextResponse } from "next/server";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function POST(req) {
  try {
    const { ticketInfo, userEmail, userName } = await req.json();

    // Add debugging
    console.log("Received ticket info:", ticketInfo);

    // Validate the data
    if (!ticketInfo || !ticketInfo.events) {
      throw new Error("Invalid ticket information received");
    }

    const eventDate = new Date(ticketInfo.events.date);

    // Create professional HTML email
    const emailHtml = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f0f0f0;">
          <h1 style="color: #2d3748; font-size: 28px; margin: 0;">Your Reservation Confirmation</h1>
        </div>

        <div style="padding: 30px 0;">
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
            Dear ${userName},
          </p>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
            You have successfully reserved your spot for <span style="font-weight: bold;">${
              ticketInfo.events.name
            }</span>. Please pay at the door when you arrive. We're excited to have you join us!
          </p>
        </div>

        <div style="background-color: #f7fafc; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h2 style="color: #2d3748; font-size: 20px; margin: 0 0 15px 0;">Event Details</h2>
          <div style="display: grid; gap: 10px;">
            <p style="color: #4a5568; margin: 5px 0;">
              <strong>Date:</strong> ${eventDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p style="color: #4a5568; margin: 5px 0;">
              <strong>Time:</strong> ${eventDate.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p style="color: #4a5568; margin: 5px 0;">
              <strong>Duration:</strong> ${ticketInfo.events.duration} hour/s
            </p>
            <p style="color: #4a5568; margin: 5px 0;">
              <strong>Location::</strong> Bankastræti 2, 101 Reykjavik, White Lotus Venue
            </p>
          </div>
        </div>

        <div style="background-color: #f7fafc; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h2 style="color: #2d3748; font-size: 20px; margin: 0 0 15px 0;">Ticket Summary</h2>
          <div style="display: grid; gap: 10px;">
            <p style="color: #4a5568; margin: 5px 0;">
              <strong>Price:</strong> ${
                ticketInfo.events.price
              } isk (to be paid at the door)
            </p>
          </div>
        </div>
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h2 style="color: #2d3748; font-size: 20px; margin: 0 0 15px 0;">Special Offer</h2>
          <div style="display: grid; gap: 10px;">
            <p style="color: #4a5568; margin: 5px 0;">
              <strong>Exclusive Dining Discount!</strong>
            </p>
            <p style="color: #4a5568; margin: 5px 0;">
              Enjoy 15% off at Mama Reykjavik restaurant, located in the same building. Valid before or after the event - just show this email to claim your discount.
            </p>
            <p style="color: #4a5568; margin: 5px 0; font-style: italic;">
              Mama Reykjavik - Authentic local cuisine with a modern twist
            </p>
          </div>
        </div>
      </div>
    `;

    const msg = {
      to: userEmail,
      from: process.env.SENDGRID_FROM_WL_EMAIL,
      subject: `Event Ticket - ${ticketInfo.events.name}`,
      html: emailHtml,
    };

    await sgMail.send(msg);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      {
        error: "Failed to send confirmation email",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
