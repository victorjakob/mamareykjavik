// CateringQuoteConfirmation — sent when a customer submits a catering quote
// inquiry. Replaces both the legacy inline HTML in
// src/app/api/sendgrid/catering-quote/route.js AND its preview adapter.

import { Section } from "@react-email/components";
import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";

export default function CateringQuoteConfirmation({
  name = "friend",
  address = null,
  date = null,
  items = [],
} = {}) {
  const firstName = (name || "").split(" ")[0] || "friend";
  const totalPortions = items.reduce((sum, i) => sum + Number(i.qty || 0), 0);

  return (
    <BrandLayout
      preview={`We got your catering request, ${firstName} — back to you in 24–48h.`}
      eyebrow="Mama · Catering"
    >
      <BrandHeading size="lg">We got your request, {firstName}.</BrandHeading>

      <BrandText>
        Thank you for reaching out. We're reviewing your catering request
        and will come back to you with a personalised quote within{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>24–48 hours</strong>.
      </BrandText>

      <BrandText>Here's a summary of what you requested:</BrandText>

      {/* Order items — left-aligned rows in centered card */}
      <Section
        style={{
          background: "#faf6f2",
          border: `1px solid ${BRAND.HAIRLINE}`,
          borderRadius: "12px",
          padding: "8px 22px",
          margin: "22px 0 6px",
        }}
      >
        <BrandText
          tone="muted"
          align="center"
          style={{
            margin: "12px 0 12px",
            fontSize: "11px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontWeight: 600,
            color: BRAND.TEXT_MUTED,
          }}
        >
          Your order
        </BrandText>

        {items.map((item, i, arr) => (
          <div
            key={`${item.dish}-${i}`}
            style={{
              padding: "10px 0",
              borderBottom:
                i < arr.length - 1 ? `1px solid ${BRAND.HAIRLINE}` : "none",
              display: "table",
              width: "100%",
            }}
          >
            <div style={{ display: "table-cell", verticalAlign: "top", textAlign: "left" }}>
              <BrandText align="left" style={{ margin: 0, fontWeight: 600 }}>
                {item.dish}
              </BrandText>
            </div>
            <div
              style={{
                display: "table-cell",
                verticalAlign: "top",
                textAlign: "right",
                whiteSpace: "nowrap",
              }}
            >
              <BrandText
                align="left"
                style={{ margin: 0, color: BRAND.TEXT_MUTED, textAlign: "right" }}
              >
                {item.qty} portions
              </BrandText>
            </div>
          </div>
        ))}

        <div style={{ padding: "12px 0", borderTop: `1px solid ${BRAND.HAIRLINE}` }}>
          <div style={{ display: "table", width: "100%" }}>
            <div style={{ display: "table-cell", textAlign: "left" }}>
              <BrandText
                tone="muted"
                align="left"
                style={{
                  margin: 0,
                  fontSize: "11px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Total
              </BrandText>
            </div>
            <div
              style={{
                display: "table-cell",
                textAlign: "right",
                verticalAlign: "middle",
              }}
            >
              <BrandText
                align="left"
                style={{
                  margin: 0,
                  fontWeight: 700,
                  color: BRAND.ORANGE,
                  textAlign: "right",
                }}
              >
                {totalPortions} portions
              </BrandText>
            </div>
          </div>
        </div>
      </Section>

      {/* Delivery / date — only if either provided */}
      {address || date ? (
        <Section style={{ margin: "20px 0 0", textAlign: "center" }}>
          {address ? (
            <>
              <BrandText
                tone="muted"
                align="center"
                style={{
                  margin: "0 0 4px",
                  fontSize: "10px",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Delivery to
              </BrandText>
              <BrandText align="center" style={{ margin: "0 0 14px" }}>
                {address}
              </BrandText>
            </>
          ) : null}
          {date ? (
            <>
              <BrandText
                tone="muted"
                align="center"
                style={{
                  margin: "0 0 4px",
                  fontSize: "10px",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Date needed
              </BrandText>
              <BrandText align="center" style={{ margin: 0 }}>
                {date}
              </BrandText>
            </>
          ) : null}
        </Section>
      ) : null}

      <BrandText tone="muted" style={{ marginTop: "22px", fontSize: "13.5px" }}>
        Any questions? Reach us at{" "}
        <a
          href="mailto:team@mama.is"
          style={{ color: BRAND.ORANGE, textDecoration: "none" }}
        >
          team@mama.is
        </a>
        .
      </BrandText>

      <BrandText style={{ marginTop: "26px" }}>With warmth,</BrandText>
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

CateringQuoteConfirmation.previewProps = {
  name: "Sólveig Magnúsdóttir",
  address: "Skólavörðustígur 18, 101 Reykjavík",
  date: "Friday 19 June 2026",
  items: [
    { dish: "Cacao bowl", qty: 30 },
    { dish: "Ginger lentil soup", qty: 30 },
    { dish: "Mama bowl (build-your-own)", qty: 30 },
  ],
};

CateringQuoteConfirmation.subject = "Your catering quote request — Mama Reykjavík";
