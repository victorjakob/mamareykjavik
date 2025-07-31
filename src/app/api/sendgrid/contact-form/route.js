import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Email to venue
    await resend.emails.send({
      from: `Mama.is <team@mama.is>`,
      to: "team@mama.is",
      reply_to: email,
      subject: `Form Submission`,
      html: `
        <h2>New Message from website</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message || "No message provided"}</p>
        <br><br>
        <p>Best regards,</p>
        <p>Mama Reykjavík</p>
        <p>team@mama.is</p>
        <p><a href="https://mama.is">https://mama.is</a></p>
      `,
    });

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
