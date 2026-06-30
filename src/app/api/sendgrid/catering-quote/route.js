import { NextResponse } from "next/server";
import { createResend } from "@/lib/resend";
import { renderEmail } from "@/emails/render.server";

const resend = createResend();

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, address, date, notes, items, occasion } = body;

    const OCCASION_LABELS = {
      "corporate-lunch": "Corporate Lunch",
      event: "Private & Event",
      retreat: "Retreat & Ceremony",
    };
    const occasionLabel = OCCASION_LABELS[occasion] || "Catering";

    // Team-side notification
    const team = await renderEmail("catering-quote-team-notification", {
      name,
      email,
      phone,
      address,
      date,
      notes,
      items,
      occasion: occasionLabel,
    });

    await resend.emails.send({
      from: "Mama Catering <team@mama.is>",
      to: "team@mama.is",
      replyTo: email,
      subject: `🥡 New ${occasionLabel} Quote Request from ${name}`,
      html: team.html,
      text: team.text,
    });

    // Customer confirmation
    const customer = await renderEmail("catering-quote-customer-confirmation", {
      name,
      address,
      date,
      items,
    });

    await resend.emails.send({
      from: "Mama Reykjavík <team@mama.is>",
      to: [email],
      replyTo: "team@mama.is",
      subject: "Your catering quote request — Mama Reykjavík",
      html: customer.html,
      text: customer.text,
    });

    return NextResponse.json({ message: "Quote request sent" }, { status: 200 });
  } catch (error) {
    console.error("Catering quote error:", error);
    return NextResponse.json({ error: "Failed to send request" }, { status: 500 });
  }
}
