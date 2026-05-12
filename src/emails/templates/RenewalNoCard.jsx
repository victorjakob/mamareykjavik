// RenewalNoCard — sent when a renewal is due but no payment method is on file.
// Short and friendly — no card means no charge attempt happened, so the tone
// is "just add one when you have a minute".

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";

function formatMoney(amount, currency = "ISK") {
  const n = Number(amount || 0);
  const pretty = new Intl.NumberFormat("is-IS").format(n).replace(/,/g, ".");
  const cur = String(currency || "ISK").toUpperCase();
  if (cur === "ISK") return `${pretty} kr.`;
  return `${pretty} ${cur}`;
}

export default function RenewalNoCard({
  name = "there",
  amount = 2000,
  currency = "ISK",
  manageUrl = "https://mama.is/membership",
} = {}) {
  const firstName = (name || "").split(" ")[0] || "there";
  return (
    <BrandLayout
      preview="A quick note — we'd love a card on file to keep your membership going."
      eyebrow="Mama · Tribe"
    >
      <BrandHeading size="lg">
        We need a card to keep your membership going.
      </BrandHeading>

      <BrandText>Hi {firstName},</BrandText>
      <BrandText>
        It's time to renew your Mama Tribe membership (
        {formatMoney(amount, currency)}) but we don't have a card on file
        for you at the moment.
      </BrandText>

      <BrandText>
        Pop over to your member page and add a card when you have a minute —
        your benefits will pick back up automatically.
      </BrandText>

      <BrandButton href={manageUrl}>Add a card</BrandButton>

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

RenewalNoCard.previewProps = {
  name: "Jón Pálsson",
  amount: 2000,
  currency: "ISK",
  manageUrl: "https://mama.is/membership",
};

RenewalNoCard.subject =
  "Please add a card to continue your Mama Tribe membership";
