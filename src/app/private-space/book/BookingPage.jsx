"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { DayPicker } from "react-day-picker";
import { is as isLocale, enGB } from "date-fns/locale";
import "react-day-picker/style.css";
import "./day-picker-overrides.css";

import { BOOK_COPY } from "./copy";
import {
  BOOKING_TYPES,
  applyPromo,
  calculateSubtotal,
  formatIsk,
  getHalfDayBlocks,
} from "@/lib/private-space/pricing";

const DEFAULT_HOUR_OPTIONS = Array.from({ length: 14 }, (_, i) => 8 + i); // 08:00 – 21:00
const DURATION_OPTIONS = [2, 3, 4, 5, 6, 7, 8];

function pad(n) {
  return String(n).padStart(2, "0");
}

function combineDateTime(date, hour, minute = 0) {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children }) {
  return (
    <label className="block text-[10px] uppercase tracking-[0.25em] text-[#a09488] mb-2">
      {children}
    </label>
  );
}

function SectionHeader({ children }) {
  return (
    <h3 className="font-cormorant text-2xl italic text-[#ff914d] mb-6 pb-3 border-b border-white/10">
      {children}
    </h3>
  );
}

function BookingTypeCard({ type, active, label, hint, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-5 rounded-2xl border transition-all ${
        active
          ? "border-[#ff914d] bg-[#ff914d]/10"
          : "border-white/10 bg-white/[0.02] hover:border-white/30"
      }`}
    >
      <div className={`text-sm font-semibold mb-1 ${active ? "text-[#ff914d]" : "text-[#f0ebe3]"}`}>
        {label}
      </div>
      <div className="text-xs text-[#a09488]">{hint}</div>
    </button>
  );
}

function HourPicker({ value, onChange, hours = DEFAULT_HOUR_OPTIONS, blockedHours = [] }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
      {hours.map((h) => {
        const blocked = blockedHours.includes(h);
        const active = value === h;
        return (
          <button
            key={h}
            type="button"
            onClick={() => !blocked && onChange(h)}
            disabled={blocked}
            className={`py-2.5 rounded-lg text-sm tabular-nums transition ${
              blocked
                ? "bg-white/[0.02] text-white/20 line-through cursor-not-allowed"
                : active
                ? "bg-[#ff914d] text-[#160f0a] font-semibold"
                : "bg-white/[0.04] text-[#d8cfc1] hover:bg-white/[0.08]"
            }`}
          >
            {pad(h)}:00
          </button>
        );
      })}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function BookingPage({ locale = "en" }) {
  const t = BOOK_COPY[locale] || BOOK_COPY.en;
  const dpLocale = locale === "is" ? isLocale : enGB;

  // Form state
  const [bookingType, setBookingType] = useState(BOOKING_TYPES.HOURLY);
  const [date, setDate] = useState(undefined);
  const [startHour, setStartHour] = useState(null);
  const [durationHours, setDurationHours] = useState(2);
  const [halfDayBlock, setHalfDayBlock] = useState("morning");
  const [recurringWeekday, setRecurringWeekday] = useState(1);
  const [recurringStartHour, setRecurringStartHour] = useState(18);
  const [hoursPerWeek, setHoursPerWeek] = useState(2);
  const [practiceType, setPracticeType] = useState("therapy");
  const [practiceDescription, setPracticeDescription] = useState("");
  const [groupSize, setGroupSize] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [promoCode, setPromoCode] = useState("");

  // Availability
  const [unavailableDates, setUnavailableDates] = useState([]); // Date[] (start of day)
  const [busyHoursForDate, setBusyHoursForDate] = useState([]); // number[]
  const [_loadingMonth, setLoadingMonth] = useState(false);
  const [month, setMonth] = useState(new Date());

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(null); // { reference_id }

  // Fetch availability for visible month
  useEffect(() => {
    let cancelled = false;
    const year = month.getFullYear();
    const m = month.getMonth() + 1;
    setLoadingMonth(true);
    fetch(`/api/private-space/availability?year=${year}&month=${m}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const fullyBooked = (data.fullyBooked || []).map((s) => new Date(s));
        setUnavailableDates(fullyBooked);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoadingMonth(false));
    return () => { cancelled = true; };
  }, [month]);

  // Fetch busy hours for the selected date
  useEffect(() => {
    let cancelled = false;
    if (!date) { setBusyHoursForDate([]); return; }
    const iso = date.toISOString().slice(0, 10);
    fetch(`/api/private-space/availability?date=${iso}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setBusyHoursForDate(data.busyHours || []);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [date]);

  // Pricing
  const { subtotalIsk, breakdown } = useMemo(
    () => calculateSubtotal({
      bookingType,
      durationHours: bookingType === BOOKING_TYPES.HOURLY ? durationHours : 0,
      recurringHoursPerWeek: bookingType === BOOKING_TYPES.RECURRING_WEEKLY ? hoursPerWeek : 0,
    }),
    [bookingType, durationHours, hoursPerWeek]
  );
  const promo = useMemo(() => applyPromo(subtotalIsk, promoCode), [subtotalIsk, promoCode]);
  const isRecurring = bookingType === BOOKING_TYPES.RECURRING_WEEKLY;

  // Submit
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");

    if (!isRecurring && !date) { setSubmitError(t.errors.pickDate); return; }
    if (bookingType === BOOKING_TYPES.HOURLY && startHour == null) { setSubmitError(t.errors.pickTime); return; }
    if (!name.trim() || !email.trim()) { setSubmitError(t.errors.missingContact); return; }

    // Build start_at / end_at
    let start_at, end_at;
    if (bookingType === BOOKING_TYPES.HOURLY) {
      start_at = combineDateTime(date, startHour, 0).toISOString();
      end_at = combineDateTime(date, startHour + durationHours, 0).toISOString();
    } else if (bookingType === BOOKING_TYPES.HALF_DAY) {
      const block = getHalfDayBlocks().find((b) => b.id === halfDayBlock);
      start_at = combineDateTime(date, block.startHour, 0).toISOString();
      end_at = combineDateTime(date, block.endHour, 0).toISOString();
    } else if (bookingType === BOOKING_TYPES.FULL_DAY) {
      start_at = combineDateTime(date, 8, 0).toISOString();
      end_at = combineDateTime(date, 22, 0).toISOString();
    } else if (bookingType === BOOKING_TYPES.RECURRING_WEEKLY) {
      // Use next occurrence of selected weekday
      const next = nextWeekday(recurringWeekday);
      start_at = combineDateTime(next, recurringStartHour, 0).toISOString();
      end_at = combineDateTime(next, recurringStartHour + hoursPerWeek, 0).toISOString();
    }

    const payload = {
      booking_type: bookingType,
      start_at,
      end_at,
      practice_type: practiceType,
      practice_description: practiceDescription,
      group_size: groupSize,
      contact_name: name,
      contact_email: email,
      contact_phone: phone,
      promo_code: promoCode || null,
      language: locale,
      // Recurring extras
      recurrence_weekday: isRecurring ? recurringWeekday : null,
      recurrence_start_time: isRecurring ? `${pad(recurringStartHour)}:00` : null,
      recurrence_duration_minutes: isRecurring ? hoursPerWeek * 60 : null,
      // Hourly extras
      duration_hours: bookingType === BOOKING_TYPES.HOURLY ? durationHours : null,
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/private-space/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submit failed");
      setSubmitted({ reference_id: data.reference_id });
    } catch (err) {
      setSubmitError(err.message || t.errors.submitFailed);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#0d0b09] flex items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
            <span className="text-xs uppercase tracking-[0.35em] text-[#ff914d]">
              {submitted.reference_id}
            </span>
            <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/50" />
          </div>
          <h1
            className="font-cormorant font-light italic text-[#f0ebe3] mb-6"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
          >
            {t.success.title}
          </h1>
          <p className="text-[#a09488] text-base md:text-lg mb-10 leading-relaxed">
            {t.success.body}
          </p>
          <Link
            href={locale === "is" ? "/is/private-space" : "/private-space"}
            className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/25 text-[#f0ebe3] text-xs tracking-[0.25em] uppercase rounded-full hover:bg-white/10 hover:border-white/40 transition-all duration-200"
          >
            {t.success.backHome}
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d0b09] py-20 md:py-28 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
            <span className="text-xs uppercase tracking-[0.35em] text-[#ff914d]">
              {t.eyebrow}
            </span>
            <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/50" />
          </div>
          <h1
            className="font-cormorant font-light italic text-[#f0ebe3] mb-5"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
          >
            {t.title}
          </h1>
          <p className="text-[#a09488] text-base md:text-lg max-w-xl mx-auto">{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Form column */}
          <div className="space-y-8">
            {/* 1 · Booking type */}
            <div className="p-6 md:p-8 rounded-3xl bg-white/[0.02] border border-white/10">
              <SectionHeader>{t.sections.bookingType}</SectionHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(t.bookingTypes).map(([key, v]) => (
                  <BookingTypeCard
                    key={key}
                    type={key}
                    active={bookingType === key}
                    label={v.label}
                    hint={v.hint}
                    onClick={() => setBookingType(key)}
                  />
                ))}
              </div>

              {/* Hourly: duration */}
              {bookingType === BOOKING_TYPES.HOURLY && (
                <div className="mt-6">
                  <FieldLabel>{t.fields.durationHours}</FieldLabel>
                  <div className="grid grid-cols-7 gap-2">
                    {DURATION_OPTIONS.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setDurationHours(h)}
                        className={`py-2.5 rounded-lg text-sm tabular-nums transition ${
                          durationHours === h
                            ? "bg-[#ff914d] text-[#160f0a] font-semibold"
                            : "bg-white/[0.04] text-[#d8cfc1] hover:bg-white/[0.08]"
                        }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Half-day blocks */}
              {bookingType === BOOKING_TYPES.HALF_DAY && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {getHalfDayBlocks().map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setHalfDayBlock(b.id)}
                      className={`p-3 rounded-lg text-sm transition ${
                        halfDayBlock === b.id
                          ? "bg-[#ff914d] text-[#160f0a] font-semibold"
                          : "bg-white/[0.04] text-[#d8cfc1] hover:bg-white/[0.08]"
                      }`}
                    >
                      {b.label[locale] || b.label.en}
                    </button>
                  ))}
                </div>
              )}

              {/* Recurring: weekday + start time + hours/week */}
              {bookingType === BOOKING_TYPES.RECURRING_WEEKLY && (
                <div className="mt-6 space-y-5">
                  <div>
                    <FieldLabel>{t.fields.weekday}</FieldLabel>
                    <div className="grid grid-cols-7 gap-1.5">
                      {t.weekdays.map((wd, i) => (
                        <button
                          key={wd}
                          type="button"
                          onClick={() => setRecurringWeekday(i)}
                          className={`py-2 rounded-md text-[10px] uppercase tracking-wider ${
                            recurringWeekday === i
                              ? "bg-[#ff914d] text-[#160f0a] font-semibold"
                              : "bg-white/[0.04] text-[#d8cfc1] hover:bg-white/[0.08]"
                          }`}
                        >
                          {wd.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <FieldLabel>{t.fields.startTime}</FieldLabel>
                    <HourPicker value={recurringStartHour} onChange={setRecurringStartHour} />
                  </div>
                  <div>
                    <FieldLabel>{t.fields.hoursPerWeek}</FieldLabel>
                    <div className="grid grid-cols-4 gap-2 max-w-xs">
                      {[2, 3, 4].map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setHoursPerWeek(h)}
                          className={`py-2.5 rounded-lg text-sm tabular-nums ${
                            hoursPerWeek === h
                              ? "bg-[#ff914d] text-[#160f0a] font-semibold"
                              : "bg-white/[0.04] text-[#d8cfc1] hover:bg-white/[0.08]"
                          }`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2 · Date (skipped for recurring) */}
            {!isRecurring && (
              <div className="p-6 md:p-8 rounded-3xl bg-white/[0.02] border border-white/10">
                <SectionHeader>{t.sections.date}</SectionHeader>
                <div className="flex justify-center">
                  <DayPicker
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    month={month}
                    onMonthChange={setMonth}
                    locale={dpLocale}
                    weekStartsOn={1}
                    fromDate={new Date()}
                    disabled={[{ before: new Date() }, ...unavailableDates]}
                    modifiers={{ booked: unavailableDates }}
                    modifiersClassNames={{ booked: "rdp-day-booked" }}
                    classNames={{
                      day_selected: "rdp-day-selected",
                      day_today: "rdp-day-today",
                    }}
                  />
                </div>
              </div>
            )}

            {/* 3 · Time of day (hourly only) */}
            {bookingType === BOOKING_TYPES.HOURLY && date && (
              <div className="p-6 md:p-8 rounded-3xl bg-white/[0.02] border border-white/10">
                <SectionHeader>{t.sections.time}</SectionHeader>
                <HourPicker
                  value={startHour}
                  onChange={setStartHour}
                  blockedHours={busyHoursForDate}
                />
              </div>
            )}

            {/* 4 · Details */}
            <div className="p-6 md:p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-5">
              <SectionHeader>{t.sections.details}</SectionHeader>

              <div>
                <FieldLabel>{t.fields.practiceType}</FieldLabel>
                <select
                  value={practiceType}
                  onChange={(e) => setPracticeType(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-[#f0ebe3] focus:border-[#ff914d] outline-none"
                >
                  {t.practiceOptions.map((o) => (
                    <option key={o.value} value={o.value} className="bg-[#160f0a]">
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>{t.fields.groupSize}</FieldLabel>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={groupSize}
                    onChange={(e) => setGroupSize(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                    className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-[#f0ebe3] focus:border-[#ff914d] outline-none"
                  />
                </div>
              </div>

              <div>
                <FieldLabel>{t.fields.practiceDescription}</FieldLabel>
                <textarea
                  rows={3}
                  value={practiceDescription}
                  onChange={(e) => setPracticeDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-[#f0ebe3] focus:border-[#ff914d] outline-none resize-none"
                  placeholder=""
                />
              </div>
            </div>

            {/* 5 · Contact */}
            <div className="p-6 md:p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-5">
              <SectionHeader>{t.sections.contact}</SectionHeader>

              <div>
                <FieldLabel>{t.fields.name}</FieldLabel>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-[#f0ebe3] focus:border-[#ff914d] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>{t.fields.email}</FieldLabel>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-[#f0ebe3] focus:border-[#ff914d] outline-none"
                  />
                </div>
                <div>
                  <FieldLabel>{t.fields.phone}</FieldLabel>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-[#f0ebe3] focus:border-[#ff914d] outline-none"
                  />
                </div>
              </div>

              <div>
                <FieldLabel>{t.sections.promo}</FieldLabel>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="WELCOME15"
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-[#f0ebe3] focus:border-[#ff914d] outline-none uppercase tracking-wider"
                />
              </div>
            </div>
          </div>

          {/* Summary column */}
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="p-6 md:p-8 rounded-3xl bg-white/[0.04] border border-[#ff914d]/30">
              <h3 className="font-cormorant text-2xl italic text-[#ff914d] mb-5 pb-3 border-b border-white/10">
                {t.sections.summary}
              </h3>

              <div className="text-xs text-[#a09488] mb-3">{breakdown}</div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[#d8cfc1]">
                  <span>{t.summary.subtotal}</span>
                  <span className="tabular-nums">{formatIsk(subtotalIsk)}</span>
                </div>
                {promo.applied && promo.discountIsk > 0 && (
                  <div className="flex justify-between text-[#ff914d]">
                    <span>{t.summary.discount}</span>
                    <span className="tabular-nums">−{formatIsk(promo.discountIsk)}</span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-3 mt-3 flex justify-between items-baseline">
                  <span className="text-[#f0ebe3] text-base">{t.summary.total}</span>
                  <span className="font-cormorant text-2xl text-[#ff914d] tabular-nums">
                    {formatIsk(promo.totalIsk)}
                    {isRecurring && (
                      <span className="text-xs text-[#a09488] ml-1 font-sans">{t.summary.monthly}</span>
                    )}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#a09488] mt-5 leading-relaxed">{t.summary.pendingNote}</p>

              {submitError && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-200 text-xs">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || subtotalIsk === 0}
                className="mt-6 w-full py-4 rounded-full bg-[#ff914d] text-[#160f0a] text-xs tracking-[0.25em] uppercase font-semibold hover:bg-[#ffa566] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t.fields.submitting : t.fields.submit}
              </button>

              <p className="text-[10px] text-[#7a6d5e] mt-5 leading-relaxed">{t.legal}</p>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}

// ── helpers ──────────────────────────────────────────────────────────────────
function nextWeekday(weekday) {
  // weekday: 0=Mon..6=Sun
  const d = new Date();
  const today = (d.getDay() + 6) % 7; // Mon=0..Sun=6
  let diff = weekday - today;
  if (diff <= 0) diff += 7;
  d.setDate(d.getDate() + diff);
  return d;
}
