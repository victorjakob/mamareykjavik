// PrivateSessionWaitlistAdmin — heads-up to Mama when someone joins the
// waitlist for an offering.

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import BrandDataRow from "../_components/BrandDataRow";
import BrandCallout from "../_components/BrandCallout";

export default function PrivateSessionWaitlistAdmin({
  clientName = "—",
  clientEmail = "—",
  clientPhone = null,
  clientNote = null,
  practitionerName = "—",
  offeringTitle = "—",
  position = null,
  waitlistUrl = "https://mama.is/private-session/admin",
} = {}) {
  return (
    <BrandLayout
      preview={`New waitlist entry — ${clientName} · ${offeringTitle}`}
      eyebrow="Private session · Admin"
    >
      <BrandHeading size="lg">New waitlist entry.</BrandHeading>

      <BrandText>
        <strong style={{ color: BRAND.TEXT_DARK }}>{clientName}</strong>
        {" · "}
        <a href={`mailto:${clientEmail}`} style={{ color: BRAND.ORANGE, textDecoration: "none" }}>
          {clientEmail}
        </a>
        {clientPhone ? ` · ${clientPhone}` : ""}
      </BrandText>

      <BrandDataRow label="Practitioner" value={practitionerName} />
      <BrandDataRow label="Session" value={offeringTitle} />
      {position ? <BrandDataRow label="Position" value={`#${position}`} /> : null}

      {clientNote ? (
        <BrandCallout label="Note from client">{clientNote}</BrandCallout>
      ) : null}

      <BrandButton href={waitlistUrl}>Open waitlist →</BrandButton>
    </BrandLayout>
  );
}

PrivateSessionWaitlistAdmin.previewProps = {
  clientName: "Sólveig Magnúsdóttir",
  clientEmail: "solveig@example.is",
  clientPhone: "+354 555 1234",
  clientNote: "Flexible on day, evenings preferred.",
  practitionerName: "Don Tomás",
  offeringTitle: "Ceremonial cacao — one-to-one",
  position: 2,
  waitlistUrl: "https://mama.is/private-session/admin/practitioners/preview/waitlist",
};

PrivateSessionWaitlistAdmin.subject = "[Private session] New waitlist entry";
