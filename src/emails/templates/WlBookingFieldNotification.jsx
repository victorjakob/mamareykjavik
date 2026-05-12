// WlBookingFieldNotification — booking field update across 4 modes:
//   - mode="approved":          admin approved a customer's pending change → notify customer
//   - mode="rejected":          admin rejected a customer's pending change → notify customer
//   - mode="changed":           admin changed a field directly → notify customer
//   - mode="customer_pending":  customer made a change that needs approval → notify admin

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import BrandDataRow from "../_components/BrandDataRow";
import BrandCallout from "../_components/BrandCallout";

const FIELD_LABELS = {
  foodNumberOfCourses: "Number of courses",
  foodAllergies: "Allergies",
  foodMenu: "Menu",
};

const MODE_CONFIG = {
  approved: {
    eyebrow: "White Lotus · Booking",
    heading: "Change approved.",
    intro: (label, ref) =>
      `Your change to “${label}” on booking ${ref} has been approved.`,
    callout: null,
    showValue: true,
    cta: "View booking",
    signoff: "The White Lotus team",
  },
  rejected: {
    eyebrow: "White Lotus · Booking",
    heading: "Change declined.",
    intro: (label, ref) =>
      `Your change to “${label}” on booking ${ref} has been declined. Please get in touch if you have questions.`,
    callout: null,
    showValue: false,
    cta: "View booking",
    signoff: "The White Lotus team",
  },
  changed: {
    eyebrow: "White Lotus · Booking",
    heading: "Booking updated.",
    intro: (label, ref) =>
      `We've updated the “${label}” field on your booking ${ref}.`,
    callout: null,
    showValue: true,
    cta: "View booking",
    signoff: "The White Lotus team",
  },
  customer_pending: {
    eyebrow: "White Lotus · Admin",
    heading: "Pending change needs approval.",
    intro: (label, ref) =>
      `A customer just changed “${label}” on booking ${ref}. This change needs your approval.`,
    callout: "Pending approval",
    showValue: true,
    cta: "Review and approve",
    signoff: "The White Lotus team",
  },
};

export default function WlBookingFieldNotification({
  mode = "approved",
  referenceId = "ref-preview",
  field = "foodMenu",
  newValue = null,
  fromEmail = null,
  bookingUrl = "https://mama.is/whitelotus/booking/preview",
} = {}) {
  const cfg = MODE_CONFIG[mode] || MODE_CONFIG.approved;
  const fieldLabel = FIELD_LABELS[field] || field;

  return (
    <BrandLayout
      preview={`${cfg.heading} — booking ${referenceId}`}
      eyebrow={cfg.eyebrow}
    >
      <BrandHeading size="lg">{cfg.heading}</BrandHeading>

      <BrandText>{cfg.intro(fieldLabel, referenceId)}</BrandText>

      <BrandDataRow label="Booking" value={referenceId} mono />
      <BrandDataRow label="Field" value={fieldLabel} />
      {fromEmail ? <BrandDataRow label="From" value={fromEmail} mono /> : null}

      {cfg.showValue && newValue ? (
        <BrandCallout label="New value">{newValue}</BrandCallout>
      ) : null}

      {cfg.callout ? (
        <BrandCallout label={cfg.callout} tone="warm">
          This change is waiting for your review before it takes effect on
          the booking.
        </BrandCallout>
      ) : null}

      <BrandButton href={bookingUrl}>{cfg.cta}</BrandButton>

      <BrandText style={{ marginTop: "26px" }}>With warmth,</BrandText>
      <BrandText
        style={{
          fontFamily: BRAND.fontStack.serif,
          fontStyle: "italic",
          fontSize: "18px",
          margin: "-8px 0 0",
        }}
      >
        {cfg.signoff}
      </BrandText>
    </BrandLayout>
  );
}

WlBookingFieldNotification.previewProps = {
  mode: "customer_pending",
  referenceId: "solveig-13-06-a4f2",
  field: "foodMenu",
  newValue:
    "We'd love to switch the buffet to a 3-course plated menu instead — happy to discuss timing implications.",
  fromEmail: "solveig@example.is",
  bookingUrl: "https://mama.is/whitelotus/booking/solveig-13-06-a4f2",
};

WlBookingFieldNotification.subject =
  "Pending change on booking solveig-13-06-a4f2 — Menu";
