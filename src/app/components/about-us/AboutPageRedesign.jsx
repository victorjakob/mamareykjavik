"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import CommunityMembershipSection from "@/app/components/community/CommunityMembershipSection";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-70px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FadeIn({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 1.1, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ target, suffix = "", duration = 2.2 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const tick = (now) => {
      const elapsed = (now - start) / (duration * 1000);
      const progress = Math.min(elapsed, 1);
      // cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

// ─── Section 1: Hero ──────────────────────────────────────────────────────────

function Hero({ t }) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="relative w-full overflow-hidden h-screen min-h-[600px]"
      data-navbar-theme="dark"
    >
      <h1 className="sr-only">{t.seoTitle}</h1>

      {/* Ken Burns background */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1.0 }}
        transition={{ duration: 3.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Image
          src="https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto,w_1920/v1776182908/IMG_1418_1_l2w9a0.heic"
          alt="Mama Reykjavík interior — warm light, wooden tables, plants"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      {/* Layered gradients */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/60 via-black/25 to-[#1f1712]" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, #1f1712 0%, rgba(31,23,18,0.55) 28%, transparent 60%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6 pb-20 pt-28 text-center">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/55" />
          <span className="text-[11px] uppercase tracking-[0.45em] text-[#ff914d]">
            {t.kicker}
          </span>
          <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/55" />
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="font-cormorant font-light italic text-white leading-[1.15] mb-6 whitespace-pre-line max-w-3xl"
          style={{ fontSize: "clamp(2.6rem, 6vw, 5rem)" }}
        >
          {t.headline}
        </motion.h2>

        {/* Sub-tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-[11px] uppercase tracking-[0.45em] text-white/55 mb-14"
        >
          {t.tagline}
        </motion.p>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={reduceMotion ? {} : { y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/30 to-white/60" />
            <div className="w-1 h-1 rounded-full bg-white/60" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Section 2: Values Ticker ─────────────────────────────────────────────────

function ValuesTicker({ items }) {
  const reduceMotion = useReducedMotion();
  const doubled = [...items, ...items];

  return (
    <div
      className="w-full overflow-hidden bg-[#291f17] border-y border-white/[0.05] py-4"
      data-navbar-theme="dark"
    >
      <motion.div
        className="flex gap-0 whitespace-nowrap"
        animate={reduceMotion ? {} : { x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-4 px-5">
            <span className="text-[11px] uppercase tracking-[0.38em] text-[#a09488]">
              {item}
            </span>
            <span className="text-[#ff914d]/40 text-xs">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Section 3: Origin Story ──────────────────────────────────────────────────

function OriginStory({ t }) {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const yWatermark = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      ref={sectionRef}
      data-navbar-theme="dark"
      className="relative w-full bg-[#1f1712] pt-24 pb-20 overflow-hidden"
    >
      {/* Watermark number */}
      <motion.div
        className="pointer-events-none absolute -left-6 top-8 select-none font-cormorant font-bold italic text-white/[0.025]"
        style={{
          fontSize: "clamp(10rem, 22vw, 18rem)",
          lineHeight: 1,
          y: yWatermark,
        }}
      >
        01
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto w-full px-5 lg:px-10 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 md:items-center">
        {/* Image */}
        <FadeIn delay={0.05} className="order-2 md:order-1">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/Mama-Page%2FIMG_0943%20Large.jpeg?alt=media&token=d92fba85-d61f-4c4f-9be2-e9712a889c25"
              alt="Inside Mama Reykjavík — the beginning"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
            <p className="absolute bottom-4 left-5 text-[10px] uppercase tracking-[0.3em] text-white/40 italic">
              {t.imageCaption}
            </p>
          </div>
        </FadeIn>

        {/* Text */}
        <div className="order-1 md:order-2 space-y-6">
          <FadeUp>
            <div className="flex items-center gap-3 mb-7">
              <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/40" />
              <span className="text-xs uppercase tracking-[0.4em] text-[#ff914d]">
                {t.kicker}
              </span>
            </div>
            <h2
              className="font-cormorant font-light italic text-[#f0ebe3] leading-tight"
              style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)" }}
            >
              {t.title}
            </h2>
          </FadeUp>

          <FadeUp delay={0.1}>
            <p className="text-[#b8ab9e] text-base md:text-lg leading-[1.9]">
              {t.paragraph1}
            </p>
          </FadeUp>

          <FadeUp delay={0.17}>
            <p className="text-[#8a7e72] text-base leading-[1.9]">
              {t.paragraph2}
            </p>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ─── Section 4: Four Pillars ──────────────────────────────────────────────────

const PILLAR_IMAGES = {
  kitchen:
    "https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto/v1762326608/dahl_aumxpm.jpg",
  cacao:
    "https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto/v1752238745/ceremonial-cacao-cup_twp40h.jpg",
  events:
    "https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto,w_1600/v1776201171/Screenshot_2026-04-14_at_21.17.39_jig1ju.png",
  community:
    "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1766576002/wl-cover_yzyuhz.jpg",
};

function PillarCard({ pillar, index }) {
  const reduceMotion = useReducedMotion();

  // Static outer shell sets real layout height. Next/Image `fill` + all-absolute innards
  // on a motion-only wrapper can collapse to 0px on some mobile WebKit builds.
  return (
    <div className="relative z-0 w-full min-w-0 h-[320px] overflow-hidden rounded-2xl sm:h-auto sm:aspect-[3/4]">
      <motion.div
        className="group absolute inset-0"
        initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 16 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.05, margin: "0px 0px 140px 0px" }}
        transition={{
          duration: 0.85,
          ease: [0.22, 1, 0.36, 1],
          delay: index * 0.12,
        }}
      >
        {/* Photo */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={PILLAR_IMAGES[pillar.id]}
            alt={pillar.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]"
          />
        </div>

        {/* Vignette — stronger at bottom on mobile so body copy stays legible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/45 sm:via-black/25 to-transparent" />

        {/* Content — always visible */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-7">
          <h3
            className="font-cormorant font-light italic text-[#f0ebe3] leading-[1.15] mb-2 sm:mb-2.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
            style={{ fontSize: "clamp(1.45rem, 4.2vw, 2rem)" }}
          >
            {pillar.name}
          </h3>
          <p className="text-[13px] sm:text-[13px] text-white/85 sm:text-white/65 leading-relaxed max-w-none sm:max-w-[22ch] drop-shadow-[0_1px_6px_rgba(0,0,0,0.65)]">
            {pillar.desc}
          </p>
        </div>

        {/* Decorative accent */}
        <div className="absolute top-4 left-5 sm:top-5 sm:left-6 text-[#ff914d]/70 sm:text-[#ff914d]/40 text-[10px] sm:text-xs uppercase tracking-[0.35em] font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
          {pillar.category}
        </div>
      </motion.div>
    </div>
  );
}

function FourPillars({ t }) {
  return (
    <section
      data-navbar-theme="dark"
      className="w-full bg-[#291f17] py-24 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <FadeUp className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-7">
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/40" />
            <span className="text-xs uppercase tracking-[0.4em] text-[#ff914d]">
              {t.kicker}
            </span>
            <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/40" />
          </div>
          <h2
            className="font-cormorant font-light italic text-[#f0ebe3] leading-tight max-w-xl mx-auto"
            style={{ fontSize: "clamp(2.2rem, 4vw, 3.4rem)" }}
          >
            {t.title}
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4">
          {t.pillars.map((pillar, i) => (
            <PillarCard key={pillar.id} pillar={pillar} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 5: Food Photo Break ─────────────────────────────────────────────

function FoodBreak({ t }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1.0]);

  return (
    <section
      ref={ref}
      data-navbar-theme="dark"
      className="relative w-full h-[55vh] min-h-[380px] overflow-hidden"
    >
      <motion.div className="absolute inset-0" style={{ scale }}>
        <Image
          src="/mamaimg/mamadahl.jpg"
          alt="Mama Reykjavík — plant-based dahl, nourishing and world-inspired"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#291f17] via-black/30 to-[#1f1712]" />

      <div className="relative z-10 w-full h-full flex items-center justify-center px-6">
        <FadeUp className="text-center">
          <p
            className="font-cormorant font-light italic text-white/90 leading-snug"
            style={{ fontSize: "clamp(1.7rem, 4vw, 3rem)" }}
          >
            "{t.quote}"
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <div className="w-8 h-px bg-[#ff914d]/40" />
            <span className="text-[10px] uppercase tracking-[0.45em] text-[#ff914d]/70">
              {t.quoteAuthor}
            </span>
            <div className="w-8 h-px bg-[#ff914d]/40" />
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ─── Section 6: Community + Stats ─────────────────────────────────────────────

function CommunityStats({ t }) {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const yWatermark = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section
      ref={sectionRef}
      data-navbar-theme="dark"
      className="relative w-full bg-[#1f1712] py-24 overflow-hidden"
    >
      {/* Watermark */}
      <motion.div
        className="pointer-events-none absolute -right-6 top-4 select-none font-cormorant font-bold italic text-white/[0.025]"
        style={{
          fontSize: "clamp(10rem, 22vw, 18rem)",
          lineHeight: 1,
          y: yWatermark,
        }}
      >
        02
      </motion.div>

      <div className="relative z-10 max-w-6xl mx-auto px-5 lg:px-10 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
        {/* Image */}
        <FadeIn delay={0.05} className="order-2 md:order-1">
          <div
            className="relative aspect-[4/3] rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 12px 60px rgba(0,0,0,0.55)" }}
          >
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/Mama-Page%2Fwhitelotuscommunity.png?alt=media&token=5f9026e7-7a3e-4102-972c-2f23ee6771e0"
              alt="Mama Reykjavík community gathering"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
          </div>
        </FadeIn>

        {/* Text + Stats */}
        <div className="order-1 md:order-2 space-y-8">
          <div>
            <FadeUp>
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/40" />
                <span className="text-xs uppercase tracking-[0.4em] text-[#ff914d]">
                  {t.kicker}
                </span>
              </div>
              <h2
                className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-5"
                style={{ fontSize: "clamp(2.2rem, 4vw, 3.6rem)" }}
              >
                {t.title}
              </h2>
            </FadeUp>
            <FadeUp delay={0.1}>
              <p className="text-[#a09488] text-base md:text-lg leading-[1.9]">
                {t.paragraph1}
              </p>
            </FadeUp>
            <FadeUp delay={0.16}>
              <p className="text-[#8a7e72] text-base leading-[1.9] mt-4">
                {t.paragraph2}
              </p>
            </FadeUp>
          </div>

          {/* Stats grid */}
          <FadeUp delay={0.22}>
            <div className="grid grid-cols-2 gap-4 pt-2">
              {t.stats.map((stat, i) => (
                <div
                  key={i}
                  className="rounded-xl p-5"
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    className="font-cormorant font-light italic text-[#ff914d] leading-none mb-1"
                    style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)" }}
                  >
                    <CountUp target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-[#6a5e52]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ─── Section 7: White Lotus ───────────────────────────────────────────────────

function WhiteLotusSection({ t }) {
  return (
    <section
      data-navbar-theme="dark"
      className="w-full bg-[#291f17] py-24 px-6"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
        {/* Text */}
        <div className="space-y-6 order-1">
          <FadeUp>
            <div className="flex items-center gap-3 mb-7">
              <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/40" />
              <span className="text-xs uppercase tracking-[0.4em] text-[#ff914d]">
                {t.kicker}
              </span>
            </div>
            <h2
              className="font-cormorant font-light italic text-[#f0ebe3] leading-tight"
              style={{ fontSize: "clamp(2.2rem, 4vw, 3.6rem)" }}
            >
              {t.title}
            </h2>
          </FadeUp>

          <FadeUp delay={0.1}>
            <p className="text-[#a09488] text-base md:text-lg leading-[1.9]">
              {t.paragraph1}
            </p>
          </FadeUp>

          <FadeUp delay={0.16}>
            <p className="text-[#8a7e72] text-base leading-[1.9]">
              {t.paragraph2}
            </p>
          </FadeUp>

          <FadeUp delay={0.22}>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/events"
                className="inline-flex items-center justify-center px-7 py-3.5 bg-[#ff914d] text-black text-sm font-semibold tracking-wide rounded-full hover:bg-[#ff914d]/90 hover:scale-[1.02] transition-all duration-200"
              >
                {t.cta1}
              </Link>
              <Link
                href="/whitelotus"
                className="inline-flex items-center justify-center px-7 py-3.5 border border-white/22 text-[#f0ebe3] text-sm rounded-full hover:bg-white/[0.06] hover:border-white/40 transition-all duration-200"
              >
                {t.cta2}
              </Link>
            </div>
          </FadeUp>
        </div>

        {/* White Lotus logo */}
        <FadeIn
          delay={0.12}
          className="order-2 flex items-center justify-center py-6"
        >
          <motion.div
            animate={{ opacity: [0.82, 1, 0.82] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1766567396/wl-darkbg_lfm9ye.png"
              alt="White Lotus — spiritual and cultural event space"
              width={1161}
              height={1020}
              className="h-auto w-52 sm:w-68 md:w-80 drop-shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            />
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Section 8: Long-Term Vision ─────────────────────────────────────────────

function Vision({ t }) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      data-navbar-theme="dark"
      className="relative isolate w-full overflow-hidden bg-[#1f1712] pt-24 pb-32 px-6"
    >
      {/* Ambient orbs */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,145,77,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,145,77,0.035) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            maskImage:
              "radial-gradient(ellipse 70% 55% at 50% 50%, black 10%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 55% at 50% 50%, black 10%, transparent 75%)",
          }}
        />
        {/* Orb 1 — orange */}
        <motion.div
          className="absolute -top-[18%] -left-[12%] h-[min(90vw,540px)] w-[min(90vw,540px)] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, rgba(255,145,77,0.22), rgba(255,120,60,0.07) 50%, transparent 72%)",
          }}
          animate={
            reduceMotion
              ? {}
              : {
                  x: [0, 32, -16, 0],
                  y: [0, -24, 14, 0],
                  scale: [1, 1.1, 0.95, 1],
                }
          }
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Orb 2 — green */}
        <motion.div
          className="absolute -bottom-[22%] -right-[8%] h-[min(100vw,600px)] w-[min(100vw,600px)] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 60% 55%, rgba(69,83,24,0.3), rgba(150,191,107,0.1) 42%, transparent 68%)",
          }}
          animate={
            reduceMotion
              ? {}
              : {
                  x: [0, -40, 20, 0],
                  y: [0, 30, -18, 0],
                  scale: [1, 0.93, 1.07, 1],
                }
          }
          transition={{
            duration: 26,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.8,
          }}
        />
        {/* Orb 3 — centre pulse */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-[min(65vw,400px)] w-[min(65vw,400px)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[72px]"
          style={{
            background:
              "radial-gradient(circle, rgba(240,235,227,0.05) 0%, rgba(255,145,77,0.045) 38%, transparent 65%)",
          }}
          animate={
            reduceMotion
              ? {}
              : { opacity: [0.5, 0.85, 0.5], scale: [1, 1.05, 1] }
          }
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.9,
          }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#1f1712] via-transparent to-[#1f1712]"
          style={{ opacity: 0.88 }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <FadeUp>
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/40" />
            <span className="text-xs uppercase tracking-[0.4em] text-[#ff914d]">
              {t.kicker}
            </span>
            <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/40" />
          </div>
          <h2
            className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-8"
            style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)" }}
          >
            {t.title}
          </h2>
        </FadeUp>

        {/* Decorative divider */}
        <FadeUp delay={0.08}>
          <div className="flex flex-col items-center gap-0 mb-10">
            <div className="w-px h-8 bg-gradient-to-b from-transparent to-[#f0ebe3]/10" />
            <div className="w-px h-5 bg-gradient-to-b from-[#f0ebe3]/10 to-[#ff914d]/45" />
            <div className="w-1 h-1 rounded-full bg-[#ff914d]/55 mt-0.5" />
          </div>
        </FadeUp>

        <FadeUp delay={0.13}>
          <p className="text-[#a09488] text-lg md:text-xl leading-[1.9] mb-6">
            {t.paragraph1}
          </p>
        </FadeUp>
        <FadeUp delay={0.2}>
          <p className="text-[#8a7e72] text-base md:text-lg leading-[1.9]">
            {t.paragraph2}
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function AboutPageRedesign() {
  const { language } = useLanguage();

  const content = {
    en: {
      hero: {
        seoTitle: "About Mama Reykjavík",
        kicker: "Our story",
        headline: "We didn't open\na restaurant.\nWe built a home.",
        tagline: "Plant-based · Soulful · Global · Alive",
      },
      ticker: [
        "Plant-based kitchen",
        "Ceremonial cacao",
        "Conscious community",
        "World-inspired flavours",
        "Reykjavík since 2020",
        "Soulful gatherings",
        "Organic & sustainable",
        "Open hearts",
      ],
      story: {
        kicker: "Our story",
        title: "The Birth of Mama",
        paragraph1:
          "Mama was born from a simple but burning idea — a circle of friends seeking to create a space that embodied love, sustainability, and nourishment. What started as a humble desire to craft the best hummus in town quickly evolved into something far greater: a vegan haven, a communal space where wellness and creativity entwine.",
        paragraph2:
          "We found our home in one of Reykjavík's historical buildings, and with dedication and heart, we transformed it into a thriving hub for conscious living. Mama is not just about serving plant-based meals; it is about fostering an environment where culture, art, spirituality, and sustainability meet in harmony.",
        imageCaption: "Some of the faces behind Mama Reykjavik",
      },
      pillars: {
        kicker: "What we offer",
        title: "Four pillars of the Mama experience",
        pillars: [
          {
            id: "kitchen",
            category: "Nourish",
            name: "Plant-Based Kitchen",
            desc: "World-inspired stews, curries, naans, and seasonal bowls — made with love, grounded in nature.",
          },
          {
            id: "cacao",
            category: "Sacred",
            name: "Ceremonial Cacao",
            desc: "Heart-opening cacao ceremonies and rich drinking chocolate — a ritual central to how we gather.",
          },
          {
            id: "events",
            category: "Live",
            name: "Events & Ceremonies",
            desc: "Music nights, yoga, cacao ceremonies, art showcases, wellness workshops — a living cultural space.",
          },
          {
            id: "community",
            category: "Together",
            name: "Conscious Community",
            desc: "A collective of yogis, artists, healers, and dreamers. Everyone welcome. Everyone seen.",
          },
        ],
      },
      foodBreak: {
        quote: "Food is medicine. The table is sacred. Community is home.",
        quoteAuthor: "Mama Reykjavík",
      },
      community: {
        kicker: "The community",
        title: "The Power of Community",
        paragraph1:
          "At Mama, we believe that a true sense of belonging comes from being seen. We are a collective of yogis, artists, travellers, musicians, healers, and nature lovers — all working together to create a space where everyone is welcomed and valued.",
        paragraph2:
          "Our goal is to uplift, educate, and inspire — whether through a shared meal, a heartfelt conversation, or an experience you carry home long after it ends.",
        stats: [
          { value: 500, suffix: "+", label: "Community members" },
          { value: 6, suffix: "+", label: "Years operating" },
          { value: 100, suffix: "%", label: "Plant-based" },
          { value: 50, suffix: "+", label: "Events per year" },
        ],
      },
      whiteLotus: {
        kicker: "Newest chapter",
        title: "Enter White Lotus",
        paragraph1:
          "As Mama has grown, so has our vision. We expanded into a new space that houses both Mama and our newest endeavour — White Lotus. A cultural and spiritual hub for creativity, wellness, and transformation.",
        paragraph2:
          "This venue hosts yoga, dance, ceremonies, live performances, and conscious gatherings, deepening our mission to cultivate connection and uplift the collective spirit.",
        cta1: "Explore Events",
        cta2: "Hire the Venue",
      },
      vision: {
        kicker: "Long-term vision",
        title: "Roots That Reach Further",
        paragraph1:
          "Our journey doesn't stop with the walls of our restaurant. We envision a future where Mama becomes fully self-sustainable — with its own land for organic farming, powered by Iceland's abundant geothermal energy.",
        paragraph2:
          "By growing our own food, reducing waste, and minimising our environmental footprint, we aim to create a model of regenerative, conscious living — not just for Reykjavík, but as an example for communities worldwide.",
      },
    },
    is: {
      hero: {
        seoTitle: "Um Mama Reykjavík",
        kicker: "Sagan okkar",
        headline: "Við opnuðum ekki\nveitingastað.\nVið byggðum heimili.",
        tagline: "Plöntubaseað · Sálarríkt · Alþjóðlegt · Lifandi",
      },
      ticker: [
        "Plöntu'base'að eldhús",
        "Ceremonial kakó",
        "Meðvituð samvera",
        "Bragð heimsins",
        "Reykjavík síðan 2020",
        "Sálarríkar samkomur",
        "Lífrænt & sjálfbært",
        "Opin hjörtu",
      ],
      story: {
        kicker: "Saga okkar",
        title: "Fæðing Mama",
        paragraph1:
          "Mama fæddist úr einfaldri en sterkri hugmynd — hópur vina sem vildi skapa rými sem endurspeglar ást, sjálfbærni og næringu. Það sem byrjaði sem löngun til að gera besta hummus bæjarins þróaðist fljótt í eitthvað miklu stærra: vegan griðarstað og samfélagsrými þar sem vellíðan og sköpun mætast.",
        paragraph2:
          "Við fundum heimili okkar í einni af sögulegum byggingum Reykjavíkur og breyttum henni með hjarta og ásetning í lifandi samkomustað fyrir meðvitaðan lífsstíl. Mama snýst ekki bara um mat. Það snýst um að skapa rými þar sem menning, list, andleg næring og sjálfbærni fléttast saman.",
        imageCaption: "Sagan okkar",
      },
      pillars: {
        kicker: "Það sem við bjóðum upp á",
        title: "Fjórar stoðir Mama",
        pillars: [
          {
            id: "kitchen",
            category: "Næring",
            name: "Plöntubasað eldhús",
            desc: "Réttir innblásnir af heiminum — pottréttir, karrý, naan og skálar — eldað af ást og tengt náttúrunni.",
          },
          {
            id: "cacao",
            category: "Helgi",
            name: "Ceremonial kakó",
            desc: "Kakóathafnir — hjartað í því hvernig við komum saman, spilum tónlist og horfum inn á við.",
          },
          {
            id: "events",
            category: "Líf",
            name: "Viðburðir & Athafnir",
            desc: "Tónlistarkvöld, jóga, kakóathafnir, listsýningar og námskeið — lifandi menningarrými.",
          },
          {
            id: "community",
            category: "Saman",
            name: "Meðvitað samfélag",
            desc: "Samfélag listafólks, yogaiðkenda, heilara og skapandi fólks. Allir velkomnir. Allir séðir.",
          },
        ],
      },
      foodBreak: {
        quote: "Matur er læknandi. Borðið er heilagt. Samfélag er heimili.",
        quoteAuthor: "Mama Reykjavík",
      },
      community: {
        kicker: "Samfélagið",
        title: "Kraftur samfélags",
        paragraph1:
          "Hjá Mama trúum við að tilfinningin fyrir því að tilheyra komi frá djúpum stað inn á við.",
        paragraph2:
          "Við erum hópur listafólks, ferðalanga, tónlistarfólks, heilara og náttúrelskenda — að skapa rými þar sem allir eru velkomnir. Markmið okkar er að lyfta, fræða og veita innblástur — hvort sem það gerist yfir máltíð, í samtali eða upplifun sem þú tekur með þér heim.",
        stats: [
          { value: 500, suffix: "+", label: "Samfélagsmeðlimir" },
          { value: 6, suffix: "+", label: "Ár í rekstri" },
          { value: 100, suffix: "%", label: "Plöntubasað" },
          { value: 50, suffix: "+", label: "Viðburðir á ári" },
        ],
      },
      whiteLotus: {
        kicker: "Nýjasti kafli",
        title: "White Lotus",
        paragraph1:
          "Eftir því sem Mama hefur vaxið hafa tækifærin einnig stækkað. Við opnuðum nýtt rými þar sem Mama og nýjasta verkefnið okkar búa saman — White Lotus. Menningar- og andlegt rými fyrir sköpun, vellíðan og umbreytingu.",
        paragraph2:
          "Hér fara fram jóga, dans, athafnir, tónleikar og meðvitaðar samkomur — allt til að dýpka tengsl og styrkja samfélagið.",
        cta1: "Skoða viðburði",
        cta2: "Leigja salinn",
      },
      vision: {
        kicker: "Langtímasýn",
        title: "Rætur sem ná lengra",
        paragraph1:
          "Ferðin okkar stoppar ekki við veggi hússins.",
        paragraph2:
          "Við sjáum fyrir okkur Mama sem sjálfbært vistkerfi — með eigin ræktun, knúið af jarðhita Íslands. Með því að rækta okkar eigið hráefni, minnka sóun og lifa í takt við náttúruna viljum við skapa fyrirmynd að meðvituðu og endurnýjandi lífi — ekki bara fyrir Reykjavík, heldur fyrir heiminn.",
      },
    },
  };

  const t = content[language] ?? content.en;

  return (
    <>
      <Hero t={t.hero} />
      <ValuesTicker items={t.ticker} />
      <OriginStory t={t.story} />
      <FourPillars t={t.pillars} />
      <FoodBreak t={t.foodBreak} />
      <CommunityStats t={t.community} />
      <WhiteLotusSection t={t.whiteLotus} />
      <Vision t={t.vision} />
      <CommunityMembershipSection />
    </>
  );
}
