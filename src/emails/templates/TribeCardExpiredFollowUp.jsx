// TribeCardExpiredFollowUp — one gentle nudge ~14 days after a card expired,
// then we stop. Lighter and more personal than the expiry notice.

import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import { BrandLayout, BRAND, SameEmailNote, SignOff } from "./_tribeLifecycleShared";

export default function TribeCardExpiredFollowUp({
  firstName = "friend",
  discountPercent = 20,
  membershipUrl = "https://mama.is/membership",
} = {}) {
  return (
    <BrandLayout
      preview="A seat is still yours at the table."
      eyebrow="Mama · Tribe"
    >
      <BrandHeading size="lg">We miss you at the table, {firstName}.</BrandHeading>

      <BrandText>
        Your Tribe Card ended a couple of weeks ago and we didn&apos;t want to
        let it slip by without one more hello. Not a sales pitch — just an
        honest note from a small kitchen that runs on its regulars.
      </BrandText>

      <BrandText>
        The Tribe membership is 2,000 kr. a month. Two visits and it&apos;s
        paid for itself in {discountPercent}% discounts — the rest is you
        helping Mama stay what it is: plant-based, independent, and full of
        music.
      </BrandText>

      <BrandButton href={membershipUrl}>Come back to the Tribe</BrandButton>

      <SameEmailNote />

      <BrandText tone="muted" style={{ fontSize: "13px" }}>
        This is the last note about your card — we won&apos;t keep nudging.
        Whatever you decide, thank you for having been part of it. Reply to
        this email any time; a real person reads it.
      </BrandText>

      <SignOff />
    </BrandLayout>
  );
}

TribeCardExpiredFollowUp.previewProps = {
  firstName: "Hera",
  discountPercent: 20,
  membershipUrl: "https://mama.is/membership?ref=card-followup",
};

TribeCardExpiredFollowUp.subject = "We miss you at the table";
