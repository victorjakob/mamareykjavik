// Shared shell for every Mama email template.
// ─────────────────────────────────────────────
// Renders the `<html>` envelope, the cream header band with the Mama wordmark,
// the white content card, and the footer (address + unsubscribe + brand mark).
// Every templated email composes its body inside <BrandLayout>.
//
// Color tokens kept in lock-step with src/app/admin/components/AdminShell.jsx
// so admin previews and real inboxes feel like the same brand.

import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
  Hr,
  Link,
} from "@react-email/components";

// Brand tokens — DO NOT diverge from AdminShell.jsx
const CREAM = "#f9f4ec";
const CARD = "#ffffff";
const TEXT_DARK = "#2c1810";
const TEXT_MUTED = "#9a7a62";
const HAIRLINE = "#e8ddd3";
const ORANGE = "#ff914d";

const fontStack = {
  serif:
    'Cormorant Garamond, Cormorant, "Playfair Display", Georgia, "Times New Roman", serif',
  sans:
    '"Helvetica Neue", Helvetica, Arial, "Segoe UI", Roboto, sans-serif',
};

/**
 * BrandLayout
 *
 * Props:
 *   preview      — short preview line shown by Gmail/Apple Mail before opening
 *   eyebrow      — small uppercase label above the wordmark (optional)
 *   wordmark     — header text (defaults to "Mama")
 *   children     — the body content
 *   footerNote   — optional short paragraph above the standard footer
 *   unsubscribeUrl — CAN-SPAM unsubscribe link (defaults to https://mama.is/unsubscribe)
 *   address      — physical address shown in footer
 */
export default function BrandLayout({
  preview = "",
  eyebrow = null,
  wordmark = "Mama",
  children,
  footerNote = null,
  unsubscribeUrl = "https://mama.is/unsubscribe",
  address = "Mama Reykjavík · Bankastræti 2 · 101 Reykjavík · Iceland",
}) {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      {preview ? <Preview>{preview}</Preview> : null}
      <Tailwind>
        <Body
          style={{
            margin: 0,
            padding: 0,
            background: CREAM,
            fontFamily: fontStack.sans,
            color: TEXT_DARK,
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          }}
        >
          {/* Outer cream surface — full width on mobile, capped on desktop */}
          <Container
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              padding: "32px 16px 48px",
            }}
          >
            {/* ── HEADER ───────────────────────────────────────────── */}
            <Section
              style={{
                textAlign: "center",
                paddingBottom: "20px",
              }}
            >
              {eyebrow ? (
                <Text
                  style={{
                    margin: "0 0 8px",
                    fontSize: "10px",
                    letterSpacing: "0.42em",
                    textTransform: "uppercase",
                    color: TEXT_MUTED,
                    fontWeight: 600,
                  }}
                >
                  {eyebrow}
                </Text>
              ) : null}
              <Text
                style={{
                  margin: 0,
                  fontFamily: fontStack.serif,
                  fontSize: "34px",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: TEXT_DARK,
                  lineHeight: 1,
                }}
              >
                {wordmark}
              </Text>
              {/* Warm orange hairline under the wordmark */}
              <div
                style={{
                  margin: "16px auto 0",
                  width: "44px",
                  height: "2px",
                  background: ORANGE,
                  borderRadius: "2px",
                }}
              />
            </Section>

            {/* ── CONTENT CARD ─────────────────────────────────────── */}
            <Section
              style={{
                background: CARD,
                borderRadius: "16px",
                border: `1px solid ${HAIRLINE}`,
                boxShadow: "0 2px 14px rgba(60,30,10,0.06)",
                overflow: "hidden",
              }}
            >
              {/* Top warm accent bar — same treatment as AdminPanel */}
              <div
                style={{
                  height: "2px",
                  background: `linear-gradient(to right, ${ORANGE} 0%, rgba(255,145,77,0.0) 70%)`,
                }}
              />
              <div style={{ padding: "36px 32px 36px" }}>{children}</div>
            </Section>

            {/* ── FOOTER ───────────────────────────────────────────── */}
            <Section style={{ paddingTop: "28px" }}>
              {footerNote ? (
                <Text
                  style={{
                    margin: "0 0 16px",
                    fontSize: "13px",
                    lineHeight: 1.55,
                    color: TEXT_MUTED,
                    textAlign: "center",
                  }}
                >
                  {footerNote}
                </Text>
              ) : null}

              <Hr
                style={{
                  border: "none",
                  borderTop: `1px solid ${HAIRLINE}`,
                  margin: "0 0 18px",
                }}
              />

              <Text
                style={{
                  margin: "0 0 8px",
                  fontSize: "11px",
                  lineHeight: 1.6,
                  color: TEXT_MUTED,
                  textAlign: "center",
                }}
              >
                {address}
              </Text>
              <Text
                style={{
                  margin: 0,
                  fontSize: "11px",
                  lineHeight: 1.6,
                  color: TEXT_MUTED,
                  textAlign: "center",
                }}
              >
                <Link
                  href="https://mama.is"
                  style={{ color: TEXT_MUTED, textDecoration: "underline" }}
                >
                  mama.is
                </Link>
                {" · "}
                <Link
                  href={unsubscribeUrl}
                  style={{ color: TEXT_MUTED, textDecoration: "underline" }}
                >
                  Unsubscribe
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

// Re-export tokens so individual templates stay on-brand.
export const BRAND = {
  CREAM,
  CARD,
  TEXT_DARK,
  TEXT_MUTED,
  HAIRLINE,
  ORANGE,
  fontStack,
};
