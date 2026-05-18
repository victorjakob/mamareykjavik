"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const FIELD =
  "w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-[#f0ebe3] focus:border-[#ff914d] outline-none";

const STATUS_BADGE = {
  confirmed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  completed: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  no_show: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  cancelled: "bg-white/[0.05] text-white/40 border-white/10",
};

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function fmtShort(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AuditRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 border-b border-white/[0.04] last:border-0">
      <span className="text-[10px] uppercase tracking-[0.2em] text-[#a09488]">{label}</span>
      <span className="text-xs text-[#d8cfc1] tabular-nums">{value || "—"}</span>
    </div>
  );
}

export default function BookingDetailClient({ booking }) {
  const router = useRouter();
  const slot = booking.private_session_slots || {};
  const offering = booking.private_session_offerings || {};
  const practitioner = booking.practitioner;

  const [location, setLocation] = useState(slot.actual_location || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function call(action, extra = {}) {
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      const res = await fetch(`/api/private-session/admin/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setMsg("Saved.");
      router.refresh();
    } catch (e) {
      setErr(e.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  function saveLocation() {
    if (!location.trim()) {
      setErr("Add an address.");
      return;
    }
    return call("set_location", { actual_location: location.trim() });
  }

  function markCompleted() {
    return call("mark_completed");
  }

  function markNoShow() {
    return call("mark_no_show");
  }

  function cancel() {
    const reason = window.prompt("Cancellation reason (optional, kept in the audit trail):") ?? "";
    return call("cancel", { reason });
  }

  const badgeCls = STATUS_BADGE[booking.status] || STATUS_BADGE.cancelled;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Link
          href="/private-session/admin"
          className="text-[10px] uppercase tracking-[0.25em] text-[#ff914d] hover:underline"
        >
          ← Back to Today
        </Link>
        <div className="flex items-start justify-between gap-4 mt-2 flex-wrap">
          <div>
            <h2 className="font-cormorant text-3xl italic text-[#f0ebe3]">{booking.client_name}</h2>
            <p className="text-[#a09488] text-sm mt-1">
              {offering.title}
              {practitioner ? ` · ${practitioner.name}` : ""}
            </p>
            <p className="text-[#d8cfc1] text-sm mt-1">{fmt(slot.starts_at)} — {fmtShort(slot.ends_at)}</p>
            <p className="text-[10px] text-[#7a6d5e] mt-1 font-mono">{booking.reference_id}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full border text-[10px] uppercase tracking-wider ${badgeCls}`}>
            {booking.status}
          </span>
        </div>
      </div>

      {/* Client + Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <section className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-3">
          <h3 className="font-cormorant text-xl italic text-[#ff914d] pb-2 border-b border-white/[0.06]">
            Client
          </h3>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#a09488]">Email</div>
            <a
              href={`mailto:${booking.client_email}`}
              className="text-sm text-[#f0ebe3] hover:text-[#ff914d]"
            >
              {booking.client_email}
            </a>
          </div>
          {booking.client_phone && (
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#a09488]">Phone</div>
              <a
                href={`tel:${booking.client_phone}`}
                className="text-sm text-[#f0ebe3] hover:text-[#ff914d]"
              >
                {booking.client_phone}
              </a>
            </div>
          )}
          {booking.client_note && (
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-1">Note from client</div>
              <p className="text-sm text-[#d8cfc1] leading-relaxed whitespace-pre-wrap">{booking.client_note}</p>
            </div>
          )}
        </section>

        <section className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-3">
          <h3 className="font-cormorant text-xl italic text-[#ff914d] pb-2 border-b border-white/[0.06]">
            Location
          </h3>
          <p className="text-xs text-[#a09488] leading-relaxed">
            Filled in here and revealed to the client by the day-before email.
            {slot.published_area && (
              <span className="block mt-1">Public hint: <span className="text-[#d8cfc1]">{slot.published_area}</span></span>
            )}
          </p>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-1">Actual address</label>
            <textarea
              rows={2}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={`${FIELD} resize-none`}
              placeholder="Bankastræti 2, 101 Reykjavík"
            />
          </div>
          <button
            type="button"
            onClick={saveLocation}
            disabled={busy}
            className="px-5 py-2 rounded-full bg-[#ff914d] text-[#160f0a] text-[10px] tracking-[0.25em] uppercase font-semibold hover:bg-[#ffa566] transition disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save address"}
          </button>
        </section>
      </div>

      {/* Audit trail */}
      <section className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-1">
        <h3 className="font-cormorant text-xl italic text-[#ff914d] pb-3 border-b border-white/[0.06] mb-2">
          Audit trail
        </h3>
        <AuditRow label="Booked at" value={fmt(booking.created_at)} />
        <AuditRow label="Confirmation sent" value={fmt(booking.confirmation_email_sent_at)} />
        <AuditRow label="Day-before sent" value={fmt(booking.day_before_email_sent_at)} />
        <AuditRow label="Location alert sent" value={fmt(booking.location_alert_sent_at)} />
        <AuditRow label="Cancelled at" value={fmt(booking.cancelled_at)} />
        {booking.cancellation_reason && <AuditRow label="Reason" value={booking.cancellation_reason} />}
        {booking.cancelled_by && <AuditRow label="Cancelled by" value={booking.cancelled_by} />}
      </section>

      {/* Actions */}
      {booking.status === "confirmed" && (
        <section className="p-6 rounded-3xl bg-white/[0.02] border border-white/10">
          <h3 className="font-cormorant text-xl italic text-[#ff914d] pb-3 border-b border-white/[0.06] mb-4">
            Actions
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={markCompleted}
              disabled={busy}
              className="px-5 py-2.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-[10px] tracking-[0.25em] uppercase hover:bg-emerald-500/25 transition disabled:opacity-50"
            >
              Mark completed
            </button>
            <button
              type="button"
              onClick={markNoShow}
              disabled={busy}
              className="px-5 py-2.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-200 text-[10px] tracking-[0.25em] uppercase hover:bg-amber-500/25 transition disabled:opacity-50"
            >
              Mark no-show
            </button>
            <button
              type="button"
              onClick={cancel}
              disabled={busy}
              className="px-5 py-2.5 rounded-full bg-white/[0.04] border border-red-500/30 text-red-200 text-[10px] tracking-[0.25em] uppercase hover:bg-red-500/15 transition disabled:opacity-50"
            >
              Cancel booking
            </button>
          </div>
        </section>
      )}

      {(msg || err) && (
        <div
          className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl border text-sm shadow-lg ${
            err ? "bg-red-500/15 border-red-500/30 text-red-200" : "bg-[#160f0a] border-white/10 text-[#d8cfc1]"
          }`}
        >
          {err || msg}
        </div>
      )}
    </div>
  );
}
