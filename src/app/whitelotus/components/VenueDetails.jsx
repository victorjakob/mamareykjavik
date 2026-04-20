"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/hooks/useLanguage";

function FadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function DetailRow({ label, value, delay }) {
  return (
    <FadeUp delay={delay}>
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 py-5 border-b border-white/[0.06]">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#6a5e52] shrink-0 sm:w-28">{label}</p>
        <p className="text-[15px] font-medium text-[#f0ebe3] leading-snug">{value}</p>
      </div>
    </FadeUp>
  );
}

export default function VenueDetails() {
  const { language } = useLanguage();

  const t = {
    en: {
      kicker: "At a glance",
      title: "Venue essentials",
      footer: "Need a specific setup? We'll tailor the room to your format.",
      photos: {
        main: "/whitelotus/whitelotus5.jpg",
        secondary: "/whitelotus/whitelotus8.jpg",
        tertiary: "/whitelotus/whitelotus10.jpg",
        altMain: "White Lotus — the room set up for an evening event",
        altSecondary: "Lighting and atmosphere inside White Lotus",
        altTertiary: "Stage and sound at White Lotus Reykjavík",
      },
      rows: [
        { label: "Capacity", value: "Standing 150 · Seated 80" },
        { label: "Location", value: "Bankastræti 2 · 101 Reykjavík" },
        { label: "Access", value: "Right next to Mama Reykjavík" },
        { label: "Hours", value: "Weekdays until 1am · Weekends until 3am" },
        { label: "Tech", value: "Pro sound · mics · mixer · projector · stage & disco lights" },
      ],
    },
    is: {
      kicker: "Kornhlaðan // White Lotus",
      title: "Helstu upplýsingar",
      footer: "Vantar þig ákveðna uppsetningu? Við aðlögum rýmið að þínum viðburði.",
      photos: {
        main: "/whitelotus/whitelotus5.jpg",
        secondary: "/whitelotus/whitelotus8.jpg",
        tertiary: "/whitelotus/whitelotus10.jpg",
        altMain: "White Lotus — salurinn undir kvöldviðburði",
        altSecondary: "Ljós og stemming í White Lotus",
        altTertiary: "Svið og hljóðkerfi í White Lotus Reykjavík",
      },
      rows: [
        { label: "Rými", value: "Standandi 150 · Sitjandi 80" },
        { label: "Staðsetning", value: "Bankastræti 2 · 101 Reykjavík" },
        { label: "Aðgangur", value: "Við hliðina á Mama Reykjavík" },
        { label: "Opið", value: "Virka daga til kl. 01:00 · Um helgar til kl. 03:00" },
        { label: "Tækni", value: "Hljóð · míkrafónn · mixer · skjávarpi · svið + diskóljós" },
      ],
    },
  }[language] ?? {
    kicker: "At a glance",
    title: "Venue essentials",
    footer: "",
    photos: {
      main: "/whitelotus/whitelotus5.jpg",
      secondary: "/whitelotus/whitelotus8.jpg",
      tertiary: "/whitelotus/whitelotus10.jpg",
      altMain: "White Lotus venue interior",
      altSecondary: "White Lotus — lighting and atmosphere",
      altTertiary: "White Lotus — stage area",
    },
    rows: [],
  };

  const photos = t.photos;

  return (
    <section data-navbar-theme="dark" className="w-full bg-[#110f0d] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {photos && (
            <div className="lg:col-span-5 order-2 lg:order-1 lg:sticky lg:top-28">
              <FadeUp>
                <div className="space-y-4">
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-[0_20px_50px_-24px_rgba(26,20,16,0.35)] ring-1 ring-[#1a1410]/[0.06]">
                    <Image
                      src={photos.main}
                      alt={photos.altMain}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 42vw"
                    />
                  </div>
                </div>
              </FadeUp>
            </div>
          )}

          <div className={`order-1 lg:order-2 ${photos ? "lg:col-span-7" : "lg:col-span-12 max-w-3xl mx-auto w-full"}`}>
            <FadeUp>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/40" />
                <span className="text-xs uppercase tracking-[0.4em] text-[#ff914d]">{t.kicker}</span>
                <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/40" />
              </div>
              <h2
                className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-10 lg:mb-12"
                style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
              >
                {t.title}
              </h2>
            </FadeUp>

            <div
              className="rounded-2xl overflow-hidden px-6 sm:px-8"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "none",
              }}
            >
              {t.rows.map((row, i) => (
                <DetailRow key={row.label} {...row} delay={i * 0.07} />
              ))}
              <FadeUp delay={t.rows.length * 0.07 + 0.1}>
                <p className="py-6 text-sm text-[#8a7e72] italic">{t.footer}</p>
              </FadeUp>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
