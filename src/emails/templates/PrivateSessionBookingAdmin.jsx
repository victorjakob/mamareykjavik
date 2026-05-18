// PrivateSessionBookingAdmin — sent to Mama whenever a private session
// booking is confirmed. Carries everything Mama needs to act on the booking
// (full client contact, deep link to the admin booking detail page).

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import BrandDataRow from "../_components/BrandDataRow";
import BrandCallout from "../_components/BrandCallout";

function fmtIsk(n) {
  return `${(Number(n) || 0).toLocaleString("en-GB")} ISK`;
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PrivateSessionBookingAdmin({
  clientName = "—",
  clientEmail = "—",
  clientPhone = null,
  clientNote = null,
  referenceId = "ref-preview",
  practitionerName = "—",
  offeringTitle = "—",
  durationMinutes = 90,
  priceIsk = 0,
  startAt = null,
  reviewUrl = "https://mama.is/private-session/admin",
  needsLocation = true,
} = {}) {
  return (
    <BrandLayout
      preview={`New booking — ${clientName} · ${practitionerName} · ${fmtDate(startAt)}`}
      eyebrow="Private session · Admin"
    >
      <BrandHeading size="lg">New booking.</BrandHeading>

      <BrandText>
        <strong style={{ color: BRAND.TEXT_DARK }}>{clientName}</strong>
        {" · "}
        <a href={`mailto:${clientEmail}`} style={{ color: BRAND.ORANGE, textDecoration: "none" }}>
          {clientEmail}
        </a>
        {clientPhone ? ` · ${clientPhone}` : ""}
      </BrandText>

      <BrandDataRow label="Reference" value={referenceId} mono />
      <BrandDataRow label="Practitioner" value={practitionerName} />
      <BrandDataRow label="Session" value={offeringTitle} />
      <BrandDataRow label="When" value={fmtDate(startAt)} emphasis />
      <BrandDataRow
        label="Duration · Price"
        value={`${durationMinutes} min · ${fmtIsk(priceIsk)} (cash)`}
      />

      {clientNote ? (
        <BrandCallout label="Note from client">{clientNote}</BrandCallout>
      ) : null}

      {needsLocation ? (
        <BrandCallout label="Action needed">
          Set the actual address on the booking — the client will receive it in
          the day-before email.
        </BrandCallout>
      ) : null}

      <BrandButton href={reviewUrl}>Open booking →</BrandButton>
    </BrandLayout>
  );
}

PrivateSessionBookingAdmin.previewProps = {
  clientName: "Sólveig Magnúsdóttir",
  clientEmail: "solveig@example.is",
  clientPhone: "+354 555 1234",
  clientNote: "First time doing a cacao ceremony — happy to bring my own blanket.",
  referenceId: "PSESS-PREVIEW-AB12",
  practitionerName: "Don Tomás",
  offeringTitle: "Ceremonial cacao — one-to-one",
  durationMinutes: 120,
  priceIsk: 18000,
  startAt: "2026-06-04T14:00:00.000Z",
  reviewUrl: "https://mama.is/private-session/admin/bookings/preview-id",
  needsLocation: true,
};

PrivateSessionBookingAdmin.subject = "[Private session] New booking";
