// HostReport — the post-event online-sales report for hosts.
//
// Scope, by design: ONLY tickets sold online through mama.is. Cash, card
// reader, bank transfer and door/kiosk sales are deliberately excluded —
// this email exists to account for the money that came in through the
// website. It says so explicitly, so a host never mistakes it for the
// full picture of the night.
//
// Sent two ways:
//   • manually from the manage hub header ("Email report" → modal), and
//   • automatically by /api/cron/host-reports once the event has ended
//     (event date + duration), when at least one online ticket sold.

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

const tableShell = {
  borderCollapse: "separate",
  borderSpacing: 0,
  width: "100%",
  background: "#faf6f2",
  border: `1px solid ${BRAND.HAIRLINE}`,
  borderRadius: "12px",
  overflow: "hidden",
};

function SectionLabel({ children, sub }) {
  return (
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
        {children}
      </BrandText>
      {sub ? (
        <BrandText tone="muted" align="center" style={{ margin: "0 0 14px", fontSize: "13px" }}>
          {sub}
        </BrandText>
      ) : (
        <div style={{ height: "10px" }} />
      )}
    </>
  );
}

function StatPillar({ label, value, sub, isFirst, width }) {
  return (
    <td
      style={{
        padding: "22px 8px",
        textAlign: "center",
        verticalAlign: "top",
        borderLeft: isFirst ? "none" : `1px solid ${BRAND.HAIRLINE}`,
        width,
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
      <p style={{ margin: 0, color: BRAND.TEXT_MUTED, fontSize: "11px" }}>{sub}</p>
    </td>
  );
}

/**
 * Props:
 *   eventName, eventDate
 *   totals   — { guests, orders, revenue }
 *   variants — [{ name, tickets, revenue }] (empty/omitted → no ticket-type section)
 *   guests   — [{ name, email, quantity, variantName, total }]
 *   hasVariants — whether to show the ticket-type column/section
 */
export default function HostReport({
  eventName = "Ecstatic Dance w/ Luana",
  eventDate = "2026-07-05T16:00:00.000Z",
  totals = { guests: 5, orders: 5, revenue: 19950 },
  variants = [],
  guests = [],
  hasVariants = false,
} = {}) {
  const showVariants = hasVariants && (variants || []).length > 0;

  return (
    <BrandLayout
      preview={`${eventName} — online ticket sales through mama.is.`}
      eyebrow="Online sales report"
      footerNote="This report covers tickets sold online through mama.is only. Cash, card-reader and door sales are not included."
    >
      <BrandHeading size="lg">{eventName}</BrandHeading>
      <BrandText
        align="center"
        style={{
          margin: "0 0 8px",
          fontFamily: BRAND.fontStack.serif,
          fontStyle: "italic",
          fontSize: "18px",
          color: BRAND.TEXT_DARK,
        }}
      >
        {fmtDate(eventDate)}
      </BrandText>
      <BrandText
        tone="muted"
        align="center"
        style={{ margin: "0 0 6px", fontSize: "12px" }}
      >
        Tickets sold online through mama.is
      </BrandText>

      {/* Stat pillars */}
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
                label="Tickets"
                value={totals.guests}
                sub={`${totals.orders} ${totals.orders === 1 ? "booking" : "bookings"}`}
                isFirst
                width="50%"
              />
              <StatPillar
                label="Total"
                value={fmtIsk(totals.revenue)}
                sub="ISK online"
                width="50%"
              />
            </tr>
          </tbody>
        </table>
      </Section>

      {/* Ticket types — only when the event actually sold variants */}
      {showVariants ? (
        <Section style={{ margin: "30px 0 0" }}>
          <SectionLabel>Ticket types</SectionLabel>
          <table width="100%" cellPadding="0" cellSpacing="0" style={tableShell}>
            <tbody>
              {variants.map((v, i) => (
                <tr key={`${v.name}-${i}`}>
                  <td
                    style={{
                      padding: "12px 18px",
                      fontSize: "14px",
                      color: BRAND.TEXT_DARK,
                      borderTop: i === 0 ? "none" : `1px solid ${BRAND.HAIRLINE}`,
                    }}
                  >
                    {v.name}
                  </td>
                  <td
                    style={{
                      padding: "12px 18px",
                      fontSize: "13px",
                      color: BRAND.TEXT_MUTED,
                      textAlign: "right",
                      whiteSpace: "nowrap",
                      fontVariantNumeric: "tabular-nums",
                      borderTop: i === 0 ? "none" : `1px solid ${BRAND.HAIRLINE}`,
                    }}
                  >
                    {v.tickets} {v.tickets === 1 ? "ticket" : "tickets"}
                  </td>
                  <td
                    style={{
                      padding: "12px 18px",
                      fontSize: "14px",
                      color: BRAND.TEXT_DARK,
                      textAlign: "right",
                      whiteSpace: "nowrap",
                      fontVariantNumeric: "tabular-nums",
                      borderTop: i === 0 ? "none" : `1px solid ${BRAND.HAIRLINE}`,
                    }}
                  >
                    {fmtIsk(v.revenue)} kr
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      ) : null}

      {/* Guest list — the heart of the report */}
      <Section style={{ margin: "30px 0 0" }}>
        <SectionLabel
          sub={`${totals.guests} ${totals.guests === 1 ? "ticket" : "tickets"} across ${totals.orders} online ${totals.orders === 1 ? "booking" : "bookings"}.`}
        >
          Guest list
        </SectionLabel>

        <table width="100%" cellPadding="0" cellSpacing="0" style={tableShell}>
          <tbody>
            {(guests || []).length === 0 ? (
              <tr>
                <td
                  style={{
                    padding: "18px",
                    textAlign: "center",
                    color: BRAND.TEXT_MUTED,
                    fontSize: "13px",
                  }}
                >
                  No online tickets sold.
                </td>
              </tr>
            ) : (
              guests.map((g, i) => (
                <tr key={`${g.email}-${i}`}>
                  <td
                    style={{
                      padding: "12px 18px",
                      borderTop: i === 0 ? "none" : `1px solid ${BRAND.HAIRLINE}`,
                    }}
                  >
                    <p style={{ margin: 0, fontSize: "14px", color: BRAND.TEXT_DARK }}>
                      {g.name || "Guest"}
                      {Number(g.quantity) > 1 ? (
                        <span style={{ color: BRAND.TEXT_MUTED, fontSize: "12px" }}>
                          {"  "}· {g.quantity} tickets
                        </span>
                      ) : null}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: BRAND.TEXT_MUTED }}>
                      {g.email}
                    </p>
                  </td>
                  {showVariants ? (
                    <td
                      style={{
                        padding: "12px 18px",
                        fontSize: "11px",
                        color: BRAND.TEXT_MUTED,
                        textAlign: "right",
                        whiteSpace: "nowrap",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        borderTop: i === 0 ? "none" : `1px solid ${BRAND.HAIRLINE}`,
                      }}
                    >
                      {g.variantName || ""}
                    </td>
                  ) : null}
                  <td
                    style={{
                      padding: "12px 18px",
                      fontSize: "14px",
                      color: BRAND.TEXT_DARK,
                      textAlign: "right",
                      whiteSpace: "nowrap",
                      fontVariantNumeric: "tabular-nums",
                      borderTop: i === 0 ? "none" : `1px solid ${BRAND.HAIRLINE}`,
                    }}
                  >
                    {Number(g.total) > 0 ? `${fmtIsk(g.total)} kr` : "Free"}
                  </td>
                </tr>
              ))
            )}

            {/* Totals: gross → payment fee → payout */}
            {(guests || []).length > 0 ? (
              <>
                <tr>
                  <td
                    colSpan={showVariants ? 2 : 1}
                    style={{
                      padding: totals.fee > 0 ? "14px 18px 6px" : "14px 18px",
                      fontSize: "12px",
                      fontWeight: 600,
                      letterSpacing: "0.24em",
                      textTransform: "uppercase",
                      color: totals.fee > 0 ? BRAND.TEXT_MUTED : BRAND.ORANGE,
                      borderTop: `1px solid ${BRAND.HAIRLINE}`,
                      background: "#fff",
                    }}
                  >
                    Total online
                  </td>
                  <td
                    style={{
                      padding: totals.fee > 0 ? "14px 18px 6px" : "14px 18px",
                      fontSize: totals.fee > 0 ? "14px" : "16px",
                      fontFamily: totals.fee > 0 ? undefined : BRAND.fontStack.serif,
                      fontStyle: totals.fee > 0 ? "normal" : "italic",
                      color: BRAND.TEXT_DARK,
                      textAlign: "right",
                      whiteSpace: "nowrap",
                      fontVariantNumeric: "tabular-nums",
                      borderTop: `1px solid ${BRAND.HAIRLINE}`,
                      background: "#fff",
                    }}
                  >
                    {fmtIsk(totals.revenue)} kr
                  </td>
                </tr>
                {totals.fee > 0 ? (
                  <>
                    <tr>
                      <td
                        colSpan={showVariants ? 2 : 1}
                        style={{
                          padding: "6px 18px",
                          fontSize: "12px",
                          color: BRAND.TEXT_MUTED,
                          background: "#fff",
                        }}
                      >
                        Online payment fee ({Math.round((totals.feeRate || 0) * 100)}%)
                      </td>
                      <td
                        style={{
                          padding: "6px 18px",
                          fontSize: "13px",
                          color: BRAND.TEXT_MUTED,
                          textAlign: "right",
                          whiteSpace: "nowrap",
                          fontVariantNumeric: "tabular-nums",
                          background: "#fff",
                        }}
                      >
                        −{fmtIsk(totals.fee)} kr
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={showVariants ? 2 : 1}
                        style={{
                          padding: "10px 18px 14px",
                          fontSize: "12px",
                          fontWeight: 600,
                          letterSpacing: "0.24em",
                          textTransform: "uppercase",
                          color: BRAND.ORANGE,
                          borderTop: `1px dashed ${BRAND.HAIRLINE}`,
                          background: "#fff",
                        }}
                      >
                        After fee
                      </td>
                      <td
                        style={{
                          padding: "10px 18px 14px",
                          fontSize: "16px",
                          fontFamily: BRAND.fontStack.serif,
                          fontStyle: "italic",
                          color: BRAND.TEXT_DARK,
                          textAlign: "right",
                          whiteSpace: "nowrap",
                          fontVariantNumeric: "tabular-nums",
                          borderTop: `1px dashed ${BRAND.HAIRLINE}`,
                          background: "#fff",
                        }}
                      >
                        {fmtIsk(totals.net)} kr
                      </td>
                    </tr>
                  </>
                ) : null}
              </>
            ) : null}
          </tbody>
        </table>
      </Section>

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
        Thank you for bringing this gathering to life. Every name above chose
        to spend their evening with you.
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

HostReport.previewProps = {
  eventName: "Ecstatic Dance w/ Luana",
  eventDate: "2026-07-05T16:00:00.000Z",
  totals: { guests: 6, orders: 5, revenue: 21940, feeRate: 0.05, fee: 1097, net: 20843 },
  hasVariants: true,
  variants: [
    { name: "Early bird", tickets: 3, revenue: 8970 },
    { name: "Standard", tickets: 3, revenue: 12970 },
  ],
  guests: [
    { name: "Brynjar Ingólfsson", email: "brynjar@remax.is", quantity: 1, variantName: "Early bird", total: 2990 },
    { name: "Jose Vicente Requena", email: "rokonoki99@gmail.com", quantity: 2, variantName: "Standard", total: 8980 },
    { name: "Maria Lasota", email: "marialasota7@gmail.com", quantity: 1, variantName: "Early bird", total: 2990 },
    { name: "Paula", email: "paula.markovina@gmail.com", quantity: 1, variantName: "Early bird", total: 2990 },
    { name: "Victor", email: "victorfrances@soulna.es", quantity: 1, variantName: "Standard", total: 3990 },
  ],
};

HostReport.subject = "Ecstatic Dance w/ Luana — online sales report";
