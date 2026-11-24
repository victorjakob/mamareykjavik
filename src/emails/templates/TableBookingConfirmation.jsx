// TableBookingConfirmation — sent to the guest when a table is booked, from
// mama.is or from the till.
//
// Bilingual on purpose: one email, Icelandic first when that is the guest's
// language, rather than two templates to keep in step. The reference is the
// thing a guest reads out on the telephone, so it is the loudest item here.

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandDataRow from "../_components/BrandDataRow";
import BrandButton from "../_components/BrandButton";

const COPY = {
  en: {
    preview: (d, t) => `Your table at Mama — ${d} at ${t}`,
    eyebrow: "Mama · Restaurant",
    heading: (n) => `See you soon, ${n}.`,
    intro: "Your table is booked. Here it is in full:",
    when: "When",
    people: "People",
    reference: "Reference",
    manage: "Change or cancel this booking",
    note: "Running late or need to change something? Use the button above, or ring us on +354 766 6262.",
    request: "What you told us",
    people_n: (n) => (n === 1 ? "1 person" : `${n} people`),
  },
  is: {
    preview: (d, t) => `Borðið þitt á Mama — ${d} kl. ${t}`,
    eyebrow: "Mama · Veitingastaður",
    heading: (n) => `Sjáumst fljótlega, ${n}.`,
    intro: "Borðið þitt er bókað. Hér er bókunin:",
    when: "Hvenær",
    people: "Fjöldi",
    reference: "Bókunarnúmer",
    manage: "Breyta eða afbóka",
    note: "Seinkar þér eða þarftu að breyta einhverju? Notaðu hnappinn hér fyrir ofan, eða hringdu í +354 766 6262.",
    request: "Það sem þú sagðir okkur",
    people_n: (n) => (n === 1 ? "1 gestur" : `${n} gestir`),
  },
};

export default function TableBookingConfirmation({
  name = "friend",
  date = "2027-01-20",
  time = "19:00",
  party = 2,
  reference = "MR-7K2Q",
  request = null,
  manageUrl = null,
  language = "en",
} = {}) {
  const t = COPY[language] ?? COPY.en;
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
    <BrandLayout preview={t.preview(pretty, time)} eyebrow={t.eyebrow}>
      <BrandHeading size="lg">{t.heading(firstName)}</BrandHeading>
      <BrandText>{t.intro}</BrandText>

      <BrandDataRow label={t.when} value={`${pretty} · ${time}`} />
      <BrandDataRow label={t.people} value={t.people_n(party)} />
      <BrandDataRow label={t.reference} value={reference} mono emphasis />

      {request ? <BrandDataRow label={t.request} value={request} /> : null}

      {manageUrl ? (
        <BrandButton href={manageUrl}>{t.manage}</BrandButton>
      ) : null}

      <BrandText tone="muted" style={{ marginTop: "18px", color: BRAND.TEXT_MUTED }}>
        {t.note}
      </BrandText>
    </BrandLayout>
  );
}

// A string, not a function: renderEmail only returns `.subject` when it is
// one. The real subject carries the date, the time and the guest's language,
// so the sender composes it — see src/lib/restaurant/notify.js. This is what
// the Email Hub shows.
TableBookingConfirmation.subject = "Your table at Mama";

TableBookingConfirmation.previewProps = {
  name: "Anna Kornelíusdóttir",
  date: "2027-01-20",
  time: "19:00",
  party: 4,
  reference: "MR-7K2Q",
  request: "One of us is coeliac.",
  manageUrl: "https://mama.is/booking/abc123",
  language: "en",
};
