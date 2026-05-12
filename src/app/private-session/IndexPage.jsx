"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

import { COPY } from "./_lib/copy";

// ── Helpers (kept local to this file — not shared cross-feature) ─────────────
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

function formatResidency(start, end, locale) {
  if (!start && !end) return "";
  const fmt = new Intl.DateTimeFormat(locale === "is" ? "is-IS" : "en-GB", {
    day: "numeric",
    month: "short",
  });
  const startLabel = start ? fmt.format(new Date(start)) : null;
  const endLabel = end ? fmt.format(new Date(end)) : null;
  if (startLabel && endLabel) return `${startLabel} – ${endLabel}`;
  return startLabel || endLabel;
}

// ── Hero / intro ─────────────────────────────────────────────────────────────
function Hero({ t }) {
  return (
    <section
      data-navbar-theme="dark"
      className="relative bg-[#0d0b09] pt-32 pb-24 md:pt-40 md:pb-28 px-6 text-center overflow-hidden"
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

      <div className="relative max-w-3xl mx-auto">
        <FadeUp>
          <SectionEyebrow>{t.indexEyebrow}</SectionEyebrow>
        </FadeUp>
        <FadeUp delay={0.05}>
          <h1
            className="font-cormorant font-light italic text-[#f0ebe3] leading-tight whitespace-pre-line mb-8"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
          >
            {t.indexTitle}
          </h1>
        </FadeUp>
        <FadeUp delay={0.15}>
          <p className="max-w-2xl mx-auto text-[#a09488] text-base md:text-lg leading-relaxed">
            {t.indexIntro}
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

// ── Practitioner card ────────────────────────────────────────────────────────
function PractitionerCard({ practitioner, locale, t }) {
  const href = locale === "is" ? `/is/private-session/${practitioner.slug}` : `/private-session/${practitioner.slug}`;
  const residency = formatResidency(practitioner.residency_start, practitioner.residency_end, locale);

  return (
    <Link
      href={href}
      className="group flex flex-col bg-white/[0.03] border border-white/[0.06] rounded-3xl overflow-hidden hover:border-[#ff914d]/40 transition-colors duration-300"
    >
      {practitioner.photo_url ? (
        <div className="relative aspect-[4/5] bg-[#160f0a] overflow-hidden">
          <Image
            src={practitioner.photo_url}
            alt={practitioner.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
        </div>
      ) : (
        <div className="relative aspect-[4/5] bg-gradient-to-b from-[#231916] to-[#160f0a]" />
      )}

      <div className="p-6 flex flex-col flex-1">
        {practitioner.country_of_origin && (
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#ff914d] mb-2">
            {practitioner.country_of_origin}
          </div>
        )}
        <h2 className="font-cormorant text-3xl italic text-[#f0ebe3] mb-2 leading-tight">
          {practitioner.name}
        </h2>

        {residency && (
          <div className="text-xs text-[#a09488] mb-4">
            {t.indexCardResidency} · {residency}
          </div>
        )}

        {practitioner.offerings && practitioner.offerings.length > 0 && (
          <div className="mt-auto pt-4 border-t border-white/[0.06]">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#a09488] mb-2">
              {t.indexCardOfferings}
            </div>
            <ul className="space-y-1">
              {practitioner.offerings.slice(0, 4).map((o) => (
                <li key={o.id} className="text-sm text-[#d8cfc1] leading-snug">
                  {o.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 text-xs tracking-[0.25em] uppercase text-[#ff914d] group-hover:text-[#ffa566] transition-colors">
          {t.indexCardView} →
        </div>
      </div>
    </Link>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function IndexPage({ locale = "en", practitioners = [] }) {
  const t = COPY[locale] || COPY.en;

  return (
    <main className="bg-[#0d0b09] min-h-screen">
      <Hero t={t} />

      <section data-navbar-theme="dark" className="bg-[#0d0b09] pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          {practitioners.length === 0 ? (
            <FadeUp className="text-center max-w-xl mx-auto">
              <p className="text-[#a09488] text-base md:text-lg leading-relaxed">
                {t.indexNoPractitioners}
              </p>
            </FadeUp>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {practitioners.map((p, i) => (
                <FadeUp key={p.id} delay={i * 0.05}>
                  <PractitionerCard practitioner={p} locale={locale} t={t} />
                </FadeUp>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
