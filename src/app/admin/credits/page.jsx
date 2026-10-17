"use client";

// /admin/credits — product credits ("one stew of any kind", "one beer"),
// separate from Mama coins. Admin only. Create a credit, copy its claim link
// (/claim/<id>) and send it yourself; nothing is emailed. Below: quick lookup
// by code / link / name for counter staff, and the full history.

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminGuard from "../AdminGuard";
import { AdminShell, AdminHero } from "@/app/admin/components/AdminShell";
import { useRole } from "@/hooks/useRole";
import { Copy, Check, Loader2, Search } from "lucide-react";

const inputCls =
  "w-full px-4 py-3 rounded-xl text-sm text-[#2c1810] placeholder-[#9a7a62] bg-[#faf6f2] border border-[#e8ddd3] focus:outline-none focus:border-[#ff914d]/60 focus:ring-1 focus:ring-[#ff914d]/30";

const EMPTY = {
  pick: "",
  item_label: "",
  customer_name: "",
  customer_contact: "",
  note: "",
  expires_at: "",
};

function CreditsInner() {
  const role = useRole();
  const [form, setForm] = useState(EMPTY);
  const [options, setOptions] = useState({ categories: [], items: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(null);
  const [credits, setCredits] = useState([]);
  const [listError, setListError] = useState(null);
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState(null);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const load = useCallback(async (query = "") => {
    try {
      const res = await fetch(`/api/admin/credits${query ? `?q=${encodeURIComponent(query)}` : ""}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load credits");
      setCredits(data.credits || []);
      setListError(null);
    } catch (err) {
      setListError(err.message);
    }
  }, []);

  useEffect(() => {
    if (role !== "admin") return;
    load();
    fetch("/api/admin/credits/options")
      .then((r) => r.json())
      .then((d) => setOptions({ categories: d.categories || [], items: d.items || [] }))
      .catch(() => {});
  }, [role, load]);

  // Picker values: "cat:<id>" / "item:<id>" / "" (free text)
  const itemsByCat = useMemo(() => {
    const m = new Map();
    for (const it of options.items) {
      if (!m.has(it.category_id)) m.set(it.category_id, []);
      m.get(it.category_id).push(it);
    }
    return m;
  }, [options.items]);

  function onPick(value) {
    let label = form.item_label;
    if (value.startsWith("cat:")) {
      const c = options.categories.find((x) => `cat:${x.id}` === value);
      if (c) label = `One ${c.name} item of any kind`;
    } else if (value.startsWith("item:")) {
      const it = options.items.find((x) => `item:${x.id}` === value);
      if (it) label = `One ${it.name}`;
    }
    setForm((p) => ({ ...p, pick: value, item_label: label }));
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const body = {
        item_label: form.item_label,
        customer_name: form.customer_name,
        customer_contact: form.customer_contact,
        note: form.note,
        expires_at: form.expires_at || null,
        menu_category_id: form.pick.startsWith("cat:") ? form.pick.slice(4) : null,
        menu_item_id: form.pick.startsWith("item:") ? form.pick.slice(5) : null,
      };
      const res = await fetch("/api/admin/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create credit");
      setResult(data.credit);
      setForm(EMPTY);
      load(q);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function copy(url) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(null), 1800);
    } catch {}
  }

  async function cancel(c) {
    if (!window.confirm(`Cancel the credit "${c.item_label}" (${c.code})? The link will stop working.`)) return;
    setBusyId(c.id);
    try {
      const res = await fetch(`/api/admin/credits/${c.id}/cancel`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not cancel");
      await load(q);
    } catch (err) {
      window.alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (role !== "admin") {
    return <p className="text-center text-sm text-[#6a5040] py-10">Admins only.</p>;
  }

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={submit} className="space-y-4 bg-white/90 border border-[#eadfd2] rounded-2xl p-6">
        <div>
          <label className="block text-xs font-semibold text-[#6a5040] mb-1">Product or category (optional)</label>
          <select className={inputCls} value={form.pick} onChange={(e) => onPick(e.target.value)}>
            <option value="">Free text only</option>
            {options.categories.map((c) => (
              <optgroup key={c.id} label={c.name}>
                <option value={`cat:${c.id}`}>Any {c.name}</option>
                {(itemsByCat.get(c.id) || []).map((it) => (
                  <option key={it.id} value={`item:${it.id}`}>
                    {it.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6a5040] mb-1">What the customer sees</label>
          <input className={inputCls} placeholder="One stew of any kind" value={form.item_label} onChange={(e) => update("item_label", e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#6a5040] mb-1">Customer name (optional)</label>
            <input className={inputCls} value={form.customer_name} onChange={(e) => update("customer_name", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6a5040] mb-1">Email or phone (optional)</label>
            <input className={inputCls} value={form.customer_contact} onChange={(e) => update("customer_contact", e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6a5040] mb-1">Internal note / reason</label>
          <input className={inputCls} placeholder="Maul complaint – dahl" value={form.note} onChange={(e) => update("note", e.target.value)} />
          <p className="mt-1 text-[11px] text-[#9a7a62]">Only visible here, never to the customer.</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6a5040] mb-1">Expires (optional)</label>
          <input className={inputCls} type="date" value={form.expires_at} onChange={(e) => update("expires_at", e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-full bg-[#c76a2b] hover:bg-[#a5551f] text-white py-3 text-sm font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />} Create credit
        </button>
      </form>

      {result && (
        <div className="mt-6 bg-white/90 border border-[#eadfd2] rounded-2xl p-6">
          <p className="text-sm text-[#2c1810] mb-2">
            <strong>{result.item_label}</strong> · code <strong className="tracking-widest">{result.code}</strong>
            {result.customer_name ? ` · ${result.customer_name}` : ""}
          </p>
          <div className="flex gap-2">
            <input readOnly className={inputCls} value={result.url} onFocus={(e) => e.target.select()} />
            <button type="button" onClick={() => copy(result.url)} className="shrink-0 inline-flex items-center gap-1.5 px-4 rounded-xl border border-[#c76a2b] text-[#c76a2b] text-sm font-semibold">
              {copied === result.url ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied === result.url ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-[#9a7a62]">Nothing has been sent. Send this link to the customer yourself.</p>
        </div>
      )}

      <div className="mt-8 bg-white/90 border border-[#eadfd2] rounded-2xl p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(q);
          }}
          className="flex gap-2 mb-4"
        >
          <input className={inputCls} placeholder="Look up code, link or name" value={q} onChange={(e) => setQ(e.target.value)} />
          <button type="submit" className="shrink-0 inline-flex items-center gap-1.5 px-4 rounded-xl bg-[#2c1810] text-white text-sm font-semibold">
            <Search className="w-4 h-4" /> Find
          </button>
        </form>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-[#2c1810]">{q ? "Results" : "History"}</p>
          {q && (
            <button type="button" className="text-[12px] text-[#c76a2b]" onClick={() => { setQ(""); load(""); }}>
              Clear
            </button>
          )}
        </div>
        {listError && <p className="text-sm text-red-600">{listError}</p>}
        {!listError && credits.length === 0 && <p className="text-sm text-[#9a7a62]">No credits {q ? "found" : "yet"}.</p>}
        <ul className="divide-y divide-[#f0e6d8]">
          {credits.map((c) => (
            <li key={c.id} className="py-3 flex items-start justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="text-[#2c1810]">
                  <span className="font-semibold">{c.item_label}</span>
                  <span className="ml-2 font-mono text-[12px] tracking-widest text-[#8a5a3a]">{c.code}</span>
                </p>
                <p className="text-[#6a5040]">
                  {c.customer_name || "No name"}
                  {c.customer_contact ? <span className="text-[#9a7a62]"> · {c.customer_contact}</span> : null}
                </p>
                {c.note && <p className="text-[12px] text-[#8a7261] italic">{c.note}</p>}
                <p className="text-[11px] text-[#9a7a62]">
                  Created {fmtDateTime(c.created_at)}
                  {c.created_by ? ` by ${c.created_by}` : ""}
                  {c.expires_at ? ` · expires ${fmtDate(c.expires_at)}` : ""}
                </p>
                {c.claimed_at && (
                  <p className="text-[11px] text-[#1f5c4b]">
                    Claimed {fmtDateTime(c.claimed_at)}
                    {c.claimed_name ? ` by “${c.claimed_name}”` : ""}
                    {c.claimed_by_email ? ` (${c.claimed_by_email})` : ""}
                    {c.claimed_user_agent ? ` · ${shortUa(c.claimed_user_agent)}` : ""}
                  </p>
                )}
                {c.cancelled_at && (
                  <p className="text-[11px] text-amber-700">
                    Cancelled {fmtDateTime(c.cancelled_at)}
                    {c.cancelled_by ? ` by ${c.cancelled_by}` : ""}
                  </p>
                )}
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1.5">
                <StatusBadge status={c.effective_status || c.status} />
                <button type="button" onClick={() => copy(c.url)} className="inline-flex items-center gap-1 text-[12px] text-[#c76a2b] font-semibold">
                  {copied === c.url ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === c.url ? "Copied" : "Copy link"}
                </button>
                {c.status === "unclaimed" && (
                  <button
                    type="button"
                    onClick={() => cancel(c)}
                    disabled={busyId === c.id}
                    className="inline-flex items-center gap-1 text-[12px] text-red-600 font-semibold disabled:opacity-50"
                  >
                    {busyId === c.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Cancel
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const STATUS_STYLE = {
  unclaimed: ["Unclaimed", "bg-[#fff1e4] text-[#c76a2b]"],
  claimed: ["Claimed", "bg-emerald-50 text-emerald-700"],
  cancelled: ["Cancelled", "bg-neutral-100 text-neutral-700"],
  expired: ["Expired", "bg-amber-50 text-amber-700"],
};

function StatusBadge({ status }) {
  const [label, cls] = STATUS_STYLE[status] || [status, "bg-neutral-100 text-neutral-700"];
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{label}</span>;
}

function shortUa(ua) {
  if (/iPhone|iPad/.test(ua)) return "iPhone/iPad";
  if (/Android/.test(ua)) return "Android";
  if (/Mac OS X/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows";
  return "browser";
}

function fmtDateTime(iso) {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Atlantic/Reykjavik",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { timeZone: "Atlantic/Reykjavik", day: "numeric", month: "short", year: "numeric" });
}

export default function CreditsPage() {
  return (
    <AdminGuard>
      <AdminShell>
        <AdminHero title="Credits" subtitle="One-time credits for a dish or drink, e.g. one stew or one beer" />
        <CreditsInner />
      </AdminShell>
    </AdminGuard>
  );
}
