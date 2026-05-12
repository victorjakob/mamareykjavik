// PrivateCacaoConfirmation — sent when a customer submits a private cacao
// ceremony inquiry. Replaces both the legacy inline HTML in
// src/app/api/sendgrid/private-cacao-booking/route.js AND its preview adapter.

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandDataRow from "../_components/BrandDataRow";

export default function PrivateCacaoConfirmation({
  name = "friend",
  participants = null,
  intention = null,
  location = null,
  preferredDate = null,
  additionalNotes = null,
} = {}) {
  return (
    <BrandLayout
      preview="Your private cacao ceremony request is in — back to you within a few days."
      eyebrow="Mama · Cacao"
    >
      <BrandHeading size="lg">Thank you, {name}.</BrandHeading>

      <BrandText>
        Your private cacao ceremony request is in. We read every inquiry
        personally and will reply within a few days.
      </BrandText>

      <BrandText style={{ marginTop: "20px" }}>
        Here's a summary of what you shared:
      </BrandText>

      {participants ? (
        <BrandDataRow label="Group size" value={String(participants)} />
      ) : null}
      {intention ? (
        <BrandDataRow label="Intention or occasion" value={intention} />
      ) : null}
      {location ? <BrandDataRow label="Location" value={location} /> : null}
      {preferredDate ? (
        <BrandDataRow label="Approximate window" value={preferredDate} />
      ) : null}
      {additionalNotes ? (
        <BrandDataRow label="Notes" value={additionalNotes} />
      ) : null}

      <BrandText style={{ marginTop: "22px" }}>
        If anything changes, simply reply to this email and we'll update
        your request.
      </BrandText>

      <BrandText style={{ marginTop: "26px" }}>With gratitude,</BrandText>
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

PrivateCacaoConfirmation.previewProps = {
  name: "Hera Björk Þórhallsdóttir",
  participants: 12,
  intention: "Birthday celebration & gentle reset",
  location: "At Mama (the back room)",
  preferredDate: "Late June or early July",
  additionalNotes:
    "We'd love a 75-minute ceremony with cacao and breath. A few guests are pregnant.",
};

PrivateCacaoConfirmation.subject =
  "We received your private cacao ceremony request";
