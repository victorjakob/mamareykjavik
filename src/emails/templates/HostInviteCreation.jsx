// HostInviteCreation — sent to a new host being invited to create an event.
// Replaces inline HTML in src/lib/hostInviteEmail.js (buildHostInviteEmailHtml).
// Three CTAs: create event, manage events, cleaning checklist.

import { Section } from "@react-email/components";
import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";

const CLEANING_LIST_URL = "https://mama.is/cleaning-list";

function CtaCard({ label, body, href, ctaLabel, accentTone = "neutral" }) {
  // accentTone: "neutral" (cream) or "warm" (orange-tinted)
  const isWarm = accentTone === "warm";
  return (
    <Section
      style={{
        margin: "16px 0",
        padding: "20px 22px",
        background: isWarm ? "rgba(255,145,77,0.06)" : "#faf6f2",
        border: `1px solid ${isWarm ? "rgba(255,145,77,0.28)" : BRAND.HAIRLINE}`,
        borderRadius: "12px",
        textAlign: "center",
      }}
    >
      <BrandText
        tone="muted"
        align="center"
        style={{
          margin: "0 0 6px",
          fontSize: "10px",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          fontWeight: 700,
          color: isWarm ? BRAND.ORANGE : BRAND.TEXT_MUTED,
        }}
      >
        {label}
      </BrandText>
      <BrandText align="center" style={{ margin: "0 0 12px", fontSize: "14px" }}>
        {body}
      </BrandText>
      <BrandButton href={href} variant={isWarm ? "primary" : "ghost"}>
        {ctaLabel}
      </BrandButton>
    </Section>
  );
}

export default function HostInviteCreation({
  inviteUrl = "https://mama.is/auth?callbackUrl=%2Fadmin%2Fcreate-event",
  manageEventsUrl = "https://mama.is/events/manager",
} = {}) {
  return (
    <BrandLayout
      preview="A warm welcome — you're invited to host your event at White Lotus."
      eyebrow="White Lotus · Hosting"
    >
      <BrandHeading size="lg">
        You're invited to host with us.
      </BrandHeading>

      <BrandText>Hi,</BrandText>
      <BrandText>
        A warm welcome, and thank you for choosing to host your event with{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>White Lotus</strong>.
        We're happy to have you with us.
      </BrandText>
      <BrandText>
        Use the links below to log in or register, and from there you can go
        directly to creating your event.
      </BrandText>

      <CtaCard
        label="Create event"
        body="Start here to log in or register and move directly into creating your event."
        href={inviteUrl}
        ctaLabel="Create event →"
        accentTone="warm"
      />

      <CtaCard
        label="Manage your events"
        body="Once your event is live, use this page to review, edit, and keep track of your events in one place."
        href={manageEventsUrl}
        ctaLabel="Manage events"
      />

      <CtaCard
        label="Cleaning checklist"
        body="Before or after hosting, this guide explains the closing routine and how to leave the space ready for the next group."
        href={CLEANING_LIST_URL}
        ctaLabel="View checklist"
      />

      <BrandText style={{ marginTop: "22px" }}>
        If you have any questions before publishing your event, simply reply
        to this email and our team will help you.
      </BrandText>

      <BrandText style={{ marginTop: "26px" }}>Warmly,</BrandText>
      <BrandText
        style={{
          fontFamily: BRAND.fontStack.serif,
          fontStyle: "italic",
          fontSize: "18px",
          margin: "-8px 0 0",
        }}
      >
        White Lotus
      </BrandText>
    </BrandLayout>
  );
}

HostInviteCreation.previewProps = {
  inviteUrl: "https://mama.is/auth?callbackUrl=%2Fadmin%2Fcreate-event",
  manageEventsUrl: "https://mama.is/events/manager",
};

HostInviteCreation.subject =
  "You're invited to create your event at White Lotus";
