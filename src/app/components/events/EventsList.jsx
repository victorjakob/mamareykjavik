"use client";

import Image from "next/image";
import Link from "next/link";
import { format, isPast } from "date-fns";
import { PropagateLoader } from "react-spinners";
import { motion } from "framer-motion";
import useSWR from "swr"; // ✅ SWR for caching & fast re-fetching
import { supabase } from "@/lib/supabase";
import { useMemo } from "react";

// ✅ Use SWR with Supabase Query
const fetcher = async () => {
  const now = new Date().toISOString();

  try {
    const { data, error } = await supabase
      .from("events")
      .select(
        "id, name, date, image, slug, shortdescription, price, duration, early_bird_price, early_bird_date"
      )
      .gt("date", now)
      .order("date", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    if (!data) {
      console.log("No data returned from Supabase");
      return [];
    }

    console.log("Fetched events:", data.length);
    return data;
  } catch (error) {
    console.error("Fetcher error:", error);
    throw error;
  }
};

export default function EventsList() {
  // ✅ Use SWR for caching & revalidation
  const {
    data: events,
    error,
    isLoading,
  } = useSWR("events", fetcher, {
    revalidateOnFocus: false, // Prevents refetching when switching tabs
    refreshInterval: 1000 * 60 * 5, // Auto refresh every 5 minutes
  });
  console.log(events, error, isLoading);
  // ✅ Memoized Grouped Events
  const groupedEvents = useMemo(() => {
    if (!events) return {};
    return events.reduce((acc, event) => {
      const date = format(new Date(event.date), "yyyy-MM-dd");
      if (!acc[date]) acc[date] = [];
      acc[date].push(event);
      return acc;
    }, {});
  }, [events]);
  console.log(groupedEvents);

  // ✅ Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <PropagateLoader color="#F97316" size={12} speedMultiplier={0.8} />
      </div>
    );
  }

  // ✅ Error State
  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-center">
        <div className="text-red-600 font-medium flex flex-col items-center gap-2">
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Error fetching events. Please try again.</span>
        </div>
      </div>
    );
  }

  // ✅ No Events State
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
          <h2 className="text-xl font-semibold text-center mb-4">
            {format(new Date(date), "MMMM d")}
          </h2>
          <ul role="list" className="divide-y divide-gray-200">
            {dateEvents.map((event) => (
              <li key={event.id} className="py-8">
                <Link href={`/events/${event.slug}`} className="block">
                  <motion.div
                    className="drop-shadow-sm w-full max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 p-4 rounded-lg hover:bg-gray-50 transition duration-300 ease-in-out"
                    whileHover={{ scale: 1.02 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
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
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
