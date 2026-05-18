"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const FIELD =
  "w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-[#f0ebe3] focus:border-[#ff914d] outline-none";

const blankOffering = {
  title: "",
  description_md: "",
  modality: "",
  duration_minutes: 90,
  price_isk: 0,
  is_active: true,
  display_order: 0,
};

function OfferingRow({ practitionerId, offering, onDirty, onChanged }) {
  const router = useRouter();
  const [v, setV] = useState(offering);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function update(k, val) {
    setV((prev) => {
      const next = { ...prev, [k]: val };
      onDirty?.(true);
      return next;
    });
  }

  async function save() {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/private-session/admin/offerings/${offering.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      onChanged?.();
      router.refresh();
    } catch (e) {
      setErr(e.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function del() {
    if (!window.confirm("Delete this offering? If it has bookings, it will be archived instead.")) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/private-session/admin/offerings/${offering.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      onChanged?.();
      router.refresh();
    } catch (e) {
      setErr(e.message || "Delete failed");
      setBusy(false);
    }
  }

  return (
    <div className={`rounded-2xl border ${offering.is_active ? "border-white/[0.06] bg-white/[0.03]" : "border-white/[0.04] bg-white/[0.015] opacity-60"}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 p-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-cormorant text-xl italic text-[#f0ebe3] truncate">
              {offering.title || "Untitled offering"}
            </span>
            {offering.modality && (
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#ff914d]">
                {offering.modality}
              </span>
            )}
          </div>
          <div className="text-xs text-[#a09488] mt-1">
            {offering.duration_minutes} min · {new Intl.NumberFormat().format(offering.price_isk)} ISK
            {!offering.is_active && " · Archived"}
          </div>
        </div>
        <span className="text-[#ff914d] text-xl">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="px-4 pb-5 pt-1 space-y-4 border-t border-white/[0.06]">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-1">Title</label>
              <input type="text" value={v.title} onChange={(e) => update("title", e.target.value)} className={FIELD} />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-1">Modality</label>
              <input
                type="text"
                value={v.modality || ""}
                onChange={(e) => update("modality", e.target.value)}
                placeholder="Cacao ceremony"
                className={FIELD}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-1">Description (markdown)</label>
            <textarea
              rows={4}
              value={v.description_md || ""}
              onChange={(e) => update("description_md", e.target.value)}
              className={`${FIELD} resize-y font-mono text-sm`}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-1">Duration (min)</label>
              <input
                type="number"
                value={v.duration_minutes}
                onChange={(e) => update("duration_minutes", parseInt(e.target.value, 10) || 0)}
                className={FIELD}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-1">Price ISK (display)</label>
              <input
                type="number"
                value={v.price_isk}
                onChange={(e) => update("price_isk", parseInt(e.target.value, 10) || 0)}
                className={FIELD}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-1">Order</label>
              <input
                type="number"
                value={v.display_order}
                onChange={(e) => update("display_order", parseInt(e.target.value, 10) || 0)}
                className={FIELD}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-[#d8cfc1]">
            <input
              type="checkbox"
              checked={v.is_active}
              onChange={(e) => update("is_active", e.target.checked)}
              className="accent-[#ff914d]"
            />
            Active (shows publicly + bookable in new slots)
          </label>

          {err && <div className="text-red-300 text-xs">{err}</div>}

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="px-5 py-2 rounded-full bg-[#ff914d] text-[#160f0a] text-[10px] tracking-[0.25em] uppercase font-semibold hover:bg-[#ffa566] transition disabled:opacity-50"
            >
              {busy ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={del}
              disabled={busy}
              className="px-4 py-2 rounded-full border border-red-500/30 text-red-200 text-[10px] tracking-[0.25em] uppercase hover:bg-red-500/10 transition disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NewOfferingForm({ practitionerId, onCreated }) {
  const router = useRouter();
  const [v, setV] = useState(blankOffering);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function update(k, val) {
    setV((prev) => ({ ...prev, [k]: val }));
  }

  async function create() {
    if (!v.title.trim()) {
      setErr("Title is required.");
      return;
    }
    if (!v.duration_minutes) {
      setErr("Duration is required.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/private-session/admin/offerings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...v, practitioner_id: practitionerId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setV(blankOffering);
      onCreated?.();
      router.refresh();
    } catch (e) {
      setErr(e.message || "Create failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-[#ff914d]/40 bg-[#ff914d]/[0.04] p-5 space-y-4">
      <div className="text-[10px] uppercase tracking-[0.25em] text-[#ff914d]">Add an offering</div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-3">
        <div>
          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-1">Title</label>
          <input type="text" value={v.title} onChange={(e) => update("title", e.target.value)} className={FIELD} placeholder="Ceremonial cacao — one-to-one" />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-1">Modality</label>
          <input type="text" value={v.modality} onChange={(e) => update("modality", e.target.value)} className={FIELD} placeholder="Cacao ceremony" />
        </div>
      </div>

      <div>
        <label className="block text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-1">Description (markdown)</label>
        <textarea
          rows={3}
          value={v.description_md}
          onChange={(e) => update("description_md", e.target.value)}
          className={`${FIELD} resize-y font-mono text-sm`}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-1">Duration (min)</label>
          <input
            type="number"
            value={v.duration_minutes}
            onChange={(e) => update("duration_minutes", parseInt(e.target.value, 10) || 0)}
            className={FIELD}
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-1">Price ISK</label>
          <input
            type="number"
            value={v.price_isk}
            onChange={(e) => update("price_isk", parseInt(e.target.value, 10) || 0)}
            className={FIELD}
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#a09488] mb-1">Order</label>
          <input
            type="number"
            value={v.display_order}
            onChange={(e) => update("display_order", parseInt(e.target.value, 10) || 0)}
            className={FIELD}
          />
        </div>
      </div>

      {err && <div className="text-red-300 text-xs">{err}</div>}

      <button
        type="button"
        onClick={create}
        disabled={busy}
        className="px-6 py-2.5 rounded-full bg-[#ff914d] text-[#160f0a] text-[10px] tracking-[0.25em] uppercase font-semibold hover:bg-[#ffa566] transition disabled:opacity-50"
      >
        {busy ? "Adding…" : "Add offering"}
      </button>
    </div>
  );
}

export default function OfferingsClient({ practitionerId, initialOfferings }) {
  return (
    <div className="space-y-4">
      <NewOfferingForm practitionerId={practitionerId} />
      {initialOfferings.length === 0 ? (
        <p className="text-[#a09488] text-sm">No offerings yet. Add one above.</p>
      ) : (
        <div className="space-y-3">
          {initialOfferings.map((o) => (
            <OfferingRow key={o.id} practitionerId={practitionerId} offering={o} />
          ))}
        </div>
      )}
    </div>
  );
}
