// CancellationScheduled — confirms the user's cancel-at-period-end request.
// Voice: gracious, no guilt, door-stays-open.

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";

function formatDate(iso) {
  if (!iso) return "the end of your current period";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "the end of your current period";
  return d.toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default function CancellationScheduled({
  name = "there",
  activeUntil = null,
  tier = "Tribe",
  manageUrl = "https://mama.is/membership",
} = {}) {
  const firstName = (name || "").split(" ")[0] || "there";
  return (
    <BrandLayout
      preview="We've received your cancellation — your benefits stay on until..."
      eyebrow="Mama · Tribe"
    >
      <BrandHeading size="lg">We've received your cancellation.</BrandHeading>

      <BrandText>Hi {firstName},</BrandText>
      <BrandText>
        We've noted your request to cancel your Mama Tribe
        {tier ? ` (${tier})` : ""} membership. You'll keep all of your
        benefits until{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>
          {formatDate(activeUntil)}
        </strong>{" "}
        — no further charges after that.
      </BrandText>

      <BrandText>
        Thank you for the time you spent in the Tribe. You're welcome back
        anytime the door swings open, and there's always a cup of cacao
        with your name on it.
      </BrandText>

      <BrandButton href={manageUrl}>Manage subscription</BrandButton>

      <BrandText tone="muted" style={{ marginTop: "20px", fontSize: "13.5px" }}>
        Changed your mind? You can reactivate from your member page before
        your benefits end.
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

CancellationScheduled.previewProps = {
  name: "Anna Sigurðardóttir",
  activeUntil: "2026-06-09",
  tier: "Tribe",
  manageUrl: "https://mama.is/membership",
};

CancellationScheduled.subject = "Your Mama Tribe cancellation is scheduled";
