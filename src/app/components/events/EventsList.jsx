"use client";

import Image from "next/image";
import Link from "next/link";
import { format, isPast } from "date-fns";
import { motion } from "framer-motion";
import { useMemo } from "react";

export default function EventsList({ events }) {
  // Remove SWR hooks and related loading states

  // Keep the memoized grouping logic
  const groupedEvents = useMemo(() => {
    return events.reduce((acc, event) => {
      const date = format(new Date(event.date), "yyyy-MM-dd");
      if (!acc[date]) acc[date] = [];
      acc[date].push(event);
      return acc;
    }, {});
  }, [events]);

  // Remove loading state (handled by Suspense if needed)

  // Keep the no events check
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">No upcoming events found.</p>
      </div>
    );
  }

  // ✅ Render Events
  return (
    <div className="mt-12">
      {Object.entries(groupedEvents).map(([date, dateEvents]) => (
        <div key={date}>
          <h2 className="text-xl font-semibold text-center mb-4 after:content-[''] after:block after:w-24 after:h-0.5 after:bg-gray-200 after:mx-auto after:mt-2">
            {format(new Date(date), "MMMM d")}
          </h2>
          <ul role="list" className="divide-y divide-gray-200">
            {dateEvents.map((event, index) => (
              <motion.li
                key={event.id}
                className="py-8"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.15,
                  ease: "easeOut",
                }}
              >
                <Link href={`/events/${event.slug}`} className="block">
                  <motion.div
                    className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-300 ease-in-out"
                    whileHover={{
                      scale: 1.02,
                      y: -4,
                      rotate: 0.5,
                      boxShadow:
                        "0 9px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                    }}
                    transition={{
                      duration: 0.2,
                      ease: "easeOut",
                    }}
                  >
                    <div className="w-full sm:w-1/3 aspect-[16/9] relative overflow-hidden rounded-lg">
                      <Image
                        src={event.image || "https://placehold.co/600x400"}
                        alt={event.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover"
                        priority={dateEvents.indexOf(event) < 2}
                      />
                    </div>
                    <div className="w-full sm:w-2/3 text-center sm:text-left">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {event.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {event.shortdescription}
                      </p>
                      <p className="mt-2 text-sm text-gray-700">
                        {format(new Date(event.date), "MMMM d")}
                      </p>
                      <div className="mt-1 flex flex-col sm:flex-row sm:justify-between">
                        <p className="text-sm text-gray-700">
                          {format(new Date(event.date), "h:mm a")} | Duration:{" "}
                          {event.duration} {" Hour/s"}
                        </p>
                        <div className="text-sm">
                          {event.early_bird_price &&
                          event.early_bird_date &&
                          !isPast(new Date(event.early_bird_date)) ? (
                            <div className="flex flex-col sm:items-end">
                              <p className="text-slate-400 line-through">
                                {event.price} kr
                              </p>
                              <p className="font-medium text-green-600">
                                Early Bird: {event.early_bird_price} kr
                              </p>
                              <p className="text-xs text-gray-500">
                                Until{" "}
                                {format(
                                  new Date(event.early_bird_date),
                                  "MMM d"
                                )}
                              </p>
                            </div>
                          ) : (
                            <p className="font-medium text-gray-900">
                              {event.price} kr
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
