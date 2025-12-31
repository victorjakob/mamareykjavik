"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { useIsMobile } from "@/hooks/useIsMobile";

/** Lightweight inline icons (brandable) */
function PetalIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 3c-2.7 2.5-4.4 5.2-4.4 7.7 0 2.1 1.7 3.8 4.4 3.8s4.4-1.7 4.4-3.8C16.4 8.2 14.7 5.5 12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 14.5c-3.6 0-6.5 1.7-8 4.6 2.3 1.2 4.9 1.9 8 1.9s5.7-.7 8-1.9c-1.5-2.9-4.4-4.6-8-4.6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WaveIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M3 16c2.2 0 2.2-2 4.4-2s2.2 2 4.4 2 2.2-2 4.4-2 2.2 2 4.4 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3 10c2.2 0 2.2-2 4.4-2s2.2 2 4.4 2 2.2-2 4.4-2 2.2 2 4.4 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}

function SparkIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 2l1.6 6.1L20 10l-6.4 1.9L12 18l-1.6-6.1L4 10l6.4-1.9L12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M19.5 14.5l.7 2.5 2.3.7-2.3.7-.7 2.5-.7-2.5-2.3-.7 2.3-.7.7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        opacity="0.85"
      />
    </svg>
  );
}

const easeOut = [0.16, 1, 0.3, 1];

const headerIn = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: easeOut },
  },
};

const grid = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const gridMobile = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03, delayChildren: 0.02 } },
};

const cardIn = {
  hidden: { opacity: 0, y: 22, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.75, ease: easeOut },
  },
};

function LotusWatermark() {
  return (
    <svg width="520" height="520" viewBox="0 0 200 200" fill="none">
      <path
        d="M100 24c-24 22-38 46-38 67 0 20 15 33 38 33s38-13 38-33c0-21-14-45-38-67Z"
        fill="currentColor"
      />
      <path
        d="M100 124c-34 0-61 17-75 47 22 11 46 17 75 17s53-6 75-17c-14-30-41-47-75-47Z"
        fill="currentColor"
      />
    </svg>
  );
}

function FancyCard({ icon: Icon, title, line, index }) {
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const motionOK = !reduceMotion && !isMobile;

  return (
    <motion.div
      variants={cardIn}
      initial={isMobile ? "show" : undefined}
      animate={isMobile ? "show" : undefined}
      whileHover={motionOK ? { y: -8, scale: 1.01 } : undefined}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="group relative transform-gpu"
      suppressHydrationWarning
    >
      {/* Outer glow */}
      {motionOK && (
        <div className="absolute -inset-1 rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div
            className="absolute inset-0 rounded-[28px]"
            style={{
              background:
                "radial-gradient(900px 260px at 20% 15%, rgba(255,220,190,0.55) 0%, transparent 55%), radial-gradient(900px 260px at 80% 85%, rgba(190,210,255,0.40) 0%, transparent 60%)",
            }}
          />
        </div>
      )}

      {/* Gradient border shell */}
      <div className="relative rounded-[28px] p-[1px] bg-gradient-to-br from-black/10 via-black/5 to-black/10">
        {/* Glass card */}
        <div className="relative h-full overflow-hidden rounded-[27px] bg-white/85 md:bg-white/70 md:backdrop-blur-xl border border-white/40 shadow-md md:shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
          {/* Animated aurora film */}
          {motionOK && (
            <motion.div
              className="absolute inset-0 opacity-[0.30] pointer-events-none"
              animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
              transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              style={{
                background:
                  "radial-gradient(600px 240px at 20% 20%, rgba(255,190,150,0.22) 0%, transparent 60%), radial-gradient(650px 260px at 80% 70%, rgba(180,200,255,0.20) 0%, transparent 62%)",
                backgroundSize: "200% 200%",
              }}
            />
          )}

          {/* Lotus watermark */}
          <div className="absolute -right-16 -top-14 opacity-[0.045] rotate-[14deg] text-black pointer-events-none">
            <LotusWatermark />
          </div>

          {/* Top accent */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-black/20 to-transparent" />

          <div className="relative p-7 sm:p-8 md:p-9">
            <div className="flex items-start gap-4">
              {/* Icon chip */}
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-2xl border border-black/5 bg-white/80 md:backdrop-blur flex items-center justify-center shadow-sm">
                  <Icon className="w-6 h-6 text-gray-900/80" />
                </div>

                {/* Orbit dot */}
                {motionOK && (
                  <motion.span
                    className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-black/25"
                    animate={{
                      opacity: [0.25, 0.75, 0.25],
                      scale: [1, 1.6, 1],
                    }}
                    transition={{
                      duration: 2.8,
                      repeat: Infinity,
                      delay: index * 0.25,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </div>

              <div className="min-w-0">
                <div className="text-lg sm:text-xl font-semibold text-gray-900">
                  {title}
                </div>
                <p className="mt-2 text-base sm:text-lg text-gray-700/90 leading-relaxed">
                  {line}
                </p>

                {/* underline + shimmer */}
                <div className="mt-6 relative h-px w-full overflow-hidden bg-gradient-to-r from-transparent via-black/15 to-transparent">
                  {motionOK && (
                    <motion.div
                      className="absolute -inset-y-6 -left-1/2 w-1/3 rotate-12"
                      animate={{ x: ["-40%", "220%"] }}
                      transition={{
                        duration: 1.35,
                        repeat: Infinity,
                        repeatDelay: 3.5,
                        ease: "easeInOut",
                        delay: 0.6 + index * 0.15,
                      }}
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent)",
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* bottom accent */}
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        </div>
      </div>
    </motion.div>
  );
}

export default function VenueBenefitsLotusFancy() {
  const { language } = useLanguage();
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

  const translations = {
    en: {
      kicker: "Why it feels right",
      title: "Great atmosphere, easy to host.",
      cards: [
        {
          title: "Intimate",
          line: "Premium and welcoming — a space that feels warm and high-quality.",
        },
        {
          title: "Flexible",
          line: "Rearrange the room quickly to fit your event, without breaking the flow.",
        },
        {
          title: "Reliable",
          line: "Professional sound and lighting that’s easy to run and always ready.",
        },
      ],
    },
    is: {
      kicker: "Af hverju þetta virkar",
      title: "Gott andrúmsloft, auðvelt að halda viðburð.",
      cards: [
        {
          title: "Náið",
          line: "Vandað og notalegt — rými sem líður hlýtt, velkomið og hágæða.",
        },
        {
          title: "Sveigjanlegt",
          line: "Hægt að endurraða rýminu fljótt til að passa við viðburðinn, án þess að trufla flæðið.",
        },
        {
          title: "Áreiðanlegt",
          line: "Faglegt hljóð og ljós sem er auðvelt í notkun og tilbúið þegar þú þarft.",
        },
      ],
    },
  };

  const t = translations[language] || translations.en;

  const cards = [
    { icon: PetalIcon, ...t.cards[0] },
    { icon: WaveIcon, ...t.cards[1] },
    { icon: SparkIcon, ...t.cards[2] },
  ];

  return (
    <section className="relative py-14 sm:py-18 md:py-20 overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={isMobile ? "show" : "hidden"}
          animate={isMobile ? "show" : undefined}
          whileInView={isMobile ? undefined : "show"}
          viewport={{ once: true, amount: 0.35 }}
          variants={headerIn}
          className="text-center mb-9 sm:mb-12 transform-gpu"
          suppressHydrationWarning
        >
          <div className="text-[11px] sm:text-xs tracking-[0.22em] uppercase text-gray-500">
            {t.kicker}
          </div>

          <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">
            {t.title}
          </h2>

          {/* Decorative underline */}
          <div className="mt-4 mx-auto h-[2px] w-24 bg-gradient-to-r from-transparent via-black/20 to-transparent" />
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={isMobile ? gridMobile : grid}
          initial={isMobile ? "show" : "hidden"}
          animate={isMobile ? "show" : undefined}
          whileInView={isMobile ? undefined : "show"}
          viewport={{ once: true, amount: 0.35 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-7"
          suppressHydrationWarning
        >
          {cards.map((c, i) => (
            <FancyCard
              key={c.title}
              icon={c.icon}
              title={c.title}
              line={c.line}
              index={i}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
