// PrivateSessionBookingCustomer — confirmation to the client when they book a
// private session with a visiting practitioner. CASH on the day — no payment
// link inside. The actual address is NOT included — it goes out by the
// day-before reminder email after the booking manager fills it in.
//
// No self-serve cancellation link by design: for a healing session with a
// small team, clients who need to cancel just reply to this email and Mama
// handles it from /private-session/admin/bookings/[id]. Keeps the email
// calm and the human in the loop.

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
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
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PrivateSessionBookingCustomer({
  clientName = "friend",
  referenceId = "ref-preview",
  practitionerName = "the practitioner",
  offeringTitle = "Private session",
  durationMinutes = 90,
  priceIsk = 0,
  startAt = null,
  publishedArea = null,
} = {}) {
  return (
    <BrandLayout
      preview={`Booking confirmed — ${offeringTitle} with ${practitionerName}`}
      eyebrow="Private session"
    >
      <BrandHeading size="lg">Booking confirmed.</BrandHeading>

      <BrandText>Hi {clientName},</BrandText>
      <BrandText>
        Your session with{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>{practitionerName}</strong> is held.
        Below are the details — please save this email.
      </BrandText>

      <BrandDataRow label="Reference" value={referenceId} mono />
      <BrandDataRow label="Session" value={offeringTitle} />
      <BrandDataRow label="When" value={fmtDate(startAt)} emphasis />
      <BrandDataRow
        label="Duration · Price"
        value={`${durationMinutes} min · ${fmtIsk(priceIsk)}`}
      />

      <BrandCallout label="Payment">
        Payment is{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>cash, in person, after the session</strong>.
        No payment is required online.
      </BrandCallout>

      <BrandCallout label="Where">
        The exact address will be emailed to you the day before your session.
        {publishedArea ? (
          <>
            {" "}
            For now, we can say the session will be in{" "}
            <strong style={{ color: BRAND.TEXT_DARK }}>{publishedArea}</strong>.
          </>
        ) : null}
      </BrandCallout>

      <BrandText tone="muted" style={{ marginTop: "20px", fontSize: "13px" }}>
        Need to cancel or move? Just reply to this email — we&apos;ll take care
        of it.
      </BrandText>

      <BrandText style={{ marginTop: "28px" }}>
        Looking forward to holding the space for you,
      </BrandText>
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

PrivateSessionBookingCustomer.previewProps = {
  clientName: "Sólveig",
  referenceId: "PSESS-PREVIEW-AB12",
  practitionerName: "Don Tomás",
  offeringTitle: "Ceremonial cacao — one-to-one",
  durationMinutes: 120,
  priceIsk: 18000,
  startAt: "2026-06-04T14:00:00.000Z",
  publishedArea: "Reykjavík 101",
};

PrivateSessionBookingCustomer.subject = "Booking confirmed · Private session";
