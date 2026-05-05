"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatInTimeZone } from "date-fns-tz";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * Series — public view for a recurring event under one persistent URL.
 *
 * UX intent (the part Mama cares about most): make the most-likely
 * action — "book the next session" — a single click. Keep the date
 * picker available but tucked behind a toggle so the page doesn't
 * feel like a list of choices to wade through.
 *
 * Props:
 *   series     row from event_series
 *   instances  upcoming events rows (already filtered + sorted asc by date)
 *              each augmented with sold_out / ticketsSold by the page resolver
 */
export default function Series({ series, instances = [] }) {
  const { language } = useLanguage();
  const icelandTimeZone = "Atlantic/Reykjavik";
  const [showAllDates, setShowAllDates] = useState(false);

  const t =
    language === "is"
      ? {
          backToEvents: "← Til baka",
          nextSession: "Næsta skipti",
          bookThisSession: "Bóka þetta skipti",
          pickAnotherDate: "Velja annan dag",
          hideDates: "Fela dagsetningar",
          allUpcoming: "Allar væntanlegar dagsetningar",
          soldOut: "Uppselt",
          eventEnded: "Lokið",
          noUpcoming: "Engin væntanleg skipti — kíktu aftur seinna",
          location: "Staðs",
          time: "Tími",
          duration: "Lengd",
          hour: "klst",
          hours: "klst",
          recurrence: "Tíðni",
          price: "Verð",
          facebookEvent: "Facebook viðburður",
        }
      : {
          backToEvents: "← Back to events",
          nextSession: "Next session",
          bookThisSession: "Book this session",
          pickAnotherDate: "Pick another date",
          hideDates: "Hide dates",
          allUpcoming: "All upcoming dates",
          soldOut: "Sold out",
          eventEnded: "Ended",
          noUpcoming: "No upcoming sessions — check back soon",
          location: "Location",
          time: "Time",
          duration: "Duration",
          hour: "hour",
          hours: "hours",
          recurrence: "Cadence",
          price: "Price",
          facebookEvent: "Facebook event",
        };

  // The "next" instance is just the first row in the already-sorted
  // upcoming list. The resolver page is responsible for filtering past
  // sessions and sort order, so this stays simple.
  const nextInstance = instances[0] || null;
  const restInstances = instances.slice(1);

  const locationLabel =
    series.location || nextInstance?.location || "Bankastræti 2, 101 Reykjavik";

  const durationHours = useMemo(() => {
    const candidate = series.default_duration ?? nextInstance?.duration;
    if (!candidate) return null;
    const value = Number(candidate);
    if (Number.isNaN(value)) return null;
    return value;
  }, [series.default_duration, nextInstance]);

  const durationLabel = durationHours
    ? `${durationHours % 1 === 0 ? durationHours : durationHours.toFixed(1)} ${durationHours === 1 ? t.hour : t.hours}`
    : null;

  const priceLabel = useMemo(() => {
    const price = series.default_price ?? nextInstance?.price;
    if (!price && price !== 0) return null;
    return `${price} ISK`;
  }, [series.default_price, nextInstance]);

  return (
    <div className="min-h-screen bg-[#1a1208]" data-navbar-theme="dark">
      {/* Poster */}
      <div className="w-full bg-[#1a1208]">
        <div className="mx-auto w-full max-w-4xl px-4 pt-20 sm:px-6 sm:pt-24 md:pt-28">
          <Image
            src={series.image || "https://placehold.co/1600x900"}
            alt={series.name || ""}
            width={1600}
            height={900}
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="mx-auto block h-auto w-full max-w-full"
            style={{ width: "100%", height: "auto" }}
          />
          <h1 className="sr-only">{series.name}</h1>
        </div>
      </div>

      {/* Quick-fact strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex justify-center px-6 pt-6 pb-2"
      >
        <div className="inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 rounded-xl border border-[#f0ebe3]/[0.08] bg-[#f0ebe3]/[0.03] px-6 py-4">
          {series.recurrence_label && (
            <span className="flex items-center gap-2 text-sm text-[#c8bdb0]">
              <svg
                className="w-4 h-4 text-[#ff914d]/60 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {series.recurrence_label}
            </span>
          )}
          {durationLabel && (
            <span className="flex items-center gap-2 text-sm text-[#c8bdb0]">
              <svg
                className="w-4 h-4 text-[#ff914d]/60 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {durationLabel}
            </span>
          )}
          <span className="flex items-center gap-2 text-sm text-[#c8bdb0]">
            <svg
              className="w-4 h-4 text-[#ff914d]/60 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {locationLabel}
          </span>
          {series.facebook_link && (
            <a
              href={series.facebook_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#ff914d]/70 hover:text-[#ff914d] transition-colors"
            >
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              {t.facebookEvent}
            </a>
          )}
        </div>
      </motion.div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-6 pb-24 pt-6">
        <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-12 lg:items-start">
          {/* Left — description */}
          <div>
            <p className="text-[#a09488] text-base leading-relaxed whitespace-pre-wrap mb-12">
              {series.description}
            </p>
          </div>

          {/* Right — booking column (desktop sticky) */}
          <div className="hidden lg:block lg:sticky lg:top-28 lg:self-start mt-0">
            <BookingCard
              series={series}
              nextInstance={nextInstance}
              restInstances={restInstances}
              showAllDates={showAllDates}
              setShowAllDates={setShowAllDates}
              icelandTimeZone={icelandTimeZone}
              t={t}
              priceLabel={priceLabel}
            />
          </div>
        </div>

        {/* Mobile booking card */}
        <div className="lg:hidden mt-6">
          <BookingCard
            series={series}
            nextInstance={nextInstance}
            restInstances={restInstances}
            showAllDates={showAllDates}
            setShowAllDates={setShowAllDates}
            icelandTimeZone={icelandTimeZone}
            t={t}
            priceLabel={priceLabel}
          />
        </div>
      </div>
    </div>
  );
}

function BookingCard({
  series,
  nextInstance,
  restInstances,
  showAllDates,
  setShowAllDates,
  icelandTimeZone,
  t,
  priceLabel,
}) {
  if (!nextInstance) {
    return (
      <div className="rounded-xl border border-[#f0ebe3]/[0.08] bg-[#f0ebe3]/[0.03] px-6 py-8 text-center">
        <p className="text-sm text-[#a09488]">{t.noUpcoming}</p>
        <Link
          href="/events"
          className="mt-4 inline-block text-xs uppercase tracking-[0.3em] text-[#ff914d] hover:text-[#ff7a2e]"
        >
          {t.backToEvents}
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border border-[#f0ebe3]/[0.08] bg-[#f0ebe3]/[0.03] overflow-hidden"
    >
      {/* Hero CTA — single most likely action: book the next session */}
      <div className="px-6 py-6 border-b border-[#f0ebe3]/[0.06]">
        <div className="text-[10px] uppercase tracking-[0.3em] text-[#7a6a5a] mb-2">
          {t.nextSession}
        </div>
        <div className="text-[#d4c9bc] text-sm mb-4">
          {formatInTimeZone(
            new Date(nextInstance.date),
            icelandTimeZone,
            "EEEE, MMMM d · h:mm a"
          )}
        </div>
        <BookButton instance={nextInstance} t={t} primary />
        {priceLabel && (
          <div className="text-xs text-[#a09488] mt-3 text-center">
            {priceLabel}
          </div>
        )}
      </div>

      {/* Toggle for the rest of the dates — keeps the page calm by default */}
      {restInstances.length > 0 && (
        <div className="px-6 py-4">
          <button
            type="button"
            onClick={() => setShowAllDates((v) => !v)}
            className="w-full text-xs uppercase tracking-[0.25em] text-[#ff914d]/80 hover:text-[#ff914d] transition-colors py-2"
          >
            {showAllDates ? t.hideDates : t.pickAnotherDate}
          </button>

          {showAllDates && (
            <div className="mt-3 space-y-2">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#7a6a5a] mb-2">
                {t.allUpcoming}
              </div>
              {restInstances.map((inst) => (
                <DateRow
                  key={inst.id}
                  instance={inst}
                  t={t}
                  icelandTimeZone={icelandTimeZone}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function DateRow({ instance, t, icelandTimeZone }) {
  const isSoldOut = instance.sold_out === true;
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-[#ff914d]/15 bg-[#ff914d]/[0.03]">
      <span className="text-sm text-[#d4c9bc]">
        {formatInTimeZone(
          new Date(instance.date),
          icelandTimeZone,
          "EEE MMM d · h:mm a"
        )}
      </span>
      {isSoldOut ? (
        <span className="text-[10px] uppercase tracking-[0.2em] text-red-400/80">
          {t.soldOut}
        </span>
      ) : (
        <Link
          href={`/events/${instance.slug}/ticket`}
          className="text-[11px] uppercase tracking-[0.2em] text-[#ff914d] hover:text-[#ff7a2e]"
        >
          {t.bookThisSession} →
        </Link>
      )}
    </div>
  );
}

function BookButton({ instance, t, primary = false }) {
  const isSoldOut = instance.sold_out === true;
  const base =
    "inline-flex items-center justify-center w-full px-6 py-3 text-sm font-medium tracking-[0.15em] uppercase rounded-full transition-colors duration-200";

  if (isSoldOut) {
    return (
      <span
        className={`${base} bg-[#f0ebe3]/[0.05] text-[#7a6a5a] border border-[#f0ebe3]/[0.08] cursor-not-allowed opacity-60`}
      >
        {t.soldOut}
      </span>
    );
  }
  return (
    <Link
      href={`/events/${instance.slug}/ticket`}
      className={`${base} ${
        primary
          ? "bg-[#ff914d] text-black hover:bg-[#ff7a2e]"
          : "bg-[#f0ebe3]/[0.05] text-[#d4c9bc] hover:bg-[#f0ebe3]/[0.1]"
      }`}
    >
      {t.bookThisSession}
    </Link>
  );
}
