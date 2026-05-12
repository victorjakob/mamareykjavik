import { NextResponse } from "next/server";
import { Resend } from "resend";
import { renderEmail } from "@/emails/render.server";

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

    // Filter to valid emails
    const validEmails = buyerEmails.filter(
      (email) => email && typeof email === "string" && email.includes("@")
    );

    if (validEmails.length === 0) {
      return NextResponse.json(
        { error: "No valid email addresses provided" },
        { status: 400 }
      );
    }

    // Render once — same body for every recipient
    const { html, text } = await renderEmail("message-attendance-broadcast", {
      eventName,
      eventDate,
      message,
    });

    const emailPromises = validEmails.map((email) =>
      resend.emails.send({
        from: "White Lotus <team@mama.is>",
        to: [email],
        subject: `Important Message Regarding ${eventName}`,
        html,
        text,
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
