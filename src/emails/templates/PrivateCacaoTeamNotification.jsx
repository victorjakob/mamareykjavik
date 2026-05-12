// PrivateCacaoTeamNotification — team-side of private cacao inquiry.
// Replaces inline HTML in src/app/api/sendgrid/private-cacao-booking/route.js (team email).

import BrandLayout from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandDataRow from "../_components/BrandDataRow";

export default function PrivateCacaoTeamNotification({
  name = "—",
  email = "—",
  participants = null,
  intention = null,
  location = null,
  preferredDate = null,
  additionalNotes = null,
} = {}) {
  return (
    <BrandLayout
      preview={`Private cacao inquiry from ${name}.`}
      eyebrow="Mama · Admin"
    >
      <BrandHeading size="lg">New private cacao inquiry.</BrandHeading>
      <BrandText>Reply to this email to reach {name} directly.</BrandText>

      <BrandDataRow label="Name" value={name} />
      <BrandDataRow label="Email" value={email} mono />
      <BrandDataRow label="Group size" value={String(participants ?? "—")} />
      {intention ? <BrandDataRow label="Intention" value={intention} /> : null}
      {location ? <BrandDataRow label="Location" value={location} /> : null}
      {preferredDate ? (
        <BrandDataRow label="Approximate window" value={preferredDate} />
      ) : null}
      {additionalNotes ? (
        <BrandDataRow label="Notes" value={additionalNotes} />
      ) : null}
    </BrandLayout>
  );
}

PrivateCacaoTeamNotification.previewProps = {
  name: "Hera Björk Þórhallsdóttir",
  email: "hera@example.is",
  participants: 12,
  intention: "Birthday celebration & gentle reset",
  location: "At Mama (the back room)",
  preferredDate: "Late June or early July",
  additionalNotes: "We'd love a 75-minute ceremony with cacao and breath. A few guests are pregnant.",
};

PrivateCacaoTeamNotification.subject =
  "Private Cacao Ceremony Inquiry from Hera Björk Þórhallsdóttir";
