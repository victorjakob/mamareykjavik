import { NextResponse } from "next/server";
import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable is not set");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { buyerEmails, message, eventName, eventDate } = await request.json();

    if (
      !buyerEmails ||
      !Array.isArray(buyerEmails) ||
      !message ||
      !eventName ||
      !eventDate
    ) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Filter out any invalid emails
    const validEmails = buyerEmails.filter(
      (email) => email && typeof email === "string" && email.includes("@")
    );

    if (validEmails.length === 0) {
      return NextResponse.json(
        { error: "No valid email addresses provided" },
        { status: 400 }
      );
    }

    // Format date
    const formattedDate = new Date(eventDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Send emails to all valid recipients
    const emailPromises = validEmails.map((email) =>
      resend.emails.send({
        from: "White Lotus <team@mama.is>",
        to: [email],
        subject: `Important Message Regarding ${eventName}`,
        text: `${message}\n\nEvent: ${eventName}\nDate: ${formattedDate}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #ff914d; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">${eventName}</h1>
              <p style="color: white; margin: 10px 0 0 0;">${formattedDate}</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="color: #333333; font-size: 16px; line-height: 1.6;">
                ${message.replace(/\n/g, "<br>")}
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee; color: #666666; font-size: 14px;">
                <p style="margin: 0;">Best regards,</p>
                <p style="margin: 5px 0;">The White Lotus Team</p>
              </div>
            </div>
          </div>
        `,
      })
    );

    await Promise.all(emailPromises);

    return NextResponse.json(
      { success: true, message: "Emails sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending emails:", error);
    return NextResponse.json(
      { error: "Failed to send emails" },
      { status: 500 }
    );
  }
}
