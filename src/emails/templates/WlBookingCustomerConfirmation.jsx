// WlBookingCustomerConfirmation — sent when a customer completes a White Lotus
// venue booking. English only.
// Replaces inline HTML in src/app/api/wl/booking/route.js (generateConfirmationContent).

import { Section } from "@react-email/components";
import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";

function fmtDateLong(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

function fmtTime(timeString) {
  if (!timeString) return "—";
  if (timeString.includes(":") && timeString.length <= 5) {
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-GB", {
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return timeString; }
  }
  return timeString;
}

const GUEST_COUNT_LABELS = {
  "undir-10": "Under 10 guests",
  "10-25": "10-25 guests",
  "26-50": "26-50 guests",
  "51-75": "51-75 guests",
  "76-100": "76-100 guests",
  "100+": "100+ guests",
};

export default function WlBookingCustomerConfirmation({
  contactName = "",
  referenceId = "ref-preview",
  bookingUrl = "https://mama.is/whitelotus/booking/preview",
  dateTime = {},
  guestCount = "",
  dateTimeComment = null,
  staffCostAcknowledged = false,
  noOwnAlcoholConfirmed = false,
  notes = null,
} = {}) {
  const guestLabel = GUEST_COUNT_LABELS[guestCount] || guestCount || "—";

  return (
    <BrandLayout
      preview={`Booking confirmed — ${referenceId}`}
      eyebrow="White Lotus · Kornhlaðan"
    >
      <BrandHeading size="lg">Booking confirmed.</BrandHeading>

      <BrandButton href={bookingUrl}>Open dashboard →</BrandButton>
      <BrandText
        tone="muted"
        align="center"
        style={{ marginTop: "6px", fontSize: "13px" }}
      >
        Update times, food, allergies, or message us — anytime.
      </BrandText>

      {/* Reference number card */}
      <Section
        style={{
          margin: "20px 0 26px",
          padding: "16px 22px",
          background: "rgba(255,145,77,0.06)",
          border: `1.5px solid rgba(255,145,77,0.4)`,
          borderRadius: "12px",
          textAlign: "center",
        }}
      >
        <BrandText
          tone="muted"
          align="center"
          style={{
            margin: "0 0 4px",
            fontSize: "10px",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            fontWeight: 700,
            color: BRAND.ORANGE,
          }}
        >
          Booking number
        </BrandText>
        <BrandText
          align="center"
          style={{
            margin: 0,
            fontFamily: '"SF Mono", Menlo, Consolas, monospace',
            fontSize: "20px",
            fontWeight: 600,
            letterSpacing: "0.05em",
            color: BRAND.TEXT_DARK,
          }}
        >
          {referenceId}
        </BrandText>
      </Section>

      <BrandText align="center">
        Dear {contactName || "customer"},
      </BrandText>
      <BrandText align="center">
        Thank you for your booking. We have received your details and will
        confirm within 48 hours.
      </BrandText>

      {/* Booking summary */}
      <Section
        style={{
          background: "#faf6f2",
          border: `1px solid ${BRAND.HAIRLINE}`,
          borderRadius: "12px",
          padding: "20px 22px",
          margin: "22px 0 8px",
          textAlign: "center",
        }}
      >
        <BrandText
          tone="muted"
          align="center"
          style={{
            margin: "0 0 12px",
            fontSize: "10px",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            fontWeight: 600,
            color: BRAND.TEXT_MUTED,
          }}
        >
          Booking summary
        </BrandText>

        <BrandText align="center" style={{ margin: "0 0 6px" }}>
          <span style={{ color: BRAND.TEXT_MUTED, fontSize: "12px", letterSpacing: "0.06em" }}>
            Date:{" "}
          </span>
          <strong style={{ color: BRAND.TEXT_DARK }}>{fmtDateLong(dateTime?.preferred)}</strong>
        </BrandText>
        <BrandText align="center" style={{ margin: "0 0 6px" }}>
          <span style={{ color: BRAND.TEXT_MUTED, fontSize: "12px", letterSpacing: "0.06em" }}>
            Time:{" "}
          </span>
          <strong style={{ color: BRAND.TEXT_DARK }}>
            {fmtTime(dateTime?.startTime)} – {fmtTime(dateTime?.endTime)}
          </strong>
        </BrandText>
        <BrandText align="center" style={{ margin: 0 }}>
          <span style={{ color: BRAND.TEXT_MUTED, fontSize: "12px", letterSpacing: "0.06em" }}>
            Number of guests:{" "}
          </span>
          <strong style={{ color: BRAND.TEXT_DARK }}>{guestLabel}</strong>
        </BrandText>

        {dateTimeComment ? (
          <BrandText
            align="center"
            tone="muted"
            style={{ margin: "12px 0 0", fontSize: "13px", fontStyle: "italic" }}
          >
            {dateTimeComment}
          </BrandText>
        ) : null}
      </Section>

      {/* Confirmations */}
      {(staffCostAcknowledged || noOwnAlcoholConfirmed) ? (
        <Section style={{ margin: "16px 0 0", textAlign: "center" }}>
          <BrandText
            tone="muted"
            align="center"
            style={{
              margin: "0 0 6px",
              fontSize: "10px",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Confirmations
          </BrandText>
          {staffCostAcknowledged ? (
            <BrandText align="center" style={{ margin: "0 0 4px", fontSize: "13.5px" }}>
              ✓ Staff cost acknowledgment confirmed
            </BrandText>
          ) : null}
          {noOwnAlcoholConfirmed ? (
            <BrandText align="center" style={{ margin: 0, fontSize: "13.5px" }}>
              ✓ Alcohol policy confirmed
            </BrandText>
          ) : null}
        </Section>
      ) : null}

      {/* Notes */}
      {notes ? (
        <Section style={{ margin: "18px 0 0" }}>
          <BrandText
            tone="muted"
            align="center"
            style={{
              margin: "0 0 6px",
              fontSize: "10px",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Notes
          </BrandText>
          <BrandText align="center" tone="muted" style={{ margin: 0, fontSize: "13.5px" }}>
            {notes}
          </BrandText>
        </Section>
      ) : null}

      <BrandText
        tone="muted"
        align="center"
        style={{
          marginTop: "32px",
          fontSize: "11px",
          letterSpacing: "0.05em",
        }}
      >
        White Lotus · Kornhlaðan · Bankastræti 2 · 101 Reykjavík
        <br />
        Blessing ehf · 670220-0440
      </BrandText>
    </BrandLayout>
  );
}

WlBookingCustomerConfirmation.previewProps = {
  contactName: "Sólveig Magnúsdóttir",
  referenceId: "solveig-13-06-a4f2",
  bookingUrl: "https://mama.is/whitelotus/booking/solveig-13-06-a4f2",
  dateTime: {
    preferred: "2026-06-13T19:00:00.000Z",
    startTime: "19:00",
    endTime: "23:00",
  },
  guestCount: "26-50",
  dateTimeComment:
    "We'd like to start with a small reception in the entryway from 18:30 if possible.",
  staffCostAcknowledged: true,
  noOwnAlcoholConfirmed: true,
  notes:
    "Half the guests are flying in from abroad — we'd love a long communal table if room allows.",
};

WlBookingCustomerConfirmation.subject = "Booking confirmed — solveig-13-06-a4f2";
