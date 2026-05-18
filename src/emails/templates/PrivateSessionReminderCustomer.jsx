// PrivateSessionReminderCustomer — sent the day before a private session.
// Carries the actual address if it's set on the slot. If the address is not
// yet set we fall back to the day-of email instead (PrivateSessionDayOfNoAddress)
// — this template is for the "we know where you're going" case.

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandDataRow from "../_components/BrandDataRow";
import BrandCallout from "../_components/BrandCallout";

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PrivateSessionReminderCustomer({
  clientName = "friend",
  practitionerName = "the practitioner",
  offeringTitle = "Private session",
  startAt = null,
  actualLocation = null,
} = {}) {
  return (
    <BrandLayout
      preview={`See you tomorrow — ${offeringTitle} with ${practitionerName}`}
      eyebrow="Tomorrow"
    >
      <BrandHeading size="lg">See you tomorrow.</BrandHeading>

      <BrandText>Hi {clientName},</BrandText>
      <BrandText>
        A gentle reminder of your session with{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>{practitionerName}</strong>.
      </BrandText>

      <BrandDataRow label="Session" value={offeringTitle} />
      <BrandDataRow label="When" value={fmtDate(startAt)} emphasis />

      {actualLocation ? (
        <BrandCallout label="Where">
          <strong style={{ color: BRAND.TEXT_DARK }}>{actualLocation}</strong>
        </BrandCallout>
      ) : (
        <BrandCallout label="Where">
          We&apos;ll send the exact address shortly — keep an eye on your inbox.
        </BrandCallout>
      )}

      <BrandCallout label="A few notes">
        Bring water, wear something comfortable, and arrive a few minutes
        early if you can. Payment is cash, in person, after the session.
      </BrandCallout>

      <BrandText tone="muted" style={{ marginTop: "20px", fontSize: "13px" }}>
        Need anything? Just reply to this email.
      </BrandText>

      <BrandText style={{ marginTop: "26px" }}>Holding space for you,</BrandText>
      <BrandText
        style={{
          fontFamily: BRAND.fontStack.serif,
          fontStyle: "italic",
          fontSize: "18px",
          margin: "-8px 0 0",
        }}
      >
        Mama
      </BrandText>
    </BrandLayout>
  );
}

PrivateSessionReminderCustomer.previewProps = {
  clientName: "Sólveig",
  practitionerName: "Don Tomás",
  offeringTitle: "Ceremonial cacao — one-to-one",
  startAt: "2026-06-04T14:00:00.000Z",
  actualLocation: "Bankastræti 2, 101 Reykjavík",
};

PrivateSessionReminderCustomer.subject = "Your session is tomorrow";
