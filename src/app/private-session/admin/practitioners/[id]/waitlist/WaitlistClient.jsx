"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_BADGE = {
  waiting: "bg-white/[0.05] text-[#d8cfc1] border-white/10",
  offered: "bg-[#ff914d]/15 text-[#ffd9bd] border-[#ff914d]/40",
  claimed: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
  expired: "bg-amber-500/15 text-amber-200 border-amber-500/30",
  declined: "bg-white/[0.05] text-white/40 border-white/10",
};

function fmt(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Row({ entry, onAction }) {
  const badgeCls = STATUS_BADGE[entry.status] || STATUS_BADGE.waiting;
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
      <div className="md:w-12 text-center">
        {entry.position ? (
          <span className="font-cormorant text-2xl italic text-[#ff914d]">{entry.position}</span>
        ) : (
          <span className="text-[10px] text-[#7a6d5e]">—</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[#f0ebe3] text-sm font-medium">{entry.client_name}</div>
        <div className="text-xs text-[#a09488]">
          {entry.client_email}
          {entry.client_phone && ` · ${entry.client_phone}`}
        </div>
        {entry.client_note && (
          <div className="text-xs text-[#7a6d5e] mt-0.5 truncate" title={entry.client_note}>
            “{entry.client_note}”
          </div>
        )}
        {entry.offer_expires_at && entry.status === "offered" && (
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#ff914d] mt-1">
            Claim window ends {fmt(entry.offer_expires_at)}
          </div>
        )}
      </div>
      <span className={`px-2.5 py-1 rounded-full border text-[10px] uppercase tracking-wider ${badgeCls}`}>
        {entry.status}
      </span>
      <div className="flex gap-2">
        {entry.status === "waiting" && (
          <button
            type="button"
            onClick={() => onAction(entry.id, "offer")}
            className="px-3 py-1.5 rounded-full bg-[#ff914d] text-[#160f0a] text-[10px] tracking-[0.25em] uppercase font-semibold hover:bg-[#ffa566] transition"
          >
            Offer slot
          </button>
        )}
        {entry.status === "offered" && (
          <button
            type="button"
            onClick={() => onAction(entry.id, "expire")}
            className="px-3 py-1.5 rounded-full bg-white/[0.05] text-[#d8cfc1] text-[10px] tracking-[0.25em] uppercase hover:bg-white/[0.08] transition"
          >
            Expire
          </button>
        )}
        {entry.status !== "removed" && entry.status !== "claimed" && (
          <button
            type="button"
            onClick={() => onAction(entry.id, "remove")}
            className="px-3 py-1.5 rounded-full bg-white/[0.05] text-[#d8cfc1] text-[10px] tracking-[0.25em] uppercase hover:bg-red-500/15 hover:text-red-200 transition"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

export default function WaitlistClient({ groups }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onAction(id, action) {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/private-session/admin/waitlist/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (e) {
      setErr(e.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  if (groups.length === 0) {
    return (
      <p className="text-[#a09488] text-sm">
        No offerings yet for this practitioner.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map(({ offering, entries }) => (
        <div key={offering.id}>
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="font-cormorant text-2xl italic text-[#f0ebe3]">{offering.title}</h3>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#a09488]">
              {entries.filter((e) => e.status === "waiting").length} waiting
            </span>
          </div>
          {entries.length === 0 ? (
            <p className="text-[#7a6d5e] text-xs">No one on this list.</p>
          ) : (
            <div className="space-y-2">
              {entries.map((e) => (
                <Row key={e.id} entry={e} onAction={onAction} />
              ))}
            </div>
          )}
        </div>
      ))}

      {err && (
        <div className="fixed bottom-6 right-6 px-5 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 text-sm shadow-lg">
          {err}
        </div>
      )}
      {busy && <div className="sr-only">Saving…</div>}
    </div>
  );
}
