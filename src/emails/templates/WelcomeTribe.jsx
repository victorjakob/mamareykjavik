// WelcomeTribe — sent when someone subscribes to the paid Tribe tier (2,000 ISK/mo).
// This is the warmer, more personal welcome — paid members have leaned in further
// and the tone reflects that. Lists their perks concretely so they remember what
// they get for their money.

import { Section } from "@react-email/components";
import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";

export default function WelcomeTribe({
  firstName = "friend",
  manageUrl = "https://mama.is/membership",
  nextCeremonyDate = null, // ISO string or null
} = {}) {
  const formattedNext = nextCeremonyDate
    ? new Date(nextCeremonyDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
      })
    : null;

  return (
    <BrandLayout
      preview="You're in the Tribe — here's what comes with it."
      eyebrow="Mama · Tribe"
    >
      <BrandHeading size="lg">Welcome to the Tribe, {firstName}.</BrandHeading>

      <BrandText>
        Thank you for stepping in. The Tribe is the heartbeat of what we're
        building at Mama — a small group of people who keep this space alive
        and get to feel the inside of it in return.
      </BrandText>

      <BrandText>Here's what's now yours:</BrandText>

      {/* Perks card with subtle row dividers */}
      <Section
        style={{
          background: "#faf6f2",
          border: `1px solid ${BRAND.HAIRLINE}`,
          borderRadius: "12px",
          padding: "8px 22px",
          margin: "18px 0 8px",
        }}
      >
        {[
          {
            title: "20% off all food & drinks at Mama",
            note: "Mention your membership at the till.",
          },
          {
            title: "Monthly live virtual ceremony",
            note: "Cacao, meditation, breathwork — we send the link a few days before.",
          },
          {
            title: "Early access to event tickets",
            note: "You'll see ceremonies open to subscribers 48h before everyone else.",
          },
          {
            title: "Private subscriber-only chat",
            note: "A quieter room, just for the Tribe.",
          },
        ].map((perk, i, arr) => (
          <div
            key={perk.title}
            style={{
              padding: "14px 0",
              borderBottom:
                i < arr.length - 1 ? `1px solid ${BRAND.HAIRLINE}` : "none",
            }}
          >
            {/* Structured rows stay left-aligned — title + note read as a pair. */}
            <BrandText
              align="left"
              style={{ margin: "0 0 2px", fontWeight: 600 }}
            >
              {perk.title}
            </BrandText>
            <BrandText
              tone="muted"
              align="left"
              style={{ margin: 0, fontSize: "13px" }}
            >
              {perk.note}
            </BrandText>
          </div>
        ))}
      </Section>

      {formattedNext ? (
        <BrandText style={{ marginTop: "18px" }}>
          The next live virtual ceremony is{" "}
          <strong style={{ color: BRAND.ORANGE }}>{formattedNext}</strong> — a
          calendar invite will land in your inbox a few days before.
        </BrandText>
      ) : null}

      <BrandButton href={manageUrl}>Manage my membership</BrandButton>

      <BrandText tone="muted" style={{ marginTop: "18px" }}>
        Your subscription renews monthly. You can pause or cancel any time
        from the membership page — no awkward conversations, no questions
        asked.
      </BrandText>

      <BrandText style={{ marginTop: "24px" }}>With deep gratitude,</BrandText>
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

WelcomeTribe.previewProps = {
  firstName: "Sólveig",
  manageUrl: "https://mama.is/membership",
  nextCeremonyDate: "2026-05-28",
};

WelcomeTribe.subject = "Welcome to the Tribe — here's what's now yours";
