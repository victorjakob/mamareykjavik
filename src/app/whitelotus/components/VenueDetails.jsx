"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  UserGroupIcon,
  MapPinIcon,
  ArrowUpRightIcon,
  ClockIcon,
  SpeakerWaveIcon,
} from "@heroicons/react/24/outline";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const listMobile = {
  hidden: {},
  show: { transition: { staggerChildren: 0.02, delayChildren: 0.01 } },
};

function DetailRow({ icon: Icon, label, value, isMobile }) {
  return (
    <motion.div
      variants={fadeUp}
      initial={isMobile ? "show" : undefined}
      animate={isMobile ? "show" : undefined}
      className="flex items-start gap-4 py-4 sm:py-5 transform-gpu"
      suppressHydrationWarning
    >
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border border-black/5 bg-white/85 md:bg-white/70 md:backdrop-blur flex items-center justify-center shadow-sm shrink-0">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900/80" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-gray-500">
          {label}
        </div>
        <div className="mt-1.5 text-base sm:text-lg font-semibold text-gray-900 leading-snug">
          {value}
        </div>
      </div>
    </motion.div>
  );
}

export default function VenueDetails() {
  const { language } = useLanguage();
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

  const translations = {
    en: {
      kicker: "At a glance",
      title: "Venue essentials",
      note: "Everything you need to plan quickly.",
      capacityLabel: "Capacity",
      capacityValue: "Standing 150 · Seated 80",
      locationLabel: "Location",
      locationValue: "Bankastræti 2 · 2nd floor",
      accessLabel: "Access",
      accessValue: "Next to Mama Reykjavík",
      hoursLabel: "Hours",
      hoursValue: "Weekdays until 1am · Weekends until 3am",
      techLabel: "Tech",
      techValue: "Pro sound · mics · mixer · projector · stage & disco lights",
    },
    is: {
      kicker: "Í hnotskurn",
      title: "Helstu upplýsingar",
      note: "Það sem þú þarft til að skipuleggja fljótt.",
      capacityLabel: "Rými",
      capacityValue: "Standandi 150 · Sitjandi 80",
      locationLabel: "Staðsetning",
      locationValue: "Bankastræti 2 · 2. hæð",
      accessLabel: "Aðgangur",
      accessValue: "Við hliðina á Mama Reykjavík",
      hoursLabel: "Tímar",
      hoursValue: "Virka daga til kl. 01:00 · Um helgar til kl. 03:00",
      techLabel: "Tækni",
      techValue: "Hljóð · hljóðnemar · blandari · skjávarpi · svið + diskóljós",
    },
  };

  const t = translations[language] || translations.en;

  const rows = [
    { icon: UserGroupIcon, label: t.capacityLabel, value: t.capacityValue },
    { icon: MapPinIcon, label: t.locationLabel, value: t.locationValue },
    { icon: ArrowUpRightIcon, label: t.accessLabel, value: t.accessValue },
    { icon: ClockIcon, label: t.hoursLabel, value: t.hoursValue },
    { icon: SpeakerWaveIcon, label: t.techLabel, value: t.techValue },
  ];

  return (
    <section className="pb-14 sm:pb-18 md:pb-20 pt-3 relative overflow-hidden">
      {/* Subtle background texture (quiet, not “busy”) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.55]"
        style={{
          background:
            "radial-gradient(900px 420px at 20% 20%, rgba(0,0,0,0.04) 0%, transparent 55%), radial-gradient(800px 420px at 85% 55%, rgba(0,0,0,0.03) 0%, transparent 55%)",
        }}
      />

      <div className="relative container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8 sm:mb-10">
          <div className="text-[11px] sm:text-xs tracking-[0.22em] uppercase text-gray-500">
            {t.kicker}
          </div>
          <motion.h2
            initial={
              isMobile || reduceMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 14 }
            }
            animate={
              isMobile || reduceMotion ? { opacity: 1, y: 0 } : undefined
            }
            whileInView={
              isMobile || reduceMotion ? undefined : { opacity: 1, y: 0 }
            }
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="mt-3 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-gray-900"
            suppressHydrationWarning
          >
            {t.title}
          </motion.h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">{t.note}</p>
        </div>

        {/* One elegant “spec sheet” instead of many cards */}
        <motion.div
          variants={isMobile ? listMobile : list}
          initial={isMobile ? "show" : "hidden"}
          animate={isMobile ? "show" : undefined}
          whileInView={isMobile ? undefined : "show"}
          viewport={{ once: true, amount: 0.35 }}
          className="mx-auto transform-gpu"
          suppressHydrationWarning
        >
          <div className="relative overflow-hidden rounded-[28px] border border-black/5 bg-white/85 md:bg-white/70 md:backdrop-blur-xl shadow-sm">
            {/* Top accent line */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-black/15 to-transparent" />

            <div className="p-6 sm:p-8 md:p-10">
              {/* Mobile-first: single column, desktop: 2 columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
                {/* Left */}
                <div>
                  <DetailRow {...rows[0]} isMobile={isMobile} />
                  <div className="h-px bg-black/5" />
                  <DetailRow {...rows[1]} isMobile={isMobile} />
                  <div className="h-px bg-black/5" />
                  <DetailRow {...rows[2]} isMobile={isMobile} />
                </div>

                {/* Right */}
                <div className="md:border-l md:border-black/5 md:pl-10 mt-0">
                  <DetailRow {...rows[3]} isMobile={isMobile} />
                  <div className="h-px bg-black/5" />
                  <DetailRow {...rows[4]} isMobile={isMobile} />
                </div>
              </div>
            </div>

            {/* Bottom accent line */}
            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-black/10 to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
