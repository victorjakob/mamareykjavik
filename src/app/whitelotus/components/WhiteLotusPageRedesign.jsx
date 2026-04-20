"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import ImageGallery from "@/app/whitelotus/components/ImageGallery";

// --- Helpers ------------------------------------------------------------------

function FadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-70px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }} className={className}>
      {children}
    </motion.div>
  );
}

function FadeIn({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 1.1, ease: "easeOut", delay }} className={className}>
      {children}
    </motion.div>
  );
}

// --- Section 1: Hero ----------------------------------------------------------

function Hero({ t, rentHref, eventsHref }) {
  const reduceMotion = useReducedMotion();
  return (
    <section className="relative w-full overflow-hidden min-h-screen" data-navbar-theme="dark">
      <h1 className="sr-only">{t.seoTitle || "White Lotus — Intimate Event Venue in Reykjavik"}</h1>
      <motion.div className="absolute inset-0" initial={{ scale: 1.07 }} animate={{ scale: 1.0 }} transition={{ duration: 3.0, ease: [0.25, 0.46, 0.45, 0.94] }}>
        <Image src="https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto,w_1920/v1766576002/wl-cover_yzyuhz.jpg" alt="White Lotus intimate event venue Reykjavik" fill priority sizes="100vw" className="object-cover" />
      </motion.div>
      <div className="absolute inset-0 pointer-events-none" aria-hidden style={{ background: ["radial-gradient(ellipse 115% 88% at 50% 46%, rgba(0,0,0,0) 18%, rgba(0,0,0,0.50) 52%, rgba(10,12,18,0.80) 100%)", "linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.24) 34%, rgba(0,0,0,0.28) 66%, rgba(0,0,0,0.88) 100%)", "linear-gradient(180deg, rgba(31,23,18,0.0) 0%, transparent 50%, rgba(31,23,18,1) 100%)"].join(",") }} />
      <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-6 pb-20 pt-28 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}>
          <Image src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1766567396/wl-darkbg_lfm9ye.png" alt="White Lotus" width={1161} height={1020} className="h-auto w-44 sm:w-56 md:w-64 lg:w-72 mb-8 drop-shadow-[0_24px_64px_rgba(0,0,0,0.75)]" priority />
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.0, delay: 0.45, ease: [0.22, 1, 0.36, 1] }} className="font-cormorant font-light italic text-white/90 leading-tight mb-5 whitespace-pre-line max-w-2xl" style={{ fontSize: "clamp(1.8rem, 4vw, 3.2rem)" }}>
          {t.headline}
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 0.68 }} className="text-[11px] uppercase tracking-[0.45em] text-white/45 mb-12">
          {t.tagline}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.82 }} className="flex flex-col sm:flex-row gap-3 items-center">
          <Link href={rentHref} className="inline-flex items-center justify-center px-8 py-3.5 bg-[#ff914d] text-black text-sm font-semibold tracking-wide rounded-full hover:bg-[#ff914d]/90 hover:scale-[1.03] transition-all duration-200 shadow-[0_0_32px_rgba(255,145,77,0.32)]">{t.rent}</Link>
          <Link href={eventsHref} className="inline-flex items-center justify-center px-8 py-3.5 border border-white/28 text-white text-sm font-medium tracking-wide rounded-full hover:bg-white/10 hover:border-white/55 transition-all duration-200 backdrop-blur-sm">{t.events}</Link>
        </motion.div>
      </div>
      <motion.div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}>
        <motion.div animate={reduceMotion ? {} : { y: [0, 8, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} className="flex flex-col items-center gap-1">
          <div className="w-px h-9 bg-gradient-to-b from-white/0 to-white/30" />
          <div className="w-1 h-1 rounded-full bg-white/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// --- Section 2: Venue Ticker --------------------------------------------------

const TICKER_EN = ["150 standing · 80 seated","Live music & concerts","Cacao ceremonies","Bankastræti 2 · Reykjavik","DJ nights & dancing","Yoga & movement","Private chef available","Full PA & stage lighting","Conscious gatherings"];
const TICKER_IS = ["150 standandi · 80 í sætum","Tónleikar & lifandi tónlist","Kakóathafnir","Bankastræti 2 · Reykjavík","DJ kvöld & dans","Jóga & hreyfing","Einkakokkur í boði","Hágæða hljóðkerfi & sviðslýsing","Meðvituð samvera"];

function VenueTicker({ language }) {
  const reduceMotion = useReducedMotion();
  const base = language === "is" ? TICKER_IS : TICKER_EN;
  const doubled = [...base, ...base];
  return (
    <div className="w-full overflow-hidden bg-[#291f17] border-y border-white/[0.05] py-4" data-navbar-theme="dark">
      <motion.div className="flex gap-0 whitespace-nowrap" animate={reduceMotion ? {} : { x: ["0%", "-50%"] }} transition={{ duration: 36, repeat: Infinity, ease: "linear" }}>
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-4 px-5">
            <span className="text-[11px] uppercase tracking-[0.35em] text-[#a09488]">{item}</span>
            <span className="text-[#ff914d]/35 text-xs">+</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// --- Section 3: The Space (watermark 01) --------------------------------------

function TheSpace({ t }) {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const yWatermark = useTransform(scrollYProgress, [0, 1], [40, -40]);
  return (
    <section ref={sectionRef} data-navbar-theme="dark" className="relative w-full bg-[#1f1712] py-24 md:py-32 overflow-hidden">
      <motion.div className="pointer-events-none absolute -left-6 top-6 select-none font-cormorant font-bold italic text-white/[0.025]" style={{ fontSize: "clamp(10rem, 22vw, 18rem)", lineHeight: 1, y: yWatermark }}>01</motion.div>
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <FadeUp><div className="flex items-center gap-3 mb-14"><div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/32" /><span className="text-xs uppercase tracking-[0.4em] text-[#ff914d]">{t.kicker}</span></div></FadeUp>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12 lg:gap-20 items-start">
          <div>
            <FadeUp delay={0.05}><h2 className="font-cormorant font-light italic text-[#f0ebe3] leading-[1.18] mb-8 whitespace-pre-line" style={{ fontSize: "clamp(2.4rem, 5vw, 4.4rem)" }}>{t.title}</h2></FadeUp>
            <FadeUp delay={0.1}><p className="text-[#a09488] text-lg md:text-xl leading-[1.9] mb-6">{t.body}</p></FadeUp>
            <FadeUp delay={0.16}><p className="text-[#6a5e52] text-sm italic leading-relaxed border-l-2 border-[#ff914d]/20 pl-4">{t.pull}</p></FadeUp>
          </div>
          <FadeUp delay={0.22} className="lg:pt-2">
            <div className="flex flex-row lg:flex-col gap-4">
              {t.stats.map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.65, delay: 0.3 + i * 0.09, ease: [0.22, 1, 0.36, 1] }} className="flex-1 lg:flex-none rounded-2xl px-5 py-5 lg:px-7 lg:py-6" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="font-cormorant font-light text-[#f0ebe3] leading-none mb-2" style={{ fontSize: "clamp(1.9rem, 4vw, 2.8rem)" }}>{stat.number}</p>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-[#8a7e72]">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// --- Section 4: What You Can Host --------------------------------------------

function EventTypes({ t, rentHref }) {
  return (
    <section className="w-full bg-[#291f17] py-24 md:py-32 px-6" data-navbar-theme="dark">
      <div className="max-w-6xl mx-auto">
        <FadeUp>
          <div className="flex items-center gap-3 mb-5"><div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" /><span className="text-xs uppercase tracking-[0.4em] text-[#ff914d]">{t.kicker}</span></div>
          <h2 className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-6 whitespace-pre-line" style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)" }}>{t.title}</h2>
        </FadeUp>
        <FadeUp delay={0.08}><p className="text-[#8a7e72] text-base md:text-lg leading-[1.8] mb-16 max-w-2xl">{t.subtitle}</p></FadeUp>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {t.featured.map((cat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}>
              <div className="group flex items-start gap-4 px-5 py-5 rounded-2xl transition-all duration-250 h-full cursor-default" style={{ border: "1px solid rgba(240,235,227,0.07)", background: "rgba(240,235,227,0.025)" }}>
                <span className="text-[#ff914d]/55 text-xl mt-0.5 group-hover:text-[#ff914d] transition-colors shrink-0">{cat.icon}</span>
                <div>
                  <p className="text-sm font-medium text-[#e0d8d0] group-hover:text-[#f0ebe3] transition-colors mb-1.5">{cat.label}</p>
                  <p className="text-xs text-[#6a5e54] leading-relaxed">{cat.note}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <FadeUp delay={0.35}><div className="flex flex-wrap gap-2 mb-14">{t.more.map((tag, i) => (<span key={i} className="px-4 py-2 rounded-full border border-white/[0.07] text-xs text-[#7a6e64] tracking-wide">{tag}</span>))}</div></FadeUp>
        <FadeUp delay={0.4}>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-start gap-0"><div className="w-px h-6 bg-gradient-to-b from-transparent to-white/10" /><div className="w-px h-4 bg-gradient-to-b from-white/10 via-white/15 to-[#ff914d]/50" /><div className="w-1 h-1 rounded-full bg-[#ff914d]/60 mt-0.5" /></div>
            <Link href={rentHref} className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#ff914d] text-black font-semibold rounded-full text-sm tracking-wide hover:scale-[1.03] hover:bg-[#ff914d]/90 transition-all duration-200 shadow-[0_0_28px_rgba(255,145,77,0.22)]">{t.cta} &rarr;</Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// --- Section 5: Gallery (visual-first placement) -----------------------------
// ImageGallery rendered in root below

// --- Section 6: Events Teaser ------------------------------------------------

function EventsTeaser({ t, eventsHref }) {
  return (
    <section data-navbar-theme="dark" className="w-full bg-[#291f17] py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <FadeUp>
              <div className="flex items-center gap-3 mb-6"><div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/40" /><span className="text-xs uppercase tracking-[0.4em] text-[#ff914d]">{t.kicker}</span></div>
              <h2 className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-5 whitespace-pre-line" style={{ fontSize: "clamp(2rem, 4vw, 3.4rem)" }}>{t.title}</h2>
            </FadeUp>
            <FadeUp delay={0.1}><p className="text-[#a09488] text-base md:text-lg leading-[1.9] mb-8">{t.body}</p></FadeUp>
            <FadeUp delay={0.16}><Link href={eventsHref} className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#ff914d] text-black text-sm font-semibold tracking-wide rounded-full hover:bg-[#ff914d]/90 hover:scale-[1.02] transition-all duration-200 shadow-[0_0_24px_rgba(255,145,77,0.22)]">{t.cta} &rarr;</Link></FadeUp>
          </div>
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-2 gap-3">
              {[{ src: "/whitelotus/whitelotus1.jpg", label: t.eventLabels[0] },{ src: "/whitelotus/whitelotus2.jpg", label: t.eventLabels[1] },{ src: "/whitelotus/whitelotus7.jpg", label: t.eventLabels[2] },{ src: "/whitelotus/whitelotus4.jpg", label: t.eventLabels[3] }].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.07 }} className="group relative aspect-square overflow-hidden rounded-xl">
                  <Image src={item.src} alt={item.label} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.05]" sizes="25vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <p className="absolute bottom-2.5 left-3 text-[10px] uppercase tracking-[0.3em] text-white/75">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// --- Section 7: Atmospheric Photo Break --------------------------------------

function PhotoBreak({ t }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1.0]);
  return (
    <section ref={ref} data-navbar-theme="dark" className="relative w-full h-[60vh] min-h-[400px] overflow-hidden">
      <motion.div className="absolute inset-0" style={{ scale }}>
        <Image src="/whitelotus/whitelotus3.jpg" alt="White Lotus ceremony and gathering space in Reykjavik" fill className="object-cover object-center" sizes="100vw" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#291f17] via-black/25 to-[#1f1712]" />
      <div className="relative z-10 w-full h-full flex items-center justify-center px-6">
        <FadeUp className="text-center max-w-3xl">
          <p className="font-cormorant font-light italic text-white/90 leading-[1.3]" style={{ fontSize: "clamp(1.8rem, 4vw, 3.2rem)" }}>&ldquo;{t.quote}&rdquo;</p>
          <div className="mt-5 flex items-center justify-center gap-3"><div className="w-8 h-px bg-[#ff914d]/40" /><span className="text-[10px] uppercase tracking-[0.45em] text-[#ff914d]/70">{t.quoteSource}</span><div className="w-8 h-px bg-[#ff914d]/40" /></div>
        </FadeUp>
      </div>
    </section>
  );
}

// --- Section 8: Venue Specs --------------------------------------------------

function VenueSpecs({ t }) {
  return (
    <section data-navbar-theme="dark" className="w-full bg-[#1f1712] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <FadeIn delay={0.05} className="lg:col-span-5 order-2 lg:order-1 lg:sticky lg:top-28">
            <div className="space-y-4">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-2xl"><Image src="/whitelotus/whitelotus5.jpg" alt="White Lotus set up for an evening event" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 42vw" /><div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" /></div>
            </div>
          </FadeIn>
          <div className="lg:col-span-7 order-1 lg:order-2">
            <FadeUp>
              <div className="flex items-center gap-3 mb-5"><div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/40" /><span className="text-xs uppercase tracking-[0.4em] text-[#ff914d]">{t.kicker}</span><div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/40" /></div>
              <h2 className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-10" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>{t.title}</h2>
            </FadeUp>
            <div className="rounded-2xl overflow-hidden px-6 sm:px-8" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {t.rows.map((row, i) => (<FadeUp key={row.label} delay={i * 0.07}><div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 py-5 border-b border-white/[0.06]"><p className="text-[10px] uppercase tracking-[0.35em] text-[#6a5e52] shrink-0 sm:w-28">{row.label}</p><p className="text-[15px] font-medium text-[#f0ebe3] leading-snug">{row.value}</p></div></FadeUp>))}
              <FadeUp delay={t.rows.length * 0.07 + 0.1}><p className="py-6 text-sm text-[#8a7e72] italic">{t.footer}</p></FadeUp>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Section 9: Benefits (watermark 02) --------------------------------------

function Benefits({ t }) {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const yWatermark = useTransform(scrollYProgress, [0, 1], [30, -30]);
  return (
    <section ref={sectionRef} data-navbar-theme="dark" className="relative w-full bg-[#291f17] py-24 overflow-hidden">
      <motion.div className="pointer-events-none absolute -right-6 top-4 select-none font-cormorant font-bold italic text-white/[0.025]" style={{ fontSize: "clamp(10rem, 22vw, 18rem)", lineHeight: 1, y: yWatermark }}>02</motion.div>
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <FadeUp>
          <div className="flex items-center gap-3 mb-4"><div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/40" /><span className="text-xs uppercase tracking-[0.4em] text-[#ff914d]">{t.kicker}</span></div>
          <h2 className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-16 whitespace-pre-line" style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.8rem)" }}>{t.title}</h2>
        </FadeUp>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {t.cards.map((card, i) => (<FadeUp key={i} delay={i * 0.1}><div className="relative h-full overflow-hidden rounded-2xl p-8 md:p-10" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}><span className="absolute -top-2 -right-1 text-[5rem] leading-none font-light text-white/[0.04] select-none pointer-events-none">{card.icon}</span><div className="relative"><h3 className="font-cormorant text-xl font-light italic text-[#f0ebe3] mb-2">{card.title}</h3><div className="w-8 h-px bg-gradient-to-r from-[#ff914d]/30 to-transparent mb-3" /><p className="text-sm text-[#8a7e72] leading-relaxed">{card.line}</p></div></div></FadeUp>))}
        </div>
      </div>
    </section>
  );
}

// --- Section 10: FAQ ---------------------------------------------------------

function FAQ({ t }) {
  const [open, setOpen] = useState(null);
  return (
    <section data-navbar-theme="dark" className="w-full bg-[#1f1712] py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <FadeUp className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-6"><div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/40" /><span className="text-xs uppercase tracking-[0.4em] text-[#ff914d]">{t.kicker}</span><div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/40" /></div>
          <h2 className="font-cormorant font-light italic text-[#f0ebe3] leading-tight" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}>{t.title}</h2>
        </FadeUp>
        <div className="space-y-3">
          {t.items.map((item, i) => (
            <FadeUp key={i} delay={i * 0.05}>
              <div className="rounded-2xl overflow-hidden transition-all duration-300" style={{ background: open === i ? "rgba(255,145,77,0.05)" : "rgba(255,255,255,0.025)", border: open === i ? "1px solid rgba(255,145,77,0.18)" : "1px solid rgba(255,255,255,0.07)" }}>
                <button type="button" onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-4 px-7 py-5 text-left">
                  <span className="text-[#f0ebe3] text-sm font-medium leading-snug pr-4">{item.q}</span>
                  <span className="shrink-0 w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-[#ff914d] text-xs transition-transform duration-300" style={{ transform: open === i ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
                </button>
                <motion.div initial={false} animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                  <p className="px-7 pb-6 text-[#8a7e72] text-sm leading-[1.85]">{item.a}</p>
                </motion.div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Section 11: Private Catering --------------------------------------------

function Catering({ t }) {
  const ICONS = { chef: "\u25ce", tailor: "\u27d0", bar: "\u25c7", service: "\u2726" };
  return (
    <section data-navbar-theme="dark" className="w-full bg-[#291f17] py-24 md:py-28 px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5">
          <FadeUp>
            <div className="flex items-center gap-3 mb-4"><div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" /><span className="text-xs uppercase tracking-[0.4em] text-[#ff914d]">{t.kicker}</span></div>
            <h2 className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-6 whitespace-pre-line" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>{t.title}</h2>
            <div className="w-10 h-px bg-[#ff914d]/40 mb-6" />
            <p className="text-[#a09488] text-base leading-[1.85] mb-5">{t.description}</p>
            <p className="text-[#6a5e54] text-sm italic mb-8 border-l-2 border-[#ff914d]/25 pl-4">{t.tagline}</p>
            <div className="flex gap-2 flex-wrap">{t.badges.map((b) => (<span key={b} className="rounded-full border border-[#ff914d]/20 bg-[#ff914d]/[0.05] px-4 py-1.5 text-xs text-[#c09a78] tracking-wide">{b}</span>))}</div>
          </FadeUp>
        </div>
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {t.tiles.map((tile, i) => (<FadeUp key={i} delay={i * 0.08}><div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 hover:bg-white/[0.05] hover:border-[#ff914d]/15 transition-all duration-300 h-full"><span className="absolute -top-2 -right-1 text-[5rem] leading-none font-light text-[#ff914d]/[0.04] select-none pointer-events-none">{ICONS[tile.icon] || "\u2726"}</span><div className="relative"><h4 className="font-cormorant text-xl font-light italic text-[#f0ebe3] mb-2">{tile.title}</h4><div className="w-8 h-px bg-gradient-to-r from-[#ff914d]/30 to-transparent mb-3" /><p className="text-sm text-[#a09488] leading-relaxed">{tile.text}</p></div></div></FadeUp>))}
        </div>
      </div>
    </section>
  );
}

// --- Section 12: Booking CTA (pricing + ambient orbs) ------------------------

function BookCTA({ t, rentHref, eventsHref }) {
  const reduceMotion = useReducedMotion();
  return (
    <section data-navbar-theme="dark" className="relative isolate w-full overflow-hidden bg-[#1f1712] pt-24 pb-32 px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 opacity-[0.28]" style={{ backgroundImage: "linear-gradient(rgba(255,145,77,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,145,77,0.035) 1px, transparent 1px)", backgroundSize: "60px 60px", maskImage: "radial-gradient(ellipse 70% 55% at 50% 50%, black 10%, transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse 70% 55% at 50% 50%, black 10%, transparent 75%)" }} />
        <motion.div className="absolute -top-[15%] -left-[10%] h-[min(85vw,500px)] w-[min(85vw,500px)] rounded-full blur-3xl" style={{ background: "radial-gradient(circle at 35% 35%, rgba(255,145,77,0.20), rgba(255,120,60,0.06) 50%, transparent 72%)" }} animate={reduceMotion ? {} : { x: [0, 30, -15, 0], y: [0, -22, 12, 0], scale: [1, 1.1, 0.95, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute -bottom-[20%] -right-[8%] h-[min(90vw,560px)] w-[min(90vw,560px)] rounded-full blur-3xl" style={{ background: "radial-gradient(circle at 60% 55%, rgba(255,145,77,0.10), rgba(240,200,140,0.05) 45%, transparent 68%)" }} animate={reduceMotion ? {} : { x: [0, -38, 18, 0], y: [0, 28, -16, 0], scale: [1, 0.93, 1.07, 1] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1f1712] via-transparent to-[#1f1712]" style={{ opacity: 0.85 }} />
      </div>
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <FadeUp>
          <div className="flex items-center justify-center gap-3 mb-6"><div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/55" /><span className="text-xs uppercase tracking-[0.4em] text-[#ff914d]">{t.kicker}</span><div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/55" /></div>
          <h2 className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-5 whitespace-pre-line" style={{ fontSize: "clamp(2.4rem, 5vw, 4.2rem)" }}>{t.title}</h2>
          <p className="max-w-lg mx-auto text-[#8a7e72] text-base leading-[1.85] mb-5">{t.description}</p>
          <div className="inline-flex items-center gap-3 rounded-full px-6 py-2.5 mb-10" style={{ background: "rgba(255,145,77,0.08)", border: "1px solid rgba(255,145,77,0.18)" }}>
            <span className="text-[#ff914d] text-xs">&#10022;</span>
            <span className="text-[#c09a78] text-xs tracking-wide">{t.pricingHint}</span>
            <span className="text-[#ff914d] text-xs">&#10022;</span>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center"><div className="w-px h-7 bg-gradient-to-b from-transparent to-white/10" /><div className="w-px h-5 bg-gradient-to-b from-transparent via-white/15 to-[#ff914d]/55" /><div className="w-1 h-1 rounded-full bg-[#ff914d]/65 mt-0.5" /></div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link href={rentHref} className="inline-flex items-center gap-2 px-9 py-4 bg-[#ff914d] text-black font-semibold rounded-full text-sm tracking-wide hover:scale-[1.03] hover:bg-[#ff914d]/90 transition-all duration-200 shadow-[0_2px_28px_rgba(255,145,77,0.30)]">{t.buttonPrimary} &rarr;</Link>
              <Link href={eventsHref} className="inline-flex items-center gap-2 px-7 py-4 border border-white/20 text-[#f0ebe3] rounded-full text-sm tracking-wide hover:border-white/40 hover:text-white transition-all duration-200">{t.buttonSecondary}</Link>
            </div>
          </div>
        </FadeUp>
        <FadeUp delay={0.12}>
          <div className="flex items-center justify-center gap-4 mt-16 mb-10"><div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/[0.12] max-w-32" /><span className="text-xs font-semibold uppercase tracking-[0.35em] text-[#6a5e52]">{t.howItWorks}</span><div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/[0.12] max-w-32" /></div>
        </FadeUp>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {t.steps.map((step, i) => (<FadeUp key={i} delay={0.15 + i * 0.08}><div className="rounded-2xl p-7 text-left h-full" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}><div className="flex items-center gap-3 mb-4"><div className="w-7 h-7 rounded-full border border-[#ff914d]/35 bg-[#ff914d]/[0.07] flex items-center justify-center"><span className="text-[10px] font-bold text-[#ff914d] font-mono">{String(i + 1).padStart(2, "0")}</span></div><h3 className="text-sm font-bold text-[#f0ebe3]">{step.title}</h3></div><p className="text-sm text-[#8a7e72] leading-relaxed">{step.text}</p></div></FadeUp>))}
        </div>
      </div>
    </section>
  );
}

// --- Root Component ----------------------------------------------------------

export default function WhiteLotusPageRedesign() {
  const { language } = useLanguage();
  const lang = language === "is" ? "is" : "en";

  const content = {
    en: {
      hero: { headline: "The most intimate event space\nin downtown Reykjavik", tagline: "Music \u00b7 Movement \u00b7 Ceremony \u00b7 Celebration", rent: "Rent the Venue", events: "See Events" },
      space: { kicker: "White Lotus \u00b7 Bankastrti 2", title: "Right next to Mama.\nA whole world inside.", body: "White Lotus sits beside Mama Reykjavik \u2014 the same soul, a different room. It\u2019s warm enough to feel personal, and built well enough to hold 150 people dancing. The acoustics are rich, the lighting is cinematic, and the room adapts: a cacao ceremony at noon, live music at midnight, a yoga morning the day after. It\u2019s not a hotel ballroom. It\u2019s not a nightclub. It\u2019s something more alive than both.", pull: "The same love that runs through Mama\u2019s kitchen runs through every event we hold here.", stats: [{ number: "150", label: "Standing guests" },{ number: "80", label: "Seated guests" },{ number: "101", label: "Bankastrti \u00b7 City centre" }] },
      events: { kicker: "The possibilities", title: "Built to hold\nany kind of gathering.", subtitle: "Concerts, cacao ceremonies, yoga mornings, dance nights, gallery openings, corporate dinners \u2014 White Lotus doesn\u2019t specialise in just one thing. That\u2019s the point.", cta: "Rent the Venue", featured: [{ icon: "\u25c8", label: "DJ Nights & Dancing", note: "Full PA \u00b7 dance floor for 150 \u00b7 stage lighting" },{ icon: "\u266a", label: "Live Music & Concerts", note: "Warm acoustics \u00b7 monitor mix \u00b7 professional stage" },{ icon: "\u25ce", label: "Ceremonies & Rituals", note: "Cacao \u00b7 breathwork \u00b7 yoga \u00b7 sacred space" },{ icon: "\u2726", label: "Talks & Workshops", note: "Projector \u00b7 microphone \u00b7 cultural gatherings" },{ icon: "\u25c7", label: "Private Celebrations", note: "Birthdays \u00b7 graduations \u00b7 milestones" },{ icon: "\u27a1", label: "Corporate & Brand Events", note: "Product launches \u00b7 team evenings \u00b7 presentations" }], more: ["Art Exhibitions","Film Screenings","Pop-ups & Markets","Fashion Shows","Healing Circles","\u2026 and so much more"] },
      eventsTeaser: { kicker: "What\u2019s on", title: "See what\u2019s happening\nat White Lotus", body: "From cacao ceremonies to live concerts, DJ nights to healing circles \u2014 check our events calendar and join us. Or create your own night.", cta: "See all events", eventLabels: ["DJ & Dance","Live Music","Cacao & Ritual","Culture & Talk"] },
      photoBreak: { quote: "Not a hotel ballroom. Not a nightclub. Something between a gallery, a temple, and a living room.", quoteSource: "White Lotus \u00b7 Reykjavik" },
      specs: { kicker: "At a glance", title: "Venue essentials", footer: "Need a specific setup? We\u2019ll tailor the room to your format.", rows: [{ label: "Capacity", value: "Standing 150 \u00b7 Seated 80" },{ label: "Location", value: "Bankastrti 2 \u00b7 101 Reykjavik" },{ label: "Access", value: "Right next to Mama Reykjavik" },{ label: "Hours", value: "Weekdays until 1am \u00b7 Weekends until 3am" },{ label: "Tech", value: "Pro sound \u00b7 mics \u00b7 mixer \u00b7 projector \u00b7 stage & disco lights" }] },
      benefits: { kicker: "Why it feels right", title: "Great atmosphere,\neasy to host.", cards: [{ icon: "\u25ce", title: "Intimate & refined", line: "A space that feels warm and human from the moment you walk in \u2014 premium quality without being stiff or corporate." },{ icon: "\u27a1", title: "Flexible layout", line: "Rearrange quickly to fit your format. Works equally well for 20 guests at a workshop or 150 on a dance floor." },{ icon: "\u2726", title: "Pro sound & light", line: "Professional-grade audio, microphones, mixer, projector, and stage lighting. Ready to go \u2014 no surprises on the night." }] },
      faq: { kicker: "Common questions", title: "Everything you need to know", items: [{ q: "How much does it cost to rent White Lotus?", a: "Rental prices vary by duration, day of week, and services required. As a guide, shorter daytime events start from 50,000 ISK. Send us an inquiry and we\u2019ll come back with a tailored quote within 24 hours." },{ q: "How many people can White Lotus hold?", a: "Up to 150 standing guests and 80 seated. The room reconfigures quickly \u2014 so whether you\u2019re hosting an intimate workshop for 20 or a full dance night for 150, it works." },{ q: "Is sound and lighting equipment included?", a: "Yes \u2014 everything is included. Professional PA system, stage and disco lighting, microphones, DI box, mixer, and a projector. You bring the music or the artist; we have the rest covered." },{ q: "Can I hire a private chef for my event?", a: "Absolutely. White Lotus has its own private chef who designs a fully custom menu \u2014 from grazing boards to sit-down dinners, with a curated bar to match. Dietary needs and service style are all tailored." },{ q: "Where exactly is White Lotus?", a: "Bankastrti 2, 101 Reykjavik \u2014 right in the city centre, next door to Mama Reykjavik. Easy to walk to from anywhere downtown, with public parking nearby." },{ q: "What types of events are best suited to the space?", a: "The room is genuinely versatile \u2014 concerts, DJ nights, cacao ceremonies, yoga mornings, corporate dinners, gallery openings, film screenings, birthdays, healing circles. If you can imagine it, we can probably host it." }] },
      catering: { kicker: "Private chef & bar", title: "Your own chef\n& a tailored bar", description: "White Lotus comes with its own private chef. Tell us your vision \u2014 we\u2019ll design a menu around it. From grazing boards to full sit-down dinners, everything is crafted for your event. Paired with a curated bar built to match.", tagline: "Your event, your menu, your night.", badges: ["Private chef","Tailored bar"], tiles: [{ icon: "chef", title: "Private chef", text: "Our in-house chef designs a custom menu for your event \u2014 any style, any dietary need, any size." },{ icon: "tailor", title: "Fully tailored", text: "Dietary needs, timing, style of service \u2014 we customise everything so it feels effortless." },{ icon: "bar", title: "Curated bar", text: "Craft cocktails, natural wines, cacao drinks, and non-alcoholic options. Built around your night." },{ icon: "service", title: "Full service", text: "Setup, service, flow. You focus on your guests \u2014 we handle the rest." }] },
      booking: { kicker: "Book the venue", title: "Host your event\nat White Lotus", description: "Tell us what you\u2019re planning \u2014 date, guest count, and any technical needs. We\u2019ll reply with layout options and pricing so you can confirm quickly.", pricingHint: "Starts from 50,000 ISK \u00b7 Tailored quotes within 24 hours", buttonPrimary: "Send an Inquiry", buttonSecondary: "See Upcoming Events", howItWorks: "How it works", steps: [{ title: "Share the idea", text: "Tell us the date, how many guests you\u2019re expecting, and the kind of event you\u2019re hosting." },{ title: "Get your options", text: "We\u2019ll suggest a layout and pricing, and answer any questions you have." },{ title: "Confirm & create", text: "You confirm \u2014 we handle the details and make sure everything runs smoothly." }] },
    },
    is: {
      hero: {
        seoTitle: "White Lotus — Fjölbreytt viðburðarými í Reykjavík",
        headline: "Glæsilegt rými fyrir viðburði\ní miðbæ Reykjavíkur",
        tagline: "Tónlist · Hreyfing · Athafnir · Fagnaður",
        rent: "Leigja salinn",
        events: "Skoða viðburði",
      },
      space: {
        kicker: "White Lotus · Bankastræti 2",
        title: "Rétt við hliðina á Mama.\nHeill heimur þar inni.",
        body: "White Lotus er við hlið Mama Reykjavík — sama hjarta, annað rými. Hlýlegt og persónulegt, en samt nógu stórt fyrir 150 manns á dansgólfi. Hljómburðurinn er djúpur, lýsingin lifandi og rýmið aðlagast hverjum viðburði. Kakóathöfn á daginn, tónleikar um kvöldið, jóga morguninn eftir.",
        pull: "Sama ástin og er í eldhúsinu hjá Mama er í hverjum viðburði hér.",
        stats: [{ number: "150", label: "Standandi gestir" },{ number: "80", label: "Sæti" },{ number: "101 Reykjavík", label: "Miðbær" }],
      },
      events: {
        kicker: "Möguleikarnir",
        title: "Rými fyrir alls konar samkomur.",
        subtitle: "Tónleikar, kakóathafnir, jóga, danskvöld, sýningar, fyrirtækjaviðburðir — White Lotus er ekki bundið við eitt form.",
        cta: "Leigja salinn",
        featured: [
          { icon: "\u25c8", label: "DJ kvöld & dans", note: "Fullt hljóðkerfi · dansgólf fyrir 150 · sviðslýsing" },
          { icon: "\u266a", label: "Lifandi tónlist & tónleikar", note: "Hlýr hljómburður · svið · monitorar" },
          { icon: "\u25ce", label: "Athafnir & helg rými", note: "Kakó · öndun · jóga" },
          { icon: "\u2726", label: "Fyrirlestrar & námskeið", note: "Skjávarpi · hljóðnemi" },
          { icon: "\u25c7", label: "Einkaviðburðir", note: "Afmæli · útskriftir · tímamót" },
          { icon: "\u27a1", label: "Fyrirtækjaviðburðir", note: "Kynningar · teymiskvöld" }
        ],
        more: ["Listasýningar","Kvikmyndasýningar","Pop-up & markaðir","Tískusýningar","Heilunarhringir","\u2026 og margt fleira"],
      },
      eventsTeaser: {
        kicker: "Dagskrá",
        title: "Sjá hvað er að gerast í White Lotus",
        body: "Frá kakóathöfnum til tónleika, DJ kvölda og heilunarhringa — skoðaðu dagskrána eða búðu til þitt eigið kvöld.",
        cta: "Sjá alla viðburði",
        eventLabels: ["DJ & dans","Lifandi tónlist","Kakó & athafnir","Menning & fyrirlestrar"],
      },
      photoBreak: {
        quote: "Ekki hótelsalur. Ekki næturklúbbur. Heldur eitthvað á milli gallerís, musteris og stofu.",
        quoteSource: "White Lotus · Reykjavík",
      },
      specs: {
        kicker: "Helstu upplýsingar",
        title: "Helstu upplýsingar",
        footer: "Þarftu sérstaka uppsetningu? Við aðlögum rýmið að þínum viðburði.",
        rows: [
          { label: "Rými", value: "150 standandi · 80 sitjandi" },
          { label: "Staðsetning", value: "Bankastræti 2 · 101 Reykjavík" },
          { label: "Aðgengi", value: "Við hliðina á Mama Reykjavík" },
          { label: "Opnunartími", value: "Virka daga til 01:00 · Helgar til 03:00" },
          { label: "Tækni", value: "Hljóðkerfi · hljóðnemar · mixer · skjávarpi · svið & ljós" }
        ],
      },
      benefits: {
        kicker: "Af hverju þetta virkar",
        title: "Hlýlegt, fallegt\nog auðvelt að halda viðburð.",
        cards: [
          { icon: "\u25ce", title: "Hlýlegt & fallegt", line: "Rými sem líður vel um leið og þú kemur inn — vandað án þess að vera stíft." },
          { icon: "\u27a1", title: "Sveigjanlegt", line: "Virkar fyrir litla hópa eða fullt dansgólf." },
          { icon: "\u2726", title: "Góð tækni", line: "Allt klárt — engar óvæntar uppákomur." }
        ],
      },
      faq: {
        kicker: "Algengar spurningar",
        title: "Algengar spurningar",
        items: [
          { q: "Hvað kostar að leigja White Lotus?", a: "Verð fer eftir lengd, degi og þjónustu. Sem viðmið byrja styttri dagviðburðir frá 50.000 kr. Sendu fyrirspurn og við svörum innan 24 tíma." },
          { q: "Hvað komast margir fyrir?", a: "Allt að 150 standandi gestir og 80 í sætum. Rýmið er auðvelt að aðlaga — hvort sem þú ert með náið námskeið fyrir 20 manns eða fullt danskvöld fyrir 150, þá virkar það." },
          { q: "Er tækni innifalin?", a: "Já — allt er innifalið. Hágæða hljóðkerfi, svið og ljós, hljóðnemar, DI box, mixer og skjávarpi. Þú kemur með tónlistina eða listamanninn — við sjáum um rest." },
          { q: "Er hægt að fá einkakokk og bar?", a: "Algjörlega. White Lotus er með sinn eigin einkakokk sem hannar sérsniðinn matseðil — allt frá smáréttum upp í sitjandi kvöldverð, ásamt bar sem passar við upplifunina. Tekið er tillit til allra matarþarfa og þjónustan sniðin að viðburðinum." },
          { q: "Hvar er White Lotus staðsett?", a: "Bankastræti 2, 101 Reykjavík — í hjarta miðbæjarins, við hliðina á Mama Reykjavík. Auðvelt að ganga alls staðar frá, og almenn bílastæði í nágrenninu." },
          { q: "Hvers konar viðburðir henta rýminu?", a: "Rýmið er mjög fjölhæft — tónleikar, DJ kvöld, kakóathafnir, jóga, fyrirtækjakvöld, sýningar, kvikmyndasýningar, afmæli, heilunarhringir. Ef þú getur ímyndað þér það, getum við líklega haldið það." }
        ],
      },
      catering: {
        kicker: "Einkakokkur & bar",
        title: "Þinn eigin kokkur\nog bar sem passar við kvöldið",
        description: "White Lotus býður upp á einkakokk. Segðu okkur frá hugmyndinni — við búum til matseðil sem passar.",
        tagline: "Frá smáréttum upp í kvöldverð — allt lagað að þínum viðburði.",
        badges: ["Einkakokkur","Sérsniðinn matseðill","Bar"],
        tiles: [
          { icon: "chef", title: "Einkakokkur", text: "Sérsniðinn matseðill fyrir hvaða viðburð sem er" },
          { icon: "tailor", title: "Sveigjanlegt", text: "Tekið tillit til mataræðis, tíma og upplifunar" },
          { icon: "bar", title: "Bar", text: "Kokteilar, vín, kakó og óáfengir drykkir" },
          { icon: "service", title: "Full þjónusta", text: "Við sjáum um uppsetningu og flæði" }
        ],
      },
      booking: {
        kicker: "Bóka salinn",
        title: "Halda viðburð hjá White Lotus",
        description: "Segðu okkur frá dagsetningu, fjölda gesta og þörfum — við sendum tillögur og verð.",
        pricingHint: "Byrjar frá 50.000 kr · svar innan 24 tíma",
        buttonPrimary: "Senda fyrirspurn",
        buttonSecondary: "Sjá viðburði",
        howItWorks: "Hvernig þetta virkar",
        steps: [
          { title: "Segðu okkur hugmyndina", text: "Segðu okkur frá dagsetningu, fjölda gesta og þörfum." },
          { title: "Fáðu tillögur", text: "Við sendum tillögur og verð sem passa við viðburðinn þinn." },
          { title: "Staðfesta & skapa", text: "Þú staðfestir — við hjálpum þér að láta kvöldið ganga upp." }
        ],
      },
    },
  };

  const t = content[lang];
  const rentHref = lang === "is" ? "/is/whitelotus/rent" : "/whitelotus/rent";
  const eventsHref = lang === "is" ? "/is/events" : "/events";

  return (
    <>
      <Hero t={t.hero} rentHref={rentHref} eventsHref={eventsHref} />
      <VenueTicker language={lang} />
      <TheSpace t={t.space} />
      <EventTypes t={t.events} rentHref={rentHref} />
      <ImageGallery />
      <EventsTeaser t={t.eventsTeaser} eventsHref={eventsHref} />
      <PhotoBreak t={t.photoBreak} />
      <VenueSpecs t={t.specs} />
      <Benefits t={t.benefits} />
      <FAQ t={t.faq} />
      <Catering t={t.catering} />
      <BookCTA t={t.booking} rentHref={rentHref} eventsHref={eventsHref} />
    </>
  );
}



