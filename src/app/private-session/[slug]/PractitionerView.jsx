"use client";

import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";

import SlotPicker from "./SlotPicker";
import Markdown from "../_lib/Markdown";

// ── Helpers ─────────────────────────────────────────────────────────────────
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
    month: "long",
  });
  const startLabel = start ? fmt.format(new Date(start)) : null;
  const endLabel = end ? fmt.format(new Date(end)) : null;
  if (startLabel && endLabel) return `${startLabel} – ${endLabel}`;
  return startLabel || endLabel;
}

function formatTime(iso, locale) {
  return new Intl.DateTimeFormat(locale === "is" ? "is-IS" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

// Bio renders via the shared Markdown component (react-markdown + GFM).

// ── Hero ────────────────────────────────────────────────────────────────────
function Hero({ practitioner, t, locale }) {
  const residency = formatResidency(practitioner.residency_start, practitioner.residency_end, locale);

  return (
    <section
      data-navbar-theme="dark"
      className="relative bg-[#0d0b09] pt-32 md:pt-40 pb-20 px-6"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-10 md:gap-16 items-center">
        <FadeUp>
          <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden bg-[#160f0a]">
            {practitioner.photo_url ? (
              <Image
                src={practitioner.photo_url}
                alt={practitioner.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-b from-[#231916] to-[#160f0a]" />
            )}
          </div>
        </FadeUp>

        <div>
          <FadeUp>
            <SectionEyebrow>{t.practitionerEyebrow}</SectionEyebrow>
          </FadeUp>
          <FadeUp delay={0.05}>
            <h1
              className="font-cormorant font-light italic text-[#f0ebe3] leading-[1.05] mb-4"
              style={{ fontSize: "clamp(2.8rem, 6vw, 5.5rem)" }}
            >
              {practitioner.name}
            </h1>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#a09488] mb-8">
              {practitioner.country_of_origin && (
                <span>
                  <span className="text-[#7a6d5e] uppercase tracking-[0.2em] text-[10px] mr-2">
                    From
                  </span>
                  {practitioner.country_of_origin}
                </span>
              )}
              {residency && (
                <span>
                  <span className="text-[#7a6d5e] uppercase tracking-[0.2em] text-[10px] mr-2">
                    {t.indexCardResidency}
                  </span>
                  {residency}
                </span>
              )}
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <Markdown>{practitioner.bio_md}</Markdown>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ── Offerings ───────────────────────────────────────────────────────────────
function OfferingsSection({ offerings, t, onJoinWaitlist }) {
  return (
    <section data-navbar-theme="dark" className="bg-[#110f0d] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <FadeUp className="text-center mb-12">
          <SectionEyebrow>Sessions</SectionEyebrow>
          <h2
            className="font-cormorant font-light italic text-[#f0ebe3]"
            style={{ fontSize: "clamp(2.2rem, 4.6vw, 3.6rem)" }}
          >
            {t.practitionerOfferingsHeading}
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {offerings.map((o, i) => (
            <FadeUp key={o.id} delay={i * 0.05}>
              <article className="h-full p-7 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex flex-col">
                {o.modality && (
                  <div className="text-[10px] uppercase tracking-[0.3em] text-[#ff914d] mb-2">
                    {o.modality}
                  </div>
                )}
                <h3 className="font-cormorant text-3xl italic text-[#f0ebe3] mb-3">
                  {o.title}
                </h3>
                {o.description_md && (
                  <div className="text-[#a09488] text-sm md:text-base leading-relaxed mb-5">
                    <Markdown>{o.description_md}</Markdown>
                  </div>
                )}

                <div className="mt-auto pt-5 border-t border-white/[0.06] flex flex-wrap items-baseline gap-x-5 gap-y-1">
                  <span className="text-[#d8cfc1] text-sm">
                    <span className="font-cormorant text-2xl text-[#f0ebe3] mr-1">
                      {o.duration_minutes}
                    </span>
                    {t.practitionerOfferingDuration}
                  </span>
                  <span className="text-[#d8cfc1] text-sm">
                    <span className="font-cormorant text-2xl text-[#ff914d] mr-1">
                      {new Intl.NumberFormat().format(o.price_isk)}
                    </span>
                    {t.practitionerOfferingPrice}
                  </span>
                </div>
                <div className="mt-2 text-xs text-[#7a6d5e] italic">
                  {t.practitionerOfferingCash}
                </div>

                {!o.has_available_slot && (
                  <button
                    type="button"
                    onClick={() => onJoinWaitlist(o)}
                    className="mt-5 inline-flex items-center self-start gap-2 px-5 py-2.5 rounded-full border border-white/20 text-[#f0ebe3] text-[10px] tracking-[0.25em] uppercase hover:bg-white/10 hover:border-white/40 transition"
                  >
                    {t.practitionerWaitlistCta}
                  </button>
                )}
              </article>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Availability ────────────────────────────────────────────────────────────
function AvailabilitySection({ groupedSlots, locale, t, onSlotClick }) {
  return (
    <section
      id="availability"
      data-navbar-theme="dark"
      className="bg-[#0d0b09] py-24 px-6"
    >
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-10">
          <SectionEyebrow>{t.practitionerAvailabilityHeading}</SectionEyebrow>
          <h2
            className="font-cormorant font-light italic text-[#f0ebe3] mb-4"
            style={{ fontSize: "clamp(2.2rem, 4.6vw, 3.6rem)" }}
          >
            {t.practitionerAvailabilityHeading}
          </h2>
          <p className="max-w-xl mx-auto text-[#a09488] text-sm md:text-base leading-relaxed">
            {t.practitionerAvailabilitySub}
          </p>
        </FadeUp>

        {groupedSlots.length === 0 ? (
          <FadeUp className="max-w-xl mx-auto text-center">
            <p className="text-[#a09488] text-sm md:text-base leading-relaxed">
              {t.practitionerAvailabilityEmpty}
            </p>
          </FadeUp>
        ) : (
          <div className="space-y-8">
            {groupedSlots.map((group, gi) => (
              <FadeUp key={group.key} delay={gi * 0.04}>
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-[#ff914d] mb-3">
                    {group.label}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {group.slots.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => onSlotClick(s)}
                        className="text-left p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-[#ff914d]/40 hover:bg-white/[0.05] transition group"
                      >
                        <div className="flex items-baseline justify-between mb-2">
                          <span className="font-cormorant text-3xl italic text-[#f0ebe3] tabular-nums">
                            {formatTime(s.starts_at, locale)}
                          </span>
                          <span className="text-[10px] uppercase tracking-[0.25em] text-[#a09488]">
                            {formatTime(s.ends_at, locale)}
                          </span>
                        </div>
                        <ul className="space-y-0.5">
                          {s.offerings.map((o) => (
                            <li
                              key={o.id}
                              className="text-xs text-[#a09488] group-hover:text-[#d8cfc1] transition leading-snug"
                            >
                              · {o.title}
                            </li>
                          ))}
                        </ul>
                      </button>
                    ))}
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function PractitionerView({
  locale = "en",
  t,
  practitioner,
  offerings,
  groupedSlots,
}) {
  const [pickerSlot, setPickerSlot] = useState(null);
  const [waitlistOffering, setWaitlistOffering] = useState(null);

  return (
    <main className="bg-[#0d0b09]">
      <Hero practitioner={practitioner} t={t} locale={locale} />
      <OfferingsSection
        offerings={offerings}
        t={t}
        onJoinWaitlist={(o) => setWaitlistOffering(o)}
      />
      <AvailabilitySection
        groupedSlots={groupedSlots}
        locale={locale}
        t={t}
        onSlotClick={(s) => setPickerSlot(s)}
      />

      <AnimatePresence>
        {pickerSlot && (
          <SlotPicker
            mode="book"
            slot={pickerSlot}
            offerings={pickerSlot.offerings}
            locale={locale}
            t={t}
            onClose={() => setPickerSlot(null)}
          />
        )}
        {waitlistOffering && (
          <SlotPicker
            mode="waitlist"
            offerings={[waitlistOffering]}
            locale={locale}
            t={t}
            onClose={() => setWaitlistOffering(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
