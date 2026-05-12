// WelcomeCommunity — sent when someone joins the free Community tier.
// Voice: warm, grounded, no over-promising. Sets expectations for what they'll
// receive (event calendar, weekly newsletter, eventual community forum).

import { Section } from "@react-email/components";
import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";

export default function WelcomeCommunity({
  firstName = "friend",
  membershipUrl = "https://mama.is/membership",
  eventsUrl = "https://mama.is/events",
} = {}) {
  return (
    <BrandLayout
      preview="Welcome to the Mama community — a small note about what's next."
      eyebrow="Mama · Community"
    >
      <BrandHeading size="lg">Welcome, {firstName}.</BrandHeading>

      <BrandText>
        We're glad you're here. You've joined the Community tier — the doorway
        into everything we do at Mama.
      </BrandText>

      <BrandText>
        From here on, you'll get our monthly letter — what's coming up at the
        space, the events worth knowing about, and the occasional reflection
        from the kitchen, the studio, or the team.
      </BrandText>

      {/* Soft inset card listing the perks — bullet items stay left-aligned
          for readability; the section label stays centered for elegance. */}
      <Section
        style={{
          background: "#faf6f2",
          border: `1px solid ${BRAND.HAIRLINE}`,
          borderRadius: "12px",
          padding: "20px 22px",
          margin: "22px 0 6px",
        }}
      >
        <BrandText
          tone="muted"
          align="center"
          style={{
            margin: "0 0 12px",
            fontSize: "11px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontWeight: 600,
            color: BRAND.TEXT_MUTED,
          }}
        >
          What you'll receive
        </BrandText>
        <BrandText align="left" style={{ margin: "0 0 6px" }}>
          · Monthly community letter (events, stories, what's stirring)
        </BrandText>
        <BrandText align="left" style={{ margin: "0 0 6px" }}>
          · Early notice when ceremony tickets go live
        </BrandText>
        <BrandText align="left" style={{ margin: 0 }}>
          · Soon: a free recorded meditation each month + community forum
        </BrandText>
      </Section>

      <BrandButton href={eventsUrl}>See what's on this month</BrandButton>

      <BrandText tone="muted" style={{ marginTop: "18px" }}>
        If you'd like to go deeper — discounts, live virtual ceremonies, the
        subscriber chat — the Tribe tier is{" "}
        <a
          href={membershipUrl}
          style={{ color: BRAND.ORANGE, textDecoration: "none" }}
        >
          right here
        </a>
        . No rush.
      </BrandText>

      <BrandText style={{ marginTop: "24px" }}>With warmth,</BrandText>
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

// Sample data used by the admin preview. Always provide realistic values
// so the preview shows something close to what real recipients will see.
WelcomeCommunity.previewProps = {
  firstName: "Anna",
  membershipUrl: "https://mama.is/membership",
  eventsUrl: "https://mama.is/events",
};

WelcomeCommunity.subject = "Welcome to Mama — a small note about what's next";
