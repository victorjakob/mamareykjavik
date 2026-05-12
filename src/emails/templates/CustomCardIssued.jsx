// CustomCardIssued — sent to a recipient when admin creates / re-sends a
// custom Mama card. Replaces inline HTML in:
//   - POST /api/admin/custom-cards
//   - POST /api/admin/custom-cards/send-email/[id]

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import BrandDataRow from "../_components/BrandDataRow";
import BrandCallout from "../_components/BrandCallout";

function fmtIsk(amount) {
  const pretty = new Intl.NumberFormat("is-IS")
    .format(Number(amount || 0))
    .replace(/,/g, ".");
  return `${pretty} kr.`;
}

function fmtDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

const EXPIRY_NOTES = {
  monthly_reset: (amt) => `This card resets to its original amount each month.`,
  monthly_add: (monthlyAmount) =>
    `This card receives ${fmtIsk(monthlyAmount)} added each month.`,
};

export default function CustomCardIssued({
  recipientName = "friend",
  cardName = "Mama Card",
  companyPerson = null,
  amount = 0,
  expirationType = "none", // none | date | monthly_reset | monthly_add
  expirationDate = null,
  monthlyAmount = null,
  cardUrl = "https://mama.is/custom-card/example",
} = {}) {
  const expiryDateFormatted = fmtDate(expirationDate);

  return (
    <BrandLayout
      preview={`Your ${cardName} from Mama Reykjavík`}
      eyebrow="Mama · Cards"
    >
      <BrandHeading size="lg">Your Mama Card.</BrandHeading>

      <BrandText>Hello {recipientName},</BrandText>
      <BrandText>
        You've received a Mama Card:{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>{cardName}</strong>.
        {companyPerson ? (
          <>
            {" "}From <strong style={{ color: BRAND.TEXT_DARK }}>{companyPerson}</strong>.
          </>
        ) : null}
      </BrandText>

      <BrandDataRow label="Card value" value={fmtIsk(amount)} emphasis />

      <BrandButton href={cardUrl}>View your card</BrandButton>
      <BrandText
        tone="muted"
        align="center"
        style={{ marginTop: "8px", fontSize: "13px" }}
      >
        Click above to access your card and check the balance any time.
      </BrandText>

      {expirationType === "date" && expiryDateFormatted ? (
        <BrandDataRow label="Expires" value={expiryDateFormatted} />
      ) : null}

      {expirationType === "monthly_reset" ? (
        <BrandCallout label="Monthly reset">
          {EXPIRY_NOTES.monthly_reset(amount)}
        </BrandCallout>
      ) : null}

      {expirationType === "monthly_add" && monthlyAmount ? (
        <BrandCallout label="Monthly top-up">
          {EXPIRY_NOTES.monthly_add(monthlyAmount)}
        </BrandCallout>
      ) : null}

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

CustomCardIssued.previewProps = {
  recipientName: "Sólveig Magnúsdóttir",
  cardName: "Studio Norð · Holiday gift",
  companyPerson: "Studio Norð",
  amount: 25000,
  expirationType: "monthly_add",
  expirationDate: null,
  monthlyAmount: 5000,
  cardUrl: "https://mama.is/custom-card/preview-token-abc123",
};

CustomCardIssued.subject = "Your Mama Card from Mama Reykjavík";
