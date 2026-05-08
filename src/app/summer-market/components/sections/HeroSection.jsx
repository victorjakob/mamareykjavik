"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { APPLY_FORM_URL, PHOTOS, useMarketCopy } from "../marketData";
import { CTAButton } from "../MarketUi";

const EASE = [0.22, 1, 0.36, 1];

export default function HeroSection() {
  const { language } = useLanguage();
  const t = useMarketCopy(language);
  const { hero } = t;
  const reduceMotion = useReducedMotion();

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  return (
    <section
      ref={heroRef}
      data-navbar-theme="dark"
      className="relative w-full min-h-[100svh] md:min-h-[86vh] lg:min-h-[80vh] flex items-center justify-center overflow-hidden bg-[#0e0b08]"
    >
      {/* Hero image with gentle Ken-Burns + parallax. Slightly dimmed on desktop. */}
      <motion.div
        className="absolute inset-0 opacity-100 md:opacity-80 lg:opacity-70"
        style={reduceMotion ? {} : { y: heroY }}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.8, ease: EASE }}
        >
          <Image
            src={PHOTOS.event1}
            alt="White Lotus Summer Market — guests gathering at Bankastræti 2"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </motion.div>

      {/* Mobile gradient (full strength) */}
      <div
        aria-hidden
        className="absolute inset-0 md:hidden"
        style={{
          background:
            "radial-gradient(ellipse 110% 88% at 50% 46%, rgba(0,0,0,0) 14%, rgba(0,0,0,0.50) 52%, rgba(14,11,8,0.92) 100%), linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.20) 38%, rgba(0,0,0,0.30) 66%, rgba(31,23,18,1) 100%)",
        }}
      />

      {/* Desktop gradient — pushes the image further back so the type leads */}
      <div
        aria-hidden
        className="absolute inset-0 hidden md:block"
        style={{
          background:
            "radial-gradient(ellipse 95% 80% at 50% 48%, rgba(14,11,8,0.20) 0%, rgba(14,11,8,0.55) 45%, rgba(14,11,8,0.92) 100%), linear-gradient(180deg, rgba(14,11,8,0.70) 0%, rgba(14,11,8,0.45) 38%, rgba(14,11,8,0.55) 66%, rgba(31,23,18,1) 100%)",
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-6 flex flex-col items-center max-w-3xl"
        style={reduceMotion ? {} : { opacity: heroOpacity }}
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="text-[10px] uppercase tracking-[0.45em] text-[#ff914d] mb-6"
        >
          {hero.pill}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.55, ease: EASE }}
          className="font-cormorant font-light italic text-white leading-[0.96] mb-8 drop-shadow-[0_2px_24px_rgba(0,0,0,0.6)]"
          style={{ fontSize: "clamp(3rem, 7.5vw, 5.25rem)" }}
        >
          <span className="block">{hero.titleA}</span>
          <motion.span
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.7, ease: EASE }}
            className="block"
          >
            {hero.titleB}
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.95 }}
          className="text-base sm:text-lg text-white/80 max-w-xl font-light leading-[1.8] mb-7"
        >
          {hero.lead}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="space-y-1 text-xs uppercase tracking-[0.3em] text-white/55 mb-10"
        >
          {hero.stats.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.3, ease: EASE }}
          className="flex flex-col sm:flex-row gap-3 items-center"
        >
          <CTAButton href={APPLY_FORM_URL}>{hero.ctaPrimary}</CTAButton>
          <CTAButton
            variant="secondary"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("open-contact-chatbox"))
            }
          >
            {hero.ctaSecondary}
          </CTAButton>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
      >
        <motion.div
          animate={reduceMotion ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-px h-9 bg-gradient-to-b from-white/0 to-white/30" />
          <div className="w-1 h-1 rounded-full bg-white/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}
