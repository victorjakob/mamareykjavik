// CustomCardUpdated — sent to a recipient when admin edits a custom card
// AND opts in to notify the recipient. Replaces inline HTML in
// PATCH /api/admin/custom-cards/[id].

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";

export default function CustomCardUpdated({
  recipientName = "friend",
  cardName = "Mama Card",
  cardUrl = "https://mama.is/custom-card/example",
} = {}) {
  return (
    <BrandLayout
      preview={`Your ${cardName} has been updated.`}
      eyebrow="Mama · Cards"
    >
      <BrandHeading size="lg">Card updated.</BrandHeading>

      <BrandText>Hello {recipientName},</BrandText>
      <BrandText>
        Your Mama Card{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>{cardName}</strong> has
        just been updated by our team. Tap below to see the latest balance
        and details.
      </BrandText>

      <BrandButton href={cardUrl}>View your card</BrandButton>

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

CustomCardUpdated.previewProps = {
  recipientName: "Sólveig",
  cardName: "Studio Norð · Holiday gift",
  cardUrl: "https://mama.is/custom-card/preview-token-abc123",
};

CustomCardUpdated.subject = "Update: your Mama Card";
