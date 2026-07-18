// PaidTicketAttendeeConfirmation — sent when an attendee gets a ticket.
// Handles BOTH flows:
//   - Pay-at-the-door (legacy sendgrid/ticket route) → paid=false, headline
//     is "Your spot is held", price line says "to pay at the door"
//   - Paid online via SaltPay (saltpay/success-server route) → paid=true,
//     headline is "Your ticket is confirmed", price line says "Paid"
// Also supports multi-ticket purchases (`quantity` > 1) and ticket variants
// (`variantName`).

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandCallout from "../_components/BrandCallout";
import BrandButton from "../_components/BrandButton";
import { communityJoinCta } from "@/lib/communityLink";

function fmtIsk(amount) {
  const n = Number(amount || 0);
  return new Intl.NumberFormat("is-IS").format(Math.round(n));
}

function fmtEventDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function fmtEventTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit",
  });
}

export default function PaidTicketAttendeeConfirmation({
  userName = "friend",
  eventName = "Sound Bath with Þórunn",
  eventDate = "2026-05-21T18:00:00.000Z",
  duration = 1.5,
  location = "Bankastræti 2, 101 Reykjavík",
  price = 4500,
  currency = "ISK",
  hasSlidingScale = false,
  slidingScaleMin = null,
  slidingScaleMax = null,
  paid = false,         // false = pay at door, true = already paid online
  quantity = 1,         // number of tickets in the purchase
  variantName = null,   // e.g. "Early bird", "VIP" — optional
  communityLink = null,       // event's community join link (WhatsApp/Telegram/…)
  communityLinkLabel = null,  // e.g. "Free Your Voice — WhatsApp group"
} = {}) {
  const firstName = (userName || "").split(" ")[0] || "friend";
  const headline = paid ? "Your ticket is confirmed." : "Your spot is held.";
  const intro = paid
    ? "Your ticket has been confirmed and we're happy to have you join us."
    : "Please pay at the door when you arrive — we're excited to have you join us.";
  const priceLabel = paid ? "Paid" : "To pay at the door";

  return (
    <BrandLayout
      preview={
        paid
          ? `Your ticket to ${eventName} is confirmed.`
          : `Your spot is held for ${eventName}.`
      }
      eyebrow="Mama · Tickets"
    >
      <BrandHeading size="lg">{headline}</BrandHeading>

      <BrandText>Dear {firstName},</BrandText>
      <BrandText>
        You've{paid ? "" : " successfully"} reserved your spot for{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>{eventName}</strong>.
        {variantName ? ` (${variantName})` : ""}
        {" "}
        {intro}
      </BrandText>
      {quantity > 1 ? (
        <BrandText>
          <strong style={{ color: BRAND.TEXT_DARK }}>{quantity} tickets</strong>{" "}
          held under your name.
        </BrandText>
      ) : null}

      {/* Event details — centered stacked block */}
      <div style={{ margin: "26px 0 18px", textAlign: "center" }}>
        <BrandText
          tone="muted"
          align="center"
          style={{
            margin: "0 0 6px",
            fontSize: "10px",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            fontWeight: 600,
            color: BRAND.ORANGE,
          }}
        >
          When &amp; where
        </BrandText>
        <BrandText
          align="center"
          style={{
            margin: "0 0 4px",
            fontFamily: BRAND.fontStack.serif,
            fontStyle: "italic",
            fontSize: "20px",
            color: BRAND.TEXT_DARK,
          }}
        >
          {fmtEventDate(eventDate)}
        </BrandText>
        <BrandText align="center" style={{ margin: "0 0 4px" }}>
          {fmtEventTime(eventDate)}
          {duration ? ` · ${duration} hour${Number(duration) === 1 ? "" : "s"}` : ""}
        </BrandText>
        <BrandText
          align="center"
          tone="muted"
          style={{ margin: 0, fontSize: "13.5px" }}
        >
          {location}
        </BrandText>
      </div>

      {/* Price line */}
      <div style={{ margin: "14px 0 8px", textAlign: "center" }}>
        <BrandText
          tone="muted"
          align="center"
          style={{
            margin: "0 0 4px",
            fontSize: "10px",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {priceLabel}
        </BrandText>
        <BrandText
          align="center"
          style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: 600,
            color: BRAND.TEXT_DARK,
          }}
        >
          {hasSlidingScale && slidingScaleMin != null && slidingScaleMax != null
            ? `${fmtIsk(slidingScaleMin)} – ${fmtIsk(slidingScaleMax)} ${currency}`
            : `${fmtIsk(price)} ${currency}`}
        </BrandText>
        {hasSlidingScale && price ? (
          <BrandText
            align="center"
            tone="muted"
            style={{ margin: "4px 0 0", fontSize: "12.5px" }}
          >
            You chose: {fmtIsk(price)} {currency} (sliding scale)
          </BrandText>
        ) : null}
      </div>

      {/* 15% restaurant discount perk */}
      <BrandCallout label="A small thank-you" tone="warm">
        Show this email at Mama Reykjavík restaurant (same building) for
        <strong style={{ color: BRAND.TEXT_DARK }}> 15% off </strong>
        before or after the event. Honest, real, heartwarming food.
      </BrandCallout>

      {/* Community invite — only when the host turned it on for this event */}
      {communityLink ? (
        <>
          <BrandCallout label="Join the community" tone="warm">
            This gathering has a community of its own
            {communityLinkLabel ? (
              <>
                {" — "}
                <strong style={{ color: BRAND.TEXT_DARK }}>
                  {communityLinkLabel}
                </strong>
              </>
            ) : null}
            . It&apos;s where fellow attendees connect, share, and hear about
            everything coming up. You&apos;re warmly invited.
          </BrandCallout>
          <BrandButton href={communityLink}>
            {communityJoinCta(communityLink)}
          </BrandButton>
        </>
      ) : null}

      <BrandText style={{ marginTop: "26px" }}>See you soon,</BrandText>
      <BrandText
        style={{
          fontFamily: BRAND.fontStack.serif,
          fontStyle: "italic",
          fontSize: "18px",
          margin: "-8px 0 0",
        }}
      >
        The Mama team
      </BrandText>
    </BrandLayout>
  );
}

PaidTicketAttendeeConfirmation.previewProps = {
  userName: "Anna Sigurðardóttir",
  eventName: "Sound Bath with Þórunn",
  eventDate: "2026-05-21T18:00:00.000Z",
  duration: 1.5,
  location: "Bankastræti 2, 101 Reykjavík",
  price: 4500,
  hasSlidingScale: false,
  communityLink: "https://chat.whatsapp.com/EXAMPLE",
  communityLinkLabel: "Free Your Voice — WhatsApp group",
};

PaidTicketAttendeeConfirmation.subject =
  "Event Ticket - Sound Bath with Þórunn";
