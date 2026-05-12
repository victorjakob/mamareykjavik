// WlBookingAdminNotification — sent to team@whitelotus.is when a customer
// completes a White Lotus venue booking. Replaces inline HTML in
// src/app/api/wl/booking/route.js (generateEmailContent).

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import BrandDataRow from "../_components/BrandDataRow";

function fmtDateLong(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

function fmtTime(timeString) {
  if (!timeString) return "—";
  if (timeString.includes(":") && timeString.length <= 5) {
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-GB", {
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return timeString; }
  }
  return timeString;
}

export default function WlBookingAdminNotification({
  referenceId = "ref-preview",
  bookingUrl = "https://mama.is/admin/bookings",
  contactName = "—",
  contactEmail = "—",
  contactCompany = null,
  preferredDate = null,
  startTime = null,
  endTime = null,
  needsEarlyAccess = null,
  setupTime = null,
} = {}) {
  return (
    <BrandLayout
      preview={`New White Lotus booking — ${referenceId}`}
      eyebrow="White Lotus · Admin"
    >
      <BrandHeading size="lg">New booking.</BrandHeading>
      <BrandText
        tone="muted"
        align="center"
        style={{
          margin: "0 0 22px",
          fontFamily: '"SF Mono", Menlo, monospace',
          fontSize: "14px",
        }}
      >
        {referenceId}
      </BrandText>

      <BrandButton href={bookingUrl}>View booking</BrandButton>
      <BrandText
        tone="muted"
        align="center"
        style={{ marginTop: "8px", fontSize: "13px" }}
      >
        Edit details, add notes, message the customer.
      </BrandText>

      <div style={{ marginTop: "26px" }}>
        <BrandDataRow label="Name" value={contactName} />
        <BrandDataRow label="Email" value={contactEmail} mono />
        {contactCompany ? <BrandDataRow label="Company" value={contactCompany} /> : null}
        <BrandDataRow label="Date" value={fmtDateLong(preferredDate)} />
        {startTime ? <BrandDataRow label="Start time" value={fmtTime(startTime)} /> : null}
        {endTime ? <BrandDataRow label="End time" value={fmtTime(endTime)} /> : null}
        {needsEarlyAccess !== null ? (
          <BrandDataRow
            label="Early access"
            value={
              needsEarlyAccess === true
                ? `Yes${setupTime ? ` — ${setupTime}` : ""}`
                : needsEarlyAccess === false
                  ? "No"
                  : "?"
            }
          />
        ) : null}
      </div>

      <BrandText
        tone="muted"
        align="center"
        style={{ marginTop: "26px", fontSize: "11.5px" }}
      >
        Confirmed via the White Lotus booking system · {referenceId}
      </BrandText>
    </BrandLayout>
  );
}

WlBookingAdminNotification.previewProps = {
  referenceId: "solveig-13-06-a4f2",
  bookingUrl: "https://mama.is/admin/bookings",
  contactName: "Sólveig Magnúsdóttir",
  contactEmail: "solveig@example.is",
  contactCompany: "Studio Norð",
  preferredDate: "2026-06-13T19:00:00.000Z",
  startTime: "19:00",
  endTime: "23:00",
  needsEarlyAccess: true,
  setupTime: "16:00",
};

WlBookingAdminNotification.subject = "New booking — solveig-13-06-a4f2";
