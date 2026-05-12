// RefundIssued — sent when an admin issues a refund (full or partial).
// Voice: clean and clear about the refund, with a soft thank-you tail.

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import BrandDataRow from "../_components/BrandDataRow";
import BrandCallout from "../_components/BrandCallout";

function formatMoney(amount, currency = "ISK") {
  const n = Number(amount || 0);
  const pretty = new Intl.NumberFormat("is-IS").format(n).replace(/,/g, ".");
  const cur = String(currency || "ISK").toUpperCase();
  if (cur === "ISK") return `${pretty} kr.`;
  return `${pretty} ${cur}`;
}

export default function RefundIssued({
  name = "there",
  amount = 2000,
  currency = "ISK",
  isPartial = false,
  originalOrderId = null,
  refundTransactionId = null,
  reason = null,
  manageUrl = "https://mama.is/membership",
} = {}) {
  const firstName = (name || "").split(" ")[0] || "there";
  const scope = isPartial ? "A partial refund" : "A full refund";

  return (
    <BrandLayout
      preview={`${isPartial ? "Partial refund" : "Refund"} from Mama — ${formatMoney(amount, currency)}`}
      eyebrow="Mama · Tribe"
    >
      <BrandHeading size="lg">Your refund is on its way.</BrandHeading>

      <BrandText>Hi {firstName},</BrandText>
      <BrandText>
        {scope} of{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>
          {formatMoney(amount, currency)}
        </strong>{" "}
        has just been issued back to the card you used for your Mama Tribe
        membership.
      </BrandText>

      {reason ? (
        <BrandCallout label="Note from us">{reason}</BrandCallout>
      ) : null}

      <BrandText>
        Depending on your bank, it can take a few business days for the
        amount to show up on your statement. If you don't see it within a
        week, just reply to this email and we'll chase it with the bank.
      </BrandText>

      <BrandDataRow
        label="Amount refunded"
        value={formatMoney(amount, currency)}
        emphasis
      />
      {originalOrderId ? (
        <BrandDataRow label="Original order" value={originalOrderId} mono />
      ) : null}
      {refundTransactionId ? (
        <BrandDataRow label="Refund ref" value={refundTransactionId} mono />
      ) : null}

      <BrandButton href={manageUrl}>View my membership</BrandButton>

      <BrandText tone="muted" style={{ marginTop: "20px", fontSize: "13.5px" }}>
        Thanks for being part of the Tribe — we hope to keep cooking for you
        for a long time yet.
      </BrandText>

      <BrandText style={{ marginTop: "26px" }}>With love,</BrandText>
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

RefundIssued.previewProps = {
  name: "Hera Björk Þórhallsdóttir",
  amount: 2000,
  currency: "ISK",
  isPartial: false,
  originalOrderId: "ord_2J4K6N8P0Q",
  refundTransactionId: "rfnd_8B3C5D7F",
  reason: null,
  manageUrl: "https://mama.is/membership",
};

RefundIssued.subject = "Refund from Mama Reykjavik · 2.000 kr.";
