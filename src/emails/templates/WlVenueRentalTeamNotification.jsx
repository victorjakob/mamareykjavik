// WlVenueRentalTeamNotification — team-side of the WL venue rental inquiry.
// Replaces inline HTML in src/app/api/sendgrid/email-wl-rent/route.js (admin email).

import BrandLayout from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandDataRow from "../_components/BrandDataRow";

export default function WlVenueRentalTeamNotification({
  name = "—",
  email = "—",
  event = null,
  timeAndDate = null,
  guestCount = null,
  comments = null,
} = {}) {
  return (
    <BrandLayout
      preview={`Venue rental inquiry from ${name}.`}
      eyebrow="White Lotus · Admin"
    >
      <BrandHeading size="lg">New venue rental inquiry.</BrandHeading>
      <BrandText>Reply to this email to reach {name} directly.</BrandText>

      <BrandDataRow label="Name" value={name} />
      <BrandDataRow label="Email" value={email} mono />
      {event ? <BrandDataRow label="Event type" value={event} /> : null}
      {timeAndDate ? <BrandDataRow label="Date / time" value={timeAndDate} /> : null}
      {guestCount ? (
        <BrandDataRow label="Guest count" value={String(guestCount)} />
      ) : null}
      {comments ? <BrandDataRow label="Details" value={comments} /> : null}
    </BrandLayout>
  );
}

WlVenueRentalTeamNotification.previewProps = {
  name: "Jón Pálsson",
  email: "jon@example.is",
  event: "60th birthday dinner",
  timeAndDate: "Saturday 13 June 2026 · 19:00 – 23:00",
  guestCount: 48,
  comments:
    "We'd like a long communal table if possible. Vegan menu, half guests are flying in from abroad.",
};

WlVenueRentalTeamNotification.subject =
  "New White Lotus Venue Rental Request from Jón Pálsson";
