"use client";

// Community membership section.
//
// Visual: three columns separated by hairlines, no cards, no ribbon sash,
// no pill "buy" buttons. Each tier has its name, a short tagline, a simple
// status, a quiet list of what's included, and a single underlined CTA
// link. A small ripple SVG sits above as the motif. Grounded copy, no
// monthly-fee framing — this is a community, not a subscription.

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/hooks/useLanguage";

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: "easeOut" },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
};

function FadeSection({ children, className = "", navbarTheme }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      data-navbar-theme={navbarTheme}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// -----------------------------------------------------------------------------
// Copy (EN / IS). Grounded — the original voice, without "monthly fee"
// framing. Features come back as a short list per tier.
// -----------------------------------------------------------------------------
const COPY = {
  en: {
    kicker: "The Mama community",
    title: "Be part of the community",
    intro:
      "Mama is more than a place to eat. It's a living community. Join us at whatever level feels right for you.",
    moreOnMembership: (count) => `+ ${count} more on the membership page`,
    tiers: [
      {
        id: "community",
        numeral: "I",
        name: "Community",
        tagline: "Stay connected",
        status: "0 ISK / always",
        features: [
          "Access to community forum / discussion board",
          "Weekly group newsletter (wellness tips, events, stories)",
          "1 free recorded meditation or guided experience per month",
          "Event calendar news (don't miss out on anything)",
          "Member directory (connect with others)",
          "10% discount on first paid event booking",
        ],
        cta: "Join free",
        href: "/membership",
        available: true,
      },
      {
        id: "tribe",
        numeral: "II",
        name: "Tribe",
        tagline: "Go deeper",
        status: "2,000 ISK / month",
        features: [
          "20% discount on all food & drinks at Mama",
          "Monthly live virtual ceremony (cacao, meditation, breathwork)",
          "Full library of recorded experiences + workshops",
          "Monthly credits toward in-person events (e.g. 1 free entry/month)",
          "Private subscriber-only chat / group",
          "Early access to event tickets (subscribers book first)",
          "Our monthly \"Letter from Mama\" — reflections, vision, inspiration",
        ],
        cta: "Join the tribe",
        href: "/membership",
        available: true,
      },
      {
        id: "patron",
        numeral: "III",
        name: "High Ticket",
        tagline: "Retreats & VIP",
        status: "20,000 – 200,000 ISK / one-time",
        features: [
          "Multi-day immersive retreats (Iceland-based)",
          "Iceland Eclipse Festival 2026 VIP packages",
          "Private ceremonies (cacao, sound healing, breathwork intensives)",
          "Corporate wellness transformation days",
          "\"Season at Mama\" quarterly membership (dining + unlimited events)",
          "Subscribers get priority booking + discounted pricing",
        ],
        cta: "Join High Ticket",
        href: "/membership",
        available: true,
      },
    ],
  },
  is: {
    kicker: "Mama samfélagið",
    title: "Vertu hluti af samfélaginu",
    intro:
      "Mama er meira en veitingastaður. Hún er lifandi samfélag. Komdu til okkur á þeim hátt sem hentar þér.",
    moreOnMembership: (count) => `+ ${count} atriði til viðbótar á aðildarsíðu`,
    tiers: [
      {
        id: "community",
        numeral: "I",
        name: "Samfélag",
        tagline: "Vertu með",
        status: "0 ISK / alltaf",
        features: [
          "Aðgangur að samfélagsvettvangi / spjallborði",
          "Vikulegt hópfréttabréf (vellíðan, viðburðir, sögur)",
          "1 ókeypis tekið upp hugleiðsla eða leiðsögn á mánuði",
          "Fréttir af viðburðadagatali (missir ekki af neinu)",
          "Meðlimaskrá (tengstu öðrum)",
          "10% afsláttur af fyrstu greiddu viðburðabókun",
        ],
        cta: "Skrá mig ókeypis",
        href: "/is/membership",
        available: true,
      },
      {
        id: "tribe",
        numeral: "II",
        name: "Ættbálkur",
        tagline: "Komdu nær",
        status: "2.000 ISK / mánuður",
        features: [
          "20% afsláttur af öllum mat og drykk á Mama",
          "Mánaðarleg bein útsending: athöfn (kakó, hugleiðsla, öndunarvinnu)",
          "Fullt safn af tekinni upp upplifun + vinnustofum",
          "Mánaðarlegar einingar að viðburðum á staðnum (t.d. 1 ókeypis aðgangur/mán.)",
          "Einkaspjall / hópur fyrir áskrifendur",
          "Forgangur að miðasölu (áskrifendur bóka fyrst)",
          "Mánaðarlegt „Bréf frá Mama“ — íhugun, framtíðarsýn, innblástur",
        ],
        cta: "Ganga í ættbálkinn",
        href: "/is/membership",
        available: true,
      },
      {
        id: "patron",
        numeral: "III",
        name: "High Ticket",
        tagline: "Frístundir og VIP",
        status: "20.000 – 200.000 ISK / ein greiðsla",
        features: [
          "Margdaga djúpupplifun í náttúru Íslands",
          "VIP pakkar fyrir Iceland Eclipse Festival 2026",
          "Einkaaðgerðir (kakó, hljóðlækningar, öndunarintensíf)",
          "Skrifstofuvellíðan og umbreytingardagar",
          "„Season at Mama“ ársfjórðungsaðild (matur + ótakmarkaðir viðburðir)",
          "Áskrifendur fá forgang í bókun + afslátt",
        ],
        cta: "Skrá í High Ticket",
        href: "/is/membership",
        available: true,
      },
    ],
  },
};

// Ambient ripple — sits behind the whole section as a watermark. Drawn in
// slowly once, then rests as a faint trace of three rings. Centered, huge,
// non-interactive. Doesn't take up layout space; it lives in the bg.
function RippleBackground() {
  return (
    <motion.div
      aria-hidden
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      <svg
        viewBox="0 0 120 120"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: "min(80vw, 780px)",
          height: "min(80vw, 780px)",
          maxHeight: "100%",
        }}
      >
        <motion.circle
          cx="60" cy="60" r="14" fill="none"
          stroke="#c9986a" strokeWidth="0.4" strokeLinecap="round"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: { pathLength: 1, opacity: 0.14, transition: { duration: 1.4, ease: [0.22, 1, 0.36, 1] } },
          }}
        />
        <motion.circle
          cx="60" cy="60" r="30" fill="none"
          stroke="#c9986a" strokeWidth="0.3" strokeLinecap="round"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: { pathLength: 1, opacity: 0.1, transition: { duration: 1.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] } },
          }}
        />
        <motion.circle
          cx="60" cy="60" r="48" fill="none"
          stroke="#c9986a" strokeWidth="0.25" strokeLinecap="round"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: { pathLength: 1, opacity: 0.07, transition: { duration: 2, delay: 0.5, ease: [0.22, 1, 0.36, 1] } },
          }}
        />
      </svg>
    </motion.div>
  );
}

// A single tier. No card, no border, no button pill. Quiet type, separated
// from its neighbours by a thin vertical rule on desktop.
function Tier({ tier, index, moreOnMembership }) {
  const previewLimit = 4;
  const previewFeatures = tier.features.slice(0, previewLimit);
  const hiddenCount = Math.max(0, tier.features.length - previewLimit);

  return (
    <motion.div
      variants={fadeUp}
      className="relative flex flex-col md:pl-8 pt-10 md:pt-0"
      style={{
        borderLeft: index > 0 ? "1px solid rgba(240,235,227,0.12)" : "none",
      }}
    >
      {/* Small bronze pebble above the numeral — only on the tier that's
          open now. No ribbon, no sash. */}
      {tier.available && (
        <span
          aria-hidden
          className="mb-3 inline-block rounded-full"
          style={{ width: 5, height: 5, background: "#c9986a" }}
        />
      )}

      <p
        className="italic leading-none mb-5"
        style={{
          fontFamily: "'Cormorant Garamond', ui-serif, Georgia, serif",
          fontSize: "clamp(2rem, 3.4vw, 2.6rem)",
          color: "#c9986a",
          fontWeight: 300,
          letterSpacing: "0.02em",
        }}
      >
        {tier.numeral}
      </p>

      <p
        className="uppercase mb-2"
        style={{
          color: "#c9986a",
          fontSize: "0.68rem",
          letterSpacing: "0.35em",
        }}
      >
        {tier.tagline}
      </p>

      <h3
        className="italic"
        style={{
          fontFamily: "'Cormorant Garamond', ui-serif, Georgia, serif",
          fontSize: "clamp(1.7rem, 2.6vw, 2.1rem)",
          color: "#f0ebe3",
          fontWeight: 300,
          lineHeight: 1.1,
          marginBottom: "0.75rem",
        }}
      >
        {tier.name}
      </h3>

      <p
        className="italic mb-7"
        style={{
          color: "#8a7e72",
          fontFamily: "'Cormorant Garamond', ui-serif, Georgia, serif",
          fontSize: "0.98rem",
        }}
      >
        {tier.status}
      </p>

      {/* Feature list — editorial: a narrow bronze em-dash prefix, no
          checkmarks, thin hairline separators between lines. */}
      <ul className="flex-1 mb-6 space-y-2">
        {previewFeatures.map((f) => (
          <li
            key={f}
            className="flex items-baseline gap-3 rounded-lg px-3 py-2.5"
            style={{ background: "rgba(240,235,227,0.04)" }}
          >
            <span
              aria-hidden
              className="shrink-0"
              style={{
                color: "rgba(201,152,106,0.8)",
                fontFamily: "'Cormorant Garamond', ui-serif, Georgia, serif",
                fontSize: "1rem",
                lineHeight: 1,
              }}
            >
              —
            </span>
            <span
              style={{
                color: "#d0c5b8",
                fontSize: "0.93rem",
                lineHeight: 1.7,
              }}
            >
              {f}
            </span>
          </li>
        ))}
      </ul>

      {hiddenCount > 0 ? (
        <Link
          href={tier.href}
          className="mb-7 inline-flex items-center text-[12px] tracking-[0.06em] text-[#bfa28a] hover:text-[#d8b699] transition-colors"
        >
          {moreOnMembership(hiddenCount)}
        </Link>
      ) : null}

      {/* CTA — a proper bordered button, not a pill. Available tier is
          solid bronze (clear primary); coming-soon tiers are outlined in
          bronze-on-dark, still obviously clickable. Italic serif text
          keeps the editorial voice. */}
      <Link
        href={tier.href}
        className="mt-auto group inline-flex items-center justify-center gap-2 transition-all duration-300"
        style={{
          alignSelf: "flex-start",
          padding: "0.85rem 1.5rem",
          borderRadius: "6px",
          fontFamily: "'Cormorant Garamond', ui-serif, Georgia, serif",
          fontStyle: "italic",
          fontSize: "1.05rem",
          letterSpacing: "0.02em",
          background: tier.available ? "#c9986a" : "transparent",
          color: tier.available ? "#2a1e15" : "#c9986a",
          border: tier.available
            ? "1px solid #c9986a"
            : "1px solid rgba(201,152,106,0.45)",
          boxShadow: tier.available
            ? "0 8px 24px -14px rgba(201,152,106,0.55)"
            : "none",
        }}
      >
        {tier.cta}
        <span
          aria-hidden
          className="transition-transform duration-300 group-hover:translate-x-1"
          style={{ fontStyle: "normal" }}
        >
          →
        </span>
      </Link>
    </motion.div>
  );
}

export default function CommunityMembershipSection() {
  const { language } = useLanguage();
  const t = COPY[language] ?? COPY.en;

  return (
    <FadeSection navbarTheme="dark" className="relative py-28 px-6 bg-[#291f17] overflow-hidden">
      <RippleBackground />
      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <div
            className="h-px"
            style={{
              width: 40,
              background: "linear-gradient(to right, transparent, rgba(201,152,106,0.45))",
            }}
          />
          <span
            className="text-[10px] uppercase"
            style={{ letterSpacing: "0.48em", color: "#c9986a" }}
          >
            {t.kicker}
          </span>
          <div
            className="h-px"
            style={{
              width: 40,
              background: "linear-gradient(to left, transparent, rgba(201,152,106,0.45))",
            }}
          />
        </motion.div>

        <motion.h2
          variants={fadeUp}
          className="font-cormorant font-light italic text-center max-w-3xl mx-auto"
          style={{
            fontSize: "clamp(2.2rem, 4.4vw, 3.4rem)",
            color: "#f0ebe3",
            lineHeight: 1.2,
            marginBottom: "1.25rem",
          }}
        >
          {t.title}
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="text-center max-w-xl mx-auto mb-20"
          style={{
            color: "#a09488",
            fontSize: "1.02rem",
            lineHeight: 1.75,
          }}
        >
          {t.intro}
        </motion.p>

        {/* Three columns separated by hairlines. Stack on mobile.
            The ripple lives in the section background, behind everything. */}
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 0 }}>
          {t.tiers.map((tier, i) => (
            <Tier
              key={tier.id}
              tier={tier}
              index={i}
              moreOnMembership={t.moreOnMembership}
            />
          ))}
        </div>
      </div>
    </FadeSection>
  );
}
