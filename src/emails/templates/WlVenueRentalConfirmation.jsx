// WlVenueRentalConfirmation — sent when a customer submits a White Lotus
// venue rental inquiry. Replaces both the legacy inline HTML in
// src/app/api/sendgrid/email-wl-rent/route.js AND its preview adapter.

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandDataRow from "../_components/BrandDataRow";

export default function WlVenueRentalConfirmation({
  name = "friend",
  email = null,
  event = null,
  timeAndDate = null,
  guestCount = null,
  comments = null,
} = {}) {
  return (
    <BrandLayout
      preview={`We have your venue inquiry, ${(name || "").split(" ")[0]} — back to you shortly.`}
      eyebrow="White Lotus · Venue"
    >
      <BrandHeading size="lg">Thank you, {name}.</BrandHeading>

      <BrandText>
        We've received your rental inquiry for{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>White Lotus venue</strong>{" "}
        with the following details:
      </BrandText>

      {event ? <BrandDataRow label="Event type" value={event} /> : null}
      {timeAndDate ? (
        <BrandDataRow label="Requested date/time" value={timeAndDate} />
      ) : null}
      {guestCount ? (
        <BrandDataRow
          label="Expected guest count"
          value={String(guestCount)}
        />
      ) : null}
      {comments ? (
        <BrandDataRow label="Additional details" value={comments} />
      ) : null}

      <BrandText style={{ marginTop: "22px" }}>
        We'll review your request and get back to you shortly
        {email ? (
          <>
            {" "}
            at{" "}
            <span style={{ color: BRAND.TEXT_DARK }}>{email}</span>
          </>
        ) : null}
        .
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

WlVenueRentalConfirmation.previewProps = {
  name: "Jón Pálsson",
  email: "jon@example.is",
  event: "60th birthday dinner",
  timeAndDate: "Saturday 13 June 2026 · 19:00 – 23:00",
  guestCount: 48,
  comments:
    "We'd like a long communal table if possible. Vegan menu, half guests are flying in from abroad.",
};

WlVenueRentalConfirmation.subject =
  "Thank you for your White Lotus Venue Rental Inquiry";
