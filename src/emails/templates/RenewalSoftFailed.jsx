// RenewalSoftFailed — sent when a renewal charge fails but a retry is queued.
// Voice: gentle, no panic. We try again automatically.

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

function formatDate(iso) {
  if (!iso) return "soon";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "soon";
  return d.toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default function RenewalSoftFailed({
  name = "there",
  amount = 2000,
  currency = "ISK",
  retryDate = null,
  attemptNumber = 1,
  reason = "Your bank declined the renewal charge.",
  manageUrl = "https://mama.is/membership",
} = {}) {
  const firstName = (name || "").split(" ")[0] || "there";
  const nth =
    attemptNumber === 1
      ? "first"
      : attemptNumber === 2
        ? "second"
        : `attempt ${attemptNumber}`;

  return (
    <BrandLayout
      preview="A small hiccup with your renewal — we'll try again."
      eyebrow="Mama · Tribe"
    >
      <BrandHeading size="lg">A little hiccup with your renewal.</BrandHeading>

      <BrandText>Hi {firstName},</BrandText>
      <BrandText>
        We just tried to renew your Mama Tribe membership (
        {formatMoney(amount, currency)}) and the charge didn't go through.
      </BrandText>

      <BrandCallout label="Reason">{reason}</BrandCallout>

      <BrandText>
        This was our {nth} attempt. We'll try again automatically on{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>
          {formatDate(retryDate)}
        </strong>
        , so there's nothing you need to do if you don't want to.
      </BrandText>

      <BrandText>
        If you'd like to fix it now — update your card or check with your
        bank — the button below opens your member page.
      </BrandText>

      <BrandButton href={manageUrl}>Update my card</BrandButton>

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

RenewalSoftFailed.previewProps = {
  name: "Anna Sigurðardóttir",
  amount: 2000,
  currency: "ISK",
  retryDate: "2026-05-13",
  attemptNumber: 1,
  reason: "Your card doesn't have enough available balance.",
  manageUrl: "https://mama.is/membership",
};

RenewalSoftFailed.subject =
  "We couldn't renew your Mama Tribe membership — we'll try again";
