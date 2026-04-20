"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/hooks/useLanguage";

function FadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function AboutTheSpace() {
  const { language } = useLanguage();

  const t = {
    en: {
      kicker: "White Lotus · Bankastræti 2",
      title: "Right next to Mama.\nA whole world inside.",
      body: "White Lotus sits beside Mama Reykjavík — the same soul, a different room. It's warm enough to feel personal, and built well enough to hold 150 people dancing. The acoustics are rich, the lighting is cinematic, and the room adapts: a cacao ceremony at noon, live music at midnight, a yoga morning the day after. It's not a hotel ballroom. It's not a nightclub. It's something more alive than both.",
      pull: "The same love and attention that runs through Mama runs through every event we hold here.",
      stats: [
        { number: "150", label: "Standing guests" },
        { number: "80", label: "Seated guests" },
        { number: "101", label: "Bankastræti · City centre" },
      ],
    },
    is: {
      kicker: "White Lotus · Bankastræti 2",
      title: "Rétt við hliðina á Mömmu.\nHeill heimur inni.",
      body: "White Lotus er rétt við hlið Mama Reykjavík — sama sálin, annað herbergi. Hlýtt og persónulegt, en byggt til að halda 150 manns á dansgólf. Hljóðvistin er ríkuleg, ljósin kvikmyndaleg og rýmið aðlagast: kakóathöfn á hádegi, lifandi tónlist um miðnætti, jóga-morgunn daginn eftir. Þetta er ekki hótelsal. Þetta er ekki nættuklúbbur. Þetta er eitthvað meira lifandi en hvort tveggja.",
      pull: "Sama meðvitund sem ríkir í eldhúsi Mömmu ríkir í hverjum viðburði sem við höldum hér.",
      stats: [
        { number: "150", label: "Standandi gestir" },
        { number: "80", label: "Sitjandi gestir" },
        { number: "101", label: "Bankastræti · Miðborg" },
      ],
    },
  }[language] ?? {
    kicker: "White Lotus · Bankastræti 2",
    title: "One floor above Mama.\nA whole world inside.",
    body: "",
    pull: "",
    stats: [],
  };

  return (
    <section
      data-navbar-theme="dark"
      className="relative isolate w-full overflow-hidden bg-[#0e0b08] py-24 md:py-32 px-6"
    >
      {/* Bottom drift toward next dark band */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-b from-transparent to-[#110f0d]/40"
        aria-hidden
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Eyebrow */}
        <FadeUp>
          <div className="flex items-center gap-3 mb-14">
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/32" />
            <span className="text-xs uppercase tracking-[0.4em] text-[#ff914d]">
              {t.kicker}
            </span>
          </div>
        </FadeUp>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 lg:gap-20 items-start">
          {/* Left — headline + body */}
          <div>
            <FadeUp delay={0.05}>
              <h2
                className="font-cormorant font-light italic text-[#f0ebe3] leading-[1.18] mb-6 whitespace-pre-line"
                style={{ fontSize: "clamp(2.4rem, 5vw, 4.2rem)" }}
              >
                {t.title}
              </h2>
            </FadeUp>

            {/* Horizontal side rule — starts at the margin, fades out across */}
            <FadeUp delay={0.08}>
              <div className="mb-10 flex items-center gap-3" aria-hidden>
                <div className="h-[3px] w-[3px] shrink-0 rotate-45 rounded-[1px] border border-[#ff914d]/40 bg-[#0e0b08]/90 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]" />
                <div className="relative min-w-0 flex-1 max-w-md sm:max-w-xl">
                  <div className="pointer-events-none absolute -top-1 left-0 h-2 w-24 max-w-[40%] rounded-full bg-gradient-to-r from-[#ff914d]/15 to-transparent blur-md" />
                  <div
                    className="relative h-px w-full rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(255,255,255,0.18) 0%, rgba(255,145,77,0.30) 32%, rgba(255,145,77,0.10) 68%, rgba(14,11,8,0) 100%)",
                    }}
                  />
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <p className="text-[#8a7e72] text-lg md:text-xl leading-[1.85] mb-8">
                {t.body}
              </p>
            </FadeUp>

            <FadeUp delay={0.15}>
              <p className="text-[#6a5e52] text-sm italic leading-relaxed">
                {t.pull}
              </p>
            </FadeUp>
          </div>

          {/* Right — stat pillars */}
          <FadeUp delay={0.2} className="lg:pt-6">
            <div className="flex flex-row lg:flex-col gap-4">
              {t.stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.65,
                    delay: 0.28 + i * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex-1 lg:flex-none rounded-2xl px-5 py-5 lg:px-7 lg:py-6"
                  style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <p
                    className="font-cormorant font-light text-[#f0ebe3] leading-none mb-2"
                    style={{ fontSize: "clamp(1.9rem, 4vw, 2.9rem)" }}
                  >
                    {stat.number}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-[#8a7e72]">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
