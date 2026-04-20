"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/hooks/useLanguage";

export default function AtmosphereQuote() {
  const { language } = useLanguage();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const t = {
    en: {
      quote:
        "Not a hotel ballroom. Not a nightclub. Something between a gallery, a temple, and a living room — built for the kind of night you'll still be talking about.",
      source: "White Lotus · Bankastræti 2 · Reykjavík",
      pillars: [
        { label: "Intimate" },
        { label: "Soulful" },
        { label: "Conscious" },
        { label: "Alive" },
      ],
    },
    is: {
      quote:
        "Þetta er ekki hótelsal. Þetta er ekki nætturklúbbur. Eitthvað þar á milli — gallería, hof og hlýtt herbergi — byggt fyrir þær nætur sem maður talar um lengi.",
      source: "White Lotus · Bankastræti 2 · Reykjavík",
      pillars: [
        { label: "Náið" },
        { label: "Sálrænt" },
        { label: "Meðvitað" },
        { label: "Lifandi" },
      ],
    },
  }[language] ?? {
    quote: "",
    source: "",
    pillars: [],
  };

  return (
    <section
      ref={ref}
      data-navbar-theme="dark"
      className="w-full bg-[#1a1510] py-24 md:py-32 px-6 relative overflow-hidden"
    >
      {/* Subtle radial glow behind quote */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,145,77,0.06) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 text-center">

        {/* Opening ornament */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={inView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-3 mb-12"
        >
          <div className="flex-1 max-w-24 h-px bg-gradient-to-r from-transparent to-[#ff914d]/25" />
          <span className="text-[#ff914d]/50 text-lg">✦</span>
          <div className="flex-1 max-w-24 h-px bg-gradient-to-l from-transparent to-[#ff914d]/25" />
        </motion.div>

        {/* The quote */}
        <motion.blockquote
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.0, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <p
            className="font-cormorant font-extralight italic text-[#d4c9bc] leading-[1.45] mb-10"
            style={{ fontSize: "clamp(1.8rem, 4vw, 3.2rem)" }}
          >
            "{t.quote}"
          </p>
        </motion.blockquote>

        {/* Source line */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="text-[10px] uppercase tracking-[0.45em] text-[#9a8e82] mb-12"
        >
          — {t.source}
        </motion.p>

        {/* Four-word pillars */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap"
        >
          {t.pillars.map((p, i) => (
            <span key={i} className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs uppercase tracking-[0.35em] text-[#c0b4a8]">
                {p.label}
              </span>
              {i < t.pillars.length - 1 && (
                <span className="text-[#ff914d]/40 text-xs">·</span>
              )}
            </span>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
