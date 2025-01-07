"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import useSWR from "swr";
import { PropagateLoader } from "react-spinners";
import { motion } from "framer-motion"; // Import Framer Motion

const fetcher = (url) =>
  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      throw err;
    });

export default function EventsList() {
  const { data, error, isLoading } = useSWR("/api/events", fetcher);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PropagateLoader color="#4F46E5" size={12} />
      </div>
    );
  }

  if (error) return <div>Error: {error.message}</div>;

  // Group events by date
  const groupedEvents = data.reduce((acc, event) => {
    const date = format(new Date(event.time), "yyyy-MM-dd");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {});

  return (
    <div className="mt-24">
      {Object.entries(groupedEvents).map(([date, dateEvents]) => (
        <div key={date}>
          <h2 className="text-xl font-semibold text-center mb-4">
            {format(new Date(date), "MMMM d, yyyy")}
          </h2>
          <ul role="list" className="divide-y divide-gray-200">
            {dateEvents.map((event) => (
              <li key={event.id} className="py-8">
                <Link href={`/events/${event.id}`} className="block">
                  <motion.div
                    className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 p-4 rounded-lg hover:bg-gray-50 transition duration-300 ease-in-out"
                    whileHover={{ scale: 1.05 }} // Scale effect on hover
                    transition={{
                      duration: 0.2, // Duration of the scale effect
                      ease: "easeOut", // Smooth easing
                    }}
                  >
                    <div className="w-full sm:w-1/3 aspect-[16/9] relative overflow-hidden rounded-lg">
                      <Image
                        src={event.image.url}
                        alt={event.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="w-full sm:w-2/3 text-center sm:text-left">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {event.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {event.shortDescription}
                      </p>
                      <div className="mt-2 flex flex-col sm:flex-row sm:justify-between">
                        <p className="text-sm text-gray-700">
                          {format(new Date(event.time), "h:mm a")} | Duration:{" "}
                          {event.duration} {" Hours"}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          Price: ${event.price}
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
