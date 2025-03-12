"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  CalendarIcon,
  ClockIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";
import { supabase } from "@/util/supabase/client";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";

const fetcher = async (key, supabase, email) => {
  const { data, error } = await supabase
    .from("tickets")
    .select(
      `
      id,
      buyer_email,
      order_id,
      status,
      quantity,
      total_price,
      created_at,
      events (
        name,
        date,
        duration
      )
    `
    )
    .in("status", ["paid", "door"])
    .eq("buyer_email", email)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export default function MyTickets() {
  const [showPastTickets, setShowPastTickets] = useState(false);
  const { data: session } = useSession();

  const {
    data: tickets,
    error,
    isLoading,
  } = useSWR(
    session ? ["tickets", session.user.email] : null,
    ([key, email]) => fetcher(key, supabase, email),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000,
      dedupingInterval: 5000,
    }
  );

  // Memoize the filtered tickets
  const { upcomingTickets, pastTickets } = useMemo(() => {
    const now = new Date();
    return {
      upcomingTickets:
        tickets?.filter((ticket) => new Date(ticket.events?.date) >= now) || [],
      pastTickets:
        tickets?.filter((ticket) => new Date(ticket.events?.date) < now) || [],
    };
  }, [tickets]); // Only recalculate when tickets data changes

  // Use memoized value
  const ticketsToShow = showPastTickets ? pastTickets : upcomingTickets;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 backdrop-blur-sm bg-white/90 text-center">
            <div className="bg-red-50 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
              <ExclamationCircleIcon className="h-10 w-10 sm:h-12 sm:w-12 text-red-500" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 leading-relaxed">
              Please log in or register to view your tickets
            </h1>

            <div className="flex justify-center">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-[#ff914d] to-[#ff8033] hover:from-[#ff8033] hover:to-[#ff6b1a] text-white rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Go to Login Page</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!tickets?.length) {
    return (
      <div className="min-h-screen pt-40 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-lg">
          <TicketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
            My Tickets
          </h1>
          <p className="text-gray-600 text-center text-lg">
            You haven&apos;t purchased any tickets yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-9 md:pt-20 px-4 ">
      <div className="max-w-4xl mx-auto">
        <div className=" rounded-2xl  overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 text-right sm:text-center mb-4 sm:mb-0 sm:flex-1">
                {showPastTickets ? "Past Events" : "Upcoming Events"}
              </h1>
              <button
                onClick={() => setShowPastTickets(!showPastTickets)}
                className="px-6 py-1.5 bg-[#fff1e6] hover:bg-[#ffe4d1] text-[#ff914d] rounded-full transition-colors font-medium text-sm self-end sm:self-auto"
                aria-label={
                  showPastTickets ? "Show Upcoming Events" : "Show Past Events"
                }
              >
                {showPastTickets ? "View Upcoming" : "View Past"}
              </button>
            </div>

            {ticketsToShow.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  No {showPastTickets ? "past" : "upcoming"} tickets found.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {ticketsToShow.map((ticket) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {ticket.events?.name || "Event Name Not Available"}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-3 text-gray-600">
                            <CalendarIcon className="h-5 w-5" />
                            <span>
                              {ticket.events?.date
                                ? format(new Date(ticket.events.date), "PPP")
                                : "Date Not Available"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3 text-gray-600">
                            <ClockIcon className="h-5 w-5" />
                            <span>
                              {ticket.events?.duration
                                ? `${ticket.events.duration} hours`
                                : "Duration Not Available"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <div className="text-right">
                          <div className="text-4xl font-bold text-[#ff914d]">
                            x{ticket.quantity}
                          </div>
                          <div className="mt-2 flex items-center justify-end space-x-2">
                            <span className="text-lg font-semibold text-gray-900">
                              {ticket.total_price
                                ? `${ticket.total_price} ISK`
                                : "Price Not Available"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center space-x-2">
                          {ticket.status === "paid" ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                              <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                              Pay at Door
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
