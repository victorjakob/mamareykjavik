// CateringQuoteTeamNotification — team-side of catering quote inquiry.
// Replaces inline HTML in src/app/api/sendgrid/catering-quote/route.js (team email).

import { Section } from "@react-email/components";
import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandDataRow from "../_components/BrandDataRow";

export default function CateringQuoteTeamNotification({
  name = "—",
  email = "—",
  phone = null,
  address = null,
  date = null,
  notes = null,
  items = [],
} = {}) {
  const totalPortions = items.reduce((sum, i) => sum + Number(i.qty || 0), 0);

  return (
    <BrandLayout
      preview={`New catering quote request from ${name}.`}
      eyebrow="Mama · Admin"
    >
      <BrandHeading size="lg">New catering request.</BrandHeading>
      <BrandText>Reply to this email to reach {name} directly.</BrandText>

      <BrandDataRow label="Name" value={name} />
      <BrandDataRow label="Email" value={email} mono />
      {phone ? <BrandDataRow label="Phone" value={phone} /> : null}
      {address ? <BrandDataRow label="Address" value={address} /> : null}
      {date ? <BrandDataRow label="Date needed" value={date} /> : null}

      {/* Items */}
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
          }}
        >
          Order
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
            <div style={{ display: "table-cell", textAlign: "left" }}>
              <BrandText align="left" style={{ margin: 0, fontWeight: 600 }}>
                {item.dish}
              </BrandText>
            </div>
            <div style={{ display: "table-cell", textAlign: "right" }}>
              <BrandText align="left" style={{ margin: 0, color: BRAND.TEXT_MUTED, textAlign: "right" }}>
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
                style={{ margin: 0, fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}
              >
                Total
              </BrandText>
            </div>
            <div style={{ display: "table-cell", textAlign: "right" }}>
              <BrandText
                align="left"
                style={{ margin: 0, fontWeight: 700, color: BRAND.ORANGE, textAlign: "right" }}
              >
                {totalPortions} portions
              </BrandText>
            </div>
          </div>
        </div>
      </Section>

      {notes ? (
        <Section style={{ marginTop: "16px", textAlign: "center" }}>
          <BrandText
            tone="muted"
            align="center"
            style={{
              margin: "0 0 6px",
              fontSize: "10px",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Notes
          </BrandText>
          <BrandText align="center" style={{ margin: 0 }}>
            {notes}
          </BrandText>
        </Section>
      ) : null}
    </BrandLayout>
  );
}

CateringQuoteTeamNotification.previewProps = {
  name: "Sólveig Magnúsdóttir",
  email: "solveig@example.is",
  phone: "+354 555 1234",
  address: "Skólavörðustígur 18, 101 Reykjavík",
  date: "Friday 19 June 2026",
  notes: "Several guests are gluten-free. We'd love a couple of mocktails on arrival if possible.",
  items: [
    { dish: "Cacao bowl", qty: 30 },
    { dish: "Ginger lentil soup", qty: 30 },
    { dish: "Mama bowl (build-your-own)", qty: 30 },
  ],
};

CateringQuoteTeamNotification.subject = "New Catering Request from Sólveig Magnúsdóttir";
