"use client";

import React from "react";
import { formatInTimeZone } from "date-fns-tz";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

export default function Event({ event }) {
  const { slug } = useParams();
  const { language } = useLanguage();
  const icelandTimeZone = "Atlantic/Reykjavik";

  const translations = {
    en: {
      eventNotFound: "Event Not Found",
      goBack: "← Back to events",
      hour: "hour",
      hours: "hours",
      facebookEvent: "Facebook Event",
      soldOut: "Sold out",
      eventEnded: "Event ended",
      buyTicket: "Buy Ticket",
      reserveSpot: "Reserve My Spot",
      time: "Time",
      duration: "Duration",
      location: "Location",
      price: "Price",
      earlyBird: "Early Bird",
      until: "Until",
      priceVariants: "Price Variants",
    },
    is: {
      eventNotFound: "Viðburður fannst ekki",
      goBack: "← Til baka",
      hour: "Klst",
      hours: "Klst",
      facebookEvent: "Facebook Viðburður",
      soldOut: "Uppselt",
      eventEnded: "Viðburði lokið",
      buyTicket: "Kaupa miða",
      reserveSpot: "Taka frá pláss",
      time: "Tími",
      duration: "Lengd",
      location: "Staðs",
      price: "Verð",
      earlyBird: "Early Bird",
      until: "Til",
      priceVariants: "Verðbreytur",
    },
  };

  const t = translations[language];

  const isEarlyBirdValid = () => {
    if (!event.early_bird_price || !event.early_bird_date) return false;
    return new Date() < new Date(event.early_bird_date);
  };

  const isSoldOut = event.sold_out === true;
  const eventStart = new Date(event.date);
  const eventEnd = new Date(
    eventStart.getTime() + (event.duration || 2) * 60 * 60 * 1000
  );
  const isPastEvent = eventEnd <= new Date();
  const isTicketUnavailable = isSoldOut || isPastEvent;
  const unavailableLabel = isPastEvent ? t.eventEnded : t.soldOut;

  const durationLabel = event.duration
    ? `${Number(event.duration) % 1 === 0 ? event.duration : parseFloat(event.duration).toFixed(1)} ${Number(event.duration) === 1 ? t.hour : t.hours}`
    : null;

  const locationLabel = event.location || "Bankastræti 2, 101 Reykjavik";

  // Shared CTA button
  const CtaButton = ({ size = "md" }) => {
    const base =
      size === "lg"
        ? "inline-flex items-center justify-center w-full px-8 py-4 text-sm font-medium tracking-[0.15em] uppercase rounded-full transition-colors duration-200"
        : "inline-flex items-center justify-center px-6 py-2.5 text-xs font-medium tracking-[0.15em] uppercase rounded-full transition-colors duration-200";

    if (isTicketUnavailable) {
      return (
        <span className={`${base} bg-[#f0ebe3]/[0.05] text-[#7a6a5a] border border-[#f0ebe3]/[0.08] cursor-not-allowed opacity-60`}>
          {unavailableLabel}
        </span>
      );
    }
    return (
      <Link
        href={`/events/${slug}/ticket`}
        className={`${base} bg-[#ff914d] text-black hover:bg-[#ff7a2e]`}
      >
        {event.payment === "online" ? t.buyTicket : t.reserveSpot}
      </Link>
    );
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-[#1a1208] flex items-center justify-center px-6" data-navbar-theme="dark">
        <div className="text-center">
          <p className="font-cormorant italic text-[#f0ebe3] text-3xl mb-6">{t.eventNotFound}</p>
          <Link href="/events" className="text-xs uppercase tracking-[0.3em] text-[#ff914d] hover:text-[#ff7a2e]">
            {t.goBack}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1208]" data-navbar-theme="dark">

      {/* ── Poster / artwork — full graphic, capped width on large screens ── */}
      <div className="w-full bg-[#1a1208]">
        <div className="mx-auto w-full max-w-4xl px-4 pt-20 sm:px-6 sm:pt-24 md:pt-28">
          <img
            src={event.image || "https://placehold.co/1600x900"}
            alt=""
            className="mx-auto block h-auto w-full max-w-full"
          />
          {/* Heading for outline/SEO; artwork usually carries the visible title */}
          <h1 className="sr-only">{event.name}</h1>
        </div>
      </div>

      {/* ── Meta strip — visible quick facts + CTA ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex justify-center px-6 pt-6 pb-8"
      >
        <div className="inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 rounded-xl border border-[#f0ebe3]/[0.08] bg-[#f0ebe3]/[0.03] px-6 py-4">
          <span className="flex items-center gap-2 text-sm text-[#c8bdb0]">
            <svg className="w-4 h-4 text-[#ff914d]/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatInTimeZone(new Date(event.date), icelandTimeZone, "MMMM d · h:mm a")}
          </span>
          {durationLabel && (
            <span className="flex items-center gap-2 text-sm text-[#c8bdb0]">
              <svg className="w-4 h-4 text-[#ff914d]/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {durationLabel}
            </span>
          )}
          <span className="flex items-center gap-2 text-sm text-[#c8bdb0]">
            <svg className="w-4 h-4 text-[#ff914d]/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {locationLabel}
          </span>
          {event.facebook_link && (
            <a
              href={event.facebook_link}
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

          {/* CTA — mobile only; full-width row, centered on both axes */}
          <div className="flex w-full shrink-0 basis-full items-center justify-center py-0.5 lg:hidden">
            <CtaButton />
          </div>
        </div>
      </motion.div>

      {/* ── Main content ── */}
      <div className="max-w-5xl mx-auto px-6 pb-24">
        <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-12 lg:items-start">

          {/* Left — description */}
          <div>
            <div className="h-px bg-gradient-to-r from-transparent via-[#f0ebe3]/[0.07] to-transparent mb-8 hidden lg:block" />

            <p className="text-[#a09488] text-base leading-relaxed whitespace-pre-wrap mb-12">
              {event.description}
            </p>
          </div>

          {/* Right — sticky details card */}
          <div className="hidden lg:block lg:sticky lg:top-28 lg:self-start mt-0">
            <DetailsCard
              event={event}
              slug={slug}
              t={t}
              icelandTimeZone={icelandTimeZone}
              isEarlyBirdValid={isEarlyBirdValid}
              isSoldOut={isSoldOut}
              isTicketUnavailable={isTicketUnavailable}
              unavailableLabel={unavailableLabel}
              durationLabel={durationLabel}
              locationLabel={locationLabel}
              CtaButton={CtaButton}
            />
          </div>
        </div>

        {/* Mobile-only details card */}
        <div className="lg:hidden mt-10">
          <DetailsCard
            event={event}
            slug={slug}
            t={t}
            icelandTimeZone={icelandTimeZone}
            isEarlyBirdValid={isEarlyBirdValid}
            isSoldOut={isSoldOut}
            isTicketUnavailable={isTicketUnavailable}
            unavailableLabel={unavailableLabel}
            durationLabel={durationLabel}
            locationLabel={locationLabel}
            CtaButton={CtaButton}
          />
        </div>
      </div>
    </div>
  );
}

// Extracted details card — used in both desktop sticky column and mobile
function DetailsCard({ event, slug, t, icelandTimeZone, isEarlyBirdValid, isSoldOut, isTicketUnavailable, unavailableLabel, durationLabel, locationLabel, CtaButton }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border border-[#f0ebe3]/[0.08] bg-[#f0ebe3]/[0.03] overflow-hidden"
    >
      {/* Card header */}
      <div className="flex min-h-[4.5rem] items-center justify-center border-b border-[#f0ebe3]/[0.06] px-6 py-5">
        <CtaButton />
      </div>

      {/* Detail rows */}
      <div className="px-6 py-5 space-y-4">
        {/* Time */}
        <div className="flex items-start gap-3">
          <svg className="w-4 h-4 text-[#ff914d]/50 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#7a6a5a] mb-0.5">{t.time}</div>
            <div className="text-sm text-[#d4c9bc]">
              {formatInTimeZone(new Date(event.date), icelandTimeZone, "MMMM d · h:mm a")}
            </div>
          </div>
        </div>

        {/* Duration */}
        {durationLabel && (
          <div className="flex items-start gap-3">
            <svg className="w-4 h-4 text-[#ff914d]/50 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#7a6a5a] mb-0.5">{t.duration}</div>
              <div className="text-sm text-[#d4c9bc]">{durationLabel}</div>
            </div>
          </div>
        )}

        {/* Location */}
        <div className="flex items-start gap-3">
          <svg className="w-4 h-4 text-[#ff914d]/50 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#7a6a5a] mb-0.5">{t.location}</div>
            <div className="text-sm text-[#d4c9bc]">{locationLabel}</div>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-start gap-3">
          <svg className="w-4 h-4 text-[#ff914d]/50 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#7a6a5a] mb-0.5">{t.price}</div>
            {isEarlyBirdValid() ? (
              <div className="flex flex-col gap-0.5">
                <span className={`text-xs text-[#7a6a5a] line-through ${isSoldOut ? "text-red-400/60" : ""}`}>
                  {event.price} ISK
                </span>
                <span className={`text-sm text-emerald-400/90 ${isSoldOut ? "line-through text-red-400/60" : ""}`}>
                  {event.early_bird_price} ISK ({t.earlyBird})
                </span>
                <span className="text-xs text-[#7a6a5a]">
                  {t.until} {formatInTimeZone(new Date(event.early_bird_date), icelandTimeZone, "MMMM d, h:mm a")}
                </span>
                {isSoldOut && <span className="text-xs text-red-400 font-medium uppercase tracking-wider">{t.soldOut}</span>}
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                <span className={`text-sm text-[#ff914d] ${isSoldOut ? "line-through text-red-400/60" : ""}`}>
                  {event.price} ISK
                </span>
                {isSoldOut && <span className="text-xs text-red-400 font-medium uppercase tracking-wider">{t.soldOut}</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ticket variants */}
      {event.ticket_variants && event.ticket_variants.length > 0 && (
        <div className="px-6 pb-6 pt-1 border-t border-[#f0ebe3]/[0.05]">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#7a6a5a] mb-3 pt-4">{t.priceVariants}</div>
          <div className="space-y-2">
            {event.ticket_variants.map((variant) => (
              <div key={variant.id} className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-[#ff914d]/15 bg-[#ff914d]/[0.03]">
                <span className="text-sm text-[#d4c9bc]">{variant.name}</span>
                <span className={`text-sm text-[#ff914d] ${isSoldOut ? "line-through" : ""}`}>
                  {variant.price} ISK
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
