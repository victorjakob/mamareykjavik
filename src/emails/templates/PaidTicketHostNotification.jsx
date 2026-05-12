// PaidTicketHostNotification — sent to a host when an attendee buys a ticket.
// Replaces inline HTML in src/app/api/sendgrid/ticket/route.js (host email).
// Functional, scannable — the host is checking who's coming.

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import BrandDataRow from "../_components/BrandDataRow";

export default function PaidTicketHostNotification({
  eventName = "Sound Bath with Þórunn",
  attendeeName = "Anna Sigurðardóttir",
  attendeeEmail = "anna@example.is",
  managerUrl = "https://mama.is/events/manager",
} = {}) {
  return (
    <BrandLayout
      preview={`New registration for ${eventName} — ${attendeeName}`}
      eyebrow="White Lotus · Hosting"
    >
      <BrandHeading size="lg">A new registration.</BrandHeading>

      <BrandText>
        Someone just registered for your event{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>{eventName}</strong>.
      </BrandText>

      <BrandDataRow label="Attendee" value={attendeeName} />
      <BrandDataRow label="Email" value={attendeeEmail} mono />

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

PaidTicketHostNotification.previewProps = {
  eventName: "Sound Bath with Þórunn",
  attendeeName: "Anna Sigurðardóttir",
  attendeeEmail: "anna@example.is",
  managerUrl: "https://mama.is/events/manager",
};

PaidTicketHostNotification.subject = "New Registration for Sound Bath with Þórunn";
