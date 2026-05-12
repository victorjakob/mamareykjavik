// SummerMarketRejection — sent to a vendor when admin rejects their Summer
// Market application. Voice: kind, no-fault, no false hope.

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandCallout from "../_components/BrandCallout";

export default function SummerMarketRejection({
  name = "friend",
  rejectionNote = null,
} = {}) {
  return (
    <BrandLayout
      preview="Update on your White Lotus Summer Market application."
      eyebrow="White Lotus · Summer Market"
    >
      <BrandHeading size="lg">Application update.</BrandHeading>

      <BrandText>Hi {name},</BrandText>
      <BrandText>
        Thank you for applying to the White Lotus Summer Market.
      </BrandText>
      <BrandText>
        After review, we're sorry to share that we can't offer a spot for
        this round.
      </BrandText>

      {rejectionNote ? (
        <BrandCallout label="Note from our team">{rejectionNote}</BrandCallout>
      ) : null}

      <BrandText>Thank you again for your time and application.</BrandText>

      <BrandText style={{ marginTop: "26px" }}>Warmly,</BrandText>
      <BrandText
        style={{
          fontFamily: BRAND.fontStack.serif,
          fontStyle: "italic",
          fontSize: "18px",
          margin: "-8px 0 0",
        }}
      >
        White Lotus
      </BrandText>
    </BrandLayout>
  );
}

SummerMarketRejection.previewProps = {
  name: "Sólveig Magnúsdóttir",
  rejectionNote:
    "We had so many beautiful applications this year that we had to make some hard calls. We'd love for you to apply again next season.",
};

SummerMarketRejection.subject =
  "Update on your White Lotus Summer Market application";
