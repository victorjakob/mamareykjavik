// SummerMarketScheduleChange — warm change-of-plan email sent from the admin
// page when something about a specific market day changes (early close,
// different setup time, weather, private event taking the room).
//
// One template, every kind of change. The admin types the specifics in;
// the template stays calm and clear.

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

/**
 * Props:
 *   firstName       - vendor first name
 *   brandName       - vendor brand (shown lightly above their name)
 *   affectedDate    - e.g. "Sat June 6"
 *   originalTime    - e.g. "13:00 to 19:00"   (optional)
 *   newTime         - e.g. "13:00 to 17:00"   (optional)
 *   reason          - free-form short paragraph for context (optional)
 *   accommodation   - optional sentence about how we make it right (refund,
 *                     free future day, etc). Shows in a soft callout.
 *   leonPhone       - default "616 7855"
 */
export default function SummerMarketScheduleChange({
  firstName = "friend",
  brandName = "",
  affectedDate = "your market day",
  originalTime = "",
  newTime = "",
  reason = "",
  accommodation = "",
  leonPhone = "616 7855",
} = {}) {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="dark" />
        <meta name="supported-color-schemes" content="dark" />
      </Head>
      <Preview>
        A small change for {affectedDate} at the Summer Market.
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
                A SMALL CHANGE
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
                  fontSize: "33px",
                  lineHeight: 1.2,
                  color: COLORS.heading,
                }}
              >
                A heads up about {affectedDate}
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
              {reason ? (
                <Text
                  style={{
                    margin: "18px 0 0",
                    fontFamily: FONT_SANS,
                    fontSize: "16px",
                    lineHeight: 1.75,
                    color: COLORS.body,
                  }}
                >
                  {reason}
                </Text>
              ) : (
                <Text
                  style={{
                    margin: "18px 0 0",
                    fontFamily: FONT_SANS,
                    fontSize: "16px",
                    lineHeight: 1.75,
                    color: COLORS.body,
                  }}
                >
                  A quick heads up about {affectedDate} at the Summer Market.
                </Text>
              )}
            </Section>

            {/* Time change callout */}
            {originalTime || newTime ? (
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
                          NEW HOURS FOR {affectedDate.toUpperCase()}
                        </Text>
                        {originalTime ? (
                          <Text
                            style={{
                              margin: "10px 0 0",
                              fontFamily: FONT_SANS,
                              fontSize: "14px",
                              color: COLORS.muted,
                              textDecoration: "line-through",
                            }}
                          >
                            {originalTime}
                          </Text>
                        ) : null}
                        {newTime ? (
                          <Text
                            style={{
                              margin: "6px 0 0",
                              fontFamily: FONT_SERIF,
                              fontStyle: "italic",
                              fontWeight: 600,
                              fontSize: "22px",
                              lineHeight: 1.2,
                              color: COLORS.heading,
                            }}
                          >
                            {newTime}
                          </Text>
                        ) : null}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Section>
            ) : null}

            {/* Accommodation paragraph (optional) */}
            {accommodation ? (
              <Section style={{ padding: "22px 44px 0", textAlign: "center" }}>
                <Text
                  style={{
                    margin: 0,
                    fontFamily: FONT_SANS,
                    fontSize: "15px",
                    lineHeight: 1.75,
                    color: COLORS.body,
                  }}
                >
                  {accommodation}
                </Text>
              </Section>
            ) : null}

            {/* Leon callout */}
            <Section style={{ padding: "26px 44px 0", textAlign: "center" }}>
              <Text
                style={{
                  margin: 0,
                  fontFamily: FONT_SANS,
                  fontSize: "15px",
                  lineHeight: 1.75,
                  color: COLORS.body,
                }}
              >
                If you have any questions or want to talk it through, call or
                message <strong style={{ color: COLORS.heading }}>Leon</strong>
                {" "}directly:{" "}
                <Link
                  href={`tel:+354${leonPhone.replace(/\s/g, "")}`}
                  style={{ color: COLORS.orange, textDecoration: "none" }}
                >
                  {leonPhone}
                </Link>
                .
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
                Thank you for rolling with us.
                <br />
                With love, the Mama family
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

SummerMarketScheduleChange.previewProps = {
  firstName: "Gabi",
  brandName: "Buzzybee",
  affectedDate: "Sat June 6",
  originalTime: "13:00 to 19:00",
  newTime: "13:00 to 17:00",
  reason:
    "We have a private event booked at 17:00 this Saturday, so the market needs to close and everything needs to be packed away and reset by then. We are sorry for the shorter day.",
  accommodation:
    "Here is what we want to offer to make this right. You pay only the confirmation price for Saturday. The rest of the day is on us. Or, if you would prefer, you keep the day and we give you a free full day at a future Summer Market. Whichever feels better to you.",
  leonPhone: "616 7855",
};

SummerMarketScheduleChange.subject = "A small change for your market day";
