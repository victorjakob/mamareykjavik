"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isPast } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import TiltHover3D from "@/app/components/ui/TiltHover3D";
import { useRole } from "@/hooks/useRole";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import dynamic from "next/dynamic";
import { useLanguage } from "@/hooks/useLanguage";
import SummerMarketCard, {
  isSummerMarketSeason,
} from "@/app/events/SummerMarketCard";

const FacebookPostModal = dynamic(
  () => import("@/app/events/FacebookPostModal"),
  {
    ssr: false,
  }
);

export default function EventsList({
  events = [],
  listType = "upcoming",
  showPastEventsLink = false,
  enableLoadMore = false,
  initialVisibleCount = 20,
  loadMoreCount = 20,
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const role = useRole();
  const isAdmin = role === "admin";
  const isHost = role === "host";
  const currentUserEmail = session?.user?.email;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { language } = useLanguage();
  const icelandTimeZone = "Atlantic/Reykjavik";

  const translations = {
    en: {
      noEvents: "No upcoming events found.",
      noPastEvents: "No past events found.",
      duration: "Duration:",
      hour: "hour",
      hours: "hours",
      earlyBird: "Early Bird:",
      until: "Until",
      soldOut: "Sold out",
      slidingScale: "Sliding scale pricing available",
      multiplePricing: "Multiple pricing options available",
      multiplePricingSliding:
        "Multiple pricing options & sliding scale available",
      tickets: "Tickets:",
      share: "Share",
      edit: "Edit",
      facebookSuccess: "Event successfully posted to Facebook!",
      showMore: "Show more events",
      seePastEvents: "See past events",
    },
    is: {
      noEvents: "Engir væntanlegir viðburðir fundust.",
      noPastEvents: "Engir liðnir viðburðir fundust.",
      duration: "Lengd:",
      hour: "Klst",
      hours: "Klst",
      earlyBird: "Early bird:",
      until: "Til",
      soldOut: "Uppselt",
      slidingScale: "Slæðandi verðlagning í boði",
      multiplePricing: "Margar verðlagningar í boði",
      multiplePricingSliding:
        "Margar verðlagningar og slæðandi verðlagning í boði",
      tickets: "Miðar:",
      share: "Deila",
      edit: "Breyta",
      facebookSuccess: "Viðburðurinn var sent á Facebook!",
      showMore: "Sýna fleiri viðburði",
      seePastEvents: "Sjá liðna viðburði",
    },
  };

  const t = translations[language];

  // Helper function to check if user can manage a specific event
  const canManageEvent = (event) => {
    if (isAdmin) return true; // Admins can manage all events
    if (isHost && event.host === currentUserEmail) return true; // Hosts can only manage their own events
    return false;
  };

  const [visibleCount, setVisibleCount] = useState(
    enableLoadMore ? initialVisibleCount : events.length
  );

  useEffect(() => {
    setVisibleCount(enableLoadMore ? initialVisibleCount : events.length);
  }, [enableLoadMore, events.length, initialVisibleCount]);

  const visibleEvents = useMemo(() => {
    if (!enableLoadMore) return events;
    return events.slice(0, visibleCount);
  }, [enableLoadMore, events, visibleCount]);

  // Keep the memoized grouping logic
  const groupedEvents = useMemo(() => {
    return visibleEvents.reduce((acc, event) => {
      const date = formatInTimeZone(
        new Date(event.date),
        icelandTimeZone,
        "yyyy-MM-dd"
      );
      if (!acc[date]) acc[date] = [];
      acc[date].push(event);
      return acc;
    }, {});
  }, [visibleEvents, icelandTimeZone]);

  const showSummerMarket =
    listType === "upcoming" && showPastEventsLink && isSummerMarketSeason();

  // Keep the no events check (but allow Summer Market card when in season)
  if ((!events || events.length === 0) && !showSummerMarket) {
    return (
      <div className="text-center py-24 px-6">
        <p className="text-[#6b5e52] text-lg font-light tracking-wide">
          {listType === "past" ? t.noPastEvents : t.noEvents}
        </p>
      </div>
    );
  }

  // ✅ Render Events
  return (
    <motion.div
      className="w-full px-4 sm:px-6 lg:px-8 pt-8 pb-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.5,
        ease: "easeOut",
      }}
    >
      {showSummerMarket && (
        <ul role="list" className="divide-y divide-[#1a1410]/[0.08]">
          <SummerMarketCard />
        </ul>
      )}

      {Object.entries(groupedEvents).map(([date, dateEvents], dateIndex) => (
        <motion.div
          key={date}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.6,
            ease: "easeOut",
          }}
          className="mb-10"
        >
          {/* Date header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: 0.7,
              ease: "easeOut",
            }}
            className={`flex items-center gap-4 max-w-4xl mx-auto mb-6 ${
              dateIndex > 0 ? "mt-12 pt-10 border-t border-[#1a1410]/[0.08]" : "mt-10"
            }`}
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#ff914d]/40" />
            <span
              className="font-cormorant italic text-[#1a1410] text-center"
              style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)" }}
            >
              {formatInTimeZone(
                new Date(`${date}T00:00:00Z`),
                icelandTimeZone,
                "EEE — MMMM d"
              )}
            </span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#ff914d]/25" />
          </motion.div>

          {/* Events for this date */}
          <ul role="list" className="space-y-4">
            {dateEvents.map((event, index) => (
              <motion.li
                key={event.id}
                initial={{ opacity: 0, y: 25, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
                  ease: "easeOut",
                }}
              >
                <Link href={`/events/${event.slug}`} className="block group">
                  <motion.div
                    className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row gap-5 py-6 sm:py-7"
                    whileHover={{ y: -3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  >
                    {/* Image — 3D tilt (Framer), no inner zoom */}
                    <TiltHover3D
                      className="w-full sm:w-72 shrink-0"
                      innerClassName="group/image relative aspect-[16/9] overflow-hidden rounded-lg shadow-[0_14px_44px_-16px_rgba(26,20,16,0.28)]"
                    >
                      <Image
                        src={event.image || "https://placehold.co/600x400"}
                        alt={event.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 288px"
                        className="object-cover"
                        priority={dateEvents.indexOf(event) < 2}
                      />
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/image:opacity-100"
                        style={{ transform: "translateZ(0.1px)" }}
                      />
                    </TiltHover3D>

                    {/* Text content */}
                    <div className="flex-1 flex flex-col justify-between text-center sm:text-left">
                      <div>
                        <h3
                          className="font-cormorant text-[1.55rem] sm:text-[clamp(1.3rem,3vw,1.75rem)] font-semibold sm:font-medium italic text-[#1a1410] leading-[1.02] sm:leading-tight tracking-[-0.015em] mb-2"
                        >
                          {event.name}
                        </h3>
                        {event.shortdescription && (
                          <p className="text-sm text-[#5a4a3a] leading-relaxed mb-3 line-clamp-2">
                            {event.shortdescription}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                        {/* Date, then time & duration */}
                        <div className="space-y-1">
                          <p className="text-xs font-medium tracking-[0.14em] text-[#1a1410]/80">
                            {formatInTimeZone(
                              new Date(event.date),
                              icelandTimeZone,
                              "EEE — MMMM d"
                            )}
                          </p>
                          <p className="text-xs uppercase tracking-[0.18em] text-[#6b5e52]">
                            {formatInTimeZone(
                              new Date(event.date),
                              icelandTimeZone,
                              "h:mm a"
                            )}
                            {event.duration && (
                              <>
                                {" · "}
                                {Number(event.duration) % 1 === 0
                                  ? event.duration
                                  : parseFloat(event.duration).toFixed(1)}{" "}
                                {Number(event.duration) === 1 ? t.hour : t.hours}
                              </>
                            )}
                          </p>
                        </div>

                        {/* Pricing */}
                        <div className="text-sm sm:text-right">
                          {event.early_bird_price &&
                          event.early_bird_date &&
                          !isPast(new Date(event.early_bird_date)) ? (
                            <div className="flex flex-col sm:items-end gap-0.5">
                              <p className={`text-[#8a7a6c] line-through text-xs ${event.sold_out ? "text-red-600/80" : ""}`}>
                                {event.has_sliding_scale
                                  ? `${event.sliding_scale_suggested} kr*`
                                  : `${event.price} kr${event.has_sliding_scale ? "*" : ""}`}
                              </p>
                              <p className={`font-medium text-emerald-700 text-sm ${event.sold_out ? "line-through text-red-600/80" : ""}`}>
                                {t.earlyBird} {event.early_bird_price} kr
                              </p>
                              <p className="text-xs text-[#6b5e52]">
                                {t.until}{" "}
                                {formatInTimeZone(
                                  new Date(event.early_bird_date),
                                  icelandTimeZone,
                                  "MMM d"
                                )}
                              </p>
                              {event.sold_out && (
                                <span className="text-xs text-red-600 mt-0.5 font-medium uppercase tracking-wider">
                                  {t.soldOut}
                                </span>
                              )}
                            </div>
                          ) : event.has_sliding_scale ? (
                            <div className="flex flex-col sm:items-end gap-0.5">
                              <p className={`font-medium text-[#ff914d] ${event.sold_out ? "line-through text-red-600/80" : ""}`}>
                                {event.sliding_scale_suggested} kr*
                              </p>
                              <p className="text-xs text-[#6b5e52]">{t.slidingScale}</p>
                              {event.sold_out && (
                                <span className="text-xs text-red-600 mt-0.5 font-medium uppercase tracking-wider">
                                  {t.soldOut}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col sm:items-end gap-0.5">
                              <p className={`font-medium text-[#ff914d] ${event.sold_out ? "line-through text-red-600/80" : ""}`}>
                                {event.price} kr
                                {(event.ticket_variants &&
                                  event.ticket_variants.length > 0) ||
                                event.has_sliding_scale ? (
                                  <span className="text-[#ff914d]/60 ml-0.5">*</span>
                                ) : null}
                              </p>
                              {(event.ticket_variants &&
                                event.ticket_variants.length > 0) ||
                              event.has_sliding_scale ? (
                                <p className="text-xs text-[#6b5e52]">
                                  {event.ticket_variants &&
                                  event.ticket_variants.length > 0 &&
                                  event.has_sliding_scale
                                    ? t.multiplePricingSliding
                                    : event.ticket_variants &&
                                        event.ticket_variants.length > 0
                                      ? t.multiplePricing
                                      : t.slidingScale}
                                </p>
                              ) : null}
                              {event.sold_out && (
                                <span className="text-xs text-red-600 mt-0.5 font-medium uppercase tracking-wider">
                                  {t.soldOut}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Admin / Host controls */}
                      {canManageEvent(event) && (
                        <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
                          <motion.button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              router.push(
                                `/events/manager/${event.slug}/attendance`
                              );
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#5a4a3a] bg-[#1a1410]/[0.04] border border-[#1a1410]/[0.1] rounded-md hover:bg-[#1a1410]/[0.08] hover:text-[#1a1410] transition-all duration-200 cursor-pointer"
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{t.tickets} {event.ticketCount}</span>
                          </motion.button>
                          {isAdmin && (
                            <motion.button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedEvent({
                                  eventTitle: event.name,
                                  eventDescription: event.shortdescription,
                                  eventDate: event.date,
                                  eventImage: event.image,
                                  eventUrl: `https://mama.is/events/${event.slug}`,
                                });
                                setIsModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#5a4a3a] bg-[#1a1410]/[0.04] border border-[#1a1410]/[0.1] rounded-md hover:bg-[#1a1410]/[0.08] hover:text-[#1a1410] transition-all duration-200"
                              whileHover={{ scale: 1.02, y: -1 }}
                              whileTap={{ scale: 0.98 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                              </svg>
                              <span>{t.share}</span>
                            </motion.button>
                          )}
                          <motion.button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              router.push(`/events/manager/${event.slug}/edit`);
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#5a4a3a] bg-[#1a1410]/[0.04] border border-[#1a1410]/[0.1] rounded-md hover:bg-[#1a1410]/[0.08] hover:text-[#1a1410] transition-all duration-200"
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>{t.edit}</span>
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </Link>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      ))}

      {/* Facebook Post Modal */}
      <FacebookPostModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        eventData={selectedEvent}
        onPost={(data) => {
          toast.success(t.facebookSuccess, {
            duration: 4000,
            position: "top-center",
          });
        }}
      />

      {/* Load more */}
      {enableLoadMore && visibleCount < events.length && (
        <div className="mt-8 mb-12 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => setVisibleCount((current) => current + loadMoreCount)}
            className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-[#1a1410]/15 text-[#1a1410] text-sm tracking-[0.12em] uppercase hover:bg-[#1a1410]/[0.04] hover:border-[#ff914d]/50 transition-all duration-200"
          >
            {t.showMore}
          </button>
        </div>
      )}

      {/* Past events link */}
      {showPastEventsLink && listType === "upcoming" && (
        <div className="mt-10 mb-14 flex justify-center">
          <Link
            href={language === "is" ? "/is/past-events" : "/past-events"}
            className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-[#1a1410]/12 text-[#5a4a3a] text-sm tracking-[0.12em] uppercase hover:border-[#1a1410]/25 hover:text-[#1a1410] transition-all duration-200"
          >
            {t.seePastEvents}
          </Link>
        </div>
      )}
    </motion.div>
  );
}
