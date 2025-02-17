"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { PropagateLoader } from "react-spinners";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { TicketIcon } from "@heroicons/react/24/outline";

export default function TicketsList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTickets() {
      try {
        // Fetch tickets with event details
        const { data, error } = await supabase
          .from("tickets")
          .select(
            `
            *,
            events (
              name,
              date
            )
          `
          )
          .in("status", ["paid", "door"])
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTickets(data || []);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching tickets:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
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

  const paidTickets = tickets.filter((ticket) => ticket.status === "paid");
  const doorTickets = tickets.filter((ticket) => ticket.status === "door");

  return (
    <div className="mt-8 sm:mt-14 md:mt-36 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-6">
          <TicketIcon className="h-8 w-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">Ticket Sales</h1>
        </div>

        <div className="grid gap-8">
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl shadow-lg p-6 border border-emerald-100">
            <h2 className="text-xl font-semibold text-emerald-600 mb-4">
              Online Ticket Sales
            </h2>
            <div className="space-y-4">
              {paidTickets.map((ticket) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {ticket.events.name}
                    </h3>
                    <p className="text-gray-600">
                      {format(
                        new Date(ticket.events.date),
                        "MMMM d, yyyy - h:mm a"
                      )}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg font-medium">
                    Paid
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg p-6 border border-blue-100">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">
              Door Sales
            </h2>
            <div className="space-y-4">
              {doorTickets.map((ticket) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {ticket.events.name}
                    </h3>
                    <p className="text-gray-600">
                      {format(
                        new Date(ticket.events.date),
                        "MMMM d, yyyy - h:mm a"
                      )}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg font-medium">
                    Door
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
