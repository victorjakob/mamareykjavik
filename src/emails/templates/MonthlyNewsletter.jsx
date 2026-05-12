// MonthlyNewsletter — the cornerstone marketing email.
//
// Designed as a fixed structure with content slots:
//   · hero          — month name + one-line lead
//   · greeting      — short opening paragraph from the team
//   · events[]      — three to five event cards with title, date, summary, link
//   · story         — a single deeper read (kitchen, ceremony, person)
//   · tribeOnly     — a small block visible only to Tribe members (announce
//                     a perk, an early-access window, etc.)
//   · closing       — sign-off
//
// The admin newsletter form fills these slots, the template stays the same
// every month — so the brand voice and visual rhythm stay consistent.

import { Section } from "@react-email/components";
import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";

export default function MonthlyNewsletter({
  monthLabel = "May 2026",
  heroLead = "Long evenings, slow mornings, the sound of the kitchen warming up.",
  greeting = "We hope you're well. A handful of things stirring at Mama this month.",
  events = [],
  story = null, // { title, body, href, hrefLabel }
  tribeOnly = null, // { title, body, href, hrefLabel } — for Tribe broadcast only
  closing = "Until next month — come find us in the space, or just on the page.",
  signedOff = "The Mama team",
} = {}) {
  return (
    <BrandLayout
      preview={`${monthLabel} at Mama — ${heroLead.slice(0, 70)}`}
      eyebrow={`Mama · ${monthLabel}`}
    >
      <BrandHeading size="lg">{monthLabel} at Mama</BrandHeading>

      <BrandText
        style={{
          fontFamily: BRAND.fontStack.serif,
          fontStyle: "italic",
          fontSize: "17px",
          color: BRAND.TEXT_MUTED,
          marginBottom: "20px",
        }}
      >
        {heroLead}
      </BrandText>

      <BrandText>{greeting}</BrandText>

      {/* ── EVENTS THIS MONTH ──────────────────────────────────────
          Section label is centered; each event card stays left-aligned
          so the date / title / body / link read as a structured stack. */}
      {events.length > 0 ? (
        <Section style={{ margin: "26px 0 8px" }}>
          <BrandText
            tone="muted"
            align="center"
            style={{
              margin: "0 0 14px",
              fontSize: "11px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontWeight: 600,
              color: BRAND.TEXT_MUTED,
            }}
          >
            What's on
          </BrandText>

          {events.map((ev, i) => (
            <div
              key={`${ev.title}-${i}`}
              style={{
                padding: "16px 0",
                borderTop: i === 0 ? "none" : `1px solid ${BRAND.HAIRLINE}`,
              }}
            >
              <BrandText
                tone="muted"
                align="left"
                style={{
                  margin: "0 0 4px",
                  fontSize: "12px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: BRAND.ORANGE,
                  fontWeight: 600,
                }}
              >
                {ev.dateLabel}
              </BrandText>
              <BrandText
                align="left"
                style={{
                  margin: "0 0 6px",
                  fontFamily: BRAND.fontStack.serif,
                  fontStyle: "italic",
                  fontSize: "21px",
                  color: BRAND.TEXT_DARK,
                }}
              >
                {ev.title}
              </BrandText>
              <BrandText align="left" style={{ margin: "0 0 8px" }}>
                {ev.body}
              </BrandText>
              {ev.href ? (
                <a
                  href={ev.href}
                  style={{
                    color: BRAND.ORANGE,
                    fontSize: "13px",
                    fontWeight: 600,
                    textDecoration: "none",
                    letterSpacing: "0.02em",
                  }}
                >
                  {ev.hrefLabel || "Read more →"}
                </a>
              ) : null}
            </div>
          ))}
        </Section>
      ) : null}

      {/* ── DEEPER STORY ─────────────────────────────────────────── */}
      {story ? (
        <Section
          style={{
            margin: "28px 0 8px",
            padding: "22px 22px 20px",
            background: "#faf6f2",
            border: `1px solid ${BRAND.HAIRLINE}`,
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <BrandText
            tone="muted"
            align="center"
            style={{
              margin: "0 0 8px",
              fontSize: "11px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontWeight: 600,
              color: BRAND.TEXT_MUTED,
            }}
          >
            From the space
          </BrandText>
          <BrandHeading size="md" align="center">
            {story.title}
          </BrandHeading>
          <BrandText align="center" style={{ margin: "0 0 10px" }}>
            {story.body}
          </BrandText>
          {story.href ? (
            <a
              href={story.href}
              style={{
                color: BRAND.ORANGE,
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              {story.hrefLabel || "Continue reading →"}
            </a>
          ) : null}
        </Section>
      ) : null}

      {/* ── TRIBE-ONLY BLOCK ─────────────────────────────────────── */}
      {tribeOnly ? (
        <Section
          style={{
            margin: "28px 0 8px",
            padding: "20px 22px",
            background: "rgba(255,145,77,0.08)",
            border: `1px solid rgba(255,145,77,0.28)`,
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <BrandText
            tone="muted"
            align="center"
            style={{
              margin: "0 0 8px",
              fontSize: "11px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: BRAND.ORANGE,
            }}
          >
            For the Tribe
          </BrandText>
          <BrandHeading size="md" align="center">
            {tribeOnly.title}
          </BrandHeading>
          <BrandText align="center" style={{ margin: "0 0 12px" }}>
            {tribeOnly.body}
          </BrandText>
          {tribeOnly.href ? (
            <BrandButton href={tribeOnly.href} align="center">
              {tribeOnly.hrefLabel || "Open"}
            </BrandButton>
          ) : null}
        </Section>
      ) : null}

      <BrandText style={{ marginTop: "30px" }}>{closing}</BrandText>
      <BrandText
        style={{
          fontFamily: BRAND.fontStack.serif,
          fontStyle: "italic",
          fontSize: "18px",
          margin: "-8px 0 0",
        }}
      >
        {signedOff}
      </BrandText>
    </BrandLayout>
  );
}

MonthlyNewsletter.previewProps = {
  monthLabel: "May 2026",
  heroLead:
    "Long evenings, slow mornings, the sound of the kitchen warming up.",
  greeting:
    "May at Mama feels softer this year — there's been more space between things, more breath. Here's what's stirring.",
  events: [
    {
      dateLabel: "Sat 17 May · 19:30",
      title: "New Moon Cacao Ceremony",
      body: "An intimate evening with cacao, breath, and the slow descent into the dark of the lunar cycle. Limited to 22 seats.",
      href: "https://mama.is/events/new-moon-cacao-may-2026",
      hrefLabel: "Hold a seat →",
    },
    {
      dateLabel: "Wed 21 May · 18:00",
      title: "Sound Bath with Þórunn",
      body: "Crystal bowls, gongs, and a long lying-down hour. Bring a blanket and something warm to wear after.",
      href: "https://mama.is/events/sound-bath-may-2026",
      hrefLabel: "More about this evening →",
    },
    {
      dateLabel: "Sun 25 May · 11:00",
      title: "Sunday Long Lunch",
      body: "A communal table, four slow courses, no phones. The kitchen's spring menu in its most generous form.",
      href: "https://mama.is/events/long-lunch-may-2026",
      hrefLabel: "Reserve a seat →",
    },
  ],
  story: {
    title: "Why we changed the bread.",
    body:
      "After eighteen months of the same sourdough, we've moved to a slower fermented spelt loaf — partly for the digestion of it, partly because the grain is now grown 80 km from the door. A short note from the kitchen on what changed and why.",
    href: "https://mama.is/journal/the-bread",
    hrefLabel: "Read the full piece →",
  },
  tribeOnly: {
    title: "Your May virtual ceremony.",
    body:
      "Wednesday 28 May at 20:00 — a one-hour live cacao + breath session, just for the Tribe. The link will land in your inbox 48 hours before.",
    href: "https://mama.is/membership",
    hrefLabel: "Add to my calendar",
  },
  closing:
    "Until next month — come find us in the space, or just on the page.",
  signedOff: "The Mama team",
};

MonthlyNewsletter.subject = "May at Mama — long evenings, slow mornings";
