"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/util/supabase/client";
import { Loader2 } from "lucide-react";
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
        <Loader2 className="w-8 h-8 text-[#ff914d] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-2xl overflow-hidden p-6 text-center"
        style={{
          background: "linear-gradient(145deg, #221508 0%, #1c1208 100%)",
          boxShadow: "0 2px 20px rgba(0,0,0,0.28)",
          border: "1px solid #3a2812",
        }}
      >
        <div className="text-[#ff914d] font-medium flex flex-col items-center gap-2">
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
    <div className="min-h-screen pt-24 pb-20 px-5 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <TicketIcon className="h-8 w-8 text-[#ff914d]" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#ff914d]/80 mb-1">
                Financial Overview
              </p>
              <h1
                className="font-cormorant italic text-[#2c1810] text-4xl font-light"
                style={{ fontFamily: "Cormorant Garamond" }}
              >
                Ticket Sales
              </h1>
            </div>
          </div>
          <Link
            href="/admin/manage-events/statistics/hosts"
            className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition"
            style={{
              background: "#241809",
              border: "1px solid #3a2812",
              color: "#9a8e82",
            }}
          >
            Open Host Finance Overview
          </Link>
        </div>

        <div className="grid gap-8">
          <div
            className="rounded-2xl overflow-hidden p-6"
            style={{
              background: "linear-gradient(145deg, #221508 0%, #1c1208 100%)",
              boxShadow: "0 2px 20px rgba(0,0,0,0.28)",
            }}
          >
            <div
              className="h-[1.5px] mb-6"
              style={{
                background: "linear-gradient(to right, rgba(255,145,77,0.4), transparent 60%)",
              }}
            />
            <h2 className="text-xl font-semibold text-[#ff914d] mb-4">
              Online Ticket Sales
            </h2>
            <div className="space-y-4">
              {paidTickets.map((ticket) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl flex justify-between items-center gap-4"
                  style={{
                    background: "#faf6f2",
                    border: "1px solid #e8ddd3",
                  }}
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-[#2c1810]">
                      {ticket.events.name}
                    </h3>
                    <p className="text-[#9a7a62]">
                      {format(
                        new Date(ticket.events.date),
                        "MMMM d, yyyy - h:mm a"
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="px-3 py-1 rounded-lg font-medium text-[#ff914d]"
                      style={{
                        background: "rgba(255,145,77,0.15)",
                        border: "1px solid rgba(255,145,77,0.3)",
                      }}
                    >
                      Paid
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div
            className="rounded-2xl overflow-hidden p-6"
            style={{
              background: "linear-gradient(145deg, #221508 0%, #1c1208 100%)",
              boxShadow: "0 2px 20px rgba(0,0,0,0.28)",
            }}
          >
            <div
              className="h-[1.5px] mb-6"
              style={{
                background: "linear-gradient(to right, rgba(255,145,77,0.4), transparent 60%)",
              }}
            />
            <h2 className="text-xl font-semibold text-[#ff914d] mb-4">
              Door Sales
            </h2>
            <div className="space-y-4">
              {doorTickets.map((ticket) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl flex justify-between items-center"
                  style={{
                    background: "#faf6f2",
                    border: "1px solid #e8ddd3",
                  }}
                >
                  <div>
                    <h3 className="font-medium text-[#2c1810]">
                      {ticket.events.name}
                    </h3>
                    <p className="text-[#9a7a62]">
                      {format(
                        new Date(ticket.events.date),
                        "MMMM d, yyyy - h:mm a"
                      )}
                    </p>
                  </div>
                  <span
                    className="px-3 py-1 rounded-lg font-medium text-[#c0b4a8]"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid #3a2812",
                    }}
                  >
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
