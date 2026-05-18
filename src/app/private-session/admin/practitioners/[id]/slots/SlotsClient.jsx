"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  addDays,
  addWeeks,
  format,
  isSameDay,
  parseISO,
  startOfWeek,
} from "date-fns";

// ── Helpers ─────────────────────────────────────────────────────────────────
const FIELD =
  "w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-[#f0ebe3] focus:border-[#ff914d] outline-none";
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function pad(n) {
  return String(n).padStart(2, "0");
}
function combineLocal(date, hh, mm = 0) {
  const d = new Date(date);
  d.setHours(hh, mm, 0, 0);
  return d;
}
function isoOnLocalDay(iso) {
  return new Date(iso).toLocaleDateString("en-CA"); // YYYY-MM-DD in local TZ
}
function timeStr(iso) {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const SLOT_BG = {
  available: "bg-emerald-500/15 border-emerald-500/30 text-emerald-100",
  booked: "bg-[#ff914d]/20 border-[#ff914d]/50 text-[#ffd9bd]",
  cancelled: "bg-white/[0.04] border-white/10 text-white/40 line-through",
  completed: "bg-blue-500/15 border-blue-500/30 text-blue-200",
};

// ── Slot tile ───────────────────────────────────────────────────────────────
function SlotTile({ slot, offerings, onSelect }) {
  const slotOfferings = (slot.offering_ids || [])
    .map((id) => offerings.find((o) => o.id === id))
    .filter(Boolean);

  // Capacity-aware occupancy. `slot.bookings` is the array of all
  // non-cancelled bookings on this slot (see admin-data.listSlots).
  const capacity = slot.capacity || 1;
  const activeBookings = Array.isArray(slot.bookings)
    ? slot.bookings.filter((b) => b.status !== "cancelled")
    : slot.booking
    ? [slot.booking]
    : [];
  const occupancy = activeBookings.length;
  const remaining = Math.max(0, capacity - occupancy);
  const isFull = remaining === 0 && occupancy > 0;

  // Show as full when capacity has been reached; otherwise honour the
  // admin-set status (available / cancelled / completed).
  const effectiveStatus = isFull ? "booked" : slot.status;
  const cls = SLOT_BG[effectiveStatus] || SLOT_BG.available;

  return (
    <button
      type="button"
      onClick={() => onSelect(slot)}
      className={`w-full text-left p-2 rounded-md border text-[11px] leading-tight ${cls} hover:opacity-90 transition mb-1`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono">{timeStr(slot.starts_at)}–{timeStr(slot.ends_at)}</span>
        {capacity > 1 && (
          <span className="text-[10px] tabular-nums opacity-90">
            {occupancy}/{capacity}
          </span>
        )}
      </div>
      {occupancy > 0 ? (
        <div className="mt-0.5 truncate">
          {activeBookings.map((b) => b.client_name).join(", ")}
        </div>
      ) : (
        <div className="mt-0.5 text-[10px] opacity-80 truncate">
          {slotOfferings.length === 0
            ? "no offerings linked"
            : slotOfferings.map((o) => o.title).join(" · ")}
        </div>
      )}
    </button>
  );
}

// ── Single-slot create form (modal) ─────────────────────────────────────────
function SlotEditor({ practitionerId, offerings, slot, defaultDate, onClose, onSaved }) {
  const router = useRouter();
  const isNew = !slot;
  const initial = useMemo(() => {
    if (slot) {
      const s = new Date(slot.starts_at);
      const e = new Date(slot.ends_at);
      return {
        date: format(s, "yyyy-MM-dd"),
        startTime: format(s, "HH:mm"),
        endTime: format(e, "HH:mm"),
        published_area: slot.published_area || "",
        actual_location: slot.actual_location || "",
        status: slot.status,
        capacity: slot.capacity || 1,
        offering_ids: new Set(slot.offering_ids || []),
      };
    }
    const d = defaultDate || new Date();
    return {
      date: format(d, "yyyy-MM-dd"),
      startTime: "10:00",
      endTime: "11:30",
      published_area: "",
      actual_location: "",
      status: "available",
      capacity: 1,
      offering_ids: new Set(offerings.map((o) => o.id)),
    };
  }, [slot, defaultDate, offerings]);

  const [v, setV] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function toggleOffering(id) {
    setV((prev) => {
      const next = new Set(prev.offering_ids);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, offering_ids: next };
    });
  }

  async function save() {
    setErr("");
    if (!v.date || !v.startTime || !v.endTime) {
      setErr("Date and times are required.");
      return;
    }
    if (v.offering_ids.size === 0) {
      setErr("Tick at least one offering.");
      return;
    }
    const [sh, sm] = v.startTime.split(":").map(Number);
    const [eh, em] = v.endTime.split(":").map(Number);
    const baseDate = parseISO(`${v.date}T00:00:00`);
    const startsAt = combineLocal(baseDate, sh, sm).toISOString();
    const endsAt = combineLocal(baseDate, eh, em).toISOString();

    setBusy(true);
    try {
      const url = isNew
        ? "/api/private-session/admin/slots"
        : `/api/private-session/admin/slots/${slot.id}`;
      const method = isNew ? "POST" : "PATCH";
      const body = isNew
        ? {
            practitioner_id: practitionerId,
            starts_at: startsAt,
            ends_at: endsAt,
            capacity: v.capacity,
            offering_ids: Array.from(v.offering_ids),
            published_area: v.published_area || null,
            actual_location: v.actual_location || null,
          }
        : {
            starts_at: startsAt,
            ends_at: endsAt,
            capacity: v.capacity,
            offering_ids: Array.from(v.offering_ids),
            published_area: v.published_area || null,
            actual_location: v.actual_location || null,
            status: v.status,
          };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      onSaved?.();
      router.refresh();
      onClose?.();
    } catch (e) {
      setErr(e.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function del() {
    if (!slot) return;
    if (!window.confirm("Delete this slot? If it has a booking, the slot will be cancelled instead.")) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/private-session/admin/slots/${slot.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      onSaved?.();
      router.refresh();
      onClose?.();
    } catch (e) {
      setErr(e.message || "Delete failed");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6" onClick={onClose}>
      <div
        className="relative w-full md:max-w-lg bg-[#160f0a] border border-white/10 rounded-t-3xl md:rounded-3xl overflow-y-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white/80 flex items-center justify-center"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="px-6 md:px-8 pt-8 pb-2">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#ff914d] mb-2">
            {isNew ? "New slot" : "Edit slot"}
          </div>
          <h3 className="font-cormorant text-2xl italic text-[#f0ebe3]">
            {format(parseISO(`${v.date}T00:00:00`), "EEEE, d MMMM yyyy")}
          </h3>
        </div>

        <div className="px-6 md:px-8 pb-8 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-1">Date</label>
              <input type="date" value={v.date} onChange={(e) => setV({ ...v, date: e.target.value })} className={FIELD} />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-1">Start</label>
              <input type="time" value={v.startTime} onChange={(e) => setV({ ...v, startTime: e.target.value })} className={FIELD} />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-1">End</label>
              <input type="time" value={v.endTime} onChange={(e) => setV({ ...v, endTime: e.target.value })} className={FIELD} />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-1">
              Capacity
            </label>
            <input
              type="number"
              min={1}
              value={v.capacity}
              onChange={(e) =>
                setV({ ...v, capacity: Math.max(1, parseInt(e.target.value, 10) || 1) })
              }
              className={FIELD}
            />
            <p className="text-[10px] text-[#7a6d5e] mt-1">
              Parallel bookings allowed. 3 practitioners working together → 3.
            </p>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-1">Published area (optional)</label>
            <input
              type="text"
              value={v.published_area}
              onChange={(e) => setV({ ...v, published_area: e.target.value })}
              placeholder="Reykjavík 101"
              className={FIELD}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-1">Actual address (private — sent the day before)</label>
            <input
              type="text"
              value={v.actual_location}
              onChange={(e) => setV({ ...v, actual_location: e.target.value })}
              placeholder="Bankastræti 2, 101 Reykjavík"
              className={FIELD}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-2">Bookable offerings</label>
            <div className="space-y-2">
              {offerings.length === 0 && (
                <p className="text-[#a09488] text-xs">No offerings yet — add some first.</p>
              )}
              {offerings.map((o) => (
                <label
                  key={o.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    v.offering_ids.has(o.id)
                      ? "border-[#ff914d] bg-[#ff914d]/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={v.offering_ids.has(o.id)}
                    onChange={() => toggleOffering(o.id)}
                    className="mt-0.5 accent-[#ff914d]"
                  />
                  <span>
                    <span className="block text-sm text-[#f0ebe3]">{o.title}</span>
                    <span className="block text-xs text-[#a09488] mt-0.5">{o.duration_minutes} min · {new Intl.NumberFormat().format(o.price_isk)} ISK</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {!isNew && (
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-1">Status</label>
              <select value={v.status} onChange={(e) => setV({ ...v, status: e.target.value })} className={FIELD}>
                <option value="available">available</option>
                <option value="booked">booked</option>
                <option value="cancelled">cancelled</option>
                <option value="completed">completed</option>
              </select>
            </div>
          )}

          {err && <div className="text-red-300 text-xs">{err}</div>}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="px-6 py-2.5 rounded-full bg-[#ff914d] text-[#160f0a] text-[10px] tracking-[0.25em] uppercase font-semibold hover:bg-[#ffa566] transition disabled:opacity-50"
            >
              {busy ? "Saving…" : isNew ? "Add slot" : "Save"}
            </button>
            {!isNew && (
              <button
                type="button"
                onClick={del}
                disabled={busy}
                className="px-5 py-2.5 rounded-full border border-red-500/30 text-red-200 text-[10px] tracking-[0.25em] uppercase hover:bg-red-500/10 transition disabled:opacity-50"
              >
                Delete
              </button>
            )}
            {!isNew && slot?.booking && (
              <Link
                href={`/private-session/admin/bookings/${slot.booking.id}`}
                className="px-5 py-2.5 rounded-full border border-white/15 text-[#d8cfc1] text-[10px] tracking-[0.25em] uppercase hover:bg-white/[0.05] transition"
              >
                Open booking →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Bulk-add panel ──────────────────────────────────────────────────────────
function BulkPanel({ practitionerId, offerings, defaultRange, onClose, onSaved }) {
  const router = useRouter();
  const [v, setV] = useState({
    range_start: defaultRange.start,
    range_end: defaultRange.end,
    weekdays: new Set([1, 3]), // Tue/Thu by default — matches the spec's example
    times: ["10:00", "14:00"],
    capacity: 1,
    offering_ids: new Set(offerings.map((o) => o.id)),
    published_area: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function toggleWeekday(i) {
    setV((prev) => {
      const next = new Set(prev.weekdays);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return { ...prev, weekdays: next };
    });
  }
  function toggleOffering(id) {
    setV((prev) => {
      const next = new Set(prev.offering_ids);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, offering_ids: next };
    });
  }
  function setTime(idx, value) {
    setV((prev) => {
      const next = [...prev.times];
      next[idx] = value;
      return { ...prev, times: next };
    });
  }
  function addTime() {
    setV((prev) => ({ ...prev, times: [...prev.times, "10:00"] }));
  }
  function removeTime(idx) {
    setV((prev) => ({ ...prev, times: prev.times.filter((_, i) => i !== idx) }));
  }

  async function submit() {
    setErr("");
    if (!v.range_start || !v.range_end) {
      setErr("Pick a date range.");
      return;
    }
    if (v.weekdays.size === 0 || v.times.length === 0) {
      setErr("Pick at least one weekday and time.");
      return;
    }
    if (v.offering_ids.size === 0) {
      setErr("Tick at least one offering.");
      return;
    }
    if (!v.capacity || v.capacity < 1) {
      setErr("Capacity must be at least 1.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/private-session/admin/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "bulk",
          practitioner_id: practitionerId,
          weekdays: Array.from(v.weekdays),
          times: v.times,
          range_start: v.range_start,
          range_end: v.range_end,
          capacity: v.capacity,
          offering_ids: Array.from(v.offering_ids),
          published_area: v.published_area || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      onSaved?.();
      router.refresh();
      onClose?.();
    } catch (e) {
      setErr(e.message || "Bulk add failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6" onClick={onClose}>
      <div
        className="relative w-full md:max-w-xl bg-[#160f0a] border border-white/10 rounded-t-3xl md:rounded-3xl overflow-y-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white/80 flex items-center justify-center"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="px-6 md:px-8 pt-8 pb-2">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#ff914d] mb-2">Bulk add</div>
          <h3 className="font-cormorant text-2xl italic text-[#f0ebe3]">
            Every selected weekday/time between two dates
          </h3>
        </div>

        <div className="px-6 md:px-8 pb-8 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-1">Range start</label>
              <input type="date" value={v.range_start} onChange={(e) => setV({ ...v, range_start: e.target.value })} className={FIELD} />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-1">Range end</label>
              <input type="date" value={v.range_end} onChange={(e) => setV({ ...v, range_end: e.target.value })} className={FIELD} />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-2">Weekdays</label>
            <div className="grid grid-cols-7 gap-1.5">
              {WEEKDAY_LABELS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleWeekday(i)}
                  className={`py-2 rounded-md text-[10px] uppercase tracking-wider ${
                    v.weekdays.has(i)
                      ? "bg-[#ff914d] text-[#160f0a] font-semibold"
                      : "bg-white/[0.04] text-[#d8cfc1] hover:bg-white/[0.08]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-2">Times</label>
            <div className="space-y-2">
              {v.times.map((t, i) => (
                <div key={i} className="flex gap-2">
                  <input type="time" value={t} onChange={(e) => setTime(i, e.target.value)} className={FIELD} />
                  <button
                    type="button"
                    onClick={() => removeTime(i)}
                    className="px-3 py-2 rounded-lg bg-white/[0.04] text-[#a09488] hover:bg-white/[0.08] transition"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addTime}
                className="text-[10px] uppercase tracking-[0.2em] text-[#ff914d] hover:underline"
              >
                + Another time
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-1">
                Capacity per slot
              </label>
              <input
                type="number"
                min={1}
                value={v.capacity}
                onChange={(e) =>
                  setV({ ...v, capacity: Math.max(1, parseInt(e.target.value, 10) || 1) })
                }
                className={FIELD}
              />
              <p className="text-[10px] text-[#7a6d5e] mt-1">
                How many parallel bookings each slot can hold. 3 practitioners
                working together → capacity 3.
              </p>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-1">Published area (optional)</label>
              <input
                type="text"
                value={v.published_area}
                onChange={(e) => setV({ ...v, published_area: e.target.value })}
                className={FIELD}
                placeholder="Reykjavík 101"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-2">Bookable offerings per slot</label>
            <div className="space-y-2">
              {offerings.length === 0 && (
                <p className="text-[#a09488] text-xs">No offerings yet — add some first.</p>
              )}
              {offerings.map((o) => (
                <label
                  key={o.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    v.offering_ids.has(o.id)
                      ? "border-[#ff914d] bg-[#ff914d]/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={v.offering_ids.has(o.id)}
                    onChange={() => toggleOffering(o.id)}
                    className="mt-0.5 accent-[#ff914d]"
                  />
                  <span className="text-sm text-[#f0ebe3]">{o.title}</span>
                </label>
              ))}
            </div>
          </div>

          {err && <div className="text-red-300 text-xs">{err}</div>}

          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="px-6 py-2.5 rounded-full bg-[#ff914d] text-[#160f0a] text-[10px] tracking-[0.25em] uppercase font-semibold hover:bg-[#ffa566] transition disabled:opacity-50"
          >
            {busy ? "Adding…" : "Add slots"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Calendar grid ───────────────────────────────────────────────────────────
function WeekGrid({ weekStart, slots, offerings, onCellClick, onSlotClick }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const byDay = useMemo(() => {
    const m = new Map();
    for (const s of slots) {
      const key = isoOnLocalDay(s.starts_at);
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(s);
    }
    for (const v of m.values()) v.sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
    return m;
  }, [slots]);

  return (
    <div className="grid grid-cols-7 gap-1 md:gap-2">
      {days.map((d) => {
        const key = format(d, "yyyy-MM-dd");
        const daySlots = byDay.get(key) || [];
        const isToday = isSameDay(d, new Date());
        return (
          <div
            key={key}
            className={`flex flex-col rounded-lg border ${isToday ? "border-[#ff914d]/50 bg-[#ff914d]/[0.04]" : "border-white/[0.06] bg-white/[0.02]"} min-h-[160px] p-2`}
          >
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#a09488]">
                {format(d, "EEE")}
              </span>
              <span className={`text-sm tabular-nums ${isToday ? "text-[#ff914d]" : "text-[#d8cfc1]"}`}>
                {format(d, "d")}
              </span>
            </div>
            <div className="flex-1">
              {daySlots.map((s) => (
                <SlotTile key={s.id} slot={s} offerings={offerings} onSelect={() => onSlotClick(s)} />
              ))}
            </div>
            <button
              type="button"
              onClick={() => onCellClick(d)}
              className="mt-1 w-full text-[10px] uppercase tracking-[0.2em] text-[#7a6d5e] hover:text-[#ff914d] py-1 rounded transition"
            >
              + add
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function SlotsClient({ practitionerId, practitioner, offerings, initialSlots }) {
  const start0 = practitioner.residency_start
    ? parseISO(practitioner.residency_start)
    : new Date();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(start0, { weekStartsOn: 1 }));
  const [editing, setEditing] = useState(null); // existing slot
  const [creatingForDate, setCreatingForDate] = useState(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const residencyRange = useMemo(() => {
    const today = new Date();
    return {
      start: practitioner.residency_start || format(today, "yyyy-MM-dd"),
      end:
        practitioner.residency_end ||
        format(addDays(today, 30), "yyyy-MM-dd"),
    };
  }, [practitioner]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekStart((d) => addWeeks(d, -1))}
            className="px-3 py-2 rounded-full bg-white/[0.04] text-[#d8cfc1] text-[10px] tracking-[0.25em] uppercase hover:bg-white/[0.08] transition"
          >
            ‹ Prev
          </button>
          <button
            type="button"
            onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            className="px-3 py-2 rounded-full bg-white/[0.04] text-[#d8cfc1] text-[10px] tracking-[0.25em] uppercase hover:bg-white/[0.08] transition"
          >
            This week
          </button>
          <button
            type="button"
            onClick={() => setWeekStart((d) => addWeeks(d, 1))}
            className="px-3 py-2 rounded-full bg-white/[0.04] text-[#d8cfc1] text-[10px] tracking-[0.25em] uppercase hover:bg-white/[0.08] transition"
          >
            Next ›
          </button>
          <span className="ml-3 text-sm text-[#d8cfc1] font-cormorant italic">
            Week of {format(weekStart, "d MMMM yyyy")}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setBulkOpen(true)}
          className="px-5 py-2.5 rounded-full bg-[#ff914d] text-[#160f0a] text-[10px] tracking-[0.25em] uppercase font-semibold hover:bg-[#ffa566] transition"
        >
          Bulk add slots
        </button>
      </div>

      <WeekGrid
        weekStart={weekStart}
        slots={initialSlots}
        offerings={offerings}
        onCellClick={(d) => {
          setCreatingForDate(d);
          setEditing(null);
        }}
        onSlotClick={(s) => {
          setEditing(s);
          setCreatingForDate(null);
        }}
      />

      <div className="text-[10px] text-[#7a6d5e] flex flex-wrap gap-4">
        <Legend cls="bg-emerald-500/15 border-emerald-500/30">available</Legend>
        <Legend cls="bg-[#ff914d]/20 border-[#ff914d]/50">booked</Legend>
        <Legend cls="bg-white/[0.04] border-white/10">cancelled</Legend>
        <Legend cls="bg-blue-500/15 border-blue-500/30">completed</Legend>
      </div>

      {(editing || creatingForDate) && (
        <SlotEditor
          practitionerId={practitionerId}
          offerings={offerings}
          slot={editing}
          defaultDate={creatingForDate}
          onClose={() => {
            setEditing(null);
            setCreatingForDate(null);
          }}
        />
      )}
      {bulkOpen && (
        <BulkPanel
          practitionerId={practitionerId}
          offerings={offerings}
          defaultRange={residencyRange}
          onClose={() => setBulkOpen(false)}
        />
      )}
    </div>
  );
}

function Legend({ cls, children }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block w-3 h-3 rounded-sm border ${cls}`} />
      {children}
    </span>
  );
}
