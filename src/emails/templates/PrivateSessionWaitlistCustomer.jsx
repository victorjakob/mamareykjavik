// PrivateSessionWaitlistCustomer — confirmation to a client who joined the
// waitlist for an offering. Tells them what happens next.

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandDataRow from "../_components/BrandDataRow";

export default function PrivateSessionWaitlistCustomer({
  clientName = "friend",
  practitionerName = "the practitioner",
  offeringTitle = "Private session",
  position = null,
} = {}) {
  return (
    <BrandLayout
      preview={`You're on the waitlist — ${offeringTitle}`}
      eyebrow="Private session · Waitlist"
    >
      <BrandHeading size="lg">You&apos;re on the waitlist.</BrandHeading>

      <BrandText>Hi {clientName},</BrandText>
      <BrandText>
        Thanks for asking after{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>{offeringTitle}</strong> with{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>{practitionerName}</strong>.
        We&apos;ve added you to the waitlist.
      </BrandText>

      {position ? (
        <BrandDataRow label="Your position" value={`#${position}`} emphasis />
      ) : null}

      <BrandText>
        If a slot opens up, you&apos;ll get an email with a six-hour window to claim
        it. If you don&apos;t claim it in time, it moves to the next person.
      </BrandText>

      <BrandText style={{ marginTop: "26px" }}>
        Holding space for you,
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

PrivateSessionWaitlistCustomer.previewProps = {
  clientName: "Sólveig",
  practitionerName: "Don Tomás",
  offeringTitle: "Ceremonial cacao — one-to-one",
  position: 2,
};

PrivateSessionWaitlistCustomer.subject = "Waitlist · Private session";
