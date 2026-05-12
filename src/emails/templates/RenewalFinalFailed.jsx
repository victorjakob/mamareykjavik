// RenewalFinalFailed — sent when all retry attempts have been exhausted.
// Voice: still warm, no shaming. Membership is paused, not lost.

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import BrandCallout from "../_components/BrandCallout";

function formatMoney(amount, currency = "ISK") {
  const n = Number(amount || 0);
  const pretty = new Intl.NumberFormat("is-IS").format(n).replace(/,/g, ".");
  const cur = String(currency || "ISK").toUpperCase();
  if (cur === "ISK") return `${pretty} kr.`;
  return `${pretty} ${cur}`;
}

export default function RenewalFinalFailed({
  name = "there",
  amount = 2000,
  currency = "ISK",
  reason = "Your bank declined the renewal charge.",
  manageUrl = "https://mama.is/membership",
} = {}) {
  const firstName = (name || "").split(" ")[0] || "there";
  return (
    <BrandLayout
      preview="Your Mama Tribe membership is paused — easy to restart."
      eyebrow="Mama · Tribe"
    >
      <BrandHeading size="lg">Your membership is paused.</BrandHeading>

      <BrandText>Hi {firstName},</BrandText>
      <BrandText>
        We weren't able to renew your Mama Tribe membership (
        {formatMoney(amount, currency)}) — even after giving it a couple of
        extra tries.
      </BrandText>

      <BrandCallout label="Reason">{reason}</BrandCallout>

      <BrandText>
        For now your membership is{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>paused</strong>. You won't
        be charged again, and your Tribe benefits are on hold until you
        choose to restart.
      </BrandText>

      <BrandText>
        When you're ready, update your card or start fresh from your member
        page — it only takes a minute, and we'll pick up right where you
        left off.
      </BrandText>

      <BrandButton href={manageUrl}>Reactivate my membership</BrandButton>

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

RenewalFinalFailed.previewProps = {
  name: "Hera Björk Þórhallsdóttir",
  amount: 2000,
  currency: "ISK",
  reason: "Your card has expired.",
  manageUrl: "https://mama.is/membership",
};

RenewalFinalFailed.subject = "Your Mama Tribe membership is paused";
