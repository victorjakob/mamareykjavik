// CancellationFinal — sent when a subscription period actually ends.
// Voice: lyrical, grateful, gently inviting them back.

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";

export default function CancellationFinal({
  name = "there",
  tier = "Tribe",
  manageUrl = "https://mama.is/membership",
} = {}) {
  const firstName = (name || "").split(" ")[0] || "there";
  return (
    <BrandLayout
      preview="Until next time — the door stays open."
      eyebrow="Mama · Tribe"
    >
      <BrandHeading size="lg">Until next time.</BrandHeading>

      <BrandText>Hi {firstName},</BrandText>
      <BrandText>
        Your Mama Tribe{tier ? ` (${tier})` : ""} membership has come to the
        end of its period. Thank you for being part of our little circle —
        it meant something.
      </BrandText>

      <BrandText>
        If you'd like to rejoin, the Tribe is always here. And if you'd just
        like to drop by for a stew and a hug, our door is open.
      </BrandText>

      <BrandButton href={manageUrl}>Come back to the Tribe</BrandButton>

      <BrandText style={{ marginTop: "26px" }}>With love,</BrandText>
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

CancellationFinal.previewProps = {
  name: "Sólveig Magnúsdóttir",
  tier: "Tribe",
  manageUrl: "https://mama.is/membership",
};

CancellationFinal.subject = "Your Mama Tribe membership has ended";
