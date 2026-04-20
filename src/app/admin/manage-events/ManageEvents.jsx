"use client";
import { useState, useCallback } from "react";
import { supabase } from "@/util/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  ChartBarIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { Loader2, Ticket, BarChart2, Copy, Banknote, CalendarDays, Clock, Tag } from "lucide-react";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ElegantLoadingOverlay from "@/app/components/ui/ElegantLoadingOverlay";
import FacebookLinkModal from "@/app/components/admin/FacebookLinkModal";

export default function ManageEvents({ initialEvents }) {
  const [events, setEvents] = useState(initialEvents);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [page, setPage] = useState(1);
  const [navigatingTo, setNavigatingTo] = useState(null);
  const [facebookModal, setFacebookModal] = useState({
    isOpen: false,
    eventId: null,
    eventName: "",
    currentLink: "",
  });
  const ITEMS_PER_PAGE = 10;

  const filteredEvents = events
    .filter((e) => (showPastEvents ? e.isPast : !e.isPast))
    .sort((a, b) =>
      showPastEvents
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date)
    );

  const paginatedEvents = showPastEvents
    ? filteredEvents.slice(0, page * ITEMS_PER_PAGE)
    : filteredEvents;
  const hasMore = showPastEvents && filteredEvents.length > page * ITEMS_PER_PAGE;

  const openFacebookModal = (event) =>
    setFacebookModal({ isOpen: true, eventId: event.id, eventName: event.name, currentLink: event.facebook_link || "" });
  const closeFacebookModal = () =>
    setFacebookModal({ isOpen: false, eventId: null, eventName: "", currentLink: "" });

  const handleSaveFacebookLink = async (facebookLink) => {
    try {
      const response = await fetch("/api/events/update-facebook-link", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: facebookModal.eventId, facebookLink }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to update Facebook link");
      }
      setEvents(events.map((e) =>
        e.id === facebookModal.eventId ? { ...e, facebook_link: facebookLink } : e
      ));
    } catch (error) {
      setError(error.message || "Failed to update Facebook link");
    }
  };

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Are you sure you want to delete this event? Have you emailed every attendee?")) return;
    try {
      setLoading(true);
      const { error: ticketsError } = await supabase.from("tickets").delete().eq("event_id", id);
      if (ticketsError) throw ticketsError;
      const { error: eventError } = await supabase.from("events").delete().eq("id", id);
      if (eventError) throw eventError;
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <LoadingSpinner />
    </div>
  );

  if (error) return (
    <div className="rounded-2xl p-6 text-center mt-6"
      style={{ background: "#fff5f5", border: "1px solid #fecaca" }}>
      <p className="text-red-500 text-sm">{error}</p>
    </div>
  );

  return (
    <div className="pb-8">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="pt-8 pb-8"
      >
        <p className="text-[10px] uppercase tracking-[0.5em] mb-2" style={{ color: "#ff914d" }}>
          Admin · Events
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1
            className="font-cormorant font-light italic leading-none"
            style={{ fontSize: "clamp(2.4rem, 5vw, 3.6rem)", color: "#1e1410" }}
          >
            Manage Events
          </h1>
          <div className="relative shrink-0">
            <Link
              href="/admin/create-event"
              onClick={() => setNavigatingTo("/admin/create-event")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{ background: "#ff914d", color: "#fff", boxShadow: "0 2px 10px rgba(255,145,77,0.3)" }}
            >
              <PlusIcon className="w-4 h-4" />
              Create New Event
            </Link>
            <ElegantLoadingOverlay isLoading={navigatingTo === "/admin/create-event"} variant="gradient" size="lg" className="rounded-xl" />
          </div>
        </div>
      </motion.div>

      {/* ── Action bar ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        className="flex flex-wrap gap-2 mb-7"
      >
        <button
          onClick={() => { setShowPastEvents(!showPastEvents); setPage(1); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
          style={showPastEvents
            ? { background: "#fff3e8", color: "#e07020", border: "1.5px solid #ffb87a" }
            : { background: "#fff", color: "#5a4a3a", border: "1.5px solid #ddd8d2" }
          }
        >
          <CalendarDays className="w-3.5 h-3.5" />
          {showPastEvents ? "Show Upcoming" : "Show Past Events"}
        </button>

        <div className="relative">
          <Link
            href="/admin/manage-events/host-invites"
            onClick={() => setNavigatingTo("/admin/manage-events/host-invites")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: "#fff", color: "#5a4a3a", border: "1.5px solid #ddd8d2" }}
          >
            <UserPlusIcon className="w-4 h-4" />
            Invite Host
          </Link>
          <ElegantLoadingOverlay isLoading={navigatingTo === "/admin/manage-events/host-invites"} variant="pulse" size="md" className="rounded-xl" />
        </div>

        <div className="relative">
          <Link
            href="/admin/manage-events/statistics/hosts"
            onClick={() => setNavigatingTo("/admin/manage-events/statistics/hosts")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: "#fff", color: "#5a4a3a", border: "1.5px solid #ddd8d2" }}
          >
            <ChartBarIcon className="w-4 h-4" />
            Host Finance
          </Link>
          <ElegantLoadingOverlay isLoading={navigatingTo === "/admin/manage-events/statistics/hosts"} variant="pulse" size="md" className="rounded-xl" />
        </div>
      </motion.div>

      {/* ── Count label ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xs font-medium" style={{ color: "#9a8878" }}>
          {filteredEvents.length} {showPastEvents ? "past" : "upcoming"} event{filteredEvents.length !== 1 ? "s" : ""}
        </span>
        <div className="flex-1 h-px" style={{ background: "#e5e3e0" }} />
      </div>

      {/* ── Event cards ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {paginatedEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 rounded-2xl"
            style={{ background: "#fff", border: "1.5px dashed #ddd8d2" }}
          >
            <CalendarDays className="w-9 h-9 mx-auto mb-3" style={{ color: "#c8bfb6" }} />
            <p className="font-cormorant italic text-xl" style={{ color: "#9a8878" }}>
              No {showPastEvents ? "past" : "upcoming"} events
            </p>
            <p className="text-xs mt-1" style={{ color: "#b8afa6" }}>
              {showPastEvents ? "Nothing in the archives yet" : "Time to create something beautiful ✦"}
            </p>
          </motion.div>
        ) : (
          paginatedEvents.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.36, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(60,30,10,0.1)" }}
              className="group rounded-2xl overflow-hidden"
              style={{
                background: "#fff",
                boxShadow: "0 1px 6px rgba(60,30,10,0.06)",
                border: "1px solid #eae6e1",
              }}
            >
              <div className="flex flex-col sm:flex-row">

                {/* Thumbnail */}
                <div className="relative w-full sm:w-44 h-40 sm:h-auto shrink-0 overflow-hidden">
                  <Image
                    src={event.image || "https://placehold.co/600x400/f5ede0/c07040?text=✦"}
                    alt={event.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 176px"
                  />
                  {/* Date badge */}
                  <div
                    className="absolute top-3 left-3 px-2.5 py-1.5 rounded-lg text-center"
                    style={{
                      background: "rgba(255,255,255,0.94)",
                      backdropFilter: "blur(8px)",
                      boxShadow: "0 1px 6px rgba(0,0,0,0.1)",
                    }}
                  >
                    <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#ff914d" }}>
                      {format(new Date(event.date), "MMM")}
                    </p>
                    <p className="text-xl font-bold leading-tight" style={{ color: "#1e1410" }}>
                      {format(new Date(event.date), "d")}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 p-4">

                  {/* Title + icon actions */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h2
                      className="font-cormorant italic text-2xl font-light leading-tight flex-1 min-w-0"
                      style={{ color: "#1e1410" }}
                    >
                      {event.name}
                    </h2>

                    <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
                      {/* Facebook */}
                      <button
                        onClick={() => openFacebookModal(event)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={event.facebook_link
                          ? { color: "#3b82f6", background: "rgba(59,130,246,0.07)" }
                          : { color: "#c8bfb6" }
                        }
                        title={event.facebook_link ? "Edit Facebook link" : "Add Facebook link"}
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </button>

                      {/* View */}
                      <div className="relative">
                        <a
                          href={`/events/${event.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setNavigatingTo(`/events/${event.slug}`)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: "#c8bfb6" }}
                          onMouseEnter={e => { e.currentTarget.style.color = "#5a4a3a"; e.currentTarget.style.background = "#f5f0eb"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "#c8bfb6"; e.currentTarget.style.background = "transparent"; }}
                          title="View event"
                        >
                          <EyeIcon className="w-3.5 h-3.5" />
                        </a>
                        <ElegantLoadingOverlay isLoading={navigatingTo === `/events/${event.slug}`} variant="minimal" size="sm" className="rounded-lg" />
                      </div>

                      {/* Edit */}
                      <div className="relative">
                        <a
                          href={`/events/manager/${event.slug}/edit`}
                          onClick={() => setNavigatingTo(`/events/manager/${event.slug}/edit`)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: "#ff914d", background: "rgba(255,145,77,0.07)" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,145,77,0.14)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,145,77,0.07)"; }}
                          title="Edit event"
                        >
                          <PencilSquareIcon className="w-3.5 h-3.5" />
                        </a>
                        <ElegantLoadingOverlay isLoading={navigatingTo === `/events/manager/${event.slug}/edit`} variant="minimal" size="sm" className="rounded-lg" />
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: "#d8b8b8" }}
                        onMouseEnter={e => { e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.background = "rgba(220,38,38,0.07)"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "#d8b8b8"; e.currentTarget.style.background = "transparent"; }}
                        title="Delete event"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Meta chips */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px]"
                      style={{ background: "#fff3e8", color: "#c05a1a", border: "1px solid #ffd6aa" }}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      {format(new Date(event.date), "h:mm a")} · {event.duration}h
                    </span>
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px]"
                      style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {event.price} kr
                    </span>
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium"
                      style={{ background: "#fefce8", color: "#854d0e", border: "1px solid #fde68a" }}
                    >
                      <Ticket className="w-2.5 h-2.5" />
                      {event.ticketCount} sold
                    </span>
                  </div>

                  {/* Action links */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { href: `/events/manager/${event.slug}/attendance`, label: "Ticket Sales", icon: Ticket,    color: "#6d28d9", bg: "#f5f3ff", border: "#ddd6fe" },
                      { href: `/events/manager/${event.slug}/sales-stats`, label: "Sales Stats",  icon: BarChart2, color: "#0369a1", bg: "#f0f9ff", border: "#bae6fd" },
                      { href: `/admin/create-event?duplicate=${event.id}`, label: "Duplicate",    icon: Copy,     color: "#374151", bg: "#f9fafb", border: "#d1d5db" },
                      { href: `/admin/manage-events/${event.id}/payments`, label: "Payments",     icon: Banknote,  color: "#065f46", bg: "#f0fdf4", border: "#6ee7b7" },
                    ].map(({ href, label, icon: Icon, color, bg, border }) => (
                      <div key={href} className="relative">
                        <Link
                          href={href}
                          onClick={() => setNavigatingTo(href)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg transition-opacity duration-150 hover:opacity-75"
                          style={{ background: bg, color, border: `1px solid ${border}` }}
                        >
                          {navigatingTo === href
                            ? <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            : <Icon className="w-2.5 h-2.5" />
                          }
                          {label}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}

        {/* Load more */}
        {showPastEvents && hasMore && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setPage((p) => p + 1)}
            className="mt-1 w-full py-3 rounded-2xl text-sm font-medium transition-all duration-200"
            style={{ background: "#fff", color: "#9a8878", border: "1.5px dashed #ddd8d2" }}
          >
            Load more past events ↓
          </motion.button>
        )}
      </div>

      <FacebookLinkModal
        isOpen={facebookModal.isOpen}
        onClose={closeFacebookModal}
        eventName={facebookModal.eventName}
        currentFacebookLink={facebookModal.currentLink}
        onSave={handleSaveFacebookLink}
      />
    </div>
  );
}
