// FreeTicketAttendeeConfirmation — sent when an attendee registers for a free event.
// Replaces inline HTML in src/app/api/sendgrid/free-ticket/route.js
// No payment, just "you're in" — keep it warm and uncomplicated.

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandCallout from "../_components/BrandCallout";

function fmtEventDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function fmtEventTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit",
  });
}

export default function FreeTicketAttendeeConfirmation({
  userName = "friend",
  eventName = "Open Cacao Sit",
  eventDate = "2026-05-19T19:00:00.000Z",
  duration = 1,
  location = "Bankastræti 2, 101 Reykjavík",
} = {}) {
  const firstName = (userName || "").split(" ")[0] || "friend";

  return (
    <BrandLayout
      preview={`You're in for ${eventName} — no payment, just bring yourself.`}
      eyebrow="Mama · Tickets"
    >
      <BrandHeading size="lg">You're in.</BrandHeading>

      <BrandText>Dear {firstName},</BrandText>
      <BrandText>
        You've secured your spot for{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>{eventName}</strong>. No
        payment required — just show up and enjoy the experience.
      </BrandText>

      {/* Event details — centered stacked */}
      <div style={{ margin: "26px 0 18px", textAlign: "center" }}>
        <BrandText
          tone="muted"
          align="center"
          style={{
            margin: "0 0 6px",
            fontSize: "10px",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            fontWeight: 600,
            color: BRAND.ORANGE,
          }}
        >
          When &amp; where
        </BrandText>
        <BrandText
          align="center"
          style={{
            margin: "0 0 4px",
            fontFamily: BRAND.fontStack.serif,
            fontStyle: "italic",
            fontSize: "20px",
            color: BRAND.TEXT_DARK,
          }}
        >
          {fmtEventDate(eventDate)}
        </BrandText>
        <BrandText align="center" style={{ margin: "0 0 4px" }}>
          {fmtEventTime(eventDate)}
          {duration ? ` · ${duration} hour${Number(duration) === 1 ? "" : "s"}` : ""}
        </BrandText>
        <BrandText
          align="center"
          tone="muted"
          style={{ margin: 0, fontSize: "13.5px" }}
        >
          {location}
        </BrandText>
      </div>

      {/* Restaurant discount */}
      <BrandCallout label="A small thank-you" tone="warm">
        Show this email at Mama Reykjavík restaurant (same building) for
        <strong style={{ color: BRAND.TEXT_DARK }}> 15% off </strong>
        before or after the event.
      </BrandCallout>

      <BrandText style={{ marginTop: "26px" }}>Looking forward to it,</BrandText>
      <BrandText
        style={{
          fontFamily: BRAND.fontStack.serif,
          fontStyle: "italic",
          fontSize: "18px",
          margin: "-8px 0 0",
        }}
      >
        The Mama team
      </BrandText>
    </BrandLayout>
  );
}

FreeTicketAttendeeConfirmation.previewProps = {
  userName: "Sólveig Magnúsdóttir",
  eventName: "Open Cacao Sit",
  eventDate: "2026-05-19T19:00:00.000Z",
  duration: 1,
  location: "Bankastræti 2, 101 Reykjavík",
};

FreeTicketAttendeeConfirmation.subject = "Free Ticket Confirmed - Open Cacao Sit";
