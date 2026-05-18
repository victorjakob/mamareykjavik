"use client";

// Focused booking flow for a single practitioner:
//   1. Pick a session (offering)
//   2. Pick a date — calendar shows only days with availability for that offering
//      then time chips for the selected day
//   3. Your details + confirm (cash on the day)
//
// All three steps live on one page with progressive disclosure. No modal —
// the form is the page. The compact hero stays at the top with an
// expand-to-read bio so the booking surface is the focus.

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DayPicker } from "react-day-picker";
import { is as isLocale, enGB } from "date-fns/locale";
import "react-day-picker/style.css";
import "./day-picker-overrides.css";

import Markdown from "../_lib/Markdown";

// ── Helpers ─────────────────────────────────────────────────────────────────
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

function isSameLocalDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(d) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

// Deterministic local YYYY-MM-DD — derived from the Date's local components
// directly so a locale-sensitive toLocaleDateString quirk can never shift
// a day. Used as the key for matching slots to calendar cells.
function localDateKey(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// First paragraph of the description as plain text — strips simple
// markdown so it composes cleanly with line-clamp on the offering card.
// The detail/about expander still shows the full Markdown.
function plainPreview(md) {
  if (!md) return "";
  return md
    .split(/\n{2,}/)[0]
    .replace(/[*_`~]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Compact hero ────────────────────────────────────────────────────────────
// Centered profile-style hero: avatar on top, eyebrow + cormorant name +
// residency stack vertically and align center. Reads the same on phones and
// desktop — phones still feel like the primary device.
function CompactHero({ practitioner, t, locale, showAbout, onToggleAbout }) {
  const residency = formatResidency(practitioner.residency_start, practitioner.residency_end, locale);
  const eyebrow = [
    t.practitionerEyebrow,
    practitioner.country_of_origin || null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section
      data-navbar-theme="dark"
      className="relative overflow-hidden bg-[#0d0b09] pt-28 md:pt-36 lg:pt-44 pb-10 md:pb-14 px-6 border-b border-white/[0.06]"
    >
      {/* Top warm hairline — same flourish as AdminHero. */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(255,145,77,0.45), transparent)",
        }}
      />

      {/* Warm orange ambient wash — two soft radial glows. Picks up the brand
          accent without overwhelming the compact band. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 65% 90% at 12% 10%, rgba(255,145,77,0.16) 0%, transparent 55%), radial-gradient(ellipse 75% 90% at 100% 100%, rgba(255,176,106,0.10) 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-3xl mx-auto flex flex-col items-center text-center">
        {practitioner.photo_url ? (
          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-[#160f0a] ring-1 ring-[#ff914d]/25 shadow-[0_4px_24px_rgba(0,0,0,0.45)]">
            <Image
              src={practitioner.photo_url}
              alt={practitioner.name}
              fill
              sizes="96px"
              priority
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-b from-[#231916] to-[#160f0a] ring-1 ring-[#ff914d]/20" />
        )}

        {eyebrow && (
          <div className="mt-5 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#ff914d]/60" />
            <span className="text-[10px] uppercase tracking-[0.35em] text-[#ff914d]">
              {eyebrow}
            </span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#ff914d]/60" />
          </div>
        )}

        <h1 className="mt-3 font-cormorant italic text-[#f0ebe3] leading-tight text-3xl md:text-4xl lg:text-5xl [text-shadow:0_2px_18px_rgba(0,0,0,0.55)]">
          {practitioner.name}
        </h1>

        {residency && (
          <div className="mt-3 text-xs md:text-sm text-[#a09488] tracking-wide">
            {residency}
          </div>
        )}

        {practitioner.bio_md && (
          <button
            type="button"
            onClick={onToggleAbout}
            className="mt-6 px-5 py-2 rounded-full border border-white/15 text-[10px] tracking-[0.25em] uppercase text-[#d8cfc1] hover:bg-white/[0.05] hover:border-[#ff914d]/40 transition"
          >
            {showAbout ? t.practitionerHideAbout : t.practitionerAbout}
          </button>
        )}

        <AnimatePresence initial={false}>
          {showAbout && practitioner.bio_md && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden w-full"
            >
              <div className="pt-7 md:pt-8 max-w-2xl mx-auto text-left">
                <Markdown>{practitioner.bio_md}</Markdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Soft bottom fade — eases the dark band into the booking section. */}
      <div
        aria-hidden
        className="absolute -bottom-px left-0 right-0 h-8 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(13,11,9,0.85))",
        }}
      />
    </section>
  );
}

// ── Step header ─────────────────────────────────────────────────────────────
// Centered horizontally so the booking flow has a clear vertical spine —
// reads the same on a phone and on desktop.
function StepHeader({ number, label, complete }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-5">
      <span
        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[11px] tabular-nums font-semibold transition ${
          complete
            ? "bg-[#ff914d] text-[#160f0a]"
            : "bg-white/[0.06] text-[#d8cfc1] border border-white/10"
        }`}
      >
        {complete ? "✓" : number}
      </span>
      <h2 className="font-cormorant text-xl md:text-2xl italic text-[#f0ebe3]">
        {label}
      </h2>
    </div>
  );
}

// ── Step 1: Offering picker ─────────────────────────────────────────────────
// Compact list (one row per offering) — scannable like a menu of services.
// Title left, duration · price right, single-line description preview below.
// Active state is a soft orange wash plus a 2-px orange left edge.
function OfferingPicker({ offerings, selectedId, onSelect, t, onWaitlist }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.015] overflow-hidden divide-y divide-white/[0.06]">
      {offerings.map((o) => {
        const active = selectedId === o.id;
        const disabled = !o.has_available_slot;
        const preview = plainPreview(o.description_md);

        return (
          <button
            key={o.id}
            type="button"
            onClick={() => {
              if (disabled) return;
              onSelect(o.id);
            }}
            className={`group relative w-full text-left flex items-start gap-4 pl-5 pr-4 py-4 transition ${
              active
                ? "bg-[#ff914d]/[0.08]"
                : disabled
                ? "opacity-60 cursor-not-allowed"
                : "hover:bg-white/[0.03]"
            }`}
            aria-pressed={active}
            aria-disabled={disabled}
          >
            {/* Selected edge */}
            <span
              className={`absolute left-0 top-0 bottom-0 w-[2px] transition ${
                active ? "bg-[#ff914d]" : "bg-transparent"
              }`}
              aria-hidden
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-4">
                <h3
                  className={`font-cormorant italic leading-tight truncate text-[1.15rem] md:text-[1.25rem] ${
                    active ? "text-[#ff914d]" : "text-[#f0ebe3]"
                  }`}
                >
                  {o.title}
                </h3>

                <div className="shrink-0 flex items-baseline gap-2 text-[13px] tabular-nums">
                  <span className="text-[#a09488]">
                    {o.duration_minutes} {t.offeringDuration}
                  </span>
                  <span className="text-[#7a6d5e]">·</span>
                  <span className={active ? "text-[#ff914d]" : "text-[#f0ebe3]"}>
                    {new Intl.NumberFormat().format(o.price_isk)} {t.offeringPrice}
                  </span>
                </div>
              </div>

              {preview && (
                <p className="text-[13px] text-[#a09488] leading-snug truncate mt-1">
                  {preview}
                </p>
              )}

              {disabled && (
                <div className="mt-2 flex items-center gap-3 text-[11px]">
                  <span className="text-[#7a6d5e]">No times open</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onWaitlist(o);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        onWaitlist(o);
                      }
                    }}
                    className="uppercase tracking-[0.2em] text-[#ff914d] hover:underline cursor-pointer"
                  >
                    {t.waitlistCta} →
                  </span>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Step 2: Calendar + times ────────────────────────────────────────────────
function CalendarPicker({
  enabled,
  slotsForOffering,
  selectedDate,
  selectedSlotId,
  onPickDate,
  onPickSlot,
  locale,
  t,
}) {
  // Map of YYYY-MM-DD (local) → slots[]
  const slotsByDay = useMemo(() => {
    const m = new Map();
    for (const s of slotsForOffering) {
      const key = localDateKey(new Date(s.starts_at));
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(s);
    }
    for (const v of m.values()) v.sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
    return m;
  }, [slotsForOffering]);

  const availableDateObjs = useMemo(
    () => Array.from(slotsByDay.keys()).map((k) => new Date(k + "T00:00:00")),
    [slotsByDay]
  );

  // For DayPicker — disabled function: any day NOT in the available set.
  // Use localDateKey on both sides so locale/timezone can never shift a day.
  const enabledKeys = useMemo(
    () => new Set(Array.from(slotsByDay.keys())),
    [slotsByDay]
  );
  const isDisabled = (day) => {
    return !enabledKeys.has(localDateKey(day));
  };

  const dpLocale = locale === "is" ? isLocale : enGB;
  const firstAvailable = availableDateObjs[0];
  const initialMonth = firstAvailable || new Date();

  const slotsOnSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    return slotsByDay.get(localDateKey(selectedDate)) || [];
  }, [slotsByDay, selectedDate]);

  if (!enabled) {
    return (
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-[#a09488] text-sm leading-relaxed">
        {t.step2Locked}
      </div>
    );
  }

  if (slotsForOffering.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-[#a09488] text-sm leading-relaxed">
        {t.noSlotsForOffering}
      </div>
    );
  }

  // Calendar centered above, time chips centered below. Same flow on phone
  // and desktop — nothing left-anchored against the page edge.
  return (
    <div className="flex flex-col items-center gap-8 md:gap-10">
      <div className="flex justify-center">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={onPickDate}
          defaultMonth={initialMonth}
          locale={dpLocale}
          weekStartsOn={1}
          disabled={isDisabled}
          modifiers={{ available: availableDateObjs }}
          modifiersClassNames={{ available: "rdp-day-pses-available" }}
        />
      </div>

      <div className="w-full max-w-md">
        {selectedDate ? (
          <>
            <div className="text-center text-[10px] uppercase tracking-[0.3em] text-[#ff914d] mb-3">
              {t.pickTime}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {slotsOnSelectedDay.map((s) => {
                const active = selectedSlotId === s.id;
                // The fetcher already filters out fully-booked slots, so any
                // chip here is bookable. No need to advertise "N left" —
                // the count adds noise for the visitor and doesn't change
                // their decision.
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onPickSlot(s)}
                    aria-pressed={active}
                    className={`px-4 py-3 rounded-lg text-sm tabular-nums transition ${
                      active
                        ? "bg-[#ff914d] text-[#160f0a] font-semibold"
                        : "bg-white/[0.04] text-[#d8cfc1] hover:bg-white/[0.08]"
                    }`}
                  >
                    {formatTime(s.starts_at, locale)}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-[#a09488] text-sm text-center">{t.pickDate}</div>
        )}
      </div>
    </div>
  );
}

// ── Step 3: Client details + submit ─────────────────────────────────────────
function DetailsForm({
  enabled,
  values,
  setValue,
  onSubmit,
  submitting,
  error,
  notice,
  t,
}) {
  if (!enabled) {
    return (
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-[#a09488] text-sm leading-relaxed">
        {t.step3Locked}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-[10px] uppercase tracking-[0.25em] text-[#a09488] mb-2">
          {t.formName}
        </label>
        <input
          type="text"
          required
          value={values.name}
          onChange={(e) => setValue("name", e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-[#f0ebe3] focus:border-[#ff914d] outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] uppercase tracking-[0.25em] text-[#a09488] mb-2">
            {t.formEmail}
          </label>
          <input
            type="email"
            required
            value={values.email}
            onChange={(e) => setValue("email", e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-[#f0ebe3] focus:border-[#ff914d] outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-[0.25em] text-[#a09488] mb-2">
            {t.formPhone}
          </label>
          <input
            type="tel"
            value={values.phone}
            onChange={(e) => setValue("phone", e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-[#f0ebe3] focus:border-[#ff914d] outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] uppercase tracking-[0.25em] text-[#a09488] mb-2">
          {t.formNote}
        </label>
        <textarea
          rows={3}
          value={values.note}
          onChange={(e) => setValue("note", e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-[#f0ebe3] focus:border-[#ff914d] outline-none resize-none"
        />
      </div>

      <p className="text-xs text-[#7a6d5e] leading-relaxed text-center max-w-md mx-auto">
        {t.formCashNote}
      </p>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-200 text-xs">
          {error}
        </div>
      )}
      {notice && (
        <div className="p-3 rounded-lg bg-[#ff914d]/15 border border-[#ff914d]/30 text-[#f0ebe3] text-xs leading-relaxed">
          {notice}
        </div>
      )}

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={submitting}
          className="w-full md:w-auto px-8 py-4 rounded-full bg-[#ff914d] text-[#160f0a] text-xs tracking-[0.25em] uppercase font-semibold hover:bg-[#ffa566] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? t.formSubmitting : t.formSubmit}
        </button>
      </div>
    </form>
  );
}

// ── Selection summary card (shown once an offering is picked) ──────────────
// Replaces the previous baseline-aligned text strip. Real hierarchy:
//   avatar │ eyebrow + offering title + "with {practitioner}" sub-line │ total price
// so the eye lands on what the user has chosen, not on a row of equal-weight chips.
function SummaryRow({ practitioner, selectedOffering, selectedSlot, locale, t }) {
  if (!selectedOffering) return null;
  const date = selectedSlot ? new Date(selectedSlot.starts_at) : null;
  const dateLabel = date
    ? date.toLocaleDateString(locale === "is" ? "is-IS" : "en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : null;
  const formattedPrice = new Intl.NumberFormat().format(selectedOffering.price_isk);

  // Strong-enough background so the card reads as solid both at its natural
  // position and when sticky (with content scrolling underneath).
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-[#ff914d]/25 backdrop-blur-md"
      style={{
        background:
          "linear-gradient(to bottom right, rgba(255,145,77,0.10), rgba(255,145,77,0.04) 60%, transparent), rgba(13,11,9,0.92)",
        boxShadow: "0 12px 36px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,145,77,0.04)",
      }}
    >
      {/* Warm hairline accent along the top edge */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(255,145,77,0.55), transparent)",
        }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 sm:p-5">
        {/* Avatar */}
        {practitioner.photo_url ? (
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-[#ff914d]/30 bg-[#160f0a] mx-auto sm:mx-0">
            <Image
              src={practitioner.photo_url}
              alt={practitioner.name}
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex-shrink-0 bg-gradient-to-b from-[#231916] to-[#160f0a] ring-1 ring-[#ff914d]/20 mx-auto sm:mx-0" />
        )}

        {/* Offering + date */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#ff914d] mb-1">
            {t.summaryEyebrow || "Your session"}
          </div>
          <div className="font-cormorant text-lg md:text-xl italic text-[#f0ebe3] leading-tight truncate">
            {selectedOffering.title}
          </div>
          <div className="text-xs md:text-sm text-[#a09488] mt-1 truncate">
            {t.summaryWith || "with"} {practitioner.name}
            {dateLabel && (
              <>
                <span className="mx-2 text-[#7a6d5e]">·</span>
                <span className="text-[#d8cfc1]">
                  {dateLabel} · {formatTime(selectedSlot.starts_at, locale)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Price + duration */}
        <div className="flex sm:flex-col sm:items-end items-baseline justify-center gap-3 sm:gap-1 sm:text-right pt-3 sm:pt-0 sm:pl-6 border-t sm:border-t-0 sm:border-l border-white/[0.06]">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#a09488]">
              {t.summaryTotal || "Total"}
            </div>
            <div className="font-cormorant text-2xl md:text-[1.75rem] italic text-[#f0ebe3] leading-none tabular-nums">
              {formattedPrice}
              <span className="text-sm not-italic font-normal tracking-wide text-[#a09488] ml-1.5">
                {t.offeringPrice}
              </span>
            </div>
          </div>
          <div className="text-[11px] text-[#a09488] tabular-nums sm:mt-1">
            {selectedOffering.duration_minutes} {t.offeringDuration}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Success card ────────────────────────────────────────────────────────────
// Shown in place of the entire booking surface after a confirmed submission.
function SuccessCard({ success, practitioner, locale, t, onBookAnother }) {
  if (!success) return null;
  const isBooking = success.kind === "booking";
  const offering = success.offering;
  const slot = success.slot;
  const dateLabel = slot
    ? new Date(slot.starts_at).toLocaleDateString(
        locale === "is" ? "is-IS" : "en-GB",
        { weekday: "long", day: "numeric", month: "long", year: "numeric" }
      )
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-[#ff914d]/40 bg-[#ff914d]/[0.07] p-8 md:p-10 text-center"
    >
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#ff914d] text-[#160f0a] mb-5">
        <span className="text-xl">✓</span>
      </div>

      <h2
        className="font-cormorant font-light italic text-[#f0ebe3] mb-3"
        style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)" }}
      >
        {isBooking ? t.bookingSuccessTitle : t.waitlistSuccessTitle}
      </h2>

      <p className="text-[#d8cfc1] text-base md:text-lg leading-relaxed max-w-xl mx-auto">
        {isBooking ? t.bookingSuccessBody : t.waitlistSuccessBody}
      </p>

      {/* Waitlist position — the only number worth showing here. The booking
          reference is in the confirmation email if anyone ever needs to cite
          it; staring at a random string on the page just feels bureaucratic. */}
      {!isBooking && success.position && (
        <div className="mt-6 font-cormorant text-2xl italic text-[#ff914d]">
          {t.waitlistSuccessPosition}
          {success.position}
        </div>
      )}

      {/* What you booked / what you're waiting for */}
      <div className="mt-6 max-w-md mx-auto text-sm text-[#d8cfc1]">
        <div className="text-[#f0ebe3] font-medium">
          {offering?.title}
          {practitioner?.name ? ` · ${practitioner.name}` : ""}
        </div>
        {isBooking && dateLabel && slot && (
          <div className="text-[#a09488] mt-1">
            {dateLabel} · {formatTime(slot.starts_at, locale)}
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onBookAnother}
          className="px-6 py-3 rounded-full bg-[#ff914d] text-[#160f0a] text-xs tracking-[0.25em] uppercase font-semibold hover:bg-[#ffa566] transition"
        >
          {t.bookingSuccessBookAnother}
        </button>
        <a
          href={locale === "is" ? "/is/private-session" : "/private-session"}
          className="px-6 py-3 rounded-full border border-white/15 text-[#d8cfc1] text-xs tracking-[0.25em] uppercase hover:bg-white/[0.05] hover:border-white/30 transition"
        >
          {t.bookingSuccessBackHome}
        </a>
      </div>
    </motion.div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function PractitionerView({
  locale = "en",
  t,
  practitioner,
  offerings,
  slots,
}) {
  const [showAbout, setShowAbout] = useState(false);
  const [offeringId, setOfferingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [waitlistFor, setWaitlistFor] = useState(null); // offering on waitlist

  // Form state
  const [values, setValues] = useState({ name: "", email: "", phone: "", note: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  // Success state — replaces the whole booking surface on confirm:
  //   { kind: "booking", referenceId, offering, slot } | { kind: "waitlist", offering, position }
  const [success, setSuccess] = useState(null);

  function resetForBookAnother() {
    setSuccess(null);
    setOfferingId(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setWaitlistFor(null);
    setValues({ name: "", email: "", phone: "", note: "" });
    setError("");
    setNotice("");
    // Scroll the page back to the top so the user starts fresh from step 1.
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // Refs for smooth scrolling between steps, plus the success card so we can
  // pull it into the viewport centre on submit (vs. just scrolling to top,
  // which would otherwise leave the user looking at the hero with the
  // confirmation card hidden somewhere below the fold).
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);
  const successRef = useRef(null);

  const selectedOffering = useMemo(
    () => offerings.find((o) => o.id === offeringId) || null,
    [offerings, offeringId]
  );

  // Available slots for the chosen offering, in the future, status available.
  const slotsForOffering = useMemo(() => {
    if (!offeringId) return [];
    const nowMs = Date.now();
    return slots
      .filter((s) => s.status === "available" && new Date(s.starts_at).getTime() > nowMs)
      .filter((s) => (s.offerings || []).some((o) => o.id === offeringId));
  }, [slots, offeringId]);

  function chooseOffering(id) {
    setOfferingId(id);
    setSelectedDate(null);
    setSelectedSlot(null);
    setError("");
    setNotice("");
    // Smooth-scroll the calendar into view shortly after the render commits.
    setTimeout(() => step2Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function pickDate(date) {
    setSelectedDate(date ? startOfDay(date) : null);
    setSelectedSlot(null);
  }

  function pickSlot(slot) {
    setSelectedSlot(slot);
    setTimeout(() => step3Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function updateValue(k, v) {
    setValues((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!offeringId) { setError(t.errorRequiredOffering); return; }
    if (!selectedSlot) { setError(t.errorRequiredSlot); return; }
    if (!values.name.trim()) { setError(t.errorRequiredName); return; }
    if (!values.email.trim()) { setError(t.errorRequiredEmail); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/private-session/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "book",
          slot_id: selectedSlot.id,
          offering_id: offeringId,
          client_name: values.name,
          client_email: values.email,
          client_phone: values.phone || null,
          client_note: values.note || null,
          language: locale,
        }),
      });

      const data = await res.json().catch(() => ({}));

      // Slot taken between page load and submit — kick the user back to step 2.
      if (res.status === 409 || data?.error === "slot_unavailable") {
        setError(t.errorSlotTaken);
        setSelectedSlot(null);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Submission failed");

      setSuccess({
        kind: "booking",
        referenceId: data.reference_id,
        offering: selectedOffering,
        slot: selectedSlot,
      });
      // Pull the confirmation card into the centre of the viewport. Wait a
      // tick so the SuccessCard has actually mounted (its ref is attached on
      // the next paint after this state update).
      setTimeout(() => {
        successRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 60);
    } catch (err) {
      setError(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleWaitlistSubmit(e) {
    e.preventDefault();
    if (!waitlistFor) return;
    setError("");
    setNotice("");
    if (!values.name.trim()) { setError(t.errorRequiredName); return; }
    if (!values.email.trim()) { setError(t.errorRequiredEmail); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/private-session/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "waitlist",
          offering_id: waitlistFor.id,
          client_name: values.name,
          client_email: values.email,
          client_phone: values.phone || null,
          client_note: values.note || null,
          language: locale,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Submission failed");

      setSuccess({
        kind: "waitlist",
        offering: waitlistFor,
        position: data.position || null,
      });
      setTimeout(() => {
        successRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 60);
    } catch (err) {
      setError(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="bg-[#0d0b09] min-h-screen">
      <CompactHero
        practitioner={practitioner}
        t={t}
        locale={locale}
        showAbout={showAbout}
        onToggleAbout={() => setShowAbout((s) => !s)}
      />

      <section className="px-6 py-10 md:py-14">
        <div className="max-w-3xl mx-auto space-y-10 md:space-y-12">
          {/* Success — replaces the whole booking flow. Wrapper carries the
              ref so we can scrollIntoView(center) it after a confirmed
              submission, putting the card in the middle of the viewport
              instead of letting it hide below the hero. */}
          {success && (
            <div ref={successRef}>
              <SuccessCard
                success={success}
                practitioner={practitioner}
                locale={locale}
                t={t}
                onBookAnother={resetForBookAnother}
              />
            </div>
          )}

          {/* Summary chip — appears at its natural position once an offering
              is chosen. Used to be sticky, but that pinned it on top of the
              navbar's logo overhang and felt cluttered. Scrolls with content. */}
          {!success && selectedOffering && !waitlistFor && (
            <SummaryRow
              practitioner={practitioner}
              selectedOffering={selectedOffering}
              selectedSlot={selectedSlot}
              locale={locale}
              t={t}
            />
          )}

          {/* Step 1: offering */}
          {!success && !waitlistFor && (
            <div>
              <StepHeader number={1} label={t.step1Label} complete={!!offeringId} />
              {offerings.length === 0 ? (
                <p className="text-[#a09488] text-sm">No sessions on offer yet.</p>
              ) : (
                <OfferingPicker
                  offerings={offerings}
                  selectedId={offeringId}
                  onSelect={chooseOffering}
                  onWaitlist={(o) => {
                    setWaitlistFor(o);
                    setOfferingId(null);
                    setSelectedDate(null);
                    setSelectedSlot(null);
                  }}
                  t={t}
                />
              )}
            </div>
          )}

          {/* Step 2: calendar + times.
              scroll-mt-* matches the CompactHero / TopBanner top padding so the
              auto-scroll lands the heading cleanly below the global navbar's
              logo overhang — otherwise the first available date sits under the
              logo and reads as a misclick into Home. */}
          {!success && !waitlistFor && (
            <div ref={step2Ref} className="scroll-mt-28 md:scroll-mt-36 lg:scroll-mt-44">
              <StepHeader number={2} label={t.step2Label} complete={!!selectedSlot} />
              <CalendarPicker
                enabled={!!offeringId}
                slotsForOffering={slotsForOffering}
                selectedDate={selectedDate}
                selectedSlotId={selectedSlot?.id}
                onPickDate={pickDate}
                onPickSlot={pickSlot}
                locale={locale}
                t={t}
              />
            </div>
          )}

          {/* Step 3: client details — same scroll-mt rationale as step 2. */}
          {!success && !waitlistFor && (
            <div ref={step3Ref} className="scroll-mt-28 md:scroll-mt-36 lg:scroll-mt-44">
              <StepHeader number={3} label={t.step3Label} complete={false} />
              <DetailsForm
                enabled={!!selectedSlot}
                values={values}
                setValue={updateValue}
                onSubmit={handleSubmit}
                submitting={submitting}
                error={error}
                notice={notice}
                t={t}
              />
            </div>
          )}

          {/* Waitlist mode — replaces the whole booking surface */}
          {!success && waitlistFor && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-[#ff914d] mb-1">
                    {t.waitlistCta}
                  </div>
                  <h2 className="font-cormorant text-2xl italic text-[#f0ebe3]">
                    {waitlistFor.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setWaitlistFor(null);
                    setError("");
                    setNotice("");
                  }}
                  className="px-4 py-2 rounded-full border border-white/10 text-[10px] tracking-[0.25em] uppercase text-[#d8cfc1] hover:bg-white/[0.05] transition"
                >
                  ← Back
                </button>
              </div>
              <DetailsForm
                enabled
                values={values}
                setValue={updateValue}
                onSubmit={handleWaitlistSubmit}
                submitting={submitting}
                error={error}
                notice={notice}
                t={t}
              />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
