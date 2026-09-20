// MembershipAdminNotification — sent to team@mama.is whenever a membership
// changes hands: someone joins (paid or free), a renewal fails, or someone
// cancels. One template, four kinds, so the four alerts read as a set.
//
// Every membership email before this one went to the member only; nothing
// reached the house. This is the house's copy.

import BrandLayout from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import BrandDataRow from "../_components/BrandDataRow";
import BrandCallout from "../_components/BrandCallout";

export const KINDS = {
  paid_joined: {
    heading: "New Tribe member.",
    blurb: "Someone just paid and joined the Tribe.",
    tone: "neutral",
  },
  free_joined: {
    heading: "New community member.",
    blurb: "Someone just joined the free community tier.",
    tone: "neutral",
  },
  renewal_failed: {
    heading: "A renewal didn't go through.",
    blurb:
      "Their card was declined on renewal. They've been emailed, but it's worth a look — a card that keeps failing quietly drops a member.",
    tone: "warm",
  },
  cancelled: {
    heading: "A membership was cancelled.",
    blurb: "They stay active until the end of the period they've paid for.",
    tone: "warm",
  },
};

export default function MembershipAdminNotification({
  kind = "paid_joined",
  name = "—",
  email = "—",
  tier = null,
  amount = null,
  activeUntil = null,
  reason = null,
  adminUrl = "https://mama.is/admin/memberships",
} = {}) {
  const copy = KINDS[kind] || KINDS.paid_joined;
  const isProblem = copy.tone === "warm";

  return (
    <BrandLayout
      preview={`${copy.heading} ${name} · ${email}`}
      eyebrow="Mama · Admin"
    >
      <BrandHeading size="lg">{copy.heading}</BrandHeading>
      <BrandText>{copy.blurb}</BrandText>

      <BrandDataRow label="Name" value={name} />
      <BrandDataRow label="Email" value={email} mono />
      {tier ? <BrandDataRow label="Tier" value={tier} /> : null}
      {amount ? (
        <BrandDataRow label="Amount" value={amount} emphasis={!isProblem} />
      ) : null}
      {activeUntil ? (
        <BrandDataRow label="Active until" value={activeUntil} />
      ) : null}

      {reason ? <BrandCallout label="Reason" tone="warm">{reason}</BrandCallout> : null}

      <BrandButton href={adminUrl}>Open in admin</BrandButton>
    </BrandLayout>
  );
}

MembershipAdminNotification.previewProps = {
  kind: "paid_joined",
  name: "Anna Sigurðardóttir",
  email: "anna@example.is",
  tier: "Tribe",
  amount: "2.000 ISK",
  activeUntil: "20 October 2026",
  adminUrl: "https://mama.is/admin/memberships",
};

MembershipAdminNotification.subject = "New Tribe member";
