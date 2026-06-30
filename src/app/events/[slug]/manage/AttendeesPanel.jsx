"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Search,
  Loader2,
  CheckCircle2,
  Circle,
  Users,
  AlertCircle,
} from "lucide-react";

const ORANGE = "#ff914d";
const DARK = "#2c1810";
const MUTED = "#9a7a62";
const BORDER = "#f0e6d8";
const GREEN = "#0f9d6b";

const STATUS_LABEL = {
  paid: "Online",
  card: "Card",
  door: "Door",
  cash: "Cash",
  transfer: "Transfer",
};

export default function AttendeesPanel({ slug }) {
  const [tickets, setTickets] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/events/${slug}/manage/attendees`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Couldn't load attendees");
        if (alive) setTickets(data.tickets || []);
      } catch (e) {
        if (alive) setError(e.message || "Couldn't load attendees");
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  const totals = useMemo(() => {
    const list = tickets || [];
    const guests = list.reduce((s, t) => s + (t.quantity || 0), 0);
    const checkedIn = list.reduce((s, t) => s + (t.used ? t.quantity || 0 : 0), 0);
    return { guests, checkedIn };
  }, [tickets]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = (tickets || []).filter(
      (t) =>
        !q ||
        (t.buyer_name || "").toLowerCase().includes(q) ||
        (t.buyer_email || "").toLowerCase().includes(q)
    );
    // Sort alphabetically by guest name (Icelandic-aware).
    return base
      .slice()
      .sort((a, b) =>
        (a.buyer_name || "").localeCompare(b.buyer_name || "", "is", { sensitivity: "base" })
      );
  }, [tickets, query]);

  async function toggle(t) {
    if (busyId) return;
    setBusyId(t.id);
    const nextUsed = !t.used;
    setTickets((prev) => prev.map((x) => (x.id === t.id ? { ...x, used: nextUsed } : x)));
    try {
      const res = await fetch(`/events/${slug}/manage/attendees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: t.id, used: nextUsed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
    } catch (e) {
      setTickets((prev) => prev.map((x) => (x.id === t.id ? { ...x, used: t.used } : x)));
      toast.error(e.message || "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center rounded-xl px-6 py-10 text-center" style={{ background: "#fff5f4" }}>
        <AlertCircle className="mb-3 h-6 w-6" style={{ color: "#dc2626" }} />
        <p className="text-sm" style={{ color: "#b23b2d" }}>{error}</p>
      </div>
    );
  }

  if (tickets === null) {
    return (
      <div className="flex items-center justify-center py-16" style={{ color: MUTED }}>
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl px-6 py-12 text-center" style={{ background: "#faf6f0" }}>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "#fff3ea" }}>
          <Users className="h-6 w-6" style={{ color: ORANGE }} strokeWidth={1.75} />
        </div>
        <p className="text-sm" style={{ color: MUTED }}>No registrations yet. They'll appear here as tickets sell.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-4">
          <span className="text-sm" style={{ color: DARK }}>
            <strong style={{ fontWeight: 600 }}>{totals.guests}</strong> {totals.guests === 1 ? "guest" : "guests"}
          </span>
          <span className="text-sm" style={{ color: GREEN }}>
            <strong style={{ fontWeight: 600 }}>{totals.checkedIn}</strong> checked in
          </span>
        </div>
        <div className="relative ml-auto">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: MUTED }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email"
            className="rounded-full py-2 pl-9 pr-3 text-sm outline-none"
            style={{ background: "#faf6f0", border: `1px solid ${BORDER}`, color: DARK, minWidth: 200 }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((t) => {
          const used = !!t.used;
          const busy = busyId === t.id;
          return (
            <div
              key={t.id}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{
                background: used ? "#f1faf5" : "#fff",
                border: `1px solid ${used ? "#cfeede" : BORDER}`,
              }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium" style={{ color: DARK }}>
                    {t.buyer_name || "—"}
                  </span>
                  {t.quantity > 1 && (
                    <span className="rounded-full px-1.5 py-0.5 text-[11px]" style={{ background: "#fff3ea", color: "#8a4b22" }}>
                      ×{t.quantity}
                    </span>
                  )}
                  {t.gatekeeper && (
                    <span className="rounded-full px-1.5 py-0.5 text-[11px]" style={{ background: "#faf6f0", color: MUTED }}>
                      walk-in
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 truncate text-xs" style={{ color: MUTED }}>
                  <span className="truncate">{t.buyer_email || ""}</span>
                  <span aria-hidden>·</span>
                  <span>{STATUS_LABEL[t.status] || t.status}</span>
                  {t.variant_name ? <span className="truncate">· {t.variant_name}</span> : null}
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggle(t)}
                disabled={busy}
                aria-label={used ? `Undo check-in for ${t.buyer_name}` : `Check in ${t.buyer_name}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-60"
                style={
                  used
                    ? { background: "#e7f7ee", color: GREEN, border: `1.5px solid #b7e6cd` }
                    : { background: "#fff", color: DARK, border: `1.5px solid #e8ddd3` }
                }
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : used ? (
                  <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                ) : (
                  <Circle className="h-4 w-4" strokeWidth={1.9} />
                )}
                {used ? "Checked in" : "Check in"}
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm" style={{ color: MUTED }}>No guests match "{query}".</p>
        )}
      </div>
    </div>
  );
}
