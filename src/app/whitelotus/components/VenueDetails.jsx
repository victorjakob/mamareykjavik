"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/hooks/useLanguage";
import { useIsMobile } from "@/hooks/useIsMobile";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
};

const listMobile = {
  hidden: {},
  show: { transition: { staggerChildren: 0.02, delayChildren: 0.01 } },
};

function DetailRow({ iconUrl, label, value, isMobile, reduceMotion }) {
  const motionOK = !(isMobile || reduceMotion);

  return (
    <motion.div
      variants={motionOK ? fadeUp : undefined}
      initial={motionOK ? undefined : { opacity: 1, y: 0 }}
      animate={motionOK ? undefined : undefined}
      whileInView={motionOK ? "show" : undefined}
      viewport={{ once: true, amount: 0.35 }}
      className="group flex items-center gap-4 py-5 sm:py-6 transform-gpu"
      suppressHydrationWarning
    >
      <div className="relative w-11 h-11 sm:w-12 sm:h-12 shrink-0">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-black/[0.04] to-transparent" />
        <div className="absolute inset-0 rounded-2xl border border-black/10" />
        <div className="relative w-full h-full rounded-2xl bg-white flex items-center justify-center">
          {iconUrl ? (
            <Image
              src={iconUrl}
              alt={label}
              width={48}
              height={48}
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain opacity-90 group-hover:opacity-100 transition-opacity"
            />
          ) : null}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-gray-500">
          {label}
        </div>

        <div className="mt-1.5 flex items-center gap-2 min-w-0">
          <div className="h-px flex-1 bg-gradient-to-r from-black/10 via-black/5 to-transparent" />
        </div>

        <div className="mt-2 text-[15px] sm:text-[17px] md:text-[18px] font-semibold text-gray-900 leading-snug">
          {value}
        </div>
      </div>
    </motion.div>
  );
}

function TopKicker({ kicker, title, note, isMobile, reduceMotion, mounted }) {
  return (
    <div className="text-center mb-9 sm:mb-10 md:mb-12">
      <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/85 md:bg-white/70 md:backdrop-blur px-3 py-1 shadow-sm">
        <span className="text-[11px] sm:text-xs tracking-[0.22em] uppercase text-gray-700">
          {kicker}
        </span>
      </div>

      <motion.h2
        initial={
          mounted && isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }
        }
        animate={mounted && isMobile ? { opacity: 1, y: 0 } : undefined}
        whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-gray-900"
        suppressHydrationWarning
      >
        {title}
      </motion.h2>

      <motion.p
        initial={
          mounted && isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }
        }
        animate={mounted && isMobile ? { opacity: 1, y: 0 } : undefined}
        whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{
          duration: 0.55,
          delay: 0.06,
          ease: "easeOut",
        }}
        className="mt-4 text-base sm:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto"
        suppressHydrationWarning
      >
        {note}
      </motion.p>
    </div>
  );
}

export default function VenueDetails() {
  const { language } = useLanguage();
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const translations = {
    en: {
      kicker: "At a glance",
      title: "Venue essentials",
      note: "A clean overview—so you can plan quickly and confidently.",
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
      // Optional footer line
      footer: "Need a specific setup? We’ll tailor the room to your format.",
    },
    is: {
      kicker: "Í hnotskurn",
      title: "Helstu upplýsingar",
      note: "Hnitmiðað yfirlit—til að skipuleggja fljótt og af öryggi.",
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
      footer:
        "Vantar þig ákveðna uppsetningu? Við aðlögum rýmið að þínum viðburði.",
    },
  };

  const t = translations[language] || translations.en;

  const rows = [
    {
      iconUrl:
        "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1767287410/capacity_yakfsr.png",
      label: t.capacityLabel,
      value: t.capacityValue,
    },
    {
      iconUrl:
        "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1767287411/location_ngvdut.png",
      label: t.locationLabel,
      value: t.locationValue,
    },
    {
      iconUrl:
        "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1767287410/access_aesr6h.png",
      label: t.accessLabel,
      value: t.accessValue,
    },
    {
      iconUrl:
        "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1767287410/hours_w5o4cz.png",
      label: t.hoursLabel,
      value: t.hoursValue,
    },
    {
      iconUrl:
        "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1767287411/tech_unkhfi.png",
      label: t.techLabel,
      value: t.techValue,
    },
  ];

  const motionOK = !(reduceMotion || isMobile);

  return (
    <section className="relative overflow-hidden pb-14 sm:pb-18 md:pb-20 pt-6 sm:pt-8">
      <div className="relative container mx-auto px-4 max-w-6xl">
        <TopKicker
          kicker={t.kicker}
          title={t.title}
          note={t.note}
          isMobile={isMobile}
          reduceMotion={reduceMotion}
          mounted={mounted}
        />

        <motion.div
          variants={motionOK ? list : undefined}
          initial={motionOK ? "hidden" : undefined}
          whileInView={motionOK ? "show" : undefined}
          animate={!motionOK ? undefined : undefined}
          viewport={{ once: true, amount: 0.35 }}
          className="mx-auto transform-gpu"
          suppressHydrationWarning
        >
          <div className="relative overflow-hidden rounded-[30px] border border-black/10 bg-white/70 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
            {/* Hairline accents */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />

            {/* Inner glow */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.6]">
              <div className="absolute inset-0 bg-[radial-gradient(900px_240px_at_50%_0%,rgba(0,0,0,0.06),transparent_60%)]" />
            </div>

            <div className="relative p-6 sm:p-8 md:p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                {/* Left column */}
                <div className="relative">
                  <DetailRow
                    {...rows[0]}
                    isMobile={isMobile}
                    reduceMotion={reduceMotion}
                  />
                  <div className="h-px bg-black/5" />
                  <DetailRow
                    {...rows[1]}
                    isMobile={isMobile}
                    reduceMotion={reduceMotion}
                  />
                  <div className="h-px bg-black/5" />
                  <DetailRow
                    {...rows[2]}
                    isMobile={isMobile}
                    reduceMotion={reduceMotion}
                  />
                </div>

                {/* Right column */}
                <div className="relative md:border-l md:border-black/5 md:pl-12">
                  <DetailRow
                    {...rows[3]}
                    isMobile={isMobile}
                    reduceMotion={reduceMotion}
                  />
                  <div className="h-px bg-black/5" />
                  <DetailRow
                    {...rows[4]}
                    isMobile={isMobile}
                    reduceMotion={reduceMotion}
                  />

                  {/* Subtle footer note */}
                  <div className="mt-6 md:mt-8">
                    <div className="rounded-2xl border border-black/10 bg-white/60 backdrop-blur px-4 py-3">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        <span className="font-semibold text-gray-900">
                          {t.footer}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Corner vignette */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-black/[0.05] blur-3xl" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
