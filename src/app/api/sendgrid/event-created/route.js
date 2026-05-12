import { NextResponse } from "next/server";
import { Resend } from "resend";
import { renderEmail } from "@/emails/render.server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { eventName, eventDate, hostEmail, duration, price, payment } = body;

    const { html, text } = await renderEmail("event-created-host-notification", {
      eventName,
      eventDate,
      duration,
      price,
      payment,
      managerUrl: "https://mama.is/events/manager",
    });

    await resend.emails.send({
      from: "White Lotus <team@mama.is>",
      to: [hostEmail],
      subject: "Your event is live",
      html,
      text,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending event creation email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
