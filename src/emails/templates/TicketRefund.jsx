// TicketRefund — sent when an admin issues a refund on an event ticket.
// Replaces inline HTML in src/lib/ticketEmails.js (sendTicketRefundEmail).
// Voice stays warm — the refund is matter-of-fact, the close is gracious.

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandDataRow from "../_components/BrandDataRow";
import BrandCallout from "../_components/BrandCallout";

function fmtIsk(amount) {
  const n = Number(amount || 0);
  return new Intl.NumberFormat("is-IS").format(Math.round(n));
}

function fmtDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-GB", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "2-digit",  minute: "2-digit",
  });
}

export default function TicketRefund({
  buyerName = "friend",
  eventName = "Sound Bath with Þórunn",
  eventDate = null,
  amount = 4500,
  currency = "ISK",
  isPartial = false,
  originalOrderId = null,
  refundTransactionId = null,
  reason = null,
} = {}) {
  const firstName = (buyerName || "").split(" ")[0] || "friend";
  const scope = isPartial ? "A partial refund" : "A refund";

  return (
    <BrandLayout
      preview={`${isPartial ? "Partial refund" : "Refund"} for ${eventName} — ${fmtIsk(amount)} ${currency}`}
      eyebrow="Mama · Tickets"
    >
      <BrandHeading size="lg">Your refund is on its way.</BrandHeading>

      <BrandText>Hi {firstName},</BrandText>
      <BrandText>
        {scope} of{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>
          {fmtIsk(amount)} {currency}
        </strong>{" "}
        has just been issued back to the card you used for{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>{eventName}</strong>
        {eventDate ? ` on ${fmtDateTime(eventDate)}` : ""}.
      </BrandText>

      {reason ? (
        <BrandCallout label="A note from us">{reason}</BrandCallout>
      ) : null}

      <BrandText tone="muted" style={{ fontSize: "13.5px" }}>
        Depending on your bank, it can take a few business days for the
        amount to show up on your statement. If you don't see it within a
        week, just reply to this email and we'll chase it with the bank.
      </BrandText>

      <BrandDataRow
        label="Amount refunded"
        value={`${fmtIsk(amount)} ${currency}`}
        emphasis
      />
      {originalOrderId ? (
        <BrandDataRow label="Original order" value={originalOrderId} mono />
      ) : null}
      {refundTransactionId ? (
        <BrandDataRow label="Refund ref" value={refundTransactionId} mono />
      ) : null}

      <BrandText tone="muted" style={{ marginTop: "20px", fontSize: "13.5px" }}>
        Thank you for being part of our little circle — we hope to see you
        again soon.
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

TicketRefund.previewProps = {
  buyerName: "Hera Björk Þórhallsdóttir",
  eventName: "Sound Bath with Þórunn",
  eventDate: "2026-05-21T18:00:00.000Z",
  amount: 4500,
  currency: "ISK",
  isPartial: false,
  originalOrderId: "ord_5G7H9J2K",
  refundTransactionId: "rfnd_3M4N6P8Q",
  reason: null,
};

TicketRefund.subject = "Refund for Sound Bath with Þórunn · 4.500 ISK";
