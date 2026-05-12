// TribeCardRequestNotification — sent to team@mama.is when a public Tribe Card
// request is submitted. Replaces buildNewRequestEmail in src/lib/tribeCardEmail.js

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import BrandDataRow from "../_components/BrandDataRow";
import BrandCallout from "../_components/BrandCallout";

export default function TribeCardRequestNotification({
  name = "—",
  email = "—",
  phone = null,
  message = null,
  adminUrl = "https://mama.is/admin/cards/tribe-cards",
} = {}) {
  return (
    <BrandLayout
      preview={`New Tribe Card request from ${name}.`}
      eyebrow="Mama · Admin"
    >
      <BrandHeading size="lg">New Tribe Card request.</BrandHeading>
      <BrandText>
        Someone just asked for a Tribe Card. Details below — open the admin
        to approve, reject, or set the discount.
      </BrandText>

      <BrandDataRow label="Name" value={name} />
      <BrandDataRow label="Email" value={email} mono />
      <BrandDataRow label="Phone" value={phone || "—"} />

      {message ? <BrandCallout label="Their message">{message}</BrandCallout> : null}

      <BrandButton href={adminUrl}>Open in admin</BrandButton>

      <BrandText
        tone="muted"
        align="center"
        style={{ marginTop: "16px", fontSize: "12.5px" }}
      >
        You can approve, reject, set the discount % and the duration directly
        from the dashboard.
      </BrandText>
    </BrandLayout>
  );
}

TribeCardRequestNotification.previewProps = {
  name: "Anna Sigurðardóttir",
  email: "anna@example.is",
  phone: "+354 555 1234",
  message:
    "I've been coming to the kitchen for years and would love to lean in more. Would a Tribe Card make sense?",
  adminUrl: "https://mama.is/admin/cards/tribe-cards",
};

TribeCardRequestNotification.subject = "Tribe Card request from Anna Sigurðardóttir";
