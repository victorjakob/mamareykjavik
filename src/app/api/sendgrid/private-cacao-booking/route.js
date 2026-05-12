import { NextResponse } from "next/server";
import { createResend } from "@/lib/resend";
import { renderEmail } from "@/emails/render.server";

const resend = createResend();

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      participants,
      intention,
      location,
      preferredDate,
      additionalNotes,
    } = body;

    // Team-side notification
    const team = await renderEmail("private-cacao-inquiry-team-notification", {
      name,
      email,
      participants,
      intention,
      location,
      preferredDate,
      additionalNotes,
    });

    await resend.emails.send({
      from: "Mama Cacao <team@mama.is>",
      to: "team@mama.is",
      replyTo: email,
      subject: `Private Cacao Ceremony Inquiry from ${name}`,
      html: team.html,
      text: team.text,
    });

    // Customer confirmation
    const customer = await renderEmail("private-cacao-inquiry-customer-confirmation", {
      name,
      participants,
      intention,
      location,
      preferredDate,
      additionalNotes,
    });

    await resend.emails.send({
      from: "Mama Cacao <team@mama.is>",
      to: [email],
      replyTo: "team@mama.is",
      subject: "We received your private cacao ceremony request",
      html: customer.html,
      text: customer.text,
    });

    return NextResponse.json(
      { message: "Booking request sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending booking request:", error);
    return NextResponse.json(
      { error: "Failed to send booking request" },
      { status: 500 }
    );
  }
}
