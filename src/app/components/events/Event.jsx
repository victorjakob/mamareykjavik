"use client";

import React from "react";
import Image from "next/image";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FcPrevious } from "react-icons/fc";

export default function Event({ event }) {
  const { slug } = useParams();

  const isEarlyBirdValid = () => {
    if (!event.early_bird_price || !event.early_bird_date) return false;
    const now = new Date();
    const earlyBirdDeadline = new Date(event.early_bird_date);
    return now < earlyBirdDeadline;
  };

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center p-4 sm:p-8 bg-white rounded-2xl shadow-lg max-w-sm mx-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Event Not Found
          </h1>
          <Link
            href="/events"
            className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#fff1e6] hover:bg-[#ffe4d1] transition duration-200 ease-in-out"
            aria-label="Go Back"
          >
            <FcPrevious className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Event Image */}
          <div className="relative w-full aspect-[16/9]">
            <Image
              src={event.image || "https://placehold.co/600x400"}
              alt={event.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            {/* Event Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              {event.name}
            </h1>

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
                {format(new Date(event.date), "MMMM d h:mm a")}
              </div>
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
                {event.duration} hours
              </div>
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
                  Bankastræti 2, 101 Reykjavik
                </span>
              </div>
              <div className="flex items-center justify-between w-full sm:w-auto">
                {event.payment === "online" ? (
                  <Link
                    href={`/events/${slug}/ticket`}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm bg-[#ff914d]/10 text-black border border-[#ff914d] rounded-lg hover:bg-[#ff914d] hover:text-white transition-all duration-300"
                  >
                    Buy Ticket
                  </Link>
                ) : (
                  <Link
                    href={`/events/${slug}/ticket`}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm bg-[#ff914d]/10 text-black border border-[#ff914d] rounded-lg hover:bg-[#ff914d] hover:text-white transition-all duration-300"
                  >
                    Get Ticket
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
                  Event Details
                </h2>
                <div>
                  {event.payment === "online" ? (
                    <Link
                      href={`/events/${slug}/ticket`}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-[#ff914d] text-white text-sm sm:text-base font-medium rounded-lg hover:bg-[#e67f43] transition-colors"
                    >
                      Buy Ticket
                    </Link>
                  ) : (
                    <Link
                      href={`/events/${slug}/ticket`}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-[#ff914d] text-white text-sm sm:text-base font-medium rounded-lg hover:bg-[#e67f43] transition-colors"
                    >
                      Get Ticket
                    </Link>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center text-sm sm:text-base text-gray-700">
                  <strong className="w-20 sm:w-24">Time:</strong>
                  <span>
                    {format(new Date(event.date), "EEEE, MMMM d - h:mm a")}
                  </span>
                </div>
                <div className="flex items-center text-sm sm:text-base text-gray-700">
                  <strong className="w-20 sm:w-24">Duration:</strong>
                  <span>{event.duration} hours</span>
                </div>
                <div className="flex items-center text-sm sm:text-base text-gray-700">
                  <strong className="w-20 sm:w-24">Location:</strong>
                  <span>Bankastræti 2, 101 Reykjavik</span>
                </div>
                <div className="flex items-center text-sm sm:text-base text-gray-700">
                  <strong className="w-20 sm:w-24">Price:</strong>
                  <div className="flex flex-col">
                    {isEarlyBirdValid() ? (
                      <>
                        <span className=" text-xs text-gray-500">
                          {event.price} ISK
                        </span>
                        <span className="text-green-600">
                          {event.early_bird_price} ISK (Early Bird)
                        </span>
                        <span className="text-xs text-gray-500">
                          Until{" "}
                          {format(
                            new Date(event.early_bird_date),
                            "MMMM d, h:mm a"
                          )}
                        </span>
                      </>
                    ) : (
                      <span>{event.price} ISK</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
