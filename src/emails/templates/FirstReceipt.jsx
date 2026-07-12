// FirstReceipt — sent when the first CIT charge of a paid membership succeeds.
// Structure mirrors RenewalSucceeded; the wording differs because this is the
// member's very first payment ("thank you for joining", not "for continuing").
// Voice preserved: warm, community-first, no upsell.

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import BrandDataRow from "../_components/BrandDataRow";

function formatMoney(amount, currency = "ISK") {
  const n = Number(amount || 0);
  const pretty = new Intl.NumberFormat("is-IS").format(n).replace(/,/g, ".");
  const cur = String(currency || "ISK").toUpperCase();
  if (cur === "ISK") return `${pretty} kr.`;
  return `${pretty} ${cur}`;
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default function FirstReceipt({
  name = "there",
  amount = 2000,
  currency = "ISK",
  nextBillingDate = null,
  tier = "Tribe",
  transactionId = null,
  manageUrl = "https://mama.is/membership",
} = {}) {
  const firstName = (name || "").split(" ")[0] || "there";
  return (
    <BrandLayout
      preview={`Your Mama Tribe receipt — ${formatMoney(amount, currency)}`}
      eyebrow="Mama · Tribe"
    >
      <BrandHeading size="lg">Your payment went through.</BrandHeading>

      <BrandText>Hi {firstName},</BrandText>
      <BrandText>
        Thank you for joining Mama Tribe — below is the receipt for your
        first payment. Your support keeps this little community cooking.
      </BrandText>

      <BrandDataRow label="Tier" value={tier || "Tribe"} />
      <BrandDataRow label="Amount" value={formatMoney(amount, currency)} emphasis />
      <BrandDataRow label="Next renewal" value={formatDate(nextBillingDate)} />
      {transactionId ? (
        <BrandDataRow label="Receipt" value={transactionId} mono />
      ) : null}

      <BrandButton href={manageUrl}>Manage subscription</BrandButton>

      <BrandText tone="muted" style={{ marginTop: "20px", fontSize: "13.5px" }}>
        Your membership renews monthly. You can manage your subscription or
        update your card anytime from your member page.
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

FirstReceipt.previewProps = {
  name: "Sólveig Magnúsdóttir",
  amount: 2000,
  currency: "ISK",
  nextBillingDate: "2026-08-07",
  tier: "Tribe",
  transactionId: "tx_2J5K7N9P2Q",
  manageUrl: "https://mama.is/membership",
};

FirstReceipt.subject = "Your Mama Tribe receipt · 2.000 kr.";
