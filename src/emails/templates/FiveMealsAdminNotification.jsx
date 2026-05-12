// FiveMealsAdminNotification — sent to team@mama.is when a 5 Meals card is
// purchased. Replaces inline HTML in
// src/app/api/saltpay/5-meals/success-server/route.js (admin email).

import BrandLayout from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import BrandDataRow from "../_components/BrandDataRow";

export default function FiveMealsAdminNotification({
  buyerName = "—",
  buyerEmail = "—",
  existingAccount = "No",
  orderId = "—",
  formattedPrice = "—",
  currency = "ISK",
  mealsRemaining = 5,
  validFrom = "—",
  validUntil = "—",
  magicLinkUrl = "https://mama.is/meal-card/example",
  adminUrl = "https://mama.is/admin/manage-meal-cards",
} = {}) {
  return (
    <BrandLayout
      preview={`New 5 Meals purchase — ${buyerName}`}
      eyebrow="Mama · Meal Cards"
    >
      <BrandHeading size="lg">New 5 Meals purchase.</BrandHeading>
      <BrandText>A customer just bought the 5 Meals for Winter card.</BrandText>

      <BrandDataRow label="Buyer" value={buyerName} />
      <BrandDataRow label="Email" value={buyerEmail} mono />
      <BrandDataRow label="Existing account" value={existingAccount} />
      <BrandDataRow label="Order ID" value={orderId} mono />
      <BrandDataRow label="Charge" value={`${formattedPrice} ${currency}`} emphasis />
      <BrandDataRow label="Meals remaining" value={String(mealsRemaining)} />
      <BrandDataRow label="Valid" value={`${validFrom} → ${validUntil}`} />

      <BrandButton href={magicLinkUrl}>View customer card</BrandButton>
      <BrandButton href={adminUrl} variant="ghost">
        Open meal cards dashboard
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

FiveMealsAdminNotification.previewProps = {
  buyerName: "Jón Pálsson",
  buyerEmail: "jon@example.is",
  existingAccount: "Yes",
  orderId: "5M-2026-0517-A4F2",
  formattedPrice: "12.000 kr.",
  currency: "ISK",
  mealsRemaining: 5,
  validFrom: "December 1, 2025",
  validUntil: "May 31, 2026",
  magicLinkUrl: "https://mama.is/meal-card/preview-token-abc123",
  adminUrl: "https://mama.is/admin/manage-meal-cards",
};

FiveMealsAdminNotification.subject = "New 5 Meals purchase – Jón Pálsson";
