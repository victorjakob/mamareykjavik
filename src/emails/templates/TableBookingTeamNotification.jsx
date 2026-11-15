// TableBookingTeamNotification — tells the restaurant a table has been booked
// from the website.
//
// Only website bookings send this. One taken at the till was taken by someone
// standing in the restaurant, who does not need an email about it.

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandDataRow from "../_components/BrandDataRow";

export default function TableBookingTeamNotification({
  name = "Guest",
  date = "2027-01-20",
  time = "19:00",
  party = 2,
  reference = "MR-7K2Q",
  email = null,
  phone = null,
  request = null,
  tables = [],
  language = "en",
} = {}) {
  const pretty = (() => {
    const d = new Date(`${date}T12:00:00`);
    if (Number.isNaN(d.getTime())) return date;
    return d.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  })();

  return (
    <BrandLayout
      preview={`${party} on ${pretty} at ${time} — ${name}`}
      eyebrow="Mama · New booking"
    >
      <BrandHeading size="lg">
        {party} on {pretty}, {time}
      </BrandHeading>

      <BrandText>
        Booked on mama.is. It is already in the till under{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>{reference}</strong>, holding{" "}
        {tables.length > 0 ? tables.join(" + ") : "no table yet"}.
      </BrandText>

      <BrandDataRow label="Name" value={name} />
      {phone ? <BrandDataRow label="Phone" value={phone} /> : null}
      {email ? <BrandDataRow label="Email" value={email} /> : null}
      {request ? <BrandDataRow label="They asked" value={request} /> : null}
      {language === "is" ? <BrandDataRow label="Language" value="Íslenska" /> : null}

      <BrandText tone="muted" style={{ marginTop: "18px", color: BRAND.TEXT_MUTED }}>
        It arrives as “New booking”. Confirm or move it on the reservations
        screen.
      </BrandText>
    </BrandLayout>
  );
}

// A string, for the same reason. The sender composes the real one with the
// party size, day and time in it.
TableBookingTeamNotification.subject = "New table booking";

TableBookingTeamNotification.previewProps = {
  name: "Anna Kornelíusdóttir",
  date: "2027-01-20",
  time: "19:00",
  party: 4,
  reference: "MR-7K2Q",
  email: "anna@example.com",
  phone: "+354 896 1118",
  request: "One of us is coeliac.",
  tables: ["Table 2A", "Table 2B"],
  language: "is",
};
