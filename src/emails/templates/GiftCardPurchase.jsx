// GiftCardPurchase — sent when a gift card payment succeeds.
// Replaces inline HTML in src/app/api/saltpay/giftcard/success-server/route.js
// Magic link gives instant card access without login. Three delivery methods
// (email, pickup, mail) each get a custom delivery note.

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import BrandDataRow from "../_components/BrandDataRow";
import BrandCallout from "../_components/BrandCallout";

const DELIVERY_INSTRUCTIONS = {
  email:
    "We'll create and activate your gift card in our system within 48 hours. You'll receive an official gift card email from Dineout once it's ready. You can also check status from the link above.",
  pickup:
    "You can pick up your physical gift card at Mama Reykjavík. Show the link above as proof of purchase when you arrive.",
  mail:
    "Your physical gift card will be sent to the shipping address you provided within the next 48 hours. Please allow a few days for delivery.",
};

export default function GiftCardPurchase({
  buyerName = "Valued guest",
  formattedAmount = "10.000 kr.",
  deliveryMethod = "email", // email | pickup | mail
  magicLinkUrl = "https://mama.is/gift-card/example-token",
} = {}) {
  const firstName = (buyerName || "").split(" ")[0] || "friend";
  const showLink = deliveryMethod !== "mail";
  const deliveryNote =
    DELIVERY_INSTRUCTIONS[deliveryMethod] || DELIVERY_INSTRUCTIONS.email;
  const prettyMethod =
    deliveryMethod.charAt(0).toUpperCase() + deliveryMethod.slice(1);

  return (
    <BrandLayout
      preview={`Your gift card is ready — ${formattedAmount}`}
      eyebrow="Mama · Gift card"
    >
      <BrandHeading size="lg">Your gift card is ready.</BrandHeading>

      <BrandText>Dear {firstName},</BrandText>
      <BrandText>
        Thank you for your purchase. Your gift card order has been received
        and payment is confirmed.
      </BrandText>

      {deliveryMethod === "email" ? (
        <BrandCallout label="A quick note">
          We'll create and activate your gift card in our system within 48
          hours. You'll receive an official gift card email from Dineout
          once it's ready — you can use either that or the link below.
        </BrandCallout>
      ) : null}

      {showLink ? (
        <>
          <BrandButton href={magicLinkUrl}>View your gift card</BrandButton>
          <BrandText
            tone="muted"
            align="center"
            style={{ marginTop: "8px", fontSize: "13px" }}
          >
            This link gives you instant access to your gift card. No login —
            bookmark it for easy access.
          </BrandText>
        </>
      ) : null}

      <BrandDataRow label="Amount" value={formattedAmount} emphasis />
      <BrandDataRow label="Delivery method" value={prettyMethod} />
      <BrandDataRow label="Expiry" value="Never expires" />

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
          What happens next
        </BrandText>
        <BrandText align="center">{deliveryNote}</BrandText>
      </div>

      <BrandText style={{ marginTop: "26px" }}>
        Made with big love,
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

GiftCardPurchase.previewProps = {
  buyerName: "Sólveig Magnúsdóttir",
  formattedAmount: "10.000 kr.",
  deliveryMethod: "email",
  magicLinkUrl: "https://mama.is/gift-card/preview-token-abc123",
};

GiftCardPurchase.subject = "Your Gift Card is Ready";
