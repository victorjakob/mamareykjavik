"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { PropagateLoader } from "react-spinners";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useEffect, useState, useMemo } from "react";

export default function EventsList() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Get current date and time
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .gt("date", now) // Use gt instead of gte to exclude events that have already started
          .order("date", { ascending: true });

        if (error) throw error;
        setEvents(data || []);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching events:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Memoize grouped events to prevent unnecessary recalculations
  const groupedEvents = useMemo(() => {
    return events.reduce((acc, event) => {
      const date = format(new Date(event.date), "yyyy-MM-dd");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(event);
      return acc;
    }, {});
  }, [events]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <PropagateLoader color="#4F46E5" size={12} speedMultiplier={0.8} />
      </div>
    );
  }

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
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  if (Object.keys(groupedEvents).length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">No upcoming events found.</p>
      </div>
    );
  }

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
                        <p className="text-sm font-medium text-gray-900">
                          {event.price} kr
                        </p>
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
