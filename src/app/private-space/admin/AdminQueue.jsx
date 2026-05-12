"use client";

import { useMemo, useState } from "react";

const STATUS_FILTERS = ["pending", "approved", "confirmed", "declined", "cancelled", "all"];
const STATUS_COLORS = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  approved: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  paid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  confirmed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  declined: "bg-red-500/15 text-red-300 border-red-500/30",
  cancelled: "bg-white/[0.05] text-white/40 border-white/10",
  refunded: "bg-purple-500/15 text-purple-300 border-purple-500/30",
};

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("is-IS", {
    weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}
function fmtIsk(n) {
  return `${(n || 0).toLocaleString("is-IS")} ISK`;
}

export default function AdminQueue({ bookings }) {
  const [filter, setFilter] = useState("pending");
  const [busyRef, setBusyRef] = useState(null);
  const [results, setResults] = useState({}); // ref → { ok, msg, payment_url }

  const filtered = useMemo(() => {
    if (filter === "all") return bookings;
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

  const counts = useMemo(() => {
    const c = {};
    bookings.forEach((b) => { c[b.status] = (c[b.status] || 0) + 1; });
    return c;
  }, [bookings]);

  async function decide(ref, action) {
    let reason = null;
    if (action === "decline") {
      reason = window.prompt("Decline reason (optional, sent to applicant):") ?? "";
    }
    setBusyRef(ref);
    try {
      const res = await fetch("/api/private-space/admin/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference_id: ref, action, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResults((r) => ({ ...r, [ref]: { ok: true, msg: action === "approve" ? "Approved & payment link emailed" : "Declined", payment_url: data.payment_url } }));
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setResults((r) => ({ ...r, [ref]: { ok: false, msg: err.message } }));
    } finally {
      setBusyRef(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#0d0b09] text-[#f0ebe3] p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-[0.3em] text-[#ff914d] mb-2">Admin</div>
          <h1 className="font-cormorant text-4xl italic">The Private Space — bookings</h1>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider border ${
                filter === s
                  ? "bg-[#ff914d] text-[#160f0a] border-[#ff914d]"
                  : "border-white/15 text-[#d8cfc1] hover:bg-white/[0.04]"
              }`}
            >
              {s} {counts[s] ? <span className="ml-1 opacity-60">{counts[s]}</span> : null}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] border-b border-white/10">
              <tr className="text-left text-xs uppercase tracking-wider text-[#a09488]">
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Renter</th>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[#a09488]">
                    No {filter === "all" ? "" : filter} bookings.
                  </td>
                </tr>
              )}
              {filtered.map((b) => {
                const result = results[b.reference_id];
                return (
                  <tr key={b.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-xs text-[#ff914d]">{b.reference_id}</td>
                    <td className="px-4 py-3">
                      <div>{b.contact_name}</div>
                      <div className="text-xs text-[#a09488]">{b.contact_email}</div>
                      {b.contact_phone && <div className="text-xs text-[#a09488]">{b.contact_phone}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {fmtDate(b.start_at)}<br/>
                      <span className="text-[#a09488]">→ {fmtDate(b.end_at)}</span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {b.booking_type}
                      <div className="text-[#a09488]">{b.practice_type} · {b.group_size}p</div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{fmtIsk(b.total_amount_isk)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider border ${STATUS_COLORS[b.status] || ""}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {b.status === "pending" ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            disabled={busyRef === b.reference_id}
                            onClick={() => decide(b.reference_id, "approve")}
                            className="px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs hover:bg-emerald-500/30 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={busyRef === b.reference_id}
                            onClick={() => decide(b.reference_id, "decline")}
                            className="px-3 py-1 rounded-md bg-red-500/20 text-red-300 text-xs hover:bg-red-500/30 disabled:opacity-50"
                          >
                            Decline
                          </button>
                        </div>
                      ) : null}
                      {result && (
                        <div className={`text-[10px] mt-1 ${result.ok ? "text-emerald-400" : "text-red-400"}`}>
                          {result.msg}
                          {result.payment_url && (
                            <div className="mt-1">
                              <a href={result.payment_url} target="_blank" rel="noopener" className="underline">
                                payment link
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                      {b.practice_description && (
                        <details className="mt-1 text-xs text-[#a09488]">
                          <summary className="cursor-pointer hover:text-[#f0ebe3]">notes</summary>
                          <p className="mt-1 max-w-xs whitespace-pre-wrap text-left">{b.practice_description}</p>
                        </details>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
