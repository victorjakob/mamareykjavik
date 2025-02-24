import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

export async function POST(request) {
  try {
    const body = await request.json();
    const { eventName, eventDate, hostEmail, duration, price, payment } = body;

    const eventDateTime = new Date(eventDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: hostEmail,
      from: process.env.SENDGRID_FROM_WL_RENT_EMAIL,
      subject: "Your Event Has Been Created Successfully! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
          <h1 style="color: #4caf50;">Event Created Successfully!</h1>
          
          <h2>Event Details:</h2>
          <ul style="list-style: none; padding-left: 0;">
            <li><strong>Event Name:</strong> ${eventName}</li>
            <li><strong>Date:</strong> ${eventDateTime}</li>
            <li><strong>Duration:</strong> ${duration} hour(s)</li>
            <li><strong>Price:</strong> ${price} ISK</li>
            <li><strong>Payment Type:</strong> ${payment}</li>
          </ul>

         <div style="margin: 30px 0; padding: 20px; background-color: #f5f5f5; border-radius: 5px;">
            <h3>Effortlessly Manage Your Event</h3>
            <p>Take full control of your event! View attendee lists, update details, and oversee everything in one place.</p>
            <p>And for your future events, you can create your upcoming events using the link below, make sure to fill in the info with the correct details.</p>
            <p>Visit your event management dashboard. Create, Edit, View attendance.. all in one place:</p>
            <p>
                <a href="https://mama.is/events/manager" style="color: #4F46E5; font-weight: bold;">
                Event Manager Portal
                </a>
            </p>
            <p><strong>Note:</strong> You must have an account to access this feature. If you haven't signed up yet, <a href="https://www.mama.is/auth" style="color: #4F46E5; font-weight: bold;">register or log in here</a>.</p>
        </div>


          <div style="margin: 30px 0; padding: 20px; background-color: #fff3cd; border-radius: 5px;">
            <h3>Venue Guidelines & Terms of Service</h3>
            <ul style="padding-left: 20px;">
              <li>Please ensure the space is left clean and tidy after your event</li>
              <li>All furniture should be returned to its original position</li>
              <li>Let us know if you need any help with setup of technical equipment</li>
              <li>White Lotus is a sacred space - please treat it with respect</li>
              <li>Please report to us if any damages are caused</li>
              <li>And most importantly - have fun!</li>
            </ul>
          </div>

          <div style="margin-top: 30px;">
            <h3>Need Help?</h3>
            <p>If you need any assistance or have questions about your event, please don't hesitate to contact us at team@whitelotus.is</p>
          </div>

          <p style="margin-top: 30px; font-style: italic;">We look forward to hosting your event at White Lotus!</p>
        </div>
      `,
    };

    await sgMail.send(msg);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending event creation email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
