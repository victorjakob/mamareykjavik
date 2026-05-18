"use client";

import Link from "next/link";
import { useState } from "react";

// ── Helpers ─────────────────────────────────────────────────────────────────
function fmtTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
function fmtDay(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

const STATUS_BADGE = {
  confirmed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  completed: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  no_show: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  cancelled: "bg-white/[0.05] text-white/40 border-white/10",
};

// ── Locations needed strip ──────────────────────────────────────────────────
function LocationsNeededRow({ booking, onSaved }) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const slot = booking.private_session_slots || {};
  const offering = booking.private_session_offerings || {};

  async function save() {
    if (!value.trim()) {
      setErr("Add an address first.");
      return;
    }
    setErr("");
    setBusy(true);
    try {
      const res = await fetch(`/api/private-session/admin/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_location", actual_location: value.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      onSaved(booking.id);
    } catch (e) {
      setErr(e.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-2xl bg-amber-500/[0.06] border border-amber-500/30">
      <div className="md:w-56 flex-shrink-0">
        <div className="text-[10px] uppercase tracking-[0.25em] text-amber-300">
          {fmtDay(slot.starts_at)} · {fmtTime(slot.starts_at)}
        </div>
        <div className="text-[#f0ebe3] text-sm">{booking.client_name}</div>
        <div className="text-[#a09488] text-xs">
          {offering.title}
          {booking.practitioner ? ` · ${booking.practitioner.name}` : ""}
        </div>
      </div>
      <div className="flex-1 flex flex-col sm:flex-row gap-2 sm:items-center">
        <input
          type="text"
          placeholder="Bankastræti 2, 101 Reykjavík …"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-[#f0ebe3] focus:border-[#ff914d] outline-none text-sm"
        />
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="px-5 py-2.5 rounded-full bg-[#ff914d] text-[#160f0a] text-[10px] tracking-[0.25em] uppercase font-semibold hover:bg-[#ffa566] transition disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save"}
        </button>
        <Link
          href={`/private-session/admin/bookings/${booking.id}`}
          className="px-4 py-2.5 rounded-full border border-white/15 text-[#d8cfc1] text-[10px] tracking-[0.25em] uppercase hover:bg-white/[0.05] transition text-center"
        >
          Open
        </Link>
      </div>
      {err && <div className="text-amber-300 text-xs">{err}</div>}
    </div>
  );
}

// ── Booking card (Today / Upcoming) ─────────────────────────────────────────
// Cancel is now the only inline action — Done / No-show were dropped because
// they were rarely used and added clutter to the row of buttons. Cancel goes
// through a proper confirmation modal (CancelBookingModal below) instead of
// firing immediately, so an accidental tap doesn't free up a slot.
function BookingCard({ booking, onCancelRequest }) {
  const slot = booking.private_session_slots || {};
  const offering = booking.private_session_offerings || {};
  const badgeCls = STATUS_BADGE[booking.status] || STATUS_BADGE.cancelled;

  return (
    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#ff914d] mb-1">
            {fmtDay(slot.starts_at)} · {fmtTime(slot.starts_at)} – {fmtTime(slot.ends_at)}
          </div>
          <Link
            href={`/private-session/admin/bookings/${booking.id}`}
            className="font-cormorant text-2xl italic text-[#f0ebe3] hover:text-[#ff914d] transition"
          >
            {booking.client_name}
          </Link>
          <div className="text-xs text-[#a09488]">
            {offering.title}
            {booking.practitioner ? ` · ${booking.practitioner.name}` : ""}
          </div>
        </div>
        <span className={`shrink-0 px-2.5 py-1 rounded-full border text-[10px] uppercase tracking-wider ${badgeCls}`}>
          {booking.status}
        </span>
      </div>

      <div className="text-xs text-[#a09488]">
        {slot.actual_location ? (
          <span className="text-[#d8cfc1]">📍 {slot.actual_location}</span>
        ) : (
          <span className="text-amber-300">No address yet</span>
        )}
      </div>

      {booking.status === "confirmed" && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={() => onCancelRequest(booking)}
            className="px-3 py-1.5 rounded-full bg-white/[0.05] text-[#d8cfc1] text-[10px] tracking-[0.2em] uppercase hover:bg-red-500/15 hover:text-red-200 transition"
          >
            Cancel booking
          </button>
        </div>
      )}
    </div>
  );
}

// ── Cancel confirmation modal ───────────────────────────────────────────────
// Replaces window.prompt — gives the admin a clear "you're about to free up
// this slot" moment, an optional reason field that's kept in the audit trail,
// and a real two-button choice. ESC + backdrop click both dismiss.
function CancelBookingModal({ booking, busy, onConfirm, onClose }) {
  const [reason, setReason] = useState("");

  if (!booking) return null;
  const slot = booking.private_session_slots || {};
  const offering = booking.private_session_offerings || {};

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-booking-title"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        className="relative w-full md:max-w-md bg-[#160f0a] border border-white/10 rounded-t-3xl md:rounded-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white/80 flex items-center justify-center disabled:opacity-50"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="px-6 md:px-8 pt-8 pb-4">
          <div className="text-[10px] uppercase tracking-[0.3em] text-red-300 mb-2">
            Cancel booking
          </div>
          <h3
            id="cancel-booking-title"
            className="font-cormorant text-2xl italic text-[#f0ebe3] mb-3"
          >
            {booking.client_name}
          </h3>
          <p className="text-sm text-[#a09488] leading-relaxed">
            <span className="text-[#d8cfc1]">{offering.title}</span>
            {booking.practitioner ? ` · ${booking.practitioner.name}` : ""}
            <br />
            {fmtDay(slot.starts_at)} · {fmtTime(slot.starts_at)} – {fmtTime(slot.ends_at)}
          </p>
        </div>

        <div className="px-6 md:px-8 pb-6 space-y-4">
          <div className="p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/25 text-[12px] text-amber-200/90 leading-relaxed">
            The booking will be cancelled and the slot will be opened up for
            re-booking.
          </div>

          <div>
            <label
              htmlFor="cancel-reason"
              className="block text-[10px] uppercase tracking-[0.25em] text-[#a09488] mb-2"
            >
              Reason (optional, kept in audit trail)
            </label>
            <textarea
              id="cancel-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Client asked to reschedule, no-show, …"
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-[#f0ebe3] focus:border-[#ff914d] outline-none text-sm resize-none"
            />
          </div>

          <div className="flex flex-wrap gap-3 justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="px-5 py-2.5 rounded-full border border-white/15 text-[#d8cfc1] text-[10px] tracking-[0.25em] uppercase hover:bg-white/[0.05] transition disabled:opacity-50"
            >
              Keep booking
            </button>
            <button
              type="button"
              onClick={() => onConfirm(booking.id, reason.trim() || null)}
              disabled={busy}
              className="px-5 py-2.5 rounded-full bg-red-500/90 text-white text-[10px] tracking-[0.25em] uppercase font-semibold hover:bg-red-500 transition disabled:opacity-50"
            >
              {busy ? "Cancelling…" : "Cancel booking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function TodayClient({ needLocation = [], upcoming = [] }) {
  const [hiddenLocationIds, setHiddenLocationIds] = useState(new Set());
  const [busy, setBusy] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  // Booking pending cancellation (drives the modal). null = modal closed.
  const [cancelTarget, setCancelTarget] = useState(null);

  async function confirmCancel(bookingId, reason) {
    setBusy(true);
    setActionMsg("");
    try {
      const res = await fetch(`/api/private-session/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", reason }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setActionMsg("Booking cancelled. Reloading…");
      setCancelTarget(null);
      // Reload so server data (and slot availability) refresh.
      setTimeout(() => window.location.reload(), 600);
    } catch (e) {
      setActionMsg(e.message || "Cancel failed");
    } finally {
      setBusy(false);
    }
  }

  const visibleNeedLocation = needLocation.filter((b) => !hiddenLocationIds.has(b.id));

  return (
    <div className="space-y-12">
      {/* Locations needed — pinned top, but only rendered when something is
          actually missing an address. Nothing-to-chase noise was dropped. */}
      {visibleNeedLocation.length > 0 && (
        <section>
          <h2 className="font-cormorant text-2xl italic text-amber-300 mb-4">
            Locations needed
            <span className="ml-3 text-[10px] uppercase tracking-[0.3em] text-amber-300/70 align-middle">
              {visibleNeedLocation.length}
            </span>
          </h2>
          <div className="space-y-3">
            {visibleNeedLocation.map((b) => (
              <LocationsNeededRow
                key={b.id}
                booking={b}
                onSaved={(id) => {
                  setHiddenLocationIds((prev) => {
                    const next = new Set(prev);
                    next.add(id);
                    return next;
                  });
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming — single chronological list (replaces the old Today / Next-14-days split). */}
      <section>
        <h2 className="font-cormorant text-2xl italic text-[#f0ebe3] mb-4">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="text-[#a09488] text-sm">No upcoming sessions.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                onCancelRequest={setCancelTarget}
              />
            ))}
          </div>
        )}
      </section>

      <CancelBookingModal
        booking={cancelTarget}
        busy={busy}
        onConfirm={confirmCancel}
        onClose={() => {
          if (!busy) setCancelTarget(null);
        }}
      />

      {actionMsg && (
        <div className="fixed bottom-6 right-6 px-5 py-3 rounded-xl bg-[#160f0a] border border-white/10 text-[#d8cfc1] text-sm shadow-lg">
          {actionMsg}
        </div>
      )}
      {busy && <div className="sr-only">Saving…</div>}
    </div>
  );
}
