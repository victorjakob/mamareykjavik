import { NextResponse } from "next/server";
import { createResend } from "@/lib/resend";
import { renderEmail } from "@/emails/render.server";

const resend = createResend();

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, message, source } = body;
    const messageSource = source?.trim() || "website";

    const { html, text } = await renderEmail("contact-form-submission", {
      name,
      email,
      message,
      source: messageSource,
    });

    await resend.emails.send({
      from: `Mama.is <team@mama.is>`,
      to: "team@mama.is",
      replyTo: email,
      subject: `New Message from ${messageSource}`,
      html,
      text,
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
