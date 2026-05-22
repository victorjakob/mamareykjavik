// SummerMarketAcceptance — sent to a vendor when admin accepts their Summer
// Market application. Replaces inline HTML in
// src/app/api/admin/summer-market/applications/[id]/route.js (acceptance branch).
//
// The pricing block + dates summary are computed by helpers in
// @/lib/summerMarketPricing — the route passes pre-rendered HTML/plain
// fragments in via `pricingHtml` so we don't duplicate pricing logic here.

import { Section } from "@react-email/components";
import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandCallout from "../_components/BrandCallout";

const TERMS_URL =
  "https://docs.google.com/document/d/1sFTWvTh6H2EtNstGS8F7g_ne5gFDMzrykjjNLzdLkUM/edit?usp=sharing";

export default function SummerMarketAcceptance({
  name = "friend",
  selectedDates = [],
  pricingHtml = null,        // pre-rendered pricing HTML fragment from lib
  customIntroText = null,    // optional admin intro
} = {}) {
  return (
    <BrandLayout
      preview="Your White Lotus Summer Market application is accepted."
      eyebrow="White Lotus · Summer Market"
    >
      <BrandHeading size="lg">Application accepted.</BrandHeading>

      <BrandText>Hi {name},</BrandText>

      {customIntroText ? (
        <BrandCallout label="Message from us">{customIntroText}</BrandCallout>
      ) : null}

      <BrandText>
        Thank you for applying to the White Lotus Summer Market.
      </BrandText>
      <BrandText>
        We're happy to confirm your application has been accepted, and we'd
        love to have you join us.
      </BrandText>

      {/* Selected dates */}
      {selectedDates.length > 0 ? (
        <Section
          style={{
            background: "#faf6f2",
            border: `1px solid ${BRAND.HAIRLINE}`,
            borderRadius: "12px",
            padding: "18px 22px",
            margin: "22px 0 8px",
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
            }}
          >
            Your selected dates
          </BrandText>
          {selectedDates.map((date, i) => (
            <BrandText
              key={`d-${i}`}
              align="center"
              style={{ margin: "0 0 4px", fontSize: "14px" }}
            >
              · {date}
            </BrandText>
          ))}
        </Section>
      ) : null}

      {/* Pricing fragment passed in pre-rendered. We trust the lib output. */}
      {pricingHtml ? (
        <div
          style={{ margin: "16px 0" }}
          dangerouslySetInnerHTML={{ __html: pricingHtml }}
        />
      ) : null}

      <BrandText>
        Once the confirmation fee has been paid, your booth will be officially
        secured.
      </BrandText>

      <BrandCallout label="Bank details" tone="warm">
        Account no.: 0322-26-670220
        <br />
        Kennitala: 670220-0440
      </BrandCallout>

      <BrandText>
        Please reply to this email once the transfer has been made.
      </BrandText>
      <BrandText>
        The remaining balance will be paid later, and we can also prepare an
        official invoice if you would like one.
      </BrandText>
      <BrandText>
        Please read all instructions, terms, agreements, and market info
        carefully here:
        <br />
        <a
          href={TERMS_URL}
          style={{ color: BRAND.ORANGE, textDecoration: "none", wordBreak: "break-all" }}
        >
          {TERMS_URL}
        </a>
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

SummerMarketAcceptance.previewProps = {
  name: "Hera Björk",
  selectedDates: ["Fri July 3 - Sun July 5", "Sat July 18"],
  pricingHtml: null,
  customIntroText:
    "We're keeping the Saturday line-up small this year — your ceramics felt like a perfect fit.",
};

SummerMarketAcceptance.subject =
  "Your White Lotus Summer Market application is accepted";
