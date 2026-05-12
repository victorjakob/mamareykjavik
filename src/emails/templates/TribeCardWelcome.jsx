// TribeCardWelcome — sent when an admin issues / approves a Tribe Card.
// Replaces the inline HTML in src/lib/tribeCardEmail.js (buildWelcomeCardEmail).
//
// The card visual is the centerpiece: holder name in italic Cormorant,
// discount % in big serif, "valid until" below. Wallet buttons (Apple + Google)
// render only when their respective URLs are passed in. The legacy route adds
// the .pkpass attachment + cid: badge image on its own — that part doesn't
// belong in the template; this template is just the HTML.

import { Section } from "@react-email/components";
import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";

function formatDate(d) {
  if (!d) return "Unlimited";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function durationLabel(duration) {
  switch (duration) {
    case "month":     return "Valid for one month";
    case "6months":   return "Valid for six months";
    case "year":      return "Valid for one year";
    case "unlimited": return "No expiration — yours to keep";
    default:          return "";
  }
}

export default function TribeCardWelcome({
  holderName = "friend",
  discountPercent = 20,
  expiresAt = null,
  durationType = "year",
  publicCardUrl = "https://mama.is/tribe-card/example",
  profileUrl = "https://mama.is/profile/my-tribe-card",
  walletPassUrl = null,    // when set: renders Add-to-Apple-Wallet button
  googleSaveUrl = null,    // when set: renders Save-to-Google-Wallet button
} = {}) {
  const expiryLabel = expiresAt ? formatDate(expiresAt) : "No expiration";

  return (
    <BrandLayout
      preview={`Welcome to the Tribe — your card is active.`}
      eyebrow="Mama · Tribe"
    >
      <BrandHeading size="lg">Welcome to the tribe.</BrandHeading>

      <BrandText>Dear {holderName},</BrandText>
      <BrandText>
        Your Tribe Card is active. Thank you for being part of Mama — your
        presence is what makes this place warm.
      </BrandText>

      {/* ── THE CARD ───────────────────────────────────────────────
          A single centered visual moment: holder name + big discount.
          Cream-on-cream with an orange hairline so it reads as a "card"
          inside the email card.                                       */}
      <Section
        style={{
          margin: "26px 0 18px",
          padding: "26px 24px 22px",
          background:
            "linear-gradient(135deg, #fff6ea 0%, #fbe3cb 70%, #f1c9a0 100%)",
          backgroundColor: "#fbe3cb",
          border: `1px solid ${BRAND.HAIRLINE}`,
          borderRadius: "16px",
          textAlign: "center",
        }}
      >
        <BrandText
          tone="muted"
          align="center"
          style={{
            margin: "0 0 4px",
            fontSize: "10px",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            fontWeight: 700,
            color: BRAND.ORANGE,
          }}
        >
          Mama · Tribe Card
        </BrandText>
        <BrandText
          align="center"
          style={{
            margin: "0 0 18px",
            fontFamily: BRAND.fontStack.serif,
            fontStyle: "italic",
            fontSize: "26px",
            fontWeight: 400,
            color: BRAND.TEXT_DARK,
          }}
        >
          {holderName}
        </BrandText>

        <BrandText
          align="center"
          style={{
            margin: "0",
            fontFamily: BRAND.fontStack.serif,
            fontWeight: 400,
            fontSize: "64px",
            lineHeight: 1,
            color: "#8a3a14",
            letterSpacing: "-0.02em",
          }}
        >
          {discountPercent}
          <span
            style={{
              fontSize: "30px",
              verticalAlign: "top",
              marginLeft: "2px",
            }}
          >
            %
          </span>
        </BrandText>
        <BrandText
          tone="muted"
          align="center"
          style={{ margin: "6px 0 14px", fontSize: "12.5px" }}
        >
          off food &amp; drinks
        </BrandText>

        <div
          style={{
            paddingTop: "12px",
            borderTop: `1px solid ${BRAND.HAIRLINE}`,
          }}
        >
          <BrandText
            tone="muted"
            align="center"
            style={{
              margin: "0 0 2px",
              fontSize: "10px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Valid until
          </BrandText>
          <BrandText
            align="center"
            style={{ margin: "0 0 2px", fontWeight: 600 }}
          >
            {expiryLabel}
          </BrandText>
          <BrandText
            tone="muted"
            align="center"
            style={{ margin: 0, fontSize: "12px" }}
          >
            {durationLabel(durationType)}
          </BrandText>
        </div>
      </Section>

      {/* Action buttons */}
      <BrandButton href={publicCardUrl}>Open your card</BrandButton>
      <BrandButton href={profileUrl} variant="ghost">
        View in profile
      </BrandButton>

      {/* Wallet section — renders only if either is configured */}
      {walletPassUrl || googleSaveUrl ? (
        <Section style={{ margin: "20px 0 8px", textAlign: "center" }}>
          <BrandText
            tone="muted"
            align="center"
            style={{
              margin: "0 0 12px",
              fontSize: "11px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Add to your phone
          </BrandText>
          <div style={{ textAlign: "center" }}>
            {walletPassUrl ? (
              <a
                href={walletPassUrl}
                style={{
                  display: "inline-block",
                  margin: "4px 6px",
                  padding: "11px 20px",
                  background: "#000000",
                  color: "#ffffff",
                  borderRadius: "10px",
                  fontFamily: BRAND.fontStack.sans,
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.01em",
                  textDecoration: "none",
                  border: "1px solid #000000",
                }}
              >
                Add to Apple Wallet
              </a>
            ) : null}
            {googleSaveUrl ? (
              <a
                href={googleSaveUrl}
                style={{
                  display: "inline-block",
                  margin: "4px 6px",
                  padding: "11px 20px",
                  background: "#202124",
                  color: "#ffffff",
                  borderRadius: "10px",
                  fontFamily: BRAND.fontStack.sans,
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.01em",
                  textDecoration: "none",
                  border: "1px solid #202124",
                }}
              >
                Save to Google Wallet
              </a>
            ) : null}
          </div>
          <BrandText
            tone="muted"
            align="center"
            style={{ margin: "12px 0 0", fontSize: "12px" }}
          >
            Always one tap away — auto-updates when your membership renews.
          </BrandText>
        </Section>
      ) : null}

      {/* How-to-use */}
      <Section
        style={{
          margin: "26px 0 0",
          padding: "16px 20px",
          background: "#faf6f2",
          border: `1px solid ${BRAND.HAIRLINE}`,
          borderRadius: "12px",
          textAlign: "center",
        }}
      >
        <BrandText
          tone="muted"
          align="center"
          style={{
            margin: "0 0 8px",
            fontSize: "11px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontWeight: 600,
            color: BRAND.ORANGE,
          }}
        >
          How to use it
        </BrandText>
        <BrandText align="center" style={{ margin: "0 0 6px" }}>
          When you pay, open your card and show it to the team — your
          discount is applied on the spot.
        </BrandText>
        <BrandText align="center" tone="muted" style={{ margin: 0, fontSize: "13.5px" }}>
          Your card lives in your Mama profile, ready whenever you visit.
          Bookmark the card link or keep this email handy as a backup.
        </BrandText>
      </Section>

      <BrandText style={{ marginTop: "26px" }}>With love,</BrandText>
      <BrandText
        style={{
          fontFamily: BRAND.fontStack.serif,
          fontStyle: "italic",
          fontSize: "18px",
          margin: "-8px 0 0",
        }}
      >
        Mama Reykjavík
      </BrandText>
    </BrandLayout>
  );
}

TribeCardWelcome.previewProps = {
  holderName: "Sólveig Magnúsdóttir",
  discountPercent: 20,
  expiresAt: "2027-05-09",
  durationType: "year",
  publicCardUrl: "https://mama.is/tribe-card/preview-token-abc123",
  profileUrl: "https://mama.is/profile/my-tribe-card",
  walletPassUrl: "https://mama.is/api/tribe-cards/by-token/preview/pkpass",
  googleSaveUrl: "https://pay.google.com/gp/v/save/preview-token",
};

TribeCardWelcome.subject = "Welcome to the tribe — your card is ready";
