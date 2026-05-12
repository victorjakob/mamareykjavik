// GatekeeperWalkinReceipt — sent to a walk-in attendee at the door who
// requests a receipt. Replaces inline HTML in
// src/app/api/events/gatekeeper/[slug]/walkin/route.js

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandDataRow from "../_components/BrandDataRow";

const METHOD_LABELS = {
  card: "Card (POS)",
  cash: "Cash",
  transfer: "Bank transfer",
  exchange: "Exchange",
};

function fmtIsk(n) {
  return `${(Number(n) || 0).toLocaleString("en-GB")} ISK`;
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

export default function GatekeeperWalkinReceipt({
  buyerName = "friend",
  eventName = "Sound Bath with Þórunn",
  eventDate = "2026-05-21T18:00:00.000Z",
  paymentMethod = "card", // card | cash | transfer | exchange
  ticketPrice = 4500,
  tip = 0,
  totalPrice = 4500,
} = {}) {
  const firstName = (buyerName || "").split(" ")[0] || "friend";
  const methodLabel = METHOD_LABELS[paymentMethod] || paymentMethod;

  return (
    <BrandLayout
      preview={`Receipt — ${eventName}`}
      eyebrow="Mama · Receipt"
    >
      <BrandHeading size="lg">Thank you, {firstName}.</BrandHeading>

      <BrandText>
        You're checked in for{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>{eventName}</strong>.
      </BrandText>
      <BrandText
        tone="muted"
        align="center"
        style={{
          margin: "0 0 22px",
          fontFamily: BRAND.fontStack.serif,
          fontStyle: "italic",
          fontSize: "14px",
        }}
      >
        {fmtDate(eventDate)}
      </BrandText>

      <BrandDataRow label="Name" value={buyerName} />
      <BrandDataRow label="Payment" value={methodLabel} />
      <BrandDataRow label="Ticket" value={fmtIsk(ticketPrice)} />
      {tip > 0 ? <BrandDataRow label="Tip" value={fmtIsk(tip)} /> : null}
      <BrandDataRow label="Total" value={fmtIsk(totalPrice)} emphasis />

      <BrandText
        tone="muted"
        align="center"
        style={{ marginTop: "20px", fontSize: "13px" }}
      >
        Keep this email as your proof of payment. We'll see you at the door.
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

GatekeeperWalkinReceipt.previewProps = {
  buyerName: "Anna Sigurðardóttir",
  eventName: "Sound Bath with Þórunn",
  eventDate: "2026-05-21T18:00:00.000Z",
  paymentMethod: "card",
  ticketPrice: 4500,
  tip: 500,
  totalPrice: 5000,
};

GatekeeperWalkinReceipt.subject = "Receipt · Sound Bath with Þórunn";
