import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { ticketInfo, userEmail, userName } = await req.json();

    // Validate the data
    if (!ticketInfo || !ticketInfo.events) {
      throw new Error("Invalid ticket information received");
    }

    const eventDate = new Date(ticketInfo.events.date);

    // Create professional HTML email for attendee (FREE TICKET VERSION)
    const attendeeEmailHtml = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f0f0f0;">
          <h1 style="color: #2d3748; font-size: 28px; margin: 0;">Your Free Ticket Confirmation</h1>
        </div>

        <div style="padding: 30px 0;">
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
            Dear ${userName},
          </p>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
            Congratulations! You have successfully secured your <span style="font-weight: bold; color: #059669;">FREE</span> spot for <span style="font-weight: bold;">${
              ticketInfo.events.name
            }</span>. We're excited to have you join us!
          </p>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
            Just show up at the event - no payment required! ✨
          </p>
        </div>

        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #059669;">
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
              <strong>Location:</strong> ${ticketInfo.events.location || "Bankastræti 2, 101 Reykjavik"}, White Lotus Venue
            </p>
          </div>
        </div>

        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #059669;">
          <h2 style="color: #059669; font-size: 20px; margin: 0 0 15px 0;">🎉 Your Free Ticket</h2>
          <div style="display: grid; gap: 10px;">
            <p style="color: #4a5568; margin: 5px 0; font-size: 18px;">
              <strong style="color: #059669;">Price: FREE</strong>
            </p>
            <p style="color: #4a5568; margin: 5px 0; font-style: italic;">
              No payment required - just bring yourself and enjoy the experience!
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
              Mama Reykjavik - Honest, Real, Heartwarming Food
            </p>
          </div>
        </div>

        <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e2e8f0; margin-top: 30px;">
          <p style="color: #718096; font-size: 14px; margin: 0;">
            Looking forward to seeing you there! 🌟
          </p>
        </div>
      </div>
    `;

    // Create notification email for host
    const hostEmailHtml = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f0f0f0;">
          <h1 style="color: #2d3748; font-size: 24px; margin: 0;">New Free Ticket Registration</h1>
        </div>

        <div style="padding: 20px 0;">
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
            A new attendee has registered for your event "${ticketInfo.events.name}" with a <span style="color: #059669; font-weight: bold;">FREE</span> ticket.
          </p>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
            <strong>Attendee Details:</strong><br>
            Name: ${userName}<br>
            Email: ${userEmail}<br>
            Ticket Type: Free
          </p>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
            You can view all attendees and manage your event at:<br>
            <a href="https://mama.is/events/manager" style="color: #4F46E5;">https://mama.is/events/manager</a>
          </p>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-top: 20px;">
            Don't have an account yet? Create one to manage your events more easily:<br>
            <a href="https://mama.is/auth" style="color: #4F46E5;">https://mama.is/auth</a>
          </p>
        </div>
      </div>
    `;

    // Send email to attendee
    await resend.emails.send({
      from: `White Lotus <team@mama.is>`,
      to: [userEmail],
      subject: `Free Ticket Confirmed - ${ticketInfo.events.name}`,
      html: attendeeEmailHtml,
    });

    // Send email to host
    await resend.emails.send({
      from: `White Lotus <team@mama.is>`,
      to: [ticketInfo.events.host],
      subject: `New Free Ticket Registration for ${ticketInfo.events.name}`,
      html: hostEmailHtml,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending free ticket email:", error);
    return NextResponse.json(
      {
        error: "Failed to send confirmation email",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
