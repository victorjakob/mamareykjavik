// SummerMarketWeekendWelcome — warm welcome sent to each confirmed weekend
// vendor a few days before their market days. Triggered by an admin batch
// action from /api/admin/summer-market/send-weekend-welcome.
//
// Voice: warm, alive, sensory, no dashes (Mama brand rule).
// Style: dark editorial, mirrors WelcomeNewsletter and the weekly letter.

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
const FONT_SANS = "'Inter', 'Helvetica Neue', Arial, sans-serif";

export default function SummerMarketWeekendWelcome({
  firstName = "friend",
  brandName = "",
  dates = [],
  leonPhone = "616 7855",
  instagramHandle = "@mamareykjavik",
} = {}) {
  const datesLine = dates.length > 0 ? dates.join(" · ") : "this weekend";

  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="dark" />
        <meta name="supported-color-schemes" content="dark" />
      </Head>
      <Preview>
        See you at the Mama Summer Market at Bankastr&aelig;ti 2 this weekend.
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
                SUMMER MARKET
              </Text>
            </Section>

            {/* Motif */}
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
                YOUR WEEKEND
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
                See you this weekend
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
                Hi {firstName},
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
                {brandName ? `${brandName} is on the list. ` : ""}
                This weekend the Summer Market is on at Bankastr&aelig;ti 2,
                and we are so glad you are part of it.
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
                Our little corner of Reykjav&iacute;k turns into a market of
                makers, growers, and the kind of people who make a city feel
                like home. You are one of them. Bring your goods, bring your
                energy, bring whatever calls you.
              </Text>
              <Text
                style={{
                  margin: "18px 0 0",
                  fontFamily: FONT_SANS,
                  fontSize: "15px",
                  lineHeight: 1.75,
                  color: COLORS.muted,
                }}
              >
                Your days: <strong style={{ color: COLORS.body }}>{datesLine}</strong>
              </Text>
            </Section>

            {/* Leon contact callout */}
            <Section style={{ padding: "26px 44px 0" }}>
              <table
                role="presentation"
                cellPadding="0"
                cellSpacing="0"
                width="100%"
                style={{ width: "100%" }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        borderTop: `1px solid rgba(255,145,77,0.15)`,
                        borderBottom: `1px solid rgba(255,145,77,0.15)`,
                        padding: "18px 0",
                        textAlign: "center",
                      }}
                    >
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
                        YOUR PERSON ALL WEEKEND
                      </Text>
                      <Text
                        style={{
                          margin: "10px 0 0",
                          fontFamily: FONT_SERIF,
                          fontStyle: "italic",
                          fontWeight: 600,
                          fontSize: "22px",
                          lineHeight: 1.2,
                          color: COLORS.heading,
                        }}
                      >
                        Leon
                      </Text>
                      <Text
                        style={{
                          margin: "4px 0 0",
                          fontFamily: FONT_SANS,
                          fontSize: "16px",
                          color: COLORS.body,
                        }}
                      >
                        <Link
                          href={`tel:+354${leonPhone.replace(/\s/g, "")}`}
                          style={{
                            color: COLORS.body,
                            textDecoration: "none",
                          }}
                        >
                          {leonPhone}
                        </Link>
                      </Text>
                      <Text
                        style={{
                          margin: "8px 0 0",
                          fontFamily: FONT_SANS,
                          fontSize: "13px",
                          color: COLORS.muted,
                        }}
                      >
                        Anything you need, before or during the market.
                      </Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* Share ask */}
            <Section style={{ padding: "26px 44px 0", textAlign: "center" }}>
              <Text
                style={{
                  margin: 0,
                  fontFamily: FONT_SANS,
                  fontSize: "16px",
                  lineHeight: 1.75,
                  color: COLORS.body,
                }}
              >
                One small ask. Help us spread the word. Share your spot on
                Instagram, tag{" "}
                <strong style={{ color: COLORS.heading }}>
                  {instagramHandle}
                </strong>
                , drop a note in the Facebook discussion, and let your people
                know you will be there. The more we share, the warmer the
                room.
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

            {/* Footer */}
            <Section
              style={{
                background: COLORS.footerBg,
                padding: "34px 44px",
                textAlign: "center",
                marginTop: "36px",
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
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

SummerMarketWeekendWelcome.previewProps = {
  firstName: "Gabi",
  brandName: "Buzzybee",
  dates: ["Fri June 5", "Sat June 6", "Sun June 7"],
  leonPhone: "616 7855",
  instagramHandle: "@mamareykjavik",
};

SummerMarketWeekendWelcome.subject = "A warm welcome to the Mama Summer Market";
