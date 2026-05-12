// GatekeeperWrap — the post-event recap sent to hosts.
// Replaces inline HTML in src/app/api/sendgrid/gatekeeper-wrap/route.js
//
// This was the most carefully designed legacy email — calligraphic enso
// watermark, "The evening, held" eyebrow, four stat pillars, by-payment-method
// table, walk-ins list, italic closing line. The original character is
// preserved here within the brand chrome: same eyebrow, similar pillar
// rhythm, same italic close.

import { Section } from "@react-email/components";
import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";

function fmtIsk(n) {
  return new Intl.NumberFormat("is-IS").format(Math.round(Number(n || 0)));
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

const METHOD_LABELS = {
  online:   "Online (pre-paid)",
  cash:     "Cash",
  pos:      "POS / Card",
  transfer: "Bank transfer",
  exchange: "Exchange",
  door:     "Door",
};

// A single pillar — used four times in a row
function StatPillar({ label, value, sub, isFirst }) {
  return (
    <td
      style={{
        padding: "22px 8px",
        textAlign: "center",
        verticalAlign: "top",
        borderLeft: isFirst ? "none" : `1px solid ${BRAND.HAIRLINE}`,
        width: "25%",
      }}
    >
      <p
        style={{
          margin: 0,
          color: BRAND.ORANGE,
          fontSize: "9px",
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: "10px 0 4px",
          fontFamily: BRAND.fontStack.serif,
          fontWeight: 400,
          fontStyle: "italic",
          fontSize: "26px",
          color: BRAND.TEXT_DARK,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </p>
      <p style={{ margin: 0, color: BRAND.TEXT_MUTED, fontSize: "11px" }}>
        {sub}
      </p>
    </td>
  );
}

export default function GatekeeperWrap({
  eventName = "Sound Bath with Þórunn",
  eventDate = "2026-05-21T18:00:00.000Z",
  totals = {
    tickets: 22,
    checkedIn: 19,
    walkIns: 4,
    revenue: 86500,
    tipsTotal: 4500,
    tippers: 6,
    byMethod: {
      online: { tickets: 12, revenue: 54000 },
      pos:    { tickets: 5,  revenue: 22500 },
      cash:   { tickets: 2,  revenue: 10000 },
    },
  },
  walkIns = [
    { name: "Anna Sigurðardóttir", method: "POS",  total: 4500 },
    { name: "Jón Pálsson",         method: "Cash", total: 4500 },
  ],
} = {}) {
  const checkedInPct =
    totals.tickets > 0 ? Math.round((totals.checkedIn / totals.tickets) * 100) : 0;

  return (
    <BrandLayout
      preview={`The evening, held — ${eventName} recap.`}
      eyebrow="The evening, held"
    >
      <BrandHeading size="lg">{eventName}</BrandHeading>
      <BrandText
        tone="muted"
        align="center"
        style={{
          margin: "0 0 6px",
          fontFamily: BRAND.fontStack.serif,
          fontStyle: "italic",
          fontSize: "14px",
        }}
      >
        {fmtDate(eventDate)}
      </BrandText>

      {/* Four stat pillars in a single row */}
      <Section style={{ margin: "26px 0 8px" }}>
        <table
          role="presentation"
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          style={{
            borderCollapse: "collapse",
            borderTop: `1px solid ${BRAND.HAIRLINE}`,
            borderBottom: `1px solid ${BRAND.HAIRLINE}`,
          }}
        >
          <tbody>
            <tr>
              <StatPillar
                label="In the room"
                value={totals.checkedIn}
                sub={`${checkedInPct}% of ${totals.tickets}`}
                isFirst
              />
              <StatPillar
                label="At the door"
                value={totals.walkIns}
                sub="walk-ins"
              />
              <StatPillar
                label="Revenue"
                value={fmtIsk(totals.revenue)}
                sub="ISK collected"
              />
              <StatPillar
                label="Tips"
                value={fmtIsk(totals.tipsTotal)}
                sub={`ISK · ${totals.tippers} offered`}
              />
            </tr>
          </tbody>
        </table>
      </Section>

      {/* By-method breakdown */}
      <Section style={{ margin: "30px 0 0" }}>
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
          By payment method
        </BrandText>
        <BrandText tone="muted" align="center" style={{ margin: "0 0 14px", fontSize: "13px" }}>
          Every walk-in is saved in your attendee list.
        </BrandText>

        <table
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          style={{
            borderCollapse: "collapse",
            background: "#faf6f2",
            border: `1px solid ${BRAND.HAIRLINE}`,
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <tbody>
            {Object.entries(totals.byMethod || {}).length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  style={{
                    padding: "18px",
                    textAlign: "center",
                    color: BRAND.TEXT_MUTED,
                    fontSize: "13px",
                  }}
                >
                  No sales recorded.
                </td>
              </tr>
            ) : (
              Object.entries(totals.byMethod).map(([key, v], i) => (
                <tr
                  key={key}
                  style={{
                    borderTop: i === 0 ? "none" : `1px solid ${BRAND.HAIRLINE}`,
                  }}
                >
                  <td style={{ padding: "12px 18px", fontSize: "14px", color: BRAND.TEXT_DARK }}>
                    {METHOD_LABELS[key] || key}
                  </td>
                  <td
                    style={{
                      padding: "12px 18px",
                      fontSize: "14px",
                      color: BRAND.TEXT_DARK,
                      textAlign: "right",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {v.tickets}
                  </td>
                  <td
                    style={{
                      padding: "12px 18px",
                      fontSize: "14px",
                      color: BRAND.TEXT_DARK,
                      textAlign: "right",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {fmtIsk(v.revenue)} ISK
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Section>

      {/* Walk-ins detailed list */}
      {walkIns && walkIns.length > 0 ? (
        <Section style={{ margin: "30px 0 0" }}>
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
            Walk-ins tonight
          </BrandText>
          <BrandText tone="muted" align="center" style={{ margin: "0 0 14px", fontSize: "13px" }}>
            {walkIns.length} {walkIns.length === 1 ? "person" : "people"} added at the door.
          </BrandText>

          <table
            width="100%"
            cellPadding="0"
            cellSpacing="0"
            style={{
              borderCollapse: "collapse",
              background: "#faf6f2",
              border: `1px solid ${BRAND.HAIRLINE}`,
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <tbody>
              {walkIns.map((w, i) => (
                <tr
                  key={`${w.name}-${i}`}
                  style={{
                    borderTop: i === 0 ? "none" : `1px solid ${BRAND.HAIRLINE}`,
                  }}
                >
                  <td style={{ padding: "10px 18px", fontSize: "13px", color: BRAND.TEXT_DARK }}>
                    {w.name}
                  </td>
                  <td
                    style={{
                      padding: "10px 18px",
                      fontSize: "11px",
                      color: BRAND.TEXT_MUTED,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                    }}
                  >
                    {w.method}
                  </td>
                  <td
                    style={{
                      padding: "10px 18px",
                      fontSize: "13px",
                      color: BRAND.TEXT_DARK,
                      textAlign: "right",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {fmtIsk(w.total)} ISK
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      ) : null}

      {/* Italic closing line — preserved verbatim from the original */}
      <BrandText
        align="center"
        style={{
          marginTop: "36px",
          fontFamily: BRAND.fontStack.serif,
          fontStyle: "italic",
          fontSize: "16px",
          lineHeight: 1.7,
          color: BRAND.TEXT_MUTED,
        }}
      >
        Thank you for holding this threshold. Every person who walked through
        tonight is part of the circle now — their emails are saved, so you
        can keep it open.
      </BrandText>

      <BrandText
        tone="muted"
        align="center"
        style={{
          marginTop: "20px",
          fontSize: "11px",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
        }}
      >
        With warmth · the Mama team
      </BrandText>
    </BrandLayout>
  );
}

GatekeeperWrap.previewProps = {
  eventName: "Sound Bath with Þórunn",
  eventDate: "2026-05-21T18:00:00.000Z",
  totals: {
    tickets: 22,
    checkedIn: 19,
    walkIns: 4,
    revenue: 86500,
    tipsTotal: 4500,
    tippers: 6,
    byMethod: {
      online: { tickets: 12, revenue: 54000 },
      pos:    { tickets: 5,  revenue: 22500 },
      cash:   { tickets: 2,  revenue: 10000 },
    },
  },
  walkIns: [
    { name: "Anna Sigurðardóttir", method: "POS",  total: 4500 },
    { name: "Jón Pálsson",         method: "Cash", total: 4500 },
    { name: "Hera Björk",          method: "POS",  total: 4500 },
    { name: "Kári Stefánsson",     method: "Cash", total: 4500 },
  ],
};

GatekeeperWrap.subject = "Your Sound Bath with Þórunn recap";
