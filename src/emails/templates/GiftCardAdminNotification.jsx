// GiftCardAdminNotification — sent to team@mama.is when a gift card is purchased.
// Replaces inline HTML in src/app/api/saltpay/giftcard/success-server/route.js (admin email).

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import BrandDataRow from "../_components/BrandDataRow";

export default function GiftCardAdminNotification({
  buyerName = "—",
  buyerEmail = "—",
  formattedAmount = "—",
  formattedPrice = "—",
  deliveryMethod = "email",
  orderId = "—",
  magicLinkUrl = "https://mama.is/gift-card/example",
  adminUrl = "https://mama.is/admin/cards/giftcards",
} = {}) {
  const prettyMethod =
    deliveryMethod.charAt(0).toUpperCase() + deliveryMethod.slice(1);
  return (
    <BrandLayout
      preview={`New gift card purchase — ${buyerName}, ${formattedAmount}`}
      eyebrow="Mama · Gift Cards"
    >
      <BrandHeading size="lg">New gift card purchase.</BrandHeading>
      <BrandText>
        A customer just bought a gift card.
      </BrandText>

      <BrandDataRow label="Buyer" value={buyerName} />
      <BrandDataRow label="Email" value={buyerEmail} mono />
      <BrandDataRow label="Order ID" value={orderId} mono />
      <BrandDataRow label="Charge" value={formattedPrice} />
      <BrandDataRow label="Gift card value" value={formattedAmount} emphasis />
      <BrandDataRow label="Delivery method" value={prettyMethod} />

      <BrandButton href={magicLinkUrl}>View gift card</BrandButton>
      <BrandButton href={adminUrl} variant="ghost">
        Open gift cards dashboard
      </BrandButton>

      <BrandText
        tone="muted"
        align="center"
        style={{ marginTop: "20px", fontSize: "11.5px" }}
      >
        Sent automatically from the Mama payment system.
      </BrandText>
    </BrandLayout>
  );
}

GiftCardAdminNotification.previewProps = {
  buyerName: "Sólveig Magnúsdóttir",
  buyerEmail: "solveig@example.is",
  formattedAmount: "10.000 kr.",
  formattedPrice: "10.000 kr.",
  deliveryMethod: "email",
  orderId: "GC-2026-0517-A4F2",
  magicLinkUrl: "https://mama.is/gift-card/preview-token-abc123",
  adminUrl: "https://mama.is/admin/cards/giftcards",
};

GiftCardAdminNotification.subject = "New Gift Card purchase – Sólveig Magnúsdóttir";
