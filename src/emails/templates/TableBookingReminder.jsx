// TableBookingReminder — one email, before a table booking.
//
// Not a second confirmation. A guest who booked three weeks ago has forgotten
// the time and lost the first email, so this carries the same facts again and
// the same link; what it adds is the one question worth asking the day before,
// which is whether they are still coming. Mama loses more covers to a party
// that quietly does not turn up than to one that cancels at teatime.
//
// How far ahead it goes out is a setting — booking_settings.reminder_hours_before
// — so the greeting cannot assume tomorrow. The sender works out which day it
// lands on and the wording follows.
//
// Bilingual like its confirmation, and for the same reason: one template to
// keep in step rather than two.

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandDataRow from "../_components/BrandDataRow";
import BrandButton from "../_components/BrandButton";

const COPY = {
  en: {
    preview: {
      today: (d, t) => `Today at Mama — ${t}`,
      tomorrow: (d, t) => `Tomorrow at Mama — ${d}, ${t}`,
      later: (d, t) => `Your table at Mama — ${d}, ${t}`,
    },
    eyebrow: "Mama · Restaurant",
    heading: {
      today: (n) => `Today, ${n}.`,
      tomorrow: (n) => `Tomorrow, ${n}.`,
      later: (n) => `See you soon, ${n}.`,
    },
    intro: "A quick reminder of your table. Everything below is as booked.",
    when: "When",
    people: "People",
    reference: "Reference",
    request: "What you told us",
    manage: "Change or cancel this booking",
    ask: "If your plans have changed, letting us know frees the table for somebody else — it takes a moment with the button above.",
    note: "Mama Reykjavík · Bankastræti 2 · +354 766 6262",
    people_n: (n) => (n === 1 ? "1 person" : `${n} people`),
  },
  is: {
    preview: {
      today: (d, t) => `Í dag á Mama — kl. ${t}`,
      tomorrow: (d, t) => `Á morgun á Mama — ${d} kl. ${t}`,
      later: (d, t) => `Borðið þitt á Mama — ${d} kl. ${t}`,
    },
    eyebrow: "Mama · Veitingastaður",
    heading: {
      today: (n) => `Í dag, ${n}.`,
      tomorrow: (n) => `Á morgun, ${n}.`,
      later: (n) => `Sjáumst fljótlega, ${n}.`,
    },
    intro: "Lítil áminning um borðið þitt. Allt hér að neðan er eins og bókað var.",
    when: "Hvenær",
    people: "Fjöldi",
    reference: "Bókunarnúmer",
    request: "Það sem þú sagðir okkur",
    manage: "Breyta eða afbóka",
    ask: "Ef áætlanir hafa breyst máttu endilega láta okkur vita — þá losnar borðið fyrir einhvern annan. Það tekur augnablik með hnappinum hér fyrir ofan.",
    note: "Mama Reykjavík · Bankastræti 2 · +354 766 6262",
    people_n: (n) => (n === 1 ? "1 gestur" : `${n} gestir`),
  },
};

export default function TableBookingReminder({
  name = "friend",
  date = "2027-01-20",
  time = "19:00",
  party = 2,
  reference = "MR-7K2Q",
  request = null,
  manageUrl = null,
  language = "en",
  when = "tomorrow",
} = {}) {
  const t = COPY[language] ?? COPY.en;
  const day = t.heading[when] ? when : "later";
  const firstName = (name || "").split(" ")[0] || "friend";

  // 20 January 2027, rather than 2027-01-20: this is read by a person.
  const pretty = (() => {
    const d = new Date(`${date}T12:00:00`);
    if (Number.isNaN(d.getTime())) return date;
    return d.toLocaleDateString(language === "is" ? "is-IS" : "en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  })();

  return (
    <BrandLayout preview={t.preview[day](pretty, time)} eyebrow={t.eyebrow}>
      <BrandHeading size="lg">{t.heading[day](firstName)}</BrandHeading>
      <BrandText>{t.intro}</BrandText>

      <BrandDataRow label={t.when} value={`${pretty} · ${time}`} />
      <BrandDataRow label={t.people} value={t.people_n(party)} />
      <BrandDataRow label={t.reference} value={reference} mono emphasis />

      {request ? <BrandDataRow label={t.request} value={request} /> : null}

      {manageUrl ? <BrandButton href={manageUrl}>{t.manage}</BrandButton> : null}

      {manageUrl ? (
        <BrandText tone="muted" style={{ marginTop: "18px", color: BRAND.TEXT_MUTED }}>
          {t.ask}
        </BrandText>
      ) : null}

      <BrandText tone="muted" style={{ marginTop: "18px", color: BRAND.TEXT_MUTED }}>
        {t.note}
      </BrandText>
    </BrandLayout>
  );
}

// A string, not a function: renderEmail only returns `.subject` when it is
// one. The real subject carries the time and the guest's language, so the
// sender composes it — see the booking-reminders cron. This is what the Email
// Hub shows.
TableBookingReminder.subject = "Your table at Mama, tomorrow";

TableBookingReminder.previewProps = {
  name: "Anna Kornelíusdóttir",
  date: "2027-01-20",
  time: "19:00",
  party: 4,
  reference: "MR-7K2Q",
  request: "One of us is coeliac.",
  manageUrl: "https://mama.is/booking/abc123",
  language: "en",
  when: "tomorrow",
};
