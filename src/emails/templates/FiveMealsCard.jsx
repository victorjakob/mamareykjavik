// FiveMealsCard — sent when the 5 Meals for Winter card payment succeeds.
// Replaces inline HTML in src/app/api/saltpay/5-meals/success-server/route.js
// Magic link to view + use the card. Specific business rules preserved:
// valid Dec 1 → May 31, 5th bowl free with ceremonial cacao/tea/coffee.

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import BrandDataRow from "../_components/BrandDataRow";

export default function FiveMealsCard({
  buyerName = "Valued guest",
  magicLinkUrl = "https://mama.is/meal-card/example-token",
  mealsRemaining = 5,
  validFrom = "December 1, 2025",
  validUntil = "May 31, 2026",
} = {}) {
  const firstName = (buyerName || "").split(" ")[0] || "friend";

  return (
    <BrandLayout
      preview="Your 5 Meals for Winter card is ready — view and use it from the link below."
      eyebrow="Mama · 5 Meals card"
    >
      <BrandHeading size="lg">Your 5 Meals card is ready.</BrandHeading>

      <BrandText>Dear {firstName},</BrandText>
      <BrandText>
        Thank you for your purchase. Your{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>
          5 Meals for Winter
        </strong>{" "}
        card has been added to your Mama account.
      </BrandText>

      <BrandButton href={magicLinkUrl}>View &amp; use your card</BrandButton>
      <BrandText
        tone="muted"
        align="center"
        style={{ marginTop: "8px", fontSize: "13px" }}
      >
        Instant access, no login. Bookmark it on your phone for easy use.
      </BrandText>

      <BrandDataRow label="Meals remaining" value={String(mealsRemaining)} emphasis />
      <BrandDataRow label="Valid from" value={validFrom} />
      <BrandDataRow label="Valid until" value={validUntil} />

      <div style={{ margin: "22px 0 0", textAlign: "center" }}>
        <BrandText
          tone="muted"
          align="center"
          style={{
            margin: "0 0 6px",
            fontSize: "11px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontWeight: 600,
            color: BRAND.ORANGE,
          }}
        >
          A small gift
        </BrandText>
        <BrandText align="center">
          Your <strong style={{ color: BRAND.TEXT_DARK }}>5th bowl</strong>{" "}
          comes with a free ceremonial cacao, tea, or coffee — on the house.
        </BrandText>
      </div>

      <div style={{ margin: "22px 0 0", textAlign: "center" }}>
        <BrandText
          tone="muted"
          align="center"
          style={{
            margin: "0 0 6px",
            fontSize: "11px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          How to use
        </BrandText>
        <BrandText align="center">
          Open your card from the button above, show your phone at the
          restaurant, and your meal is automatically deducted.
        </BrandText>
      </div>

      <BrandText style={{ marginTop: "26px" }}>Made with big love,</BrandText>
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

FiveMealsCard.previewProps = {
  buyerName: "Jón Pálsson",
  magicLinkUrl: "https://mama.is/meal-card/preview-token-abc123",
  mealsRemaining: 5,
  validFrom: "December 1, 2025",
  validUntil: "May 31, 2026",
};

FiveMealsCard.subject = "Your 5 Meals for Winter Card is Ready";
