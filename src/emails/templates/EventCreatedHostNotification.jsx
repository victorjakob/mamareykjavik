// EventCreatedHostNotification — sent to a host when their event is created.
// Replaces inline HTML in src/app/api/sendgrid/event-created/route.js
// Tone: warm welcome to hosting, with practical reminders about the venue.

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import BrandDataRow from "../_components/BrandDataRow";
import BrandCallout from "../_components/BrandCallout";

function fmtEventDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtIsk(amount) {
  const n = Number(amount || 0);
  return new Intl.NumberFormat("is-IS").format(Math.round(n));
}

export default function EventCreatedHostNotification({
  eventName = "Sound Bath with Þórunn",
  eventDate = "2026-05-21T18:00:00.000Z",
  duration = 1.5,
  price = 4500,
  payment = "Pay at the door",
  managerUrl = "https://mama.is/events/manager",
  cleaningListUrl = "https://mama.is/cleaning-list",
} = {}) {
  return (
    <BrandLayout
      preview={`Your event "${eventName}" is live.`}
      eyebrow="White Lotus · Hosting"
    >
      <BrandHeading size="lg">Your event is live.</BrandHeading>

      <BrandText>Hi,</BrandText>
      <BrandText>
        Lovely — your event{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>{eventName}</strong> has
        been created and is ready to receive registrations.
      </BrandText>

      <BrandDataRow label="Event" value={eventName} />
      <BrandDataRow label="Date" value={fmtEventDate(eventDate)} />
      <BrandDataRow
        label="Duration"
        value={`${duration} hour${Number(duration) === 1 ? "" : "s"}`}
      />
      <BrandDataRow
        label="Price"
        value={Number(price) > 0 ? `${fmtIsk(price)} ISK` : "Free"}
      />
      <BrandDataRow label="Payment" value={payment} />

      <BrandButton href={managerUrl}>Open event manager</BrandButton>
      <BrandText
        tone="muted"
        align="center"
        style={{ marginTop: "8px", fontSize: "13px" }}
      >
        View attendees, edit details, and create future events from one
        place.
      </BrandText>

      <BrandCallout label="A few gentle reminders" tone="warm">
        Please leave the space clean and tidy — our{" "}
        <a
          href={cleaningListUrl}
          style={{ color: BRAND.ORANGE, textDecoration: "none", fontWeight: 600 }}
        >
          cleaning checklist
        </a>{" "}
        covers the closing routine. Return furniture to its original
        position. Let us know if you need help with the technical setup.
        White Lotus is a sacred space — please treat it with respect. And
        most importantly, have fun.
      </BrandCallout>

      <BrandText style={{ marginTop: "20px" }}>
        Any questions, write to us at{" "}
        <a
          href="mailto:team@whitelotus.is"
          style={{ color: BRAND.ORANGE, textDecoration: "none" }}
        >
          team@whitelotus.is
        </a>{" "}
        — we read everything.
      </BrandText>

      <BrandText style={{ marginTop: "26px" }}>
        We're looking forward to hosting you.
      </BrandText>
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

EventCreatedHostNotification.previewProps = {
  eventName: "Sound Bath with Þórunn",
  eventDate: "2026-05-21T18:00:00.000Z",
  duration: 1.5,
  price: 4500,
  payment: "Pay at the door",
  managerUrl: "https://mama.is/events/manager",
  cleaningListUrl: "https://mama.is/cleaning-list",
};

EventCreatedHostNotification.subject = "Your event is live";
