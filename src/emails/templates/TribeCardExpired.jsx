// TribeCardExpired — sent the day a gifted / legacy Tribe Card flips to
// expired. Short, warm, one button. No guilt.

import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import BrandCallout from "../_components/BrandCallout";
import { BrandLayout, BRAND, formatDate, SameEmailNote, SignOff } from "./_tribeLifecycleShared";

export default function TribeCardExpired({
  firstName = "friend",
  discountPercent = 20,
  expiresAt = null,
  membershipUrl = "https://mama.is/membership",
} = {}) {
  const date = formatDate(expiresAt);
  return (
    <BrandLayout
      preview="Your Tribe Card has ended — keeping the 20% takes a minute."
      eyebrow="Mama · Tribe"
    >
      <BrandHeading size="lg">Your Tribe Card has ended, {firstName}.</BrandHeading>

      <BrandText>
        As of {date}, your Mama Tribe Card is no longer active. If it&apos;s in
        your phone wallet, you&apos;ll see it now reads &ldquo;Expired&rdquo;
        instead of {discountPercent}%.
      </BrandText>

      <BrandText>
        Thank you — truly — for the time you spent in the Tribe. We&apos;d
        love to keep you at the table.
      </BrandText>

      <BrandCallout label="Keep the love going">
        Join the Tribe for 2,000 kr. a month and your card wakes straight back
        up: same {discountPercent}% on food and drinks, early access to events,
        the monthly Letter from Mama. Cancel whenever you like.
      </BrandCallout>

      <BrandButton href={membershipUrl}>Join the Tribe — 2,000 kr./month</BrandButton>

      <SameEmailNote />

      <BrandText tone="muted" style={{ fontSize: "13px" }}>
        Not the right moment? No problem at all. Come by for a bowl of
        something warm whenever you like — Tribe or not, you&apos;re always
        welcome here.
      </BrandText>

      <SignOff />
    </BrandLayout>
  );
}

TribeCardExpired.previewProps = {
  firstName: "Hera",
  discountPercent: 20,
  expiresAt: "2027-01-15T12:00:00Z",
  membershipUrl: "https://mama.is/membership?ref=card-expired",
};

TribeCardExpired.subject = "Your Tribe Card has ended — here's how to keep the love going";
