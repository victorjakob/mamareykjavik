// TribeCardExpiringSoon — 30 days before a gifted / legacy Tribe Card ends.
// Voice: a heads-up between friends, not a renewal notice. One clear ask:
// keep the 20% by joining the Tribe (2,000 kr./month).

import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import BrandCallout from "../_components/BrandCallout";
import { BrandLayout, BRAND, formatDate, SameEmailNote, SignOff } from "./_tribeLifecycleShared";

export default function TribeCardExpiringSoon({
  firstName = "friend",
  discountPercent = 20,
  expiresAt = null,
  cardUrl = "https://mama.is/tribe-card",
  membershipUrl = "https://mama.is/membership",
} = {}) {
  const date = formatDate(expiresAt);
  return (
    <BrandLayout
      preview={`Your Tribe Card ends on ${date}. Here's how to keep it.`}
      eyebrow="Mama · Tribe"
    >
      <BrandHeading size="lg">One month left on your card, {firstName}.</BrandHeading>

      <BrandText>
        A small heads-up before it happens quietly: your Mama Tribe Card —
        the one that takes {discountPercent}% off everything at the table —
        comes to an end on{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>{date}</strong>.
      </BrandText>

      <BrandText>
        It has been a joy having you in the circle. Every hummus, every
        chai, every evening you spent here helped keep this place alive, and
        we don&apos;t take that lightly.
      </BrandText>

      <BrandCallout label="Keep your 20%">
        The Tribe membership is 2,000 kr. a month — cancel any time. You keep
        the same card, the same discount, plus early access to events, the
        monthly Letter from Mama, and the occasional surprise.
      </BrandCallout>

      <BrandButton href={membershipUrl}>Keep my 20% — join the Tribe</BrandButton>

      <SameEmailNote />

      <BrandText tone="muted" style={{ fontSize: "13px" }}>
        Until {date} your card works exactly as before —{" "}
        <a href={cardUrl} style={{ color: BRAND.ORANGE }}>here it is</a> if you
        need it. And if you&apos;d rather let it go, that&apos;s completely fine;
        the door is always open.
      </BrandText>

      <SignOff />
    </BrandLayout>
  );
}

TribeCardExpiringSoon.previewProps = {
  firstName: "Hera",
  discountPercent: 20,
  expiresAt: "2027-01-15T12:00:00Z",
  cardUrl: "https://mama.is/tribe-card/preview-token",
  membershipUrl: "https://mama.is/membership?ref=card-expiring",
};

TribeCardExpiringSoon.subject = "Your Tribe Card ends soon — let's keep you close";
