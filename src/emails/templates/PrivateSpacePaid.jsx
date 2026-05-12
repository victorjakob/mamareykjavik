// PrivateSpacePaid — sent to the customer after Teya callback confirms payment
// for an approved Private Space booking. The room is theirs at the time block.
// Replaces inline HTML in src/app/api/private-space/securepay-callback/route.js
// (sendPaidConfirmationEmail).

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandDataRow from "../_components/BrandDataRow";

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    weekday: "long", year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function PrivateSpacePaid({
  contactName = "friend",
  referenceId = "ref-preview",
  startAt = null,
  endAt = null,
} = {}) {
  return (
    <BrandLayout
      preview="You're booked — the room is yours."
      eyebrow="The Private Space"
    >
      <BrandHeading size="lg">You're booked.</BrandHeading>

      <BrandText>Hi {contactName},</BrandText>
      <BrandText>
        Payment received and the room is yours at this time:
      </BrandText>

      <BrandDataRow label="From" value={fmtDate(startAt)} />
      <BrandDataRow label="To" value={fmtDate(endAt)} />

      <BrandText style={{ marginTop: "20px" }}>
        Come to{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>Bankastræti 2</strong> —
        the entrance is private. We'll send arrival instructions 24 hours
        before your booking.
      </BrandText>

      <BrandText
        tone="muted"
        align="center"
        style={{
          marginTop: "20px",
          fontSize: "11.5px",
          fontFamily: '"SF Mono", Menlo, monospace',
        }}
      >
        Reference: {referenceId}
      </BrandText>

      <BrandText style={{ marginTop: "26px" }}>See you soon,</BrandText>
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

PrivateSpacePaid.previewProps = {
  contactName: "Sólveig",
  referenceId: "PS-solveig-13062026",
  startAt: "2026-06-13T13:00:00.000Z",
  endAt: "2026-06-13T17:00:00.000Z",
};

PrivateSpacePaid.subject = "Booking confirmed · The Private Space";
