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
} = {}) {
  return (
    <BrandLayout
      preview="You're in the Tribe — here's what comes with it."
      eyebrow="Mama · Tribe"
    >
      <BrandHeading size="lg">Welcome to the Tribe, {firstName}.</BrandHeading>

      <BrandText>
        Thank you for stepping in. The Tribe is the heartbeat of what
        we&apos;re building at Mama — a small group of people who keep this
        space alive and get to feel the inside of it in return.
      </BrandText>

      <BrandText>Here&apos;s what&apos;s now yours:</BrandText>

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
            title: "Mama Tribe Card: 20% off food & drinks at Mama",
            note: "Your card arrives in a separate email — add it to Apple or Google Wallet and show it at the till.",
          },
          {
            title: "Early access to selected events and special evenings",
            note: "You'll hear about them before everyone else.",
          },
          {
            title: "Monthly Letter from Mama",
            note: "Reflections, vision and inspiration, once a month in your inbox.",
          },
          {
            title: "Occasional member gifts, surprises and soft invitations",
            note: "Every now and then, something small finds its way to you.",
          },
          {
            title: "First invitation when deeper offerings open",
            note: "Retreats, recordings and new community offerings — you're first in line.",
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
};

WelcomeTribe.subject = "Welcome to the Tribe — here's what's now yours";
