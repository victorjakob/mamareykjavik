// MessageAttendanceBroadcast — sent by host/admin to all event attendees.
// Replaces inline HTML in src/app/api/sendgrid/message-attendance/route.js
// The host writes the message; we frame it on-brand. Multi-line input is
// preserved (newlines render as line breaks).

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";

function fmtEventDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

export default function MessageAttendanceBroadcast({
  eventName = "Sound Bath with Þórunn",
  eventDate = "2026-05-21T18:00:00.000Z",
  message = "Hello — a small note for everyone joining us tomorrow…",
} = {}) {
  // Preserve line breaks from the host's message
  const messageLines = String(message || "").split("\n");

  return (
    <BrandLayout
      preview={`A message about ${eventName}.`}
      eyebrow="White Lotus · Important"
    >
      <BrandHeading size="lg">{eventName}</BrandHeading>
      <BrandText
        tone="muted"
        align="center"
        style={{
          margin: "0 0 22px",
          fontFamily: BRAND.fontStack.serif,
          fontStyle: "italic",
          fontSize: "14px",
        }}
      >
        {fmtEventDate(eventDate)}
      </BrandText>

      {messageLines.map((line, i) =>
        line.trim() === "" ? (
          <div key={i} style={{ height: "10px" }} />
        ) : (
          <BrandText key={i} align="center">
            {line}
          </BrandText>
        ),
      )}

      <BrandText style={{ marginTop: "26px" }}>With warmth,</BrandText>
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

MessageAttendanceBroadcast.previewProps = {
  eventName: "Sound Bath with Þórunn",
  eventDate: "2026-05-21T18:00:00.000Z",
  message:
    "A small note before tomorrow.\n\nWe'll be starting at 18:30 sharp — the door opens 15 minutes before. Bring a blanket and something warm to wear after; the room cools down once the bowls quiet. No need to bring a mat, we'll have everything laid out.\n\nLooking forward to holding this hour with you.",
};

MessageAttendanceBroadcast.subject =
  "Important Message Regarding Sound Bath with Þórunn";
