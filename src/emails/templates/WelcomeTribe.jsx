// WelcomeTribe — sent when someone subscribes to the paid Tribe tier (2,000 ISK/mo).
// Copy is Mama's own (Victor, Sept 2026) — keep it human, don't "improve" it.
// The Tribe Card itself arrives in a separate email (tribe-card-welcome) with
// the wallet buttons; this one is the thank-you and the list of what's included.

import { Section } from "@react-email/components";
import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";

const PERKS = [
  {
    title: "20% off food & drinks at Mama",
    note: "Your Mama Tribe Card will arrive in a separate email. Add it to Apple or Google Wallet and show it when you order.",
  },
  {
    title: "Early access to selected events",
    note: "For some gatherings and special evenings, Tribe members will hear about them first.",
  },
  {
    title: "A monthly letter from Mama",
    note: "A little update from us — what's happening, what we're dreaming about, and things we'd like to share with you.",
  },
  {
    title: "Member gifts & little extras",
    note: "From time to time, we'll send something your way or invite you into something special.",
  },
  {
    title: "First access to new offerings",
    note: "Retreats, recordings, gatherings and other things we create along the way.",
  },
];

export default function WelcomeTribe({
  firstName = "friend",
  manageUrl = "https://mama.is/membership",
} = {}) {
  return (
    <BrandLayout
      preview="Thank you for being part of Mama in a deeper way."
      eyebrow="Mama · Tribe"
    >
      <BrandHeading size="lg">Welcome to the Tribe, {firstName} 💛</BrandHeading>

      <BrandText>
        Thank you for being part of Mama in a deeper way. Your membership
        helps support the space, the people, the events and everything
        we&apos;re slowly building around it.
      </BrandText>

      <BrandText>As part of the Mama Tribe, you now get:</BrandText>

      <Section
        style={{
          background: "#faf6f2",
          border: `1px solid ${BRAND.HAIRLINE}`,
          borderRadius: "12px",
          padding: "8px 22px",
          margin: "18px 0 8px",
        }}
      >
        {PERKS.map((perk, i, arr) => (
          <div
            key={perk.title}
            style={{
              padding: "14px 0",
              borderBottom:
                i < arr.length - 1 ? `1px solid ${BRAND.HAIRLINE}` : "none",
            }}
          >
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
        Your membership renews monthly, and you can pause or cancel whenever
        you like from the membership page.
      </BrandText>

      <BrandText style={{ marginTop: "22px" }}>
        Thank you for being here and helping us keep Mama growing. 💛
      </BrandText>

      <BrandText style={{ marginTop: "18px" }}>With love,</BrandText>
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

WelcomeTribe.subject = "Welcome to the Tribe 💛";
