"use client";

// /admin/payment-links — create a "pay this amount" link for a customer
// (paid by card on Teya SecurePay). Admin only. Every link is stored in
// payment_links and listed below; nothing is sent — copy the link and send
// it to the customer yourself.

import { useCallback, useEffect, useState } from "react";
import AdminGuard from "../AdminGuard";
import { AdminShell, AdminHero } from "@/app/admin/components/AdminShell";
import { useRole } from "@/hooks/useRole";
import { Copy, Check, Loader2 } from "lucide-react";

const inputCls =
  "w-full px-4 py-3 rounded-xl text-sm text-[#2c1810] placeholder-[#9a7a62] bg-[#faf6f2] border border-[#e8ddd3] focus:outline-none focus:border-[#ff914d]/60 focus:ring-1 focus:ring-[#ff914d]/30";

function PaymentLinksInner() {
  const role = useRole();
  const [form, setForm] = useState({ amount: "", reference: "", name: "", contact: "", days: 14 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(null);
  const [links, setLinks] = useState([]);
  const [listError, setListError] = useState(null);

  const loadLinks = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/payment-links", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load links");
      setLinks(data.links || []);
      setListError(null);
    } catch (err) {
      setListError(err.message);
    }
  }, []);

  useEffect(() => {
    if (role === "admin") loadLinks();
  }, [role, loadLinks]);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/payment-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create link");
      setResult(data.link);
      loadLinks();
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

  if (role !== "admin") {
    return <p className="text-center text-sm text-[#6a5040] py-10">Admins only.</p>;
  }

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={submit} className="space-y-4 bg-white/90 border border-[#eadfd2] rounded-2xl p-6">
        <div>
          <label className="block text-xs font-semibold text-[#6a5040] mb-1">Amount (ISK)</label>
          <input className={inputCls} inputMode="numeric" placeholder="6080" value={form.amount} onChange={(e) => update("amount", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6a5040] mb-1">Order reference</label>
          <input className={inputCls} placeholder="YAIMA 8057572bc66d" value={form.reference} onChange={(e) => update("reference", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6a5040] mb-1">Customer name</label>
          <input className={inputCls} value={form.name} onChange={(e) => update("name", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6a5040] mb-1">Customer email or phone</label>
          <input className={inputCls} placeholder="name@example.com" value={form.contact} onChange={(e) => update("contact", e.target.value)} />
          <p className="mt-1 text-[11px] text-[#9a7a62]">An email is pre-filled on Teya&apos;s page so the receipt goes there.</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6a5040] mb-1">Valid for (days)</label>
          <input className={inputCls} type="number" min={1} max={90} value={form.days} onChange={(e) => update("days", e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-full bg-[#c76a2b] hover:bg-[#a5551f] text-white py-3 text-sm font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />} Create payment link
        </button>
      </form>

      {result && (
        <div className="mt-6 bg-white/90 border border-[#eadfd2] rounded-2xl p-6">
          <p className="text-sm text-[#2c1810] mb-2">
            <strong>{result.reference}</strong> · {Number(result.amount_isk).toLocaleString("is-IS")} kr · {result.customer_name}
            {result.customer_contact ? ` · ${result.customer_contact}` : ""}
          </p>
          <div className="flex gap-2">
            <input readOnly className={inputCls} value={result.url} onFocus={(e) => e.target.select()} />
            <button type="button" onClick={() => copy(result.url)} className="shrink-0 inline-flex items-center gap-1.5 px-4 rounded-xl border border-[#c76a2b] text-[#c76a2b] text-sm font-semibold">
              {copied === result.url ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied === result.url ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-[#9a7a62]">
            Valid until {fmtDate(result.expires_at)}. Nothing has been sent — send this link to the customer yourself. You&apos;ll get an email when it&apos;s paid.
          </p>
        </div>
      )}

      <div className="mt-8 bg-white/90 border border-[#eadfd2] rounded-2xl p-6">
        <p className="text-sm font-semibold text-[#2c1810] mb-3">History</p>
        {listError && <p className="text-sm text-red-600">{listError}</p>}
        {!listError && links.length === 0 && <p className="text-sm text-[#9a7a62]">No payment links yet.</p>}
        <ul className="divide-y divide-[#f0e6d8]">
          {links.map((l) => (
            <li key={l.id} className="py-3 flex items-start justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="text-[#2c1810]">
                  <span className="font-semibold">{l.customer_name}</span>
                  {l.customer_contact ? <span className="text-[#9a7a62]"> · {l.customer_contact}</span> : null}
                </p>
                <p className="text-[#6a5040]">{l.reference} · {Number(l.amount_isk).toLocaleString("is-IS")} kr</p>
                <p className="text-[11px] text-[#9a7a62]">
                  {fmtDateTime(l.created_at)}
                  {l.paid_at ? ` · paid ${fmtDateTime(l.paid_at)}` : ""}
                </p>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1.5">
                <StatusBadge status={l.status} />
                <button type="button" onClick={() => copy(l.url)} className="inline-flex items-center gap-1 text-[12px] text-[#c76a2b] font-semibold">
                  {copied === l.url ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === l.url ? "Copied" : "Copy link"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const STATUS_STYLE = {
  created: ["Unpaid", "bg-[#faf6f2] text-[#8a7261]"],
  paid: ["Paid", "bg-emerald-50 text-emerald-700"],
  failed: ["Failed", "bg-red-50 text-red-700"],
  cancelled: ["Cancelled", "bg-amber-50 text-amber-700"],
};

function StatusBadge({ status }) {
  const [label, cls] = STATUS_STYLE[status] || [status, "bg-neutral-100 text-neutral-700"];
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{label}</span>;
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
  return iso
    ? new Date(iso).toLocaleDateString("en-GB", { timeZone: "Atlantic/Reykjavik", day: "numeric", month: "short", year: "numeric" })
    : "-";
}

export default function PaymentLinksPage() {
  return (
    <AdminGuard>
      <AdminShell>
        <AdminHero title="Payment links" subtitle="Send a customer a link to pay an amount by card" />
        <PaymentLinksInner />
      </AdminShell>
    </AdminGuard>
  );
}
