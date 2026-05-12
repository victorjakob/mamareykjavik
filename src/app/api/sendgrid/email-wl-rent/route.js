import { NextResponse } from "next/server";
import { createResend } from "@/lib/resend";
import { renderEmail } from "@/emails/render.server";

const resend = createResend();

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, event, timeAndDate, guestCount, comments } = body;

    // Team-side notification
    const team = await renderEmail("wl-venue-rental-team-notification", {
      name,
      email,
      event,
      timeAndDate,
      guestCount,
      comments,
    });

    await resend.emails.send({
      from: "White Lotus <team@mama.is>",
      to: "team@whitelotus.is",
      replyTo: email,
      subject: `New White Lotus Venue Rental Inquiry from ${name}`,
      html: team.html,
      text: team.text,
    });

    // Customer confirmation
    const customer = await renderEmail("wl-venue-rental-customer-confirmation", {
      name,
      email,
      event,
      timeAndDate,
      guestCount,
      comments,
    });

    await resend.emails.send({
      from: "White Lotus <team@mama.is>",
      to: [email],
      replyTo: "team@mama.is",
      subject: "Thank you for your White Lotus Venue Rental Inquiry",
      html: customer.html,
      text: customer.text,
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
