// PrivateSpaceRequestAdmin — internal alert when a Private Space request comes in.
// Replaces inline admin HTML in src/app/api/private-space/request/route.js.

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import BrandDataRow from "../_components/BrandDataRow";
import BrandCallout from "../_components/BrandCallout";

function fmtIsk(n) {
  return `${(Number(n) || 0).toLocaleString("is-IS")} ISK`;
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function PrivateSpaceRequestAdmin({
  contactName = "—",
  contactEmail = "—",
  contactPhone = null,
  referenceId = "ref-preview",
  bookingType = "hourly",
  practiceType = "other",
  groupSize = 1,
  startAt = null,
  endAt = null,
  totalIsk = 0,
  discountIsk = 0,
  practiceDescription = null,
  reviewUrl = "https://mama.is/private-space/admin",
} = {}) {
  // Note: a per-reference admin page (/private-space/admin/[ref]) doesn't
  // exist yet, so reviewUrl points to the admin index. When the per-ref
  // page lands, flip the route handler's reviewUrl construction back to
  // include the reference id.
  return (
    <BrandLayout
      preview={`New Private Space request — ${contactName} · ${fmtIsk(totalIsk)}`}
      eyebrow="Mama · Private Space Admin"
    >
      <BrandHeading size="lg">New Private Space request.</BrandHeading>

      <BrandText>
        <strong style={{ color: BRAND.TEXT_DARK }}>{contactName}</strong>
        {" · "}
        <a href={`mailto:${contactEmail}`} style={{ color: BRAND.ORANGE, textDecoration: "none" }}>
          {contactEmail}
        </a>
        {contactPhone ? ` · ${contactPhone}` : ""}
      </BrandText>

      <BrandDataRow label="Reference" value={referenceId} mono />
      <BrandDataRow label="Type" value={bookingType} />
      <BrandDataRow label="Practice" value={practiceType} />
      <BrandDataRow label="Group size" value={String(groupSize)} />
      <BrandDataRow label="Start" value={fmtDate(startAt)} />
      <BrandDataRow label="End" value={fmtDate(endAt)} />
      <BrandDataRow
        label="Total"
        value={
          discountIsk > 0
            ? `${fmtIsk(totalIsk)} (after ${fmtIsk(discountIsk)} discount)`
            : fmtIsk(totalIsk)
        }
        emphasis
      />

      {practiceDescription ? (
        <BrandCallout label="Description">{practiceDescription}</BrandCallout>
      ) : null}

      <BrandButton href={reviewUrl}>Review →</BrandButton>
    </BrandLayout>
  );
}

PrivateSpaceRequestAdmin.previewProps = {
  contactName: "Sólveig Magnúsdóttir",
  contactEmail: "solveig@example.is",
  contactPhone: "+354 555 1234",
  referenceId: "PS-solveig-13062026",
  bookingType: "half_day",
  practiceType: "circle",
  groupSize: 6,
  startAt: "2026-06-13T13:00:00.000Z",
  endAt: "2026-06-13T17:00:00.000Z",
  totalIsk: 24000,
  discountIsk: 0,
  practiceDescription:
    "Closing circle for our 6-week women's group. Cacao + breath + sharing. We'd love a soft, warm setup with floor cushions if possible.",
  reviewUrl: "https://mama.is/private-space/admin",
};

PrivateSpaceRequestAdmin.subject =
  "[Private Space] New half_day request · 24.000 ISK";
