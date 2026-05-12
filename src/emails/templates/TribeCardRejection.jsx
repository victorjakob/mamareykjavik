// TribeCardRejection — soft, optional rejection email for Tribe Card requests.
// Replaces inline HTML in src/lib/tribeCardEmail.js (buildRejectionEmail).
// Voice: gentle, non-final ("if there's been a mix-up, just reply").

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandCallout from "../_components/BrandCallout";

export default function TribeCardRejection({
  holderName = "friend",
  reviewNotes = null,
} = {}) {
  return (
    <BrandLayout
      preview="A small note about your Tribe Card request."
      eyebrow="Mama · Tribe"
    >
      <BrandHeading size="lg">Thank you for writing.</BrandHeading>

      <BrandText>Dear {holderName},</BrandText>
      <BrandText>
        Thank you so much for reaching out about a Tribe Card.
      </BrandText>
      <BrandText>
        After a careful look, we aren't able to issue one to you at this
        time.
      </BrandText>

      {reviewNotes ? (
        <BrandCallout label="A note from us">{reviewNotes}</BrandCallout>
      ) : null}

      <BrandText>
        If you think there's been a mix-up, please just reply to this email
        and we'll take another look.
      </BrandText>

      <BrandText style={{ marginTop: "26px" }}>With love,</BrandText>
      <BrandText
        style={{
          fontFamily: BRAND.fontStack.serif,
          fontStyle: "italic",
          fontSize: "18px",
          margin: "-8px 0 0",
        }}
      >
        Mama Reykjavík
      </BrandText>
    </BrandLayout>
  );
}

TribeCardRejection.previewProps = {
  holderName: "Anna Sigurðardóttir",
  reviewNotes:
    "We're keeping the Tribe small for now — we'd love to revisit this in a few months as we grow.",
};

TribeCardRejection.subject = "Regarding your Tribe Card request";
