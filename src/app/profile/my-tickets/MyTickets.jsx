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
import { ChevronLeft, Ticket } from "lucide-react";
import { supabase } from "@/util/supabase/client";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import PageBackground from "@/app/components/ui/PageBackground";
import ProfileHero from "@/app/profile/components/ProfileHero";

const ACCENT = "#f59e0b";

const fetcher = async (key, supabase, email) => {
  const { data, error } = await supabase
    .from("tickets")
    .select(
      `id, buyer_email, order_id, status, quantity, total_price, variant_name, created_at, events (name, date, duration)`,
    )
    .in("status", ["paid", "door"])
    .eq("buyer_email", email)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

function TicketCard({ ticket, i }) {
  return (
    <motion.div
      key={ticket.id}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group relative rounded-2xl overflow-hidden"
      style={{
        background: "#ffffff",
        border: "1.5px solid #f0e6d8",
        boxShadow: "0 2px 14px rgba(60,30,10,0.07)",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(60,30,10,0.12), 0 0 0 1.5px rgba(245,158,11,0.25)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 14px rgba(60,30,10,0.07)"; }}
    >
      {/* Subtle amber wash */}
      <div
        className="pointer-events-none absolute inset-0 z-0 rounded-2xl opacity-40 transition-opacity group-hover:opacity-70"
        style={{ background: "radial-gradient(ellipse 80% 100% at 0% 80%, rgba(245,158,11,0.07) 0%, transparent 55%)" }}
        aria-hidden
      />
      {/* Left accent bar */}
      <div
        className="pointer-events-none absolute left-0 top-1/2 z-[2] h-[55%] w-[3px] -translate-y-1/2 rounded-full opacity-50 transition-opacity group-hover:opacity-90"
        style={{ background: `linear-gradient(180deg, ${ACCENT} 0%, transparent 92%)` }}
        aria-hidden
      />
      {/* Top border accent */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl opacity-50 group-hover:opacity-90 transition-opacity"
        style={{ background: `linear-gradient(to right, ${ACCENT}, transparent)` }}
        aria-hidden
      />

      <div className="relative z-[2] p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-5">
          <div className="flex-1 space-y-3">
            <h2
              className="font-cormorant font-light italic leading-tight transition-colors"
              style={{ fontSize: "clamp(1.35rem, 3vw, 1.85rem)", color: "#2c1810" }}
            >
              {ticket.events?.name || "Event Name Not Available"}
            </h2>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 text-sm" style={{ color: "#9a7a62" }}>
                <CalendarIcon className="h-4 w-4 flex-shrink-0" style={{ color: `${ACCENT}90` }} />
                <span>
                  {ticket.events?.date
                    ? format(new Date(ticket.events.date), "PPP")
                    : "Date Not Available"}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-sm" style={{ color: "#9a7a62" }}>
                <ClockIcon className="h-4 w-4 flex-shrink-0" style={{ color: `${ACCENT}90` }} />
                <span>
                  {ticket.events?.duration
                    ? `${ticket.events.duration} hours`
                    : "Duration Not Available"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-between gap-3">
            <div className="text-right">
              <div
                className="font-cormorant font-light tabular-nums"
                style={{ fontSize: "1.85rem", color: ACCENT }}
              >
                ×{ticket.quantity}
              </div>
              <div className="space-y-0.5 mt-1">
                {ticket.variant_name && (
                  <p className="text-xs" style={{ color: "#9a7a62" }}>{ticket.variant_name}</p>
                )}
                <p className="text-sm font-medium" style={{ color: "#2c1810" }}>
                  {ticket.total_price ? `${ticket.total_price} ISK` : "Price Not Available"}
                </p>
              </div>
            </div>

            <div>
              {ticket.status === "paid" ? (
                <span
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: "rgba(245,158,11,0.12)", color: "#d97706" }}
                >
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                  Paid
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: "#f3f0ec", color: "#9a7a62" }}
                >
                  <ExclamationCircleIcon className="h-3.5 w-3.5" />
                  Pay at Door
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function MyTickets() {
  const [showPastTickets, setShowPastTickets] = useState(false);
  const { data: session } = useSession();

  const { data: tickets, error, isLoading } = useSWR(
    session ? ["tickets", session.user.email] : null,
    ([key, email]) => fetcher(key, supabase, email),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000,
      dedupingInterval: 5000,
    },
  );

  const { upcomingTickets, pastTickets } = useMemo(() => {
    const now = new Date();
    return {
      upcomingTickets: tickets?.filter((t) => new Date(t.events?.date) >= now) || [],
      pastTickets: tickets?.filter((t) => new Date(t.events?.date) < now) || [],
    };
  }, [tickets]);

  const ticketsToShow = showPastTickets ? pastTickets : upcomingTickets;

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="min-h-screen relative">
      <PageBackground />
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    </div>
  );

  // ── Error / no session ───────────────────────────────────────────────────────
  if (error || !session) return (
    <div className="min-h-screen relative">
      <PageBackground />
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm text-center"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
            style={{ background: "#fff3e8", border: "1.5px solid #ffd6aa" }}
          >
            <ExclamationCircleIcon className="h-10 w-10" style={{ color: "#ff914d" }} />
          </div>
          <h1 className="font-cormorant font-light italic text-4xl mb-3" style={{ color: "#2c1810" }}>
            Please sign in
          </h1>
          <p className="mb-10 text-base" style={{ color: "#9a7a62" }}>
            Log in or register to view your tickets
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-full text-white transition-colors"
            style={{ background: "#ff914d" }}
          >
            Go to Login
          </Link>
        </motion.div>
      </div>
    </div>
  );

  // ── No tickets ───────────────────────────────────────────────────────────────
  if (!tickets?.length) return (
    <div className="min-h-screen relative">
      <PageBackground />
      <ProfileHero
        title="My Tickets"
        eyebrow="Your bookings"
        subtitle="Upcoming & past events"
        compact
      />
      <div className="relative z-10 flex items-center justify-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm text-center"
        >
          <div
            className="relative inline-flex items-center justify-center mb-8"
          >
            <div
              className="absolute w-24 h-24 rounded-full opacity-40"
              style={{ background: "radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 75%)", filter: "blur(10px)" }}
            />
            <div
              className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center"
              style={{
                background: "#fff8ed",
                border: "1.5px solid #fde68a",
                boxShadow: "0 4px 20px rgba(245,158,11,0.15)",
              }}
            >
              <Ticket className="w-9 h-9" style={{ color: ACCENT }} strokeWidth={1.35} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-[0.45em] mb-2" style={{ color: `${ACCENT}90` }}>Your tickets</p>
          <h2 className="font-cormorant font-light italic text-4xl mb-4" style={{ color: "#2c1810" }}>
            No bookings yet
          </h2>
          <p className="text-base mb-10" style={{ color: "#9a7a62" }}>
            You haven&apos;t purchased any tickets yet.
          </p>
          <Link
            href="/events"
            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-full text-white transition-colors"
            style={{ background: "#ff914d" }}
          >
            Explore Events
          </Link>
        </motion.div>
      </div>
    </div>
  );

  // ── Main ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen relative">
      <PageBackground />
      <ProfileHero
        title="My Tickets"
        eyebrow="Your bookings"
        subtitle="Upcoming & past events"
        compact
      />

      <div className="relative z-10 mx-auto max-w-sm px-5 pb-16 pt-6 sm:max-w-xl lg:max-w-6xl xl:max-w-7xl lg:px-10">

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-sm transition-colors mb-8"
            style={{ color: "#9a7a62" }}
            onMouseEnter={e => e.currentTarget.style.color = "#6b4e37"}
            onMouseLeave={e => e.currentTarget.style.color = "#9a7a62"}
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Profile
          </Link>
        </motion.div>

        {/* Upcoming / Past toggle */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3 mb-8"
        >
          <button
            type="button"
            onClick={() => setShowPastTickets(false)}
            className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
            style={!showPastTickets
              ? { background: "#ff914d", color: "#fff", boxShadow: "0 2px 10px rgba(255,145,77,0.3)" }
              : { background: "#ffffff", color: "#9a7a62", border: "1.5px solid #e8ddd3" }
            }
          >
            Upcoming
          </button>
          <button
            type="button"
            onClick={() => setShowPastTickets(true)}
            className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
            style={showPastTickets
              ? { background: "#ff914d", color: "#fff", boxShadow: "0 2px 10px rgba(255,145,77,0.3)" }
              : { background: "#ffffff", color: "#9a7a62", border: "1.5px solid #e8ddd3" }
            }
          >
            Past
          </button>
          <span className="text-xs ml-auto" style={{ color: "#c0a890" }}>
            {ticketsToShow.length} {ticketsToShow.length === 1 ? "event" : "events"}
          </span>
        </motion.div>

        {/* Ticket list or empty state */}
        {ticketsToShow.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl text-center py-14 px-6"
            style={{
              background: "#ffffff",
              border: "1.5px solid #f0e6d8",
              boxShadow: "0 2px 14px rgba(60,30,10,0.06)",
            }}
          >
            <CalendarIcon className="h-10 w-10 mx-auto mb-4" style={{ color: "#e8ddd3" }} />
            <p className="text-base mb-6" style={{ color: "#9a7a62" }}>
              No {showPastTickets ? "past" : "upcoming"} tickets found.
            </p>
            {!showPastTickets && (
              <Link
                href="/events"
                className="inline-flex items-center justify-center px-7 py-3 text-base font-semibold rounded-full text-white transition-colors"
                style={{ background: "#ff914d" }}
              >
                Explore Events
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {ticketsToShow.map((ticket, i) => (
              <TicketCard key={ticket.id} ticket={ticket} i={i} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
