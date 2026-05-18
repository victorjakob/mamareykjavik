// PrivateSessionDayOfNoAddress — sent to the attendee on the day of their
// session, only if the slot's actual_location is STILL NULL after the
// day-before reminder cron skipped it. A "we have you, the address is
// coming" courtesy note so the client isn't left in the dark.

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
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

export default function PrivateSessionDayOfNoAddress({
  clientName = "friend",
  practitionerName = "the practitioner",
  offeringTitle = "Private session",
  startAt = null,
} = {}) {
  return (
    <BrandLayout
      preview="The address is coming shortly — your session is today"
      eyebrow="Today"
    >
      <BrandHeading size="lg">The address is on its way.</BrandHeading>

      <BrandText>Hi {clientName},</BrandText>
      <BrandText>
        Just a quick note. Your session with{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>{practitionerName}</strong>{" "}
        is today and we&apos;re finalising the location — we&apos;ll send the
        exact address as soon as it&apos;s confirmed.
      </BrandText>

      <BrandDataRow label="Session" value={offeringTitle} />
      <BrandDataRow label="When" value={fmtDate(startAt)} emphasis />

      <BrandText tone="muted" style={{ marginTop: "16px", fontSize: "13px" }}>
        If you don&apos;t hear from us within a couple of hours of your slot,
        please reply to this email and we&apos;ll sort it.
      </BrandText>

      <BrandText style={{ marginTop: "26px" }}>Looking forward to today,</BrandText>
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

PrivateSessionDayOfNoAddress.previewProps = {
  clientName: "Sólveig",
  practitionerName: "Don Tomás",
  offeringTitle: "Ceremonial cacao — one-to-one",
  startAt: "2026-06-04T14:00:00.000Z",
};

PrivateSessionDayOfNoAddress.subject = "Your session today — address coming shortly";
