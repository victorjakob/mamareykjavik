// TourBookingConfirmation — sent to a customer after their tour booking is paid.
// Replaces inline HTML in src/app/api/tours/success-server/route.js
// (which also had a `eventData.location` bug — preserved as a TODO note).
//
// Voice: warm welcome to a tour experience. Brand voice with grounded
// language. The tour-specific business info (meeting point, what to bring,
// what's included) is preserved from the original.

import { Section } from "@react-email/components";
import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandCallout from "../_components/BrandCallout";

const DEFAULT_TOUR_INFO = {
  meeting_point:
    "We meet at MAMA Restaurant, Bankastræti 2, 2nd Floor. Look for your guide wearing a MAMA Tours jacket.",
  what_to_bring: [
    "Comfortable walking shoes",
    "Warm and waterproof clothing",
    "Camera",
    "Appetite for delicious food and beer",
  ],
  included: [
    "6 unique food tastings",
    "5 craft beer samples",
    "Professional local guide",
    "Food history and culture commentary",
    "Restaurant recommendations",
  ],
};

function fmtTourDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

function fmtTourTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit",
  });
}

export default function TourBookingConfirmation({
  customerName = "friend",
  customerEmail = "—",
  customerPhone = null,
  tourName = "Reykjavik Food & Beer Walk",
  startTime = null,
  durationMinutes = 180,
  numberOfTickets = 2,
  amount = 0,
  currency = "ISK",
  notes = null,
  tourInfo = DEFAULT_TOUR_INFO,
} = {}) {
  return (
    <BrandLayout
      preview={`Your ${tourName} booking is confirmed.`}
      eyebrow="Mama · Tours"
    >
      <BrandHeading size="lg">Your journey awaits.</BrandHeading>

      <BrandText>Dear {customerName},</BrandText>
      <BrandText>
        We're delighted to welcome you to MAMA Tours. Get ready for an
        authentic journey through the heart of Reykjavik.
      </BrandText>

      {/* Tour details — centered stacked block */}
      <div style={{ margin: "26px 0 20px", textAlign: "center" }}>
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
          When &amp; what
        </BrandText>
        <BrandText
          align="center"
          style={{
            margin: "0 0 6px",
            fontFamily: BRAND.fontStack.serif,
            fontStyle: "italic",
            fontSize: "22px",
            color: BRAND.TEXT_DARK,
          }}
        >
          {tourName}
        </BrandText>
        <BrandText align="center" style={{ margin: "0 0 4px" }}>
          {fmtTourDate(startTime)}
        </BrandText>
        <BrandText align="center" style={{ margin: "0 0 4px" }}>
          {fmtTourTime(startTime)}
          {durationMinutes
            ? ` · ${Math.round(durationMinutes / 60)} hour${Math.round(durationMinutes / 60) === 1 ? "" : "s"}`
            : ""}
          {" · "}
          {numberOfTickets} {numberOfTickets === 1 ? "guest" : "guests"}
        </BrandText>
        <BrandText
          align="center"
          tone="muted"
          style={{ margin: "8px 0 0", fontSize: "13px" }}
        >
          {Math.round(Number(amount) || 0)} {currency} paid
        </BrandText>
      </div>

      {/* Meeting point */}
      <BrandCallout label="Where we'll meet" tone="warm">
        {tourInfo.meeting_point}
      </BrandCallout>

      {/* What's included */}
      {tourInfo.included && tourInfo.included.length > 0 ? (
        <Section
          style={{
            background: "#faf6f2",
            border: `1px solid ${BRAND.HAIRLINE}`,
            borderRadius: "12px",
            padding: "20px 22px",
            margin: "20px 0 0",
          }}
        >
          <BrandText
            tone="muted"
            align="center"
            style={{
              margin: "0 0 10px",
              fontSize: "11px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            What's included
          </BrandText>
          {tourInfo.included.map((item, i) => (
            <BrandText
              key={`inc-${i}`}
              align="left"
              style={{ margin: "0 0 6px", fontSize: "14px" }}
            >
              · {item}
            </BrandText>
          ))}
        </Section>
      ) : null}

      {/* What to bring */}
      {tourInfo.what_to_bring && tourInfo.what_to_bring.length > 0 ? (
        <Section
          style={{
            background: "#faf6f2",
            border: `1px solid ${BRAND.HAIRLINE}`,
            borderRadius: "12px",
            padding: "20px 22px",
            margin: "16px 0 0",
          }}
        >
          <BrandText
            tone="muted"
            align="center"
            style={{
              margin: "0 0 10px",
              fontSize: "11px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            What to bring
          </BrandText>
          {tourInfo.what_to_bring.map((item, i) => (
            <BrandText
              key={`brng-${i}`}
              align="left"
              style={{ margin: "0 0 6px", fontSize: "14px" }}
            >
              · {item}
            </BrandText>
          ))}
        </Section>
      ) : null}

      {/* A few notes */}
      <Section style={{ margin: "24px 0 0", textAlign: "center" }}>
        <BrandText
          tone="muted"
          align="center"
          style={{
            margin: "0 0 8px",
            fontSize: "11px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          A few gentle notes
        </BrandText>
        <BrandText align="center" tone="muted" style={{ fontSize: "13.5px" }}>
          Arrive 10 minutes early. Iceland's weather is changeable — dress in
          layers. Need to change your plans? Let us know 24 hours before.
        </BrandText>
      </Section>

      {notes ? (
        <Section style={{ margin: "20px 0 0", textAlign: "center" }}>
          <BrandText
            tone="muted"
            align="center"
            style={{
              margin: "0 0 6px",
              fontSize: "11px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Your message to us
          </BrandText>
          <BrandText align="center">{notes}</BrandText>
        </Section>
      ) : null}

      <BrandText
        tone="muted"
        align="center"
        style={{ marginTop: "24px", fontSize: "13px" }}
      >
        Need help? Call{" "}
        <a href="tel:+3547666262" style={{ color: BRAND.ORANGE, textDecoration: "none", fontWeight: 600 }}>
          +354 766 6262
        </a>{" "}
        or email{" "}
        <a href="mailto:tours@mama.is" style={{ color: BRAND.ORANGE, textDecoration: "none", fontWeight: 600 }}>
          tours@mama.is
        </a>
      </BrandText>

      <BrandText style={{ marginTop: "26px" }}>Looking forward to it,</BrandText>
      <BrandText
        style={{
          fontFamily: BRAND.fontStack.serif,
          fontStyle: "italic",
          fontSize: "18px",
          margin: "-8px 0 0",
        }}
      >
        The MAMA Tours team
      </BrandText>
    </BrandLayout>
  );
}

TourBookingConfirmation.previewProps = {
  customerName: "Hera Björk Þórhallsdóttir",
  customerEmail: "hera@example.is",
  customerPhone: "+354 555 1234",
  tourName: "Reykjavik Food & Beer Walk",
  startTime: "2026-06-15T17:00:00.000Z",
  durationMinutes: 180,
  numberOfTickets: 2,
  amount: 19800,
  currency: "ISK",
  notes: "We're celebrating my partner's birthday — anything special is welcome.",
  tourInfo: DEFAULT_TOUR_INFO,
};

TourBookingConfirmation.subject =
  "Welcome to your Reykjavik Food & Beer Walk";
