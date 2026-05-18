// PrivateSessionNeedsAddressTeam — fires two days before a session if the
// slot's actual_location is still NULL. Goes to the global Mama + White
// Lotus team addresses (and the practitioner's notification_email if set).
// Carries a direct link to the booking detail page where the address is set.

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import BrandDataRow from "../_components/BrandDataRow";

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PrivateSessionNeedsAddressTeam({
  clientName = "—",
  practitionerName = "—",
  offeringTitle = "—",
  startAt = null,
  bookingUrl = "https://mama.is/private-session/admin",
} = {}) {
  return (
    <BrandLayout
      preview={`Address still missing — session in 2 days with ${clientName}`}
      eyebrow="Private session · Admin"
    >
      <BrandHeading size="lg">Address still missing.</BrandHeading>

      <BrandText>
        A session is two days out and the slot still has no actual address.
        The day-before reminder won&apos;t carry a location until this is set.
      </BrandText>

      <BrandDataRow label="When" value={fmtDate(startAt)} emphasis />
      <BrandDataRow label="Client" value={clientName} />
      <BrandDataRow label="Practitioner" value={practitionerName} />
      <BrandDataRow label="Session" value={offeringTitle} />

      <BrandButton href={bookingUrl}>Set the address →</BrandButton>

      <BrandText tone="muted" style={{ marginTop: "16px", fontSize: "12px" }}>
        Once saved, the client gets the address automatically the day before.
      </BrandText>
    </BrandLayout>
  );
}

PrivateSessionNeedsAddressTeam.previewProps = {
  clientName: "Sólveig Magnúsdóttir",
  practitionerName: "Don Tomás",
  offeringTitle: "Ceremonial cacao — one-to-one",
  startAt: "2026-06-04T14:00:00.000Z",
  bookingUrl: "https://mama.is/private-session/admin/bookings/preview-id",
};

PrivateSessionNeedsAddressTeam.subject = "[Private session] Set the address — session in 2 days";
