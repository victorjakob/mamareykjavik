// TribeCardInvite — one-off note to holders of unlimited (never-expiring)
// Tribe Cards. Their perk stays. This is an invitation to support Mama by
// joining the paid Tribe, nothing more. Sent once per card, by hand from
// the admin, never by the cron.

import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import BrandCallout from "../_components/BrandCallout";
import { BrandLayout, BRAND, SameEmailNote, SignOff } from "./_tribeLifecycleShared";

export default function TribeCardInvite({
  firstName = "friend",
  discountPercent = 20,
  membershipUrl = "https://mama.is/membership",
} = {}) {
  return (
    <BrandLayout
      preview="Your card isn't going anywhere. This is something else."
      eyebrow="Mama · Tribe"
    >
      <BrandHeading size="lg">A small invitation, {firstName}.</BrandHeading>

      <BrandText>
        First, the important part: your Mama Tribe Card stays exactly as it
        is. Your {discountPercent}% isn&apos;t going anywhere. You were there
        early, and that means something to us.
      </BrandText>

      <BrandText>
        This year we opened the Tribe to everyone as a paid membership —
        2,000 kr. a month, cancel any time. It&apos;s how we keep an
        independent plant-based kitchen and a community space alive in the
        middle of Reykjavík, without turning into something we&apos;re not.
      </BrandText>

      <BrandCallout label="If you'd like to be part of that">
        Joining the Tribe adds early access to events and special evenings,
        the monthly Letter from Mama, occasional gifts and surprises, and
        first invitation when retreats and deeper offerings open. And it
        quietly helps keep the lights on.
      </BrandCallout>

      <BrandButton href={membershipUrl}>Join the Tribe — 2,000 kr./month</BrandButton>

      <SameEmailNote />

      <BrandText tone="muted" style={{ fontSize: "13px" }}>
        No pressure, and no follow-ups — this is the only note you&apos;ll get
        about it. Thank you for being one of the people who made Mama, Mama.
      </BrandText>

      <SignOff />
    </BrandLayout>
  );
}

TribeCardInvite.previewProps = {
  firstName: "Hera",
  discountPercent: 20,
  membershipUrl: "https://mama.is/membership?ref=card-invite",
};

TribeCardInvite.subject = "A small invitation from Mama";
