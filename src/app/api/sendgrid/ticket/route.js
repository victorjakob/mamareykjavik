import sgMail from "@sendgrid/mail";
import { NextResponse } from "next/server";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function POST(req) {
  try {
    const { ticketInfo, userEmail, userName } = await req.json();

    // Add debugging

    // Validate the data
    if (!ticketInfo || !ticketInfo.events) {
      throw new Error("Invalid ticket information received");
    }

    const eventDate = new Date(ticketInfo.events.date);

    // Create professional HTML email for attendee
    const attendeeEmailHtml = `
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
              Mama Reykjavik - Honest, Real, Hartwarming Food
            </p>
          </div>
        </div>
      </div>
    `;

    // Create notification email for host
    const hostEmailHtml = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f0f0f0;">
          <h1 style="color: #2d3748; font-size: 24px; margin: 0;">New Event Registration</h1>
        </div>

        <div style="padding: 20px 0;">
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
            A new attendee has registered for your event "${ticketInfo.events.name}".
          </p>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
            <strong>Attendee Details:</strong><br>
            Name: ${userName}<br>
            Email: ${userEmail}
          </p>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
            You can view all attendees and manage your event at:<br>
            <a href="https://mama.is/events/manager" style="color: #4F46E5;">https://mama.is/events/manager</a>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-top: 20px;">
            Don't have an account yet? Create one to manage your events more easily:<br>
            <a href="https://mama.is/auth" style="color: #4F46E5;">https://mama.is/auth</a>
          </p>
          </p>
        </div>
      </div>
    `;

    // Send email to attendee
    const attendeeMsg = {
      to: userEmail,
      from: {
        email: process.env.SENDGRID_FROM_WL_EMAIL,
        name: "White Lotus Events",
      },
      subject: `Event Ticket - ${ticketInfo.events.name}`,
      html: attendeeEmailHtml,
    };

    // Send email to host
    const hostMsg = {
      to: ticketInfo.events.host,
      from: {
        email: process.env.SENDGRID_FROM_WL_EMAIL,
        name: "White Lotus Events",
      },
      subject: `New Registration for ${ticketInfo.events.name}`,
      html: hostEmailHtml,
    };

    await Promise.all([sgMail.send(attendeeMsg), sgMail.send(hostMsg)]);

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
