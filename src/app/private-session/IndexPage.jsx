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

// ── Top banner (small, just the section label) ──────────────────────────────
// Top padding clears the global DarkNavbar — same scale as /admin layout uses.
function TopBanner({ t }) {
  return (
    <section
      data-navbar-theme="dark"
      className="bg-[#0d0b09] pt-28 md:pt-36 lg:pt-44 pb-10 px-6 border-b border-white/[0.06]"
    >
      <div className="max-w-6xl mx-auto text-center">
        <SectionEyebrow>{t.indexEyebrow}</SectionEyebrow>
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
  const isSingle = practitioners.length === 1;

  return (
    <main className="bg-[#0d0b09] min-h-screen">
      <TopBanner t={t} />

      <section data-navbar-theme="dark" className="bg-[#0d0b09] py-16 md:py-20 px-6">
        <div className="max-w-6xl mx-auto">
          {practitioners.length === 0 ? (
            <FadeUp className="text-center max-w-xl mx-auto">
              <p className="text-[#a09488] text-base md:text-lg leading-relaxed">
                {t.indexNoPractitioners}
              </p>
            </FadeUp>
          ) : isSingle ? (
            // One practitioner — center with a constrained width so the card
            // doesn't stretch across the full grid track.
            <div className="flex justify-center">
              <FadeUp className="w-full max-w-sm md:max-w-md">
                <PractitionerCard practitioner={practitioners[0]} locale={locale} t={t} />
              </FadeUp>
            </div>
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
