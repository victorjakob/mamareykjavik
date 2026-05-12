// PrivateSpaceRequestCustomer — sent to a customer when they submit a Private
// Space booking request. English only.
// Replaces inline HTML in src/app/api/private-space/request/route.js (sendEmails).

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandDataRow from "../_components/BrandDataRow";

const BOOKING_TYPE_LABELS = {
  hourly: "Hourly",
  half_day: "Half-day",
  full_day: "Full day",
  recurring_weekly: "Weekly recurring slot",
};

function fmtIsk(n) {
  return `${(Number(n) || 0).toLocaleString("en-GB")} ISK`;
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function PrivateSpaceRequestCustomer({
  contactName = "friend",
  referenceId = "ref-preview",
  bookingType = "hourly",
  startAt = null,
  endAt = null,
  totalIsk = 0,
} = {}) {
  const typeLabel = BOOKING_TYPE_LABELS[bookingType] || bookingType;

  return (
    <BrandLayout
      preview={`Request received — ${referenceId}`}
      eyebrow="The Private Space"
    >
      <BrandHeading size="lg">Request received.</BrandHeading>

      <BrandText>Hi {contactName},</BrandText>
      <BrandText>
        Thanks for your request. We'll review it within 24 hours and email
        you a payment link, or suggest an alternative.
      </BrandText>

      <BrandDataRow label="Reference" value={referenceId} mono />
      <BrandDataRow label="Type" value={typeLabel} />
      <BrandDataRow label="From" value={fmtDate(startAt)} />
      <BrandDataRow label="To" value={fmtDate(endAt)} />
      <BrandDataRow label="Total" value={fmtIsk(totalIsk)} emphasis />

      <BrandText
        tone="muted"
        align="center"
        style={{ marginTop: "28px", fontSize: "13px" }}
      >
        Questions?{" "}
        <a
          href="tel:+3546167722"
          style={{ color: BRAND.ORANGE, textDecoration: "none", fontWeight: 600 }}
        >
          616 7722
        </a>
      </BrandText>

      <BrandText style={{ marginTop: "26px" }}>
        Looking forward to welcoming you,
      </BrandText>
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

PrivateSpaceRequestCustomer.previewProps = {
  contactName: "Sólveig",
  referenceId: "PS-solveig-13062026",
  bookingType: "half_day",
  startAt: "2026-06-13T13:00:00.000Z",
  endAt: "2026-06-13T17:00:00.000Z",
  totalIsk: 18000,
};

PrivateSpaceRequestCustomer.subject = "Request received · The Private Space";
