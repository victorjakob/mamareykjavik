import { NextResponse } from "next/server";
import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Email to venue
    const msg = {
      to: process.env.SENDGRID_FROM_MAMA_EMAIL,
      from: process.env.SENDGRID_FROM_MAMA_EMAIL,
      replyTo: email,
      subject: `Mama.is Form Submission`,
      html: `
        <h2>New Message from website</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message || "No message provided"}</p>
      `,
    };

    await sendgrid.send(msg);

    return NextResponse.json(
      { message: "Email sent successfully" },
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
