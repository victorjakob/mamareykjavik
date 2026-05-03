"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TicketIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  Loader2,
  BarChart2,
  Pencil,
  Eye,
  Copy,
  DoorOpen,
} from "lucide-react";
import FacebookLinkModal from "@/app/components/admin/FacebookLinkModal";

// ── Action button ──────────────────────────────────────────────────────────────
function ActionBtn({ href, onClick, loading, icon: Icon, label, variant = "ghost", compact }) {
  const styles = {
    orange: {
      background: "#ff914d",
      color: "#fff",
      border: "none",
      boxShadow: "0 2px 8px rgba(255,145,77,0.28)",
    },
    green: {
      background: "#ecfdf5",
      color: "#059669",
      border: "1.5px solid #bbf7d0",
    },
    ghost: {
      background: "#ffffff",
      color: "#9a7a62",
      border: "1.5px solid #e8ddd3",
    },
    amber: {
      background: "#fffbeb",
      color: "#d97706",
      border: "1.5px solid #fde68a",
    },
    danger: {
      background: "#fff1f0",
      color: "#dc2626",
      border: "1.5px solid #fecaca",
    },
    // "Gate Keeper" — darker, intentional; it locks the tablet into kiosk
    // mode so we want it to feel heavier than the other ticket actions.
    dark: {
      background: "#2c1810",
      color: "#f0ebe3",
      border: "none",
      boxShadow: "0 2px 10px rgba(44,24,16,0.3)",
    },
  };

  const s = styles[variant] || styles.ghost;
  const inner = (
    <span className={`inline-flex items-center gap-1.5 font-medium ${compact ? "text-xs" : "text-sm"}`}>
      {loading
        ? <Loader2 className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"} animate-spin`} />
        : Icon && <Icon className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"}`} strokeWidth={1.75} />
      }
      {label}
    </span>
  );

  const baseClass = compact
    ? "relative inline-flex items-center justify-center px-3 py-1.5 rounded-full transition-all duration-200"
    : "relative inline-flex items-center justify-center px-4 py-2 rounded-full transition-all duration-200";

  if (href) return (
    <div className="relative">
      <Link href={href} onClick={onClick} className={baseClass} style={s}>
        {inner}
      </Link>
      {loading && (
        <div className="absolute inset-0 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.12)" }}>
          <Loader2 className="h-4 w-4 text-white animate-spin" />
        </div>
      )}
    </div>
  );

  return (
    <button type="button" onClick={onClick} disabled={loading} className={`${baseClass} disabled:opacity-50 disabled:cursor-not-allowed`} style={s}>
      {inner}
    </button>
  );
}

// ── Event card ─────────────────────────────────────────────────────────────────
function EventCard({ event, navigatingTo, setNavigatingTo, onDelete, deletingId, onFacebook }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group rounded-2xl overflow-hidden"
      style={{
        background: "#ffffff",
        border: "1.5px solid #f0e6d8",
        boxShadow: "0 2px 14px rgba(60,30,10,0.07)",
        transition: "box-shadow 0.25s ease",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 28px rgba(60,30,10,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 14px rgba(60,30,10,0.07)"; }}
    >
      {/* Top accent bar */}
      <div className="h-[3px] w-full" style={{ background: "linear-gradient(to right, #ff914d, #ffb06a40)" }} />

      <div className="flex flex-col sm:flex-row sm:items-start gap-0">
        {/* Thumbnail — FB cover ratio (1200×630); fixed height so wide art isn’t cropped to a sliver */}
        <div className="w-full sm:w-[280px] md:w-[300px] shrink-0 sm:self-start">
          <div className="relative aspect-[1200/630] w-full overflow-hidden">
            <Image
              src={event.image || "https://placehold.co/600x400"}
              alt={event.name}
              fill
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 300px"
              priority
            />
            {/* Date badge */}
            <div
              className="absolute top-3 left-3 rounded-xl px-3 py-1.5 text-xs font-semibold backdrop-blur-sm"
              style={{ background: "rgba(255,249,240,0.92)", color: "#c05a1a", border: "1px solid rgba(255,145,77,0.25)" }}
            >
              {format(new Date(event.date), "MMM d, yyyy")}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-4 sm:p-5 min-w-0">
          <div>
            {/* Name + Facebook */}
            <div className="flex items-start gap-2 mb-1.5">
              <h3
                className="font-cormorant font-light italic leading-tight flex-1"
                style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)", color: "#2c1810" }}
              >
                {event.name}
              </h3>
              <button
                onClick={() => onFacebook(event)}
                className="mt-1 p-1.5 rounded-lg transition-all flex-shrink-0"
                style={{
                  color: event.facebook_link ? "#2563eb" : "#c0a890",
                  background: event.facebook_link ? "#eff6ff" : "transparent",
                }}
                title={event.facebook_link ? "Edit Facebook link" : "Add Facebook link"}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
            </div>

            {event.shortdescription && (
              <p className="text-sm leading-relaxed line-clamp-2 mb-3" style={{ color: "#9a7a62" }}>
                {event.shortdescription}
              </p>
            )}

            {/* Meta chips */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: "#fff8f2", color: "#c05a1a", border: "1px solid #ffd6aa" }}>
                <ClockIcon className="h-3 w-3" />
                {format(new Date(event.date), "h:mm a")}
                {event.duration && ` · ${Number(event.duration) % 1 === 0 ? event.duration : parseFloat(event.duration).toFixed(1)}h`}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: "#f0fdf4", color: "#059669", border: "1px solid #bbf7d0" }}>
                <CurrencyDollarIcon className="h-3 w-3" />
                {event.price} ISK
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" }}>
                <TicketIcon className="h-3 w-3" />
                {event.ticketCount} sold
              </span>
            </div>
          </div>

          {/* Actions — two groups; side-by-side from md to save vertical space */}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-2.5">
            <div
              className="rounded-xl px-2.5 py-2 sm:px-3 sm:py-2.5"
              style={{
                background: "linear-gradient(145deg, #fff9f4 0%, #f3faf6 100%)",
                border: "1px solid #e8e2d8",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
              }}
            >
              <p
                className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: "#a89482" }}
              >
                Tickets &amp; reports
              </p>
              <div className="flex flex-wrap gap-1.5">
                <ActionBtn
                  href={`/events/manager/${event.slug}/attendance`}
                  onClick={() => setNavigatingTo(`/events/manager/${event.slug}/attendance`)}
                  loading={navigatingTo === `/events/manager/${event.slug}/attendance`}
                  icon={TicketIcon}
                  label="Ticket Sales"
                  variant="orange"
                  compact
                />
                <ActionBtn
                  href={`/events/manager/${event.slug}/sales-stats`}
                  onClick={() => setNavigatingTo(`/events/manager/${event.slug}/sales-stats`)}
                  loading={navigatingTo === `/events/manager/${event.slug}/sales-stats`}
                  icon={BarChart2}
                  label="Sales Stats"
                  variant="green"
                  compact
                />
                <ActionBtn
                  href={`/events/manager/${event.slug}/gatekeeper`}
                  onClick={() => setNavigatingTo(`/events/manager/${event.slug}/gatekeeper`)}
                  loading={navigatingTo === `/events/manager/${event.slug}/gatekeeper`}
                  icon={DoorOpen}
                  label="Gate Keeper"
                  variant="dark"
                  compact
                />
              </div>
            </div>

            <div
              className="rounded-xl px-2.5 py-2 sm:px-3 sm:py-2.5"
              style={{
                background: "#f7f5f2",
                border: "1px solid #e5e0d8",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.65)",
              }}
            >
              <p
                className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: "#a89482" }}
              >
                Manage event
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                <ActionBtn
                  href={`/events/${event.slug}`}
                  onClick={() => setNavigatingTo(`/events/${event.slug}`)}
                  loading={navigatingTo === `/events/${event.slug}`}
                  icon={Eye}
                  label="View"
                  variant="ghost"
                  compact
                />
                <ActionBtn
                  href={`/events/manager/${event.slug}/edit`}
                  onClick={() => setNavigatingTo(`/events/manager/${event.slug}/edit`)}
                  loading={navigatingTo === `/events/manager/${event.slug}/edit`}
                  icon={Pencil}
                  label="Edit"
                  variant="ghost"
                  compact
                />
                <ActionBtn
                  href={`/admin/create-event?duplicate=${event.id}`}
                  onClick={() => setNavigatingTo(`/admin/create-event?duplicate=${event.id}`)}
                  loading={navigatingTo === `/admin/create-event?duplicate=${event.id}`}
                  icon={Copy}
                  label="Duplicate"
                  variant="amber"
                  compact
                />
                <ActionBtn
                  onClick={() => onDelete(event.id, event.name)}
                  loading={deletingId === event.id}
                  icon={TrashIcon}
                  label="Delete"
                  variant="danger"
                  compact
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function ManageEvents({ initialData }) {
  const router = useRouter();
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [navigatingTo, setNavigatingTo] = useState(null);
  const [deletingEventId, setDeletingEventId] = useState(null);
  const [facebookModal, setFacebookModal] = useState({
    isOpen: false, eventId: null, eventName: "", currentLink: "",
  });
  const { events, user } = initialData;

  const handleDelete = useCallback(async (eventId, eventName) => {
    if (!window.confirm(`Are you sure you want to delete "${eventName}"? This cannot be undone.`)) return;
    try {
      setDeletingEventId(eventId);
      const response = await fetch(`/api/events/delete?eventId=${encodeURIComponent(eventId)}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Failed to delete event");
      router.refresh();
    } catch (err) {
      alert(err.message || "Failed to delete event");
    } finally {
      setDeletingEventId(null);
    }
  }, [router]);

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date();
    const upcoming = events
      .filter((e) => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    const past = events
      .filter((e) => new Date(e.date) < now)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    return { upcomingEvents: upcoming, pastEvents: past };
  }, [events]);

  useEffect(() => {
    if (!navigatingTo) return;
    const id = setTimeout(() => setNavigatingTo(null), 3000);
    return () => clearTimeout(id);
  }, [navigatingTo]);

  const openFacebookModal  = (event) => setFacebookModal({ isOpen: true, eventId: event.id, eventName: event.name, currentLink: event.facebook_link || "" });
  const closeFacebookModal = () => setFacebookModal({ isOpen: false, eventId: null, eventName: "", currentLink: "" });

  const handleSaveFacebookLink = async (facebookLink) => {
    const response = await fetch("/api/events/update-facebook-link", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: facebookModal.eventId, facebookLink }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update Facebook link");
    }
    window.location.reload();
  };

  // ── No user ──
  if (!user) return (
    <div className="max-w-sm mx-auto px-4 py-16 text-center">
      <div
        className="rounded-2xl p-8"
        style={{ background: "#ffffff", border: "1.5px solid #f0e6d8", boxShadow: "0 2px 14px rgba(60,30,10,0.07)" }}
      >
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "#fff3e8", border: "1.5px solid #ffd6aa" }}>
          <svg className="w-8 h-8" style={{ color: "#ff914d" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="font-cormorant font-light italic text-3xl mb-2" style={{ color: "#2c1810" }}>
          Sign in required
        </h2>
        <p className="text-sm mb-8" style={{ color: "#9a7a62" }}>Please log in to manage your events.</p>
        <Link href="/auth"
          className="inline-flex items-center justify-center px-7 py-3 rounded-full text-base font-semibold text-white transition-colors"
          style={{ background: "#ff914d" }}>
          Go to Login
        </Link>
      </div>
    </div>
  );

  const visibleEvents = showUpcoming ? upcomingEvents : pastEvents;

  return (
    <div>
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-cormorant font-light italic" style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", color: "#2c1810" }}>
            Your events
          </h2>
        </div>
        <Link
          href="/admin/create-event"
          onClick={() => setNavigatingTo("/admin/create-event")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:brightness-110"
          style={{ background: "#059669", boxShadow: "0 2px 10px rgba(5,150,105,0.35)" }}
        >
          {navigatingTo === "/admin/create-event"
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <PlusIcon className="h-4 w-4" />
          }
          Create Event
        </Link>
      </div>

      {/* Upcoming / Past toggle */}
      <div className="flex items-center gap-2 mb-7">
        {[
          { key: true,  label: `Upcoming`, count: upcomingEvents.length },
          { key: false, label: `Past`,     count: pastEvents.length },
        ].map(({ key, label, count }) => (
          <button
            key={String(key)}
            onClick={() => setShowUpcoming(key)}
            className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-200"
            style={showUpcoming === key
              ? { background: "#ff914d", color: "#fff", boxShadow: "0 2px 10px rgba(255,145,77,0.3)" }
              : { background: "#ffffff", color: "#9a7a62", border: "1.5px solid #e8ddd3" }
            }
          >
            {label}
            <span
              className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
              style={showUpcoming === key
                ? { background: "rgba(255,255,255,0.25)", color: "#fff" }
                : { background: "#f3ede7", color: "#9a7a62" }
              }
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Event list */}
      <AnimatePresence mode="wait">
        <motion.div
          key={showUpcoming ? "upcoming" : "past"}
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {visibleEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 rounded-2xl"
              style={{ background: "#fff8f2", border: "1.5px solid #f0e6d8" }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "#fff3e8", border: "1.5px solid #ffd6aa" }}
              >
                <CalendarIcon className="h-7 w-7" style={{ color: "#ff914d" }} />
              </div>
              <p className="text-base" style={{ color: "#9a7a62" }}>
                No {showUpcoming ? "upcoming" : "past"} events found.
              </p>
            </motion.div>
          ) : (
            visibleEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                navigatingTo={navigatingTo}
                setNavigatingTo={setNavigatingTo}
                onDelete={handleDelete}
                deletingId={deletingEventId}
                onFacebook={openFacebookModal}
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>

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
