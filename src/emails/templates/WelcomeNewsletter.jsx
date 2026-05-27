// WelcomeNewsletter — sent automatically when someone subscribes via signup
// or via the soft opt-in checkbox at ticket checkout. One template, two
// variants controlled by the `source` prop, which only changes the footer
// "why you are receiving this" line.
//
// Voice: warm, alive, sensory, human. No dashes (Mama brand rule). Mirrors
// the standalone welcome-email.html used for the one-time re-introduction
// warm-up. Dark editorial palette, Cormorant Garamond + Inter.
//
// This template renders its own dark shell instead of BrandLayout, because
// the warm marketing voice for Mama lives in dark editorial. The transactional
// emails (ticket confirmation, password reset) intentionally use the light
// BrandLayout — a different category, a different feeling.

import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
} from "@react-email/components";

const COLORS = {
  pageBg: "#1a1208",
  cardBg: "#1e1610",
  footerBg: "#17100a",
  heading: "#f0ebe3",
  body: "#c0b4a8",
  muted: "#9a8e82",
  orange: "#ff914d",
};

const FONT_SERIF =
  "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const FONT_SANS =
  "'Inter', 'Helvetica Neue', Arial, sans-serif";

// Why are you receiving this line, per source
function whyLine(source) {
  if (source === "account_optin" || source === "account") {
    return "You are receiving this letter because you signed up at mama.is.";
  }
  if (source === "ticket_buyer" || source === "ticket") {
    return "You are receiving this letter because you bought a ticket to a Mama event.";
  }
  // Generic fallback — used for the one-time re-introduction warm-up.
  return "You are receiving this letter because you came to a Mama event or a gathering at White Lotus.";
}

export default function WelcomeNewsletter({
  source = "account_optin",
  eventsUrl = "https://mama.is/events",
  unsubscribeUrl = "https://mama.is/unsubscribe",
} = {}) {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="dark" />
        <meta name="supported-color-schemes" content="dark" />
      </Head>
      <Preview>
        A small weekly letter from our table at Bankastr&aelig;ti 2.
      </Preview>
      <Body
        style={{
          margin: 0,
          padding: 0,
          background: COLORS.pageBg,
          WebkitTextSizeAdjust: "100%",
        }}
      >
        <Container
          style={{
            margin: "0 auto",
            padding: "40px 16px",
            maxWidth: "600px",
            width: "100%",
          }}
        >
          <Section
            style={{
              background: COLORS.cardBg,
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            {/* Wordmark */}
            <Section style={{ padding: "58px 44px 0", textAlign: "center" }}>
              <Text
                style={{
                  margin: 0,
                  fontFamily: FONT_SERIF,
                  fontSize: "42px",
                  fontWeight: 600,
                  letterSpacing: "1px",
                  color: COLORS.heading,
                  lineHeight: 1,
                }}
              >
                Mama
              </Text>
              <Text
                style={{
                  margin: "13px 0 0",
                  fontFamily: FONT_SANS,
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "4px",
                  color: COLORS.muted,
                }}
              >
                REYKJAV&Iacute;K
              </Text>
            </Section>

            {/* ✦ motif */}
            <Section style={{ padding: "32px 44px 0", textAlign: "center" }}>
              <Text
                style={{
                  margin: 0,
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "13px",
                  lineHeight: "13px",
                  color: COLORS.orange,
                }}
              >
                &#10022;
              </Text>
            </Section>

            {/* Eyebrow */}
            <Section style={{ padding: "30px 44px 0", textAlign: "center" }}>
              <Text
                style={{
                  margin: 0,
                  fontFamily: FONT_SANS,
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "3px",
                  color: COLORS.orange,
                }}
              >
                HELLO
              </Text>
            </Section>

            {/* Hero heading */}
            <Section style={{ padding: "13px 44px 0", textAlign: "center" }}>
              <Text
                style={{
                  margin: 0,
                  fontFamily: FONT_SERIF,
                  fontStyle: "italic",
                  fontWeight: 600,
                  fontSize: "37px",
                  lineHeight: 1.2,
                  color: COLORS.heading,
                }}
              >
                Pull up a chair
              </Text>
            </Section>

            {/* Body copy */}
            <Section style={{ padding: "24px 44px 0", textAlign: "center" }}>
              <Text
                style={{
                  margin: 0,
                  fontFamily: FONT_SANS,
                  fontSize: "16px",
                  lineHeight: 1.75,
                  color: COLORS.body,
                }}
              >
                It is good to have you. So here is a warm hello from our table
                at Bankastr&aelig;ti 2.
              </Text>
              <Text
                style={{
                  margin: "18px 0 0",
                  fontFamily: FONT_SANS,
                  fontSize: "16px",
                  lineHeight: 1.75,
                  color: COLORS.body,
                }}
              >
                You will hear from us once a week, a small letter with what is
                coming up. Cacao ceremonies, live music, workshops, and the
                food that started it all.
              </Text>
              <Text
                style={{
                  margin: "18px 0 0",
                  fontFamily: FONT_SANS,
                  fontSize: "16px",
                  lineHeight: 1.75,
                  color: COLORS.body,
                }}
              >
                One letter a week. Nothing heavier than that.
              </Text>
              <Text
                style={{
                  margin: "18px 0 0",
                  fontFamily: FONT_SANS,
                  fontSize: "16px",
                  lineHeight: 1.75,
                  color: COLORS.body,
                }}
              >
                If it is not for you, one click on the link at the foot of this
                letter and you are off the list. No hard feelings, none at all.
              </Text>
              <Text
                style={{
                  margin: "18px 0 0",
                  fontFamily: FONT_SANS,
                  fontSize: "16px",
                  lineHeight: 1.75,
                  color: COLORS.body,
                }}
              >
                Come as you are. There is always a seat at this table.
              </Text>
            </Section>

            {/* Sign-off */}
            <Section style={{ padding: "28px 44px 0", textAlign: "center" }}>
              <Text
                style={{
                  margin: 0,
                  fontFamily: FONT_SERIF,
                  fontStyle: "italic",
                  fontWeight: 600,
                  fontSize: "21px",
                  lineHeight: 1.4,
                  color: COLORS.heading,
                }}
              >
                With love,
                <br />
                the Mama family
              </Text>
            </Section>

            {/* Invitation button */}
            <Section
              style={{
                padding: "36px 44px 58px",
                textAlign: "center",
              }}
            >
              <Link
                href={eventsUrl}
                style={{
                  display: "inline-block",
                  background: COLORS.orange,
                  borderRadius: "4px",
                  padding: "15px 36px",
                  fontFamily: FONT_SANS,
                  fontSize: "14px",
                  fontWeight: 600,
                  letterSpacing: "0.4px",
                  color: COLORS.pageBg,
                  textDecoration: "none",
                }}
              >
                See what is coming up
              </Link>
            </Section>

            {/* Footer */}
            <Section
              style={{
                background: COLORS.footerBg,
                padding: "34px 44px",
                textAlign: "center",
              }}
            >
              <Text
                style={{
                  margin: "0 0 18px",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "12px",
                  lineHeight: "12px",
                  color: COLORS.orange,
                }}
              >
                &#10022;
              </Text>
              <Text
                style={{
                  margin: 0,
                  fontFamily: FONT_SANS,
                  fontSize: "11px",
                  lineHeight: 1.9,
                  color: COLORS.muted,
                }}
              >
                Mama Reykjav&iacute;k &middot; Bankastr&aelig;ti 2 &middot; 101
                Reykjav&iacute;k &middot; team@mama.is
                <br />
                {whyLine(source)}
                <br />
                <Link
                  href={unsubscribeUrl}
                  style={{
                    color: COLORS.orange,
                    textDecoration: "underline",
                  }}
                >
                  Unsubscribe in one click
                </Link>
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Preview values shown in /admin/email.
WelcomeNewsletter.previewProps = {
  source: "account_optin",
  eventsUrl: "https://mama.is/events",
  unsubscribeUrl: "https://mama.is/unsubscribe",
};

WelcomeNewsletter.subject = "A gentle hello from Mama";
