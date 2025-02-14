"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { PropagateLoader } from "react-spinners";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChevronRightIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchHostEvents = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        setIsAuthenticated(true);

        // First fetch the events
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .eq("host", user.email)
          .order("date", { ascending: true });

        if (eventsError) throw eventsError;

        // Then fetch ticket counts for each event
        const eventsWithTickets = await Promise.all(
          eventsData.map(async (event) => {
            const { count, error: ticketsError } = await supabase
              .from("tickets")
              .select("*", { count: "exact" })
              .eq("event_id", event.id)
              .in("status", ["door", "paid"]);

            if (ticketsError) throw ticketsError;

            return {
              ...event,
              ticketCount: count || 0,
            };
          })
        );

        setEvents(eventsWithTickets);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching events:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHostEvents();
  }, []);

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date();
    return {
      upcomingEvents: events.filter((event) => new Date(event.date) >= now),
      pastEvents: events.filter((event) => new Date(event.date) < now),
    };
  }, [events]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <PropagateLoader color="#ff914d" size={12} speedMultiplier={0.8} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900">
            Authentication Required
          </h2>
          <p className="text-gray-600">
            Please log in or register to manage your events.
          </p>
          <Link
            href="/auth"
            className="inline-block px-6 py-3 rounded-xl font-medium bg-[#ff914d] text-black hover:scale-105 transition-all duration-200"
          >
            Go to Login Page
          </Link>
        </div>
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

  return (
    <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-10">
        <h1 className="leading-relaxed text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight text-right sm:text-center w-1/2 sm:w-auto ml-auto sm:ml-0">
          Manage Your Events
        </h1>
        <Link
          href="/admin/create-event"
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-black bg-[#ff914d] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff914d] transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Create New Event
          <ChevronRightIcon className="ml-2 h-5 w-5" />
        </Link>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => setShowUpcoming(true)}
          className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
            showUpcoming
              ? "bg-[#ff914d] text-black shadow-md hover:scale-105 ring-2 ring-[#ff914d] ring-offset-2"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Upcoming ({upcomingEvents.length})
        </button>
        <button
          onClick={() => setShowUpcoming(false)}
          className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
            !showUpcoming
              ? "bg-[#ff914d] text-black shadow-md hover:scale-105 ring-2 ring-[#ff914d] ring-offset-2"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Past ({pastEvents.length})
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {(showUpcoming ? upcomingEvents : pastEvents).map((event) => (
            <motion.div
              key={event.id}
              layout
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100"
              whileHover={{ scale: 1.01 }}
            >
              <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8">
                <div className="w-full sm:w-1/3">
                  <div className="aspect-[3/2] relative rounded-xl overflow-hidden shadow-sm">
                    <Image
                      src={event.image || "https://placehold.co/600x400"}
                      alt={event.name}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 33vw"
                      priority={true}
                    />
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                      {event.name}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed line-clamp-2">
                      {event.shortdescription}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center text-gray-700">
                        <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
                        {format(new Date(event.date), "MMMM d, yyyy")}
                      </div>
                      <div className="flex items-center text-gray-700">
                        <ClockIcon className="h-5 w-5 mr-2 text-gray-400" />
                        {format(new Date(event.date), "h:mm a")}
                      </div>
                      <div className="flex items-center text-gray-700">
                        <svg
                          className="h-5 w-5 mr-2 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {event.duration} Hours
                      </div>
                      <div className="flex items-center text-gray-700">
                        <CurrencyDollarIcon className="h-5 w-5 mr-2 text-gray-400" />
                        {event.price} ISK
                      </div>
                      <div className="flex items-center text-gray-700 col-span-2">
                        <TicketIcon className="h-5 w-5 mr-2 text-gray-400" />
                        {event.ticketCount} Tickets Sold
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-6">
                    <Link
                      href={`/events/manager/${event.slug}/attendance`}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-2.5 text-black font-medium rounded-lg bg-[#ff914d] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff914d] transition-all duration-200"
                    >
                      Ticket Sales
                    </Link>
                    <Link
                      href={`/events/manager/${event.slug}/edit`}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium rounded-lg text-[#ff914d] bg-[#fff5ef] hover:bg-[#fff0e6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff914d] transition-all duration-200"
                    >
                      Edit Event
                    </Link>
                    <Link
                      href={`/events/${event.slug}`}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                    >
                      View Event
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {(showUpcoming ? upcomingEvents : pastEvents).length === 0 && (
            <motion.div
              className="text-center py-16 bg-gray-50 rounded-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-4 text-gray-500 text-lg">
                No {showUpcoming ? "upcoming" : "past"} events found.
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
