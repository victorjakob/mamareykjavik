// WlBookingCommentNotification — handles BOTH directions of the WL booking
// comment thread:
//   - direction="to_customer": admin posted a comment, notifying the customer
//   - direction="to_admin":    customer posted a comment, notifying admin
// One template, switched by prop. Translated to English (was Icelandic).

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import BrandDataRow from "../_components/BrandDataRow";
import BrandCallout from "../_components/BrandCallout";

const SECTION_LABELS = {
  guest_count: "Guest count",
  services: "Services",
  food: "Food",
  drinks: "Drinks",
  room_setup: "Room setup",
  tech_and_music: "Tech & music",
  tablecloth: "Tablecloth & decoration",
  notes: "Notes",
  event_info: "Event info",
  contact: "Contact",
};

export default function WlBookingCommentNotification({
  direction = "to_customer", // to_customer | to_admin
  referenceId = "ref-preview",
  section = "notes",
  comment = "",
  fromEmail = null,
  bookingUrl = "https://mama.is/whitelotus/booking/preview",
} = {}) {
  const isToAdmin = direction === "to_admin";
  const sectionLabel = SECTION_LABELS[section] || section;

  return (
    <BrandLayout
      preview={`New comment on booking ${referenceId} — ${sectionLabel}`}
      eyebrow={isToAdmin ? "White Lotus · Admin" : "White Lotus · Booking"}
    >
      <BrandHeading size="lg">
        {isToAdmin ? "New comment on a booking." : "New comment on your booking."}
      </BrandHeading>

      <BrandText>
        {isToAdmin
          ? `A customer just added a comment on booking ${referenceId}.`
          : `Our team just added a comment on your booking ${referenceId}.`}
      </BrandText>

      <BrandDataRow label="Booking" value={referenceId} mono />
      <BrandDataRow label="Section" value={sectionLabel} />
      {isToAdmin && fromEmail ? (
        <BrandDataRow label="From" value={fromEmail} mono />
      ) : null}

      <BrandCallout label="Comment">{comment}</BrandCallout>

      <BrandButton href={bookingUrl}>View booking</BrandButton>

      <BrandText style={{ marginTop: "26px" }}>
        {isToAdmin ? "With warmth," : "With warmth,"}
      </BrandText>
      <BrandText
        style={{
          fontFamily: BRAND.fontStack.serif,
          fontStyle: "italic",
          fontSize: "18px",
          margin: "-8px 0 0",
        }}
      >
        The White Lotus team
      </BrandText>
    </BrandLayout>
  );
}

WlBookingCommentNotification.previewProps = {
  direction: "to_customer",
  referenceId: "solveig-13-06-a4f2",
  section: "food",
  comment:
    "We've confirmed the buffet menu — three mains, two sides, dessert. Let us know about allergies before Friday.",
  fromEmail: null,
  bookingUrl: "https://mama.is/whitelotus/booking/solveig-13-06-a4f2",
};

WlBookingCommentNotification.subject = "New comment on booking solveig-13-06-a4f2 — Food";
