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
  if (!d) return "Always";
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
    case "unlimited": return "Yours to keep";
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
  context = "issued",      // "issued" (admin gave a card) | "membership" (paid Tribe signup)
  assetBase = "https://mama.is", // where /wallet-pass/*.png is served from
} = {}) {
  const expiryLabel = expiresAt ? formatDate(expiresAt) : "Always";
  const isMembership = context === "membership";
  const firstName = String(holderName || "").trim().split(/\s+/)[0] || "friend";

  return (
    <BrandLayout
      preview={
        isMembership
          ? "Your Mama Tribe Card — add it to your wallet and show it when you order."
          : "Welcome to the Tribe — your card is active."
      }
      eyebrow="Mama · Tribe"
    >
      <BrandHeading size="lg">
        {isMembership ? "Here's your Mama Tribe Card" : "Welcome to the tribe."}
      </BrandHeading>

      <BrandText>{isMembership ? `Hi ${firstName},` : `Dear ${holderName},`}</BrandText>
      <BrandText>
        {isMembership
          ? "This is the card that comes with your Tribe membership — 20% off food & drinks at Mama. Add it to Apple or Google Wallet below, and show it when you order."
          : "Your Tribe Card is active. Thank you for being part of Mama — your presence is what makes this place warm."}
      </BrandText>

      {/* ── THE CARD ───────────────────────────────────────────────
          Same anatomy as the Wallet pass and the web card ("Cream &
          botanical"): script wordmark + Tribe, the wreath band, the
          discount, then Member / Valid until. Images are the hosted
          wallet-pass assets so the email always matches the pass.   */}
      <Section
        style={{
          margin: "26px 0 18px",
          background: "#f9f4ec",
          border: `1px solid ${BRAND.HAIRLINE}`,
          borderRadius: "22px",
          overflow: "hidden",
        }}
      >
        <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ padding: "18px 20px 12px" }}>
                <img src={`${assetBase}/wallet-pass/logo@3x.png`} alt="Mama" height="34" style={{ height: "34px", width: "auto", display: "block" }} />
              </td>
              <td align="right" style={{ padding: "18px 20px 12px", fontFamily: BRAND.fontStack.sans, fontSize: "15px", color: BRAND.TEXT_DARK }}>
                Tribe
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ padding: 0, lineHeight: 0 }}>
                <img src={`${assetBase}/wallet-pass/strip@3x.png`} alt="" width="100%" style={{ width: "100%", height: "auto", display: "block" }} />
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ padding: "14px 20px 0" }}>
                <BrandText align="left" style={{ margin: 0, fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, color: "#1f5c4b" }}>
                  Member discount
                </BrandText>
                <BrandText align="left" style={{ margin: "2px 0 0", fontSize: "54px", lineHeight: 1, fontWeight: 300, letterSpacing: "-0.02em", color: BRAND.TEXT_DARK }}>
                  {discountPercent}%
                </BrandText>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "18px 20px 0", verticalAlign: "top" }}>
                <BrandText align="left" style={{ margin: 0, fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600, color: "#1f5c4b" }}>Member</BrandText>
                <BrandText align="left" style={{ margin: "3px 0 0", fontSize: "15px", color: BRAND.TEXT_DARK }}>{holderName}</BrandText>
              </td>
              <td style={{ padding: "18px 20px 0", verticalAlign: "top" }}>
                <BrandText align="left" style={{ margin: 0, fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600, color: "#1f5c4b" }}>Valid until</BrandText>
                <BrandText align="left" style={{ margin: "3px 0 0", fontSize: "15px", color: BRAND.TEXT_DARK }}>{expiryLabel}</BrandText>
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ padding: "20px 20px 18px" }}>
                <BrandText align="left" style={{ margin: 0, fontSize: "12px", color: "#7a6a5a" }}>
                  Show at the counter before paying · food &amp; drinks
                </BrandText>
                <BrandText align="left" style={{ margin: "14px 0 0", fontFamily: BRAND.fontStack.serif, fontStyle: "italic", fontSize: "15px", color: "#9a8e82" }}>
                  {isMembership
                    ? expiresAt ? "Renews together with your membership" : "Yours to keep"
                    : durationLabel(durationType)}
                </BrandText>
              </td>
            </tr>
          </tbody>
        </table>
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
            {isMembership
              ? "Always one tap away. It updates by itself each month as your membership renews."
              : "Always one tap away — auto-updates when your membership renews."}
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
  context: "membership",
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
