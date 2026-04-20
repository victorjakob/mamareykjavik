"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

export default function HeroAbout() {
  const { language } = useLanguage();

  const t = {
    en: {
      eyebrow: "Our story",
      headline: "A conscious community\nin the heart of Reykjavík.",
      tagline: "Plant-based · Soulful · Global · Alive",
      cta1: "Eat with us",
      cta2: "See Events",
    },
    is: {
      eyebrow: "Saga okkar",
      headline: "Meðvitað samfélag\ní hjarta Reykjavíkur.",
      tagline: "Jurtafæði · Sálrænt · Alþjóðlegt · Lifandi",
      cta1: "Borðaðu með okkur",
      cta2: "Sjá viðburði",
    },
  }[language] ?? {
    eyebrow: "Our story",
    headline: "A conscious community\nin the heart of Reykjavík.",
    tagline: "Plant-based · Soulful · Global · Alive",
    cta1: "Eat with us",
    cta2: "See Events",
  };

  return (
    <section className="relative w-full overflow-hidden h-[68vh] min-h-[480px]" data-navbar-theme="dark">
      <h1 className="sr-only">About Mama Reykjavík</h1>

      {/* Background — slow Ken Burns */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.07 }}
        animate={{ scale: 1.0 }}
        transition={{ duration: 2.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Image
          src="https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto,w_1920/v1776182908/IMG_1418_1_l2w9a0.heic"
          alt="Mama Reykjavík — conscious community restaurant"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      {/* Gradient overlay — fades into story section bg #0e0b08 */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/55 via-black/30 to-[#0e0b08]" />
      <div
        className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0e0b08] via-transparent to-transparent"
        style={{
          background:
            "linear-gradient(to top, #0e0b08 0%, rgba(14,11,8,0.5) 30%, transparent 60%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6 pb-16 pt-24 text-center">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3 mb-7"
        >
          <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/55" />
          <span className="text-[11px] uppercase tracking-[0.4em] text-[#ff914d]">{t.eyebrow}</span>
          <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/55" />
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="font-cormorant font-light italic text-white leading-[1.2] mb-6 whitespace-pre-line"
          style={{ fontSize: "clamp(2.2rem, 5vw, 4.4rem)" }}
        >
          {t.headline}
        </motion.h2>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-[11px] uppercase tracking-[0.42em] text-white/65 mb-11"
        >
          {t.tagline}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row gap-3 items-center"
        >
          <Link
            href="/restaurant"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-[#ff914d] text-black text-sm font-semibold tracking-wide rounded-full hover:bg-[#ff914d]/90 hover:scale-[1.03] transition-all duration-200 shadow-[0_0_30px_rgba(255,145,77,0.28)]"
          >
            {t.cta1}
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center justify-center px-8 py-3.5 border border-white/28 text-white text-sm font-medium tracking-wide rounded-full hover:bg-white/10 hover:border-white/50 transition-all duration-200 backdrop-blur-sm"
          >
            {t.cta2}
          </Link>
        </motion.div>
      </div>

    </section>
  );
}
