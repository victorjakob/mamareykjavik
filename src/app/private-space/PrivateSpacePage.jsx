"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { COPY, PHONE_DISPLAY, PHONE_TEL } from "./copy";
import {
  PRIVATE_SPACE_HERO,
  PRIVATE_SPACE_BANNER,
  PRIVATE_SPACE_GALLERY,
  PRIVATE_SPACE_VIDEO_MP4,
  PRIVATE_SPACE_VIDEO_WEBM,
  PRIVATE_SPACE_VIDEO_POSTER,
} from "@/lib/images";

// ── Helpers ──────────────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionEyebrow({ children }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-5">
      <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
      <span className="text-xs uppercase tracking-[0.35em] text-[#ff914d]">
        {children}
      </span>
      <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/50" />
    </div>
  );
}

function SectionTitle({ children, className = "" }) {
  return (
    <h2
      className={`font-cormorant font-light italic text-[#f0ebe3] leading-tight whitespace-pre-line ${className}`}
      style={{ fontSize: "clamp(2.2rem, 4.6vw, 4rem)" }}
    >
      {children}
    </h2>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ t, bookHref }) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduceMotion ? "0%" : "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      data-navbar-theme="dark"
      className="relative w-full h-[100svh] min-h-[640px] overflow-hidden bg-[#0d0b09]"
    >
      <motion.div className="absolute inset-0" style={{ y }}>
        <Image
          src={PRIVATE_SPACE_HERO}
          alt={t.eyebrow}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/40 to-black/85" />

      <motion.div
        style={{ opacity }}
        className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center"
      >
        <FadeUp>
          <div className="flex items-center justify-center gap-3 mb-7">
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/60" />
            <span className="text-xs uppercase tracking-[0.4em] text-[#ff914d]">
              {t.eyebrow}
            </span>
            <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/60" />
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <h1
            className="font-cormorant font-light italic text-[#f0ebe3] leading-[1.05]"
            style={{ fontSize: "clamp(3rem, 9vw, 7.5rem)" }}
          >
            {t.heroTitle}
            <br />
            {t.heroTitleSecond}
          </h1>
        </FadeUp>

        <FadeUp delay={0.25}>
          <p className="mt-7 max-w-xl text-[#d8cfc1] text-base md:text-lg leading-relaxed">
            {t.heroSubtitle}
          </p>
        </FadeUp>

        <FadeUp delay={0.4}>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center">
            <Link
              href={bookHref}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#ff914d] text-[#160f0a] text-xs tracking-[0.25em] uppercase font-semibold rounded-full hover:bg-[#ffa566] transition-all duration-200"
            >
              {t.heroCtaPrimary} →
            </Link>
            <a
              href="#availability"
              className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/25 text-[#f0ebe3] text-xs tracking-[0.25em] uppercase rounded-full hover:bg-white/10 hover:border-white/40 transition-all duration-200"
            >
              {t.heroCtaSecondary}
            </a>
          </div>
        </FadeUp>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-px h-10 bg-gradient-to-b from-white/0 to-white/40" />
          <div className="w-1 h-1 rounded-full bg-white/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ── Intro ────────────────────────────────────────────────────────────────────
function Intro({ t }) {
  return (
    <section
      data-navbar-theme="dark"
      className="relative bg-[#160f0a] border-y border-white/[0.06] py-28 px-6 text-center overflow-hidden"
    >
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden
      >
        <span
          className="font-cormorant font-light italic text-white/[0.025]"
          style={{
            fontSize: "clamp(8rem, 22vw, 18rem)",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          quiet
        </span>
      </div>

      <div className="relative max-w-3xl mx-auto">
        <FadeUp>
          <SectionEyebrow>{t.introEyebrow}</SectionEyebrow>
        </FadeUp>
        <FadeUp delay={0.1}>
          <SectionTitle className="mb-8">{t.introTitle}</SectionTitle>
        </FadeUp>
        <FadeUp delay={0.2}>
          <p className="max-w-2xl mx-auto text-[#a09488] text-base md:text-lg leading-relaxed">
            {t.introBody}
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

// ── For You (use cases) ──────────────────────────────────────────────────────
function ForYou({ t }) {
  return (
    <section data-navbar-theme="dark" className="bg-[#110f0d] py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <FadeUp className="text-center mb-14">
          <SectionEyebrow>{t.forYouEyebrow}</SectionEyebrow>
          <SectionTitle>{t.forYouTitle}</SectionTitle>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {t.forYouItems.map((item, i) => (
            <FadeUp key={item.title} delay={i * 0.05}>
              <div className="h-full p-7 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-[#ff914d]/30 transition-colors duration-300">
                <h3 className="font-cormorant text-2xl italic text-[#f0ebe3] mb-2">
                  {item.title}
                </h3>
                <p className="text-[#a09488] text-sm leading-relaxed">{item.body}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Video peek ───────────────────────────────────────────────────────────────
function VideoPeek({ t }) {
  return (
    <section
      data-navbar-theme="dark"
      className="relative bg-[#0d0b09] py-24 px-6 overflow-hidden"
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-16">
        <FadeUp className="flex-1 text-center md:text-left">
          <SectionEyebrow>
            <span className="block">{t.galleryEyebrow}</span>
          </SectionEyebrow>
          <SectionTitle className="!text-left mb-4">{t.videoCaption}</SectionTitle>
          <p className="text-[#a09488] text-base leading-relaxed max-w-md md:mx-0 mx-auto">
            {t.heroSubtitle}
          </p>
        </FadeUp>

        <FadeUp delay={0.15} className="flex-shrink-0">
          {/* Phone-frame */}
          <div className="relative w-[260px] md:w-[300px] aspect-[9/19.5] rounded-[2.5rem] border-[10px] border-[#1a1614] shadow-[0_30px_80px_-20px_rgba(255,145,77,0.25)] overflow-hidden bg-black">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-10" />
            <video
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              poster={PRIVATE_SPACE_VIDEO_POSTER}
            >
              <source src={PRIVATE_SPACE_VIDEO_WEBM} type="video/webm" />
              <source src={PRIVATE_SPACE_VIDEO_MP4} type="video/mp4" />
            </video>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ── Gallery ──────────────────────────────────────────────────────────────────
function Gallery({ t }) {
  const [lightbox, setLightbox] = useState(null);

  // Lock scroll while lightbox open
  useEffect(() => {
    if (lightbox) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [lightbox]);

  return (
    <section data-navbar-theme="dark" className="bg-[#160f0a] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <FadeUp className="text-center mb-12">
          <SectionEyebrow>{t.galleryEyebrow}</SectionEyebrow>
          <SectionTitle>{t.galleryTitle}</SectionTitle>
          <p className="mt-3 text-[#a09488] text-sm">{t.galleryHint}</p>
        </FadeUp>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {PRIVATE_SPACE_GALLERY.map((src, i) => (
            <FadeUp key={src} delay={i * 0.04}>
              <button
                type="button"
                onClick={() => setLightbox(i)}
                className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#0d0b09] group"
                aria-label={`Open photo ${i + 1}`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="bg-[#0d0b09] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </FadeUp>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 md:p-10"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
            className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-lg flex items-center justify-center"
            aria-label="Close"
          >
            ✕
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + PRIVATE_SPACE_GALLERY.length) % PRIVATE_SPACE_GALLERY.length); }}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % PRIVATE_SPACE_GALLERY.length); }}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center"
            aria-label="Next"
          >
            ›
          </button>
          <div
            className="relative w-full h-full max-w-4xl max-h-[88vh] bg-[#0d0b09]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={PRIVATE_SPACE_GALLERY[lightbox]}
              alt=""
              fill
              sizes="100vw"
              className="bg-[#0d0b09] object-contain"
              priority
            />
          </div>
        </div>
      )}
    </section>
  );
}

// ── Included ─────────────────────────────────────────────────────────────────
function Included({ t }) {
  return (
    <section data-navbar-theme="dark" className="bg-[#110f0d] py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-14">
          <SectionEyebrow>{t.includedEyebrow}</SectionEyebrow>
          <SectionTitle>{t.includedTitle}</SectionTitle>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {t.includedGroups.map((group, i) => (
            <FadeUp key={group.heading} delay={i * 0.1}>
              <div className="h-full p-7 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <h3 className="font-cormorant text-2xl italic text-[#ff914d] mb-5 pb-4 border-b border-white/10">
                  {group.heading}
                </h3>
                <ul className="space-y-3">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[#d8cfc1] text-sm leading-relaxed">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-[#ff914d]/60 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How it works ─────────────────────────────────────────────────────────────
function HowItWorks({ t }) {
  return (
    <section data-navbar-theme="dark" className="bg-[#0d0b09] py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-14">
          <SectionEyebrow>{t.howEyebrow}</SectionEyebrow>
          <SectionTitle>{t.howTitle}</SectionTitle>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
          {t.howSteps.map((step, i) => (
            <FadeUp key={step.num} delay={i * 0.1} className="relative">
              <div className="text-center md:text-left">
                <div className="font-cormorant text-7xl italic text-[#ff914d]/30 leading-none mb-3">
                  {step.num}
                </div>
                <h3 className="font-cormorant text-2xl italic text-[#f0ebe3] mb-2">
                  {step.title}
                </h3>
                <p className="text-[#a09488] text-sm leading-relaxed">{step.body}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing ──────────────────────────────────────────────────────────────────
function Pricing({ t, bookHref }) {
  return (
    <section data-navbar-theme="dark" className="bg-[#160f0a] py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <FadeUp className="text-center mb-14 max-w-2xl mx-auto">
          <SectionEyebrow>{t.pricingEyebrow}</SectionEyebrow>
          <SectionTitle className="mb-5">{t.pricingTitle}</SectionTitle>
          <p className="text-[#a09488] text-base leading-relaxed">{t.pricingSub}</p>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {t.pricingCards.map((card, i) => (
            <FadeUp key={card.title} delay={i * 0.05}>
              <div
                className={`h-full p-6 rounded-2xl border flex flex-col ${
                  card.featured
                    ? "bg-gradient-to-b from-[#ff914d]/15 to-transparent border-[#ff914d]/40"
                    : "bg-white/[0.03] border-white/[0.06]"
                }`}
              >
                <div className="text-[10px] uppercase tracking-[0.3em] text-[#ff914d] mb-3">
                  {card.tag}
                </div>
                <h3 className="font-cormorant text-3xl italic text-[#f0ebe3] mb-1">
                  {card.title}
                </h3>
                <p className="text-xs text-[#a09488] mb-5">{card.note}</p>
                <div className="mb-5">
                  <span className="font-cormorant text-3xl text-[#f0ebe3]">{card.price}</span>
                  <span className="text-xs text-[#a09488] ml-1">{card.per}</span>
                </div>
                <ul className="space-y-2 mb-5 flex-1">
                  {card.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs text-[#d8cfc1]">
                      <span className="mt-1 w-1 h-1 rounded-full bg-[#ff914d]/60 flex-shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={bookHref}
                  className={`text-center inline-block px-4 py-2.5 rounded-full text-[10px] tracking-[0.25em] uppercase transition ${
                    card.featured
                      ? "bg-[#ff914d] text-[#160f0a] hover:bg-[#ffa566]"
                      : "border border-white/20 text-[#f0ebe3] hover:bg-white/10"
                  }`}
                >
                  {t.heroCtaPrimary}
                </Link>
              </div>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={0.3}>
          <p className="text-center mt-10 text-xs text-[#a09488] max-w-2xl mx-auto">
            {t.pricingFootnote}
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

// ── Calendar teaser (full calendar lives on /private-space/book) ─────────────
function CalendarTeaser({ t, bookHref }) {
  return (
    <section
      id="availability"
      data-navbar-theme="dark"
      className="relative bg-[#0d0b09] py-28 px-6 overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        aria-hidden
      >
        <Image
          src={PRIVATE_SPACE_BANNER}
          alt=""
          fill
          className="object-cover blur-2xl scale-110"
        />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        <FadeUp>
          <SectionEyebrow>{t.calendarEyebrow}</SectionEyebrow>
          <SectionTitle className="mb-5">{t.calendarTitle}</SectionTitle>
        </FadeUp>
        <FadeUp delay={0.1}>
          <p className="text-[#a09488] text-base mb-10 max-w-xl mx-auto">{t.calendarSub}</p>
        </FadeUp>
        <FadeUp delay={0.2}>
          <Link
            href={bookHref}
            className="inline-flex items-center gap-2 px-9 py-4 bg-[#ff914d] text-[#160f0a] text-xs tracking-[0.25em] uppercase font-semibold rounded-full hover:bg-[#ffa566] transition-all duration-200"
          >
            {t.calendarCta}
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}

// ── Cancellation / house rules ───────────────────────────────────────────────
function HouseRules({ t }) {
  return (
    <section data-navbar-theme="dark" className="bg-[#110f0d] py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-14">
          <SectionEyebrow>{t.cancellationEyebrow}</SectionEyebrow>
          <SectionTitle>{t.cancellationTitle}</SectionTitle>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {t.cancellationItems.map((item, i) => (
            <FadeUp key={item.title} delay={i * 0.05}>
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <h3 className="font-cormorant text-xl italic text-[#ff914d] mb-2">
                  {item.title}
                </h3>
                <p className="text-[#d8cfc1] text-sm leading-relaxed">{item.body}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ──────────────────────────────────────────────────────────────────────
function FAQ({ t }) {
  const [open, setOpen] = useState(0);

  return (
    <section data-navbar-theme="dark" className="bg-[#0d0b09] py-28 px-6">
      <div className="max-w-3xl mx-auto">
        <FadeUp className="text-center mb-12">
          <SectionEyebrow>{t.faqEyebrow}</SectionEyebrow>
          <SectionTitle>{t.faqTitle}</SectionTitle>
        </FadeUp>

        <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {t.faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <FadeUp key={faq.q} delay={i * 0.04}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full text-left py-5 flex items-start justify-between gap-6 group"
                  aria-expanded={isOpen}
                >
                  <span className="font-cormorant text-xl md:text-2xl italic text-[#f0ebe3] group-hover:text-[#ff914d] transition-colors">
                    {faq.q}
                  </span>
                  <span
                    className={`text-[#ff914d] text-2xl flex-shrink-0 mt-1 transition-transform ${isOpen ? "rotate-45" : ""}`}
                    aria-hidden
                  >
                    +
                  </span>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: isOpen ? "auto" : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 pr-10 text-[#a09488] text-sm md:text-base leading-relaxed">
                    {faq.a}
                  </p>
                </motion.div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA({ t, bookHref }) {
  return (
    <section
      data-navbar-theme="dark"
      className="relative bg-[#160f0a] border-t border-white/[0.06] py-28 px-6 text-center overflow-hidden"
    >
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden
      >
        <span
          className="font-cormorant font-light italic text-white/[0.025]"
          style={{
            fontSize: "clamp(8rem, 22vw, 18rem)",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          held
        </span>
      </div>

      <div className="relative max-w-2xl mx-auto">
        <FadeUp>
          <SectionTitle className="mb-5">{t.finalCtaTitle}</SectionTitle>
        </FadeUp>
        <FadeUp delay={0.1}>
          <p className="text-[#a09488] text-base md:text-lg mb-10">{t.finalCtaBody}</p>
        </FadeUp>
        <FadeUp delay={0.2}>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center">
            <Link
              href={bookHref}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#ff914d] text-[#160f0a] text-xs tracking-[0.25em] uppercase font-semibold rounded-full hover:bg-[#ffa566] transition-all duration-200"
            >
              {t.finalCtaPrimary} →
            </Link>
            <a
              href={`tel:${PHONE_TEL}`}
              className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/25 text-[#f0ebe3] text-xs tracking-[0.25em] uppercase rounded-full hover:bg-white/10 hover:border-white/40 transition-all duration-200"
            >
              {t.finalCtaSecondary}
            </a>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function PrivateSpacePage({ locale = "en" }) {
  const t = COPY[locale] || COPY.en;
  const bookHref = locale === "is" ? "/is/private-space/book" : "/private-space/book";

  return (
    <main className="bg-[#0d0b09]">
      <Hero t={t} bookHref={bookHref} />
      <Intro t={t} />
      <ForYou t={t} />
      <VideoPeek t={t} />
      <Gallery t={t} />
      <Included t={t} />
      <HowItWorks t={t} />
      <Pricing t={t} bookHref={bookHref} />
      <CalendarTeaser t={t} bookHref={bookHref} />
      <HouseRules t={t} />
      <FAQ t={t} />
      <FinalCTA t={t} bookHref={bookHref} />
    </main>
  );
}
