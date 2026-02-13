"use client";

import Link from "next/link";

const EMPTY = "\u2014";

function formatValue(v) {
  if (v == null || v === "") return EMPTY;
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) {
    if (v.length === 0) return EMPTY;
    return v
      .map((item) =>
        typeof item === "object" && item !== null
          ? [item.name, item.phone, item.comment].filter(Boolean).join(" \u00B7 ") || EMPTY
          : String(item)
      )
      .filter(Boolean)
      .join(" \u00B7 ");
  }
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function formatDateDisplay(iso) {
  if (!iso) return EMPTY;
  const s = String(iso).trim();
  if (!/^\d{4}-\d{2}-\d{2}/.test(s)) return s;
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  const month = MONTHS[m - 1] || "";
  return `${d} ${month} ${y}`;
}

function SectionCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 sm:mb-4">
        {title}
      </h3>
      <dl className="space-y-2 sm:space-y-2.5">{children}</dl>
    </div>
  );
}

function Row({ label, value }) {
  const v = formatValue(value);
  if (v === EMPTY) return null;
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3 sm:items-baseline">
      <dt className="shrink-0 text-sm text-gray-600 sm:min-w-[10rem]">{label}</dt>
      <dd className="break-words whitespace-pre-line text-sm text-gray-900">{v}</dd>
    </div>
  );
}

export default function RawBookingOverview({ booking, bookingRef }) {
  if (!booking) return null;

  const bd = booking.booking_data || {};
  const ops = bd.adminOps || {};
  const preferred = booking.preferred_datetime || bd?.dateTime?.preferred;

  const sections = [
    {
      title: "Booking & contact",
      rows: [
        ["Name of Event / Company", ops.eventNameOrCompany],
        ["Type of event", ops.eventType],
        [
          "Contact",
          [
            booking.contact_name || bd?.contact?.name,
            booking.contact_phone || bd?.contact?.phone,
            ops.contactComment,
          ]
            .filter(Boolean)
            .join(" \u00B7 ") || null,
        ],
        ["Contact email", booking.contact_email || bd?.contact?.email],
        ["Extra contacts", ops.extraContacts],
      ],
    },
    {
      title: "Timing",
      rows: [
        ["Date", formatDateDisplay(preferred)],
        ["Start time", booking.start_time || bd?.dateTime?.startTime],
        ["End time", booking.end_time || bd?.dateTime?.endTime],
        ["End-time policy", ops.endTimePolicy === "hardCutoff" ? "Hard cutoff" : ops.endTimePolicy === "canStayLate" ? "Flexible" : "Unsure"],
        ["Latest exit time", ops.lateExitLatestTime],
      ],
    },
    {
      title: "Guests & staffing",
      rows: [
        ["Guest count", booking.guest_count ?? bd?.guestCount],
        ["Staff needed", ops.staffNeeded],
        ["Comment", ops.guestStaffComment],
      ],
    },
    {
      title: "Drinks",
      rows: [
        ["There will be drinks", ops.hasDrinks],
        ["Prepaid", ops.drinksPrepaidSummary],
        ["Available", ops.drinksToHaveAvailable],
        ["Pre-drinks plan", ops.preDrinksPlan],
        ["Bringing own", ops.bringingOwnItems],
      ],
    },
    {
      title: "Food",
      rows: [
        [
          "Selection",
          ops.foodSelection === "fingerfood"
            ? "Fingerfood"
            : ops.foodSelection === "buffet"
              ? "Buffet"
              : ops.foodSelection === "tableService"
                ? "Table service"
                : ops.foodSelection,
        ],
        ["Menu", ops.foodMenu],
        ["Number of servings", ops.numberOfPeople],
        ["Allergies", ops.allergiesSummary],
        ["Other", ops.foodOther],
        ["Chef", ops.chefName],
        ["Chef phone", ops.chefPhone],
      ],
    },
    {
      title: "Space",
      rows: [
        ["Setup style", ops.setupStyle || booking.room_setup || bd?.roomSetup],
        ["Table / decoration", ops.tableStyleNotes],
      ],
    },
    {
      title: "Tech",
      rows: [
        ["Soundsystem", ops.soundsystemCheck],
        ["Lights and disco", ops.lightsDiscoCheck],
        ["Projector", ops.projectorCheck],
        ["Musician / DJ - Soundcheck?", ops.musicianOrDJ],
        ["Tech notes", ops.techNotes],
        ["Services", Array.isArray(booking.services) ? booking.services.join(", ") : booking.services],
      ],
    },
  ];

  const statusClass =
    booking.status === "confirmed"
      ? "bg-emerald-100 text-emerald-800"
      : booking.status === "pending"
        ? "bg-amber-100 text-amber-800"
        : "bg-gray-100 text-gray-700";

  return (
    <section className="space-y-4 sm:space-y-5">
      <header className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
        <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
          Booking #{bookingRef}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium sm:text-sm ${statusClass}`}
          >
            {booking.status}
          </span>
          <Link
            href={`/whitelotus/booking/${bookingRef}`}
            className="inline-block rounded-lg py-2 text-sm font-medium text-[#a77d3b] underline-offset-2 hover:underline active:opacity-80"
          >
            Guest dashboard →
          </Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-2">
        {sections.map(({ title, rows }) => (
          <SectionCard key={title} title={title}>
            {rows.map(([label, value]) => (
              <Row key={label} label={label} value={value} />
            ))}
          </SectionCard>
        ))}
      </div>
    </section>
  );
}
