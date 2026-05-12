// PrivateSpaceDeclined — sent to the customer when admin declines their
// Private Space request. Optional reason callout.
// Replaces inline HTML in src/app/api/private-space/admin/decision/route.js
// (sendDeclineEmail).

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandCallout from "../_components/BrandCallout";

export default function PrivateSpaceDeclined({
  contactName = "friend",
  reason = null,
  privateSpaceUrl = "https://mama.is/private-space",
} = {}) {
  return (
    <BrandLayout
      preview="About your Private Space request."
      eyebrow="The Private Space"
    >
      <BrandHeading size="lg">About your request.</BrandHeading>

      <BrandText>Hi {contactName},</BrandText>
      <BrandText>
        Unfortunately we can't accommodate this time.
      </BrandText>

      {reason ? <BrandCallout label="Note from us">{reason}</BrandCallout> : null}

      <BrandText>
        Please try another time — we'd love to host your work.
      </BrandText>

      <BrandText style={{ marginTop: "20px" }}>
        <a
          href={privateSpaceUrl}
          style={{ color: BRAND.ORANGE, textDecoration: "none", fontWeight: 600 }}
        >
          Back to the page →
        </a>
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
        The Mama team
      </BrandText>
    </BrandLayout>
  );
}

PrivateSpaceDeclined.previewProps = {
  contactName: "Hera Björk",
  reason:
    "The room is already booked for a private retreat that whole afternoon. We'd love to offer you the morning instead — let us know if that works.",
  privateSpaceUrl: "https://mama.is/private-space",
};

PrivateSpaceDeclined.subject = "About your request · The Private Space";
