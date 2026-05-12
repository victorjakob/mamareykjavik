// FreeTicketHostNotification — sent to a host when an attendee registers for
// a free event. Mirrors PaidTicketHostNotification but flagged as a free
// ticket so the host knows there's no payment to track.
// Replaces inline HTML in src/app/api/sendgrid/free-ticket/route.js (host email).

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import BrandDataRow from "../_components/BrandDataRow";

export default function FreeTicketHostNotification({
  eventName = "Open Cacao Sit",
  attendeeName = "Sólveig Magnúsdóttir",
  attendeeEmail = "solveig@example.is",
  managerUrl = "https://mama.is/events/manager",
} = {}) {
  return (
    <BrandLayout
      preview={`New free-ticket registration for ${eventName} — ${attendeeName}`}
      eyebrow="White Lotus · Hosting"
    >
      <BrandHeading size="lg">A new free-ticket registration.</BrandHeading>

      <BrandText>
        Someone just registered for your event{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>{eventName}</strong> with
        a free ticket.
      </BrandText>

      <BrandDataRow label="Attendee" value={attendeeName} />
      <BrandDataRow label="Email" value={attendeeEmail} mono />
      <BrandDataRow label="Ticket type" value="Free" />

      <BrandButton href={managerUrl}>View all attendees</BrandButton>

      <BrandText
        tone="muted"
        align="center"
        style={{ marginTop: "20px", fontSize: "13px" }}
      >
        New to hosting?{" "}
        <a
          href="https://mama.is/auth"
          style={{ color: BRAND.ORANGE, textDecoration: "none" }}
        >
          Create an account
        </a>{" "}
        to manage events more easily.
      </BrandText>

      <BrandText style={{ marginTop: "26px" }}>With warmth,</BrandText>
      <BrandText
        style={{
          fontFamily: BRAND.fontStack.serif,
          fontStyle: "italic",
          fontSize: "18px",
          margin: "-8px 0 0",
        }}
      >
        The White Lotus team
      </BrandText>
    </BrandLayout>
  );
}

FreeTicketHostNotification.previewProps = {
  eventName: "Open Cacao Sit",
  attendeeName: "Sólveig Magnúsdóttir",
  attendeeEmail: "solveig@example.is",
  managerUrl: "https://mama.is/events/manager",
};

FreeTicketHostNotification.subject = "New Free Ticket Registration for Open Cacao Sit";
