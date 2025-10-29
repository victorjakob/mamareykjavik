"use client";

import React from "react";
import Image from "next/image";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FcPrevious } from "react-icons/fc";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

export default function Event({ event }) {
  const { slug } = useParams();
  const { language } = useLanguage();

  const translations = {
    en: {
      eventNotFound: "Event Not Found",
      goBack: "Go Back",
      hours: "hours",
      facebookEvent: "Facebook Event",
      soldOut: "Sold out",
      buyTicket: "Buy Ticket",
      reserveSpot: "Reserve My Spot",
      eventDetails: "Event Details",
      time: "Time:",
      duration: "Duration:",
      location: "Location:",
      price: "Price:",
      earlyBird: "Early Bird",
      until: "Until",
      priceVariants: "Price Variants:",
    },
    is: {
      eventNotFound: "Viðburður fannst ekki",
      goBack: "Til baka",
      hours: "Klst",
      facebookEvent: "Facebook Viðburður",
      soldOut: "Uppselt",
      buyTicket: "Kaupa miða",
      reserveSpot: "Taka frá pláss",
      eventDetails: "Upplýsingar",
      time: "Tími:",
      duration: "Lengd:",
      location: "Staðs:",
      price: "Verð:",
      earlyBird: "Early bird",
      until: "Til",
      priceVariants: "Verðbreytur:",
    },
  };

  const t = translations[language];
  const isEarlyBirdValid = () => {
    if (!event.early_bird_price || !event.early_bird_date) return false;
    const now = new Date();
    const earlyBirdDeadline = new Date(event.early_bird_date);
    return now < earlyBirdDeadline;
  };

  const isSoldOut = event.sold_out === true;

  if (!event) {
    return (
      <motion.div
        initial={{ opacity: 0, transform: "translateY(20px)" }}
        animate={{ opacity: 1, transform: "translateY(0)" }}
        className="flex flex-col items-center justify-center min-h-screen"
      >
        <div className="text-center p-4 sm:p-8 bg-white rounded-2xl shadow-lg max-w-sm mx-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            {t.eventNotFound}
          </h1>
          <Link
            href="/events"
            className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#fff1e6] hover:bg-[#ffe4d1] transition duration-200 ease-in-out"
            aria-label={t.goBack}
          >
            <FcPrevious className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, transform: "translateY(20px)" }}
      animate={{ opacity: 1, transform: "translateY(0)" }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, transform: "translateY(50px)" }}
          animate={{ opacity: 1, transform: "translateY(0)" }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Event Image */}
          <motion.div
            initial={{ opacity: 0, transform: "scale(1.1)" }}
            animate={{ opacity: 1, transform: "scale(1)" }}
            transition={{ duration: 0.5 }}
            className="relative w-full aspect-[16/9]"
          >
            <Image
              src={event.image || "https://placehold.co/600x400"}
              alt={event.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="p-4 sm:p-6 md:p-8"
          >
            {/* Event Title */}
            <motion.h1
              initial={{ opacity: 0, transform: "translateY(10px)" }}
              animate={{ opacity: 1, transform: "translateY(0)" }}
              transition={{ duration: 0.4 }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6"
            >
              {event.name}
            </motion.h1>

            {/* Event Info */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 mb-6 sm:mb-8 text-sm sm:text-base text-gray-600">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {format(new Date(event.date), "MMMM d - h:mm a", {
                  timeZone: "Atlantic/Reykjavik",
                })}
              </div>
              {event.duration && (
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
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
                  {Number(event.duration) % 1 === 0
                    ? event.duration
                    : parseFloat(event.duration).toFixed(1)}{" "}
                  {t.hours}
                </div>
              )}
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
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
                <span className="text-sm sm:text-base">
                  {event.location || "Bankastræti 2, 101 Reykjavik"}
                </span>
              </div>
              {event.facebook_link && (
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <a
                    href={event.facebook_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 font-light"
                  >
                    {t.facebookEvent}
                  </a>
                </div>
              )}
              <div className="flex items-center justify-between w-full sm:w-auto">
                {event.payment === "online" ? (
                  <Link
                    href={isSoldOut ? "#" : `/events/${slug}/ticket`}
                    className={`w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm bg-[#ff914d]/10 text-black border border-[#ff914d] rounded-lg hover:bg-[#ff914d] hover:text-white transition-all duration-300${
                      isSoldOut ? " pointer-events-none opacity-60" : ""
                    }`}
                    tabIndex={isSoldOut ? -1 : 0}
                    aria-disabled={isSoldOut}
                  >
                    {isSoldOut ? t.soldOut : t.buyTicket}
                  </Link>
                ) : (
                  <Link
                    href={isSoldOut ? "#" : `/events/${slug}/ticket`}
                    className={`w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm bg-[#ff914d]/10 text-black border border-[#ff914d] rounded-lg hover:bg-[#ff914d] hover:text-white transition-all duration-300${
                      isSoldOut ? " pointer-events-none opacity-60" : ""
                    }`}
                    tabIndex={isSoldOut ? -1 : 0}
                    aria-disabled={isSoldOut}
                  >
                    {isSoldOut ? t.soldOut : t.reserveSpot}
                  </Link>
                )}
              </div>
            </div>

            <div className="border-b border-gray-200 my-4 sm:my-6"></div>

            {/* Event Description */}
            <div className="prose max-w-none mb-6 sm:mb-8">
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>

            {/* Additional Event Details */}
            <div className="bg-[#fff1e6] rounded-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
                  {t.eventDetails}
                </h2>
                <div>
                  {event.payment === "online" ? (
                    <Link
                      href={isSoldOut ? "#" : `/events/${slug}/ticket`}
                      className={`w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-[#ff914d] text-white text-sm sm:text-base font-medium rounded-lg hover:bg-[#e67f43] transition-colors${
                        isSoldOut ? " pointer-events-none opacity-60" : ""
                      }`}
                      tabIndex={isSoldOut ? -1 : 0}
                      aria-disabled={isSoldOut}
                    >
                      {isSoldOut ? t.soldOut : t.buyTicket}
                    </Link>
                  ) : (
                    <Link
                      href={isSoldOut ? "#" : `/events/${slug}/ticket`}
                      className={`w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-[#ff914d] text-white text-sm sm:text-base font-medium rounded-lg hover:bg-[#e67f43] transition-colors${
                        isSoldOut ? " pointer-events-none opacity-60" : ""
                      }`}
                      tabIndex={isSoldOut ? -1 : 0}
                      aria-disabled={isSoldOut}
                    >
                      {isSoldOut ? t.soldOut : t.reserveSpot}
                    </Link>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center text-sm sm:text-base text-gray-700">
                  <strong className="w-20 sm:w-24">{t.time}</strong>
                  <span>
                    {format(new Date(event.date), "MMMM d - h:mm a", {
                      timeZone: "Atlantic/Reykjavik",
                    })}
                  </span>
                </div>
                {event.duration && (
                  <div className="flex items-center text-sm sm:text-base text-gray-700">
                    <strong className="w-20 sm:w-24">{t.duration}</strong>
                    <span>
                      {Number(event.duration) % 1 === 0
                        ? event.duration
                        : parseFloat(event.duration).toFixed(1)}{" "}
                      {t.hours}
                    </span>
                  </div>
                )}
                <div className="flex items-center text-sm sm:text-base text-gray-700">
                  <strong className="w-20 sm:w-24">{t.location}</strong>
                  <span>
                    {event.location || "Bankastræti 2, 101 Reykjavik"}
                  </span>
                </div>
                <div className="flex items-center text-sm sm:text-base text-gray-700">
                  <strong className="w-20 sm:w-24">{t.price}</strong>
                  <div className="flex flex-col">
                    {isEarlyBirdValid() ? (
                      <>
                        <span
                          className={`text-xs text-gray-500${
                            isSoldOut ? " line-through text-red-400" : ""
                          }`}
                        >
                          {event.price} ISK
                        </span>
                        <span
                          className={`text-green-600${
                            isSoldOut ? " line-through text-red-400" : ""
                          }`}
                        >
                          {event.early_bird_price} ISK ({t.earlyBird})
                        </span>
                        <span className="text-xs text-gray-500">
                          {t.until}{" "}
                          {format(
                            new Date(event.early_bird_date),
                            "MMMM d, h:mm a"
                          )}
                        </span>
                        {isSoldOut && (
                          <span className="text-xs text-red-500 mt-1 font-medium">
                            {t.soldOut}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span
                          className={`text-gray-900${
                            isSoldOut ? " line-through text-red-400" : ""
                          }`}
                        >
                          {event.price} ISK
                        </span>
                        {isSoldOut && (
                          <span className="text-xs text-red-500 mt-1 font-medium">
                            {t.soldOut}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {event.ticket_variants && event.ticket_variants.length > 0 && (
                  <div className="flex items-start text-sm sm:text-base text-gray-700">
                    <strong className="w-20 sm:w-24">{t.priceVariants}</strong>
                    <div className="flex-1 space-y-3">
                      {event.ticket_variants.map((variant, index) => (
                        <div
                          key={variant.id}
                          className="bg-orange-200 rounded-3xl p-3"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 mb-1">
                              {variant.name}
                            </span>
                            <span
                              className={`text-[#724123] font-medium${
                                isSoldOut ? " line-through" : ""
                              }`}
                            >
                              {variant.price} ISK
                            </span>
                            {isSoldOut && (
                              <span className="text-xs text-red-500 mt-1 font-medium">
                                {t.soldOut}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
