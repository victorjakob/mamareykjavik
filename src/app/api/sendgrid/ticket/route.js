import { Resend } from "resend";
import { NextResponse } from "next/server";
import { renderEmail } from "@/emails/render.server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { ticketInfo, userEmail, userName } = await req.json();

    if (!ticketInfo || !ticketInfo.events) {
      throw new Error("Invalid ticket information received");
    }

    const ev = ticketInfo.events;

    // Attendee confirmation
    const attendee = await renderEmail("paid-ticket-attendee-confirmation", {
      userName,
      eventName: ev.name,
      eventDate: ev.date,
      duration: ev.duration,
      location: ev.location || "Bankastræti 2, 101 Reykjavík",
      price: ev.price,
      hasSlidingScale: ev.has_sliding_scale,
      slidingScaleMin: ev.sliding_scale_min,
      slidingScaleMax: ev.sliding_scale_max,
    });

    await resend.emails.send({
      from: `White Lotus <team@mama.is>`,
      to: [userEmail],
      subject: `Event Ticket - ${ev.name}`,
      html: attendee.html,
      text: attendee.text,
    });

    // Host notification — to all valid host emails
    const hostRecipients = Array.from(
      new Set(
        [ev.host, ev.host_secondary]
          .map((e) => (typeof e === "string" ? e.trim() : ""))
          .filter(Boolean)
      )
    );

    if (hostRecipients.length > 0) {
      const host = await renderEmail("paid-ticket-host-notification", {
        eventName: ev.name,
        attendeeName: userName,
        attendeeEmail: userEmail,
        managerUrl: "https://mama.is/events/manager",
      });

      await resend.emails.send({
        from: `White Lotus <team@mama.is>`,
        to: hostRecipients,
        subject: `New Registration for ${ev.name}`,
        html: host.html,
        text: host.text,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      {
        error: "Failed to send confirmation email",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
