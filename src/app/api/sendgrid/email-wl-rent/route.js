import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, event, timeAndDate, guestCount, comments } = body;

    // Email to venue
    await resend.emails.send({
      from: "White Lotus <team@mama.is>",
      to: "team@whitelotus.is",
      replyTo: email, // Add replyTo field with customer's email
      subject: `New White Lotus Venue Rental Inquiry from ${name}`,
      html: `
        <h2>White Lotus Rental Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Event Type:</strong> ${event}</p>
        <p><strong>Requested Date/Time:</strong> ${
          timeAndDate || "Not specified"
        }</p>
        <p><strong>Expected Guest Count:</strong> ${
          guestCount || "Not specified"
        }</p>
        <p><strong>Additional Details:</strong> ${
          comments || "None provided"
        }</p>
      `,
    });

    // Confirmation email to user
    await resend.emails.send({
      from: "White Lotus <team@mama.is>",
      to: [email],
      replyTo: "team@mama.is",
      subject: "Thank you for your White Lotus Venue Rental Inquiry",
      html: `
        <h2>Thank you for your inquiry, ${name}!</h2>
        <p>We have received your rental inquiry for White Lotus venue with the following details:</p>
        <p><strong>Event Type:</strong> ${event}</p>
        <p><strong>Requested Date/Time:</strong> ${
          timeAndDate || "Not specified"
        }</p>
        <p><strong>Expected Guest Count:</strong> ${
          guestCount || "Not specified"
        }</p>
        <p><strong>Additional Details:</strong> ${
          comments || "None provided"
        }</p>
        <br>
        <p>We will review your request and get back to you shortly at this email address (${email}).</p>
        <br>
        <p>Best regards,</p>
        <p>The White Lotus Team</p>
      `,
    });

    return NextResponse.json(
      { message: "Emails sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
