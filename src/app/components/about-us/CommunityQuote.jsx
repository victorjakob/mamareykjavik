"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/hooks/useLanguage";

export default function CommunityQuote() {
  const { language } = useLanguage();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const t = {
    en: {
      quote: "We are yogis, artists, travelers, musicians, healers, and nature lovers. We left a light on for you.",
      source: "Mama Reykjavík · Since 2018",
    },
    is: {
      quote: "Við erum jógar, listamenn, ferðalagar, tónlistarmenn, læknar og náttúruunendur. Við léttum ljósi fyrir þig.",
      source: "Mama Reykjavík · Frá 2018",
    },
  }[language] ?? { quote: "", source: "" };

  return (
    <section
      ref={ref}
      data-navbar-theme="dark"
      className="w-full bg-[#1a1208] py-24 md:py-32 px-6 relative overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[360px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,145,77,0.05) 0%, transparent 65%)",
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 text-center">

        {/* Ornament */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={inView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-3 mb-12"
        >
          <div className="flex-1 max-w-20 h-px bg-gradient-to-r from-transparent to-[#ff914d]/25" />
          <span className="text-[#ff914d]/45 text-base">◎</span>
          <div className="flex-1 max-w-20 h-px bg-gradient-to-l from-transparent to-[#ff914d]/25" />
        </motion.div>

        {/* Quote */}
        <motion.blockquote
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.0, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <p
            className="font-cormorant font-extralight italic text-[#d4c9bc] leading-[1.5] mb-9"
            style={{ fontSize: "clamp(1.8rem, 4vw, 3.4rem)" }}
          >
            "{t.quote}"
          </p>
        </motion.blockquote>

        {/* Source */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-[10px] uppercase tracking-[0.45em] text-[#6a5e54]"
        >
          — {t.source}
        </motion.p>

      </div>
    </section>
  );
}
