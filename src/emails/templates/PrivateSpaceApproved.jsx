// PrivateSpaceApproved — sent to the customer when admin approves their
// Private Space request. Includes the SecurePay payment link.
// Replaces inline HTML in src/app/api/private-space/admin/decision/route.js
// (sendApprovalEmail).

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import BrandDataRow from "../_components/BrandDataRow";

function fmtIsk(n) {
  return `${(Number(n) || 0).toLocaleString("en-GB")} ISK`;
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    weekday: "long", year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function PrivateSpaceApproved({
  contactName = "friend",
  referenceId = "ref-preview",
  startAt = null,
  endAt = null,
  totalIsk = 0,
  paymentUrl = "https://mama.is/private-space/pay/example",
} = {}) {
  return (
    <BrandLayout
      preview={`Booking approved — pay below to lock in your time.`}
      eyebrow="The Private Space"
    >
      <BrandHeading size="lg">Booking approved.</BrandHeading>

      <BrandText>Hi {contactName},</BrandText>
      <BrandText>
        Wonderful news — your request is approved. Pay below to lock in your
        time.
      </BrandText>

      <BrandDataRow label="From" value={fmtDate(startAt)} />
      <BrandDataRow label="To" value={fmtDate(endAt)} />
      <BrandDataRow label="Total" value={fmtIsk(totalIsk)} emphasis />

      <BrandButton href={paymentUrl}>Pay now →</BrandButton>

      <BrandText
        tone="muted"
        align="center"
        style={{ marginTop: "16px", fontSize: "12px" }}
      >
        Payment is securely handled by Teya.
      </BrandText>

      <BrandText
        tone="muted"
        align="center"
        style={{
          marginTop: "10px",
          fontSize: "11.5px",
          fontFamily: '"SF Mono", Menlo, monospace',
        }}
      >
        Reference: {referenceId}
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

PrivateSpaceApproved.previewProps = {
  contactName: "Sólveig",
  referenceId: "PS-solveig-13062026",
  startAt: "2026-06-13T13:00:00.000Z",
  endAt: "2026-06-13T17:00:00.000Z",
  totalIsk: 18000,
  paymentUrl: "https://mama.is/private-space/pay/preview-payment-link",
};

PrivateSpaceApproved.subject =
  "Booking approved · payment link · The Private Space";
