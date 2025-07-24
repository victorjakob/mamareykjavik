"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, isPast } from "date-fns";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useRole } from "@/hooks/useRole";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import dynamic from "next/dynamic";

const FacebookPostModal = dynamic(
  () => import("@/app/events/FacebookPostModal"),
  {
    ssr: false,
  }
);

export default function EventsList({ events }) {
  const router = useRouter();
  const { data: session } = useSession();
  const role = useRole();
  const isAdmin = role === "admin";
  const isHost = role === "host";
  const currentUserEmail = session?.user?.email;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Helper function to check if user can manage a specific event
  const canManageEvent = (event) => {
    if (isAdmin) return true; // Admins can manage all events
    if (isHost && event.host === currentUserEmail) return true; // Hosts can only manage their own events
    console.log(event.host);
    return false;
  };

  // Keep the memoized grouping logic
  const groupedEvents = useMemo(() => {
    return events.reduce((acc, event) => {
      const date = format(new Date(event.date), "yyyy-MM-dd");
      if (!acc[date]) acc[date] = [];
      acc[date].push(event);
      return acc;
    }, {});
  }, [events]);

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
    <motion.div
      className="mt-12"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.5,
        ease: "easeOut",
      }}
    >
      {Object.entries(groupedEvents).map(([date, dateEvents]) => (
        <motion.div
          key={date}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.6,
            ease: "easeOut",
          }}
        >
          <motion.h2
            className="text-xl font-semibold text-center mb-4 after:content-[''] after:block after:w-24 after:h-0.5 after:bg-gray-200 after:mx-auto after:mt-2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: 0.7,
              ease: "easeOut",
            }}
          >
            {format(new Date(date), "EEE - MMMM d")}
          </motion.h2>
          <ul role="list" className="divide-y divide-gray-200">
            {dateEvents.map((event, index) => (
              <motion.li
                key={event.id}
                className="py-8"
                initial={{ opacity: 0, y: 25, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
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
                    <div className="w-full sm:w-1/3 relative overflow-hidden rounded-lg">
                      <div className="aspect-[16/9] relative">
                        <Image
                          src={event.image || "https://placehold.co/600x400"}
                          alt={event.name}
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover"
                          priority={dateEvents.indexOf(event) < 2}
                        />
                      </div>
                    </div>
                    <div className="w-full sm:w-2/3 text-center sm:text-left">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {event.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {event.shortdescription}
                      </p>
                      <p className="mt-2 text-sm text-gray-700">
                        {format(new Date(event.date), "EEE - MMMM d")}
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
                              <p
                                className={`text-slate-400 line-through ${
                                  event.sold_out
                                    ? "line-through text-red-400"
                                    : ""
                                }`}
                              >
                                {event.price} kr
                              </p>
                              <p
                                className={`font-medium text-green-600 ${
                                  event.sold_out
                                    ? "line-through text-red-400"
                                    : ""
                                }`}
                              >
                                Early Bird: {event.early_bird_price} kr
                              </p>
                              <p className="text-xs text-gray-500">
                                Until{" "}
                                {format(
                                  new Date(event.early_bird_date),
                                  "MMM d"
                                )}
                              </p>
                              {event.sold_out && (
                                <span className="text-xs text-red-500 mt-1 font-medium">
                                  Sold out
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col sm:items-end">
                              <p
                                className={`font-medium text-gray-900 ${
                                  event.sold_out
                                    ? "line-through text-red-400"
                                    : ""
                                }`}
                              >
                                {event.price} kr
                                {event.ticket_variants &&
                                  event.ticket_variants.length > 0 && (
                                    <span className="text-yellow-500 ml-1">
                                      *
                                    </span>
                                  )}
                              </p>
                              {event.ticket_variants &&
                                event.ticket_variants.length > 0 && (
                                  <p className="text-xs text-gray-500">
                                    Multiple pricing options available
                                  </p>
                                )}
                              {event.sold_out && (
                                <span className="text-xs text-red-500 mt-1 font-medium">
                                  Sold out
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {canManageEvent(event) && (
                        <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
                          <motion.button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              router.push(
                                `/events/manager/${event.slug}/attendance`
                              );
                            }}
                            className="group relative inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 hover:border-gray-300 hover:text-gray-700 transition-all duration-200 ease-out cursor-pointer"
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>Tickets: {event.ticketCount}</span>
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
                              className="group relative inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 hover:border-gray-300 hover:text-gray-700 transition-all duration-200 ease-out"
                              whileHover={{
                                scale: 1.02,
                                y: -1,
                              }}
                              whileTap={{
                                scale: 0.98,
                              }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                              }}
                            >
                              <svg
                                className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-105"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                              </svg>
                              <span>Share</span>
                            </motion.button>
                          )}
                          <motion.button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              router.push(`/admin/manage-events/${event.id}`);
                            }}
                            className="group relative inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 hover:border-gray-300 hover:text-gray-700 transition-all duration-200 ease-out"
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <svg
                              className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-105"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            <span>Edit</span>
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
          toast.success(`Event successfully posted to Facebook!`, {
            duration: 4000,
            position: "top-center",
          });
        }}
      />
    </motion.div>
  );
}
