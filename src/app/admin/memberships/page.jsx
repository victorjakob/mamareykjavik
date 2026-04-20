"use client";

// /admin/memberships — Mama Membership CMS
// ─────────────────────────────────────────
// Operator overview of every membership_subscription row, with:
//   - Roll-up counters: total members, by tier, MRR (paid-only, ISK)
//   - Filter bar: status, tier, email/name search
//   - Table: email, tier, status, amount, next bill, signup date
//   - Row click → side panel with the full audit trail
//     (membership_payment_events)
//
// No mutations here; it's a read-only CMS. Cancellations / upgrades still
// go through /api/membership/cancel and /api/membership/checkout so the
// state machine stays single-sourced.

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminGuard from "../AdminGuard";
import { AdminShell, AdminHero } from "@/app/admin/components/AdminShell";
import {
  Users,
  Sparkles,
  HandHeart,
  Leaf,
  Search,
  X,
  Loader2,
  TrendingUp,
  Clock,
  AlertCircle,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "",                 label: "All" },
  { value: "active",           label: "Active" },
  { value: "grace_period",     label: "Grace" },
  { value: "pending_payment",  label: "Pending" },
  { value: "past_due",         label: "Past due" },
  { value: "canceled",         label: "Canceled" },
  { value: "paused",           label: "Paused" },
];

const TIER_OPTIONS = [
  { value: "",       label: "All tiers" },
  { value: "free",   label: "Free" },
  { value: "tribe",  label: "Tribe" },
  { value: "patron", label: "High Ticket" },
];

const TIER_COLOR = {
  free:   { bg: "#f5efe6", fg: "#6a5040", Icon: Leaf },
  tribe:  { bg: "#fff0e0", fg: "#c76a2b", Icon: Sparkles },
  patron: { bg: "#e6ece4", fg: "#1f5c4b", Icon: HandHeart },
};

const TIER_LABEL = {
  free: "Free",
  tribe: "Tribe",
  patron: "High Ticket",
};

const STATUS_COLOR = {
  active:          { bg: "#e7f3ea", fg: "#1f5c4b" },
  grace_period:    { bg: "#fdecec", fg: "#9a1f1f" },
  pending_payment: { bg: "#fff3e0", fg: "#c76a2b" },
  past_due:        { bg: "#fdecec", fg: "#9a1f1f" },
  canceled:        { bg: "#f2ece3", fg: "#8a7261" },
  paused:          { bg: "#eee6da", fg: "#8a7261" },
};

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function fmtIsk(n) {
  const v = Number(n || 0);
  return new Intl.NumberFormat("en-IS", { style: "decimal", maximumFractionDigits: 0 }).format(v);
}

export default function AdminMembershipsPage() {
  return (
    <AdminGuard>
      <AdminShell hero={<AdminHero eyebrow="Admin" title="Memberships" subtitle="Free · Tribe · High Ticket" backHref="/admin" size="compact" />}>
        <MembershipsBody />
      </AdminShell>
    </AdminGuard>
  );
}

function MembershipsBody() {
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({ all: 0, byStatus: {}, byTier: {}, mrrIsk: 0 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [tier, setTier] = useState("");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (tier) params.set("tier", tier);
      if (debouncedQ) params.set("q", debouncedQ);
      const res = await fetch(`/api/admin/memberships?${params}`);
      const data = await res.json().catch(() => ({}));
      setRows(data?.memberships || []);
      setTotals(data?.totals || { all: 0, byStatus: {}, byTier: {}, mrrIsk: 0 });
    } catch (err) {
      console.error("admin memberships load:", err);
    } finally {
      setLoading(false);
    }
  }, [status, tier, debouncedQ]);

  useEffect(() => { load(); }, [load]);

  const selected = useMemo(
    () => rows.find((r) => r.id === selectedId) || null,
    [rows, selectedId],
  );

  const paidCount =
    (totals.byTier?.tribe || 0) + (totals.byTier?.patron || 0);

  return (
    <>
      {/* Roll-up metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={<Users className="h-4 w-4" strokeWidth={1.6} />}
          label="Members"
          value={String(totals.all || 0)}
          sub={`${totals.byStatus?.active || 0} active`}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" strokeWidth={1.6} />}
          label="MRR"
          value={`${fmtIsk(totals.mrrIsk || 0)}`}
          sub={`ISK · ${paidCount} paying`}
          accent="#1f5c4b"
        />
        <StatCard
          icon={<Sparkles className="h-4 w-4" strokeWidth={1.6} />}
          label="Tribe"
          value={String(totals.byTier?.tribe || 0)}
          sub="2,000 ISK / mo"
          accent="#c76a2b"
        />
        <StatCard
          icon={<HandHeart className="h-4 w-4" strokeWidth={1.6} />}
          label="High Ticket"
          value={String(totals.byTier?.patron || 0)}
          sub="20k–200k ISK once"
          accent="#1f5c4b"
        />
      </div>

      {/* Filter bar */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9a7a62]" strokeWidth={1.6} />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by email or name…"
            className="w-full rounded-full border border-[#e8ddd3] bg-white pl-9 pr-3 py-2 text-[13px] text-[#2c1810] placeholder:text-[#c0a890] focus:outline-none focus:border-[#ff914d]"
          />
          {q ? (
            <button
              type="button"
              onClick={() => setQ("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#c0a890] hover:text-[#2c1810]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-full border border-[#e8ddd3] bg-white px-3 py-2 text-[13px] text-[#2c1810] focus:outline-none focus:border-[#ff914d]"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          className="rounded-full border border-[#e8ddd3] bg-white px-3 py-2 text-[13px] text-[#2c1810] focus:outline-none focus:border-[#ff914d]"
        >
          {TIER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1.5px solid #e8ddd3", background: "#fefcf8" }}
      >
        {loading ? (
          <div className="py-12 flex items-center justify-center text-[#9a7a62]">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading memberships…
          </div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-[#9a7a62] text-[14px]">
            No memberships match this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.18em] text-[#9a7a62] border-b border-[#f0e8dc]">
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Next bill</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const tierMeta = TIER_COLOR[r.tier] || TIER_COLOR.free;
                  const TierIcon = tierMeta.Icon;
                  const statusMeta = STATUS_COLOR[r.status] || { bg: "#f2ece3", fg: "#8a7261" };
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedId(r.id)}
                      className="border-b border-[#f5efe6] last:border-0 hover:bg-[#fff7ef] cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="text-[14px] font-medium text-[#2c1810] leading-tight">
                          {r.member_name || "—"}
                        </div>
                        <div className="text-[12px] text-[#9a7a62]">{r.member_email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 text-[12px] px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: tierMeta.bg, color: tierMeta.fg }}
                        >
                          <TierIcon className="h-3 w-3" strokeWidth={1.8} />
                          {TIER_LABEL[r.tier] || r.tier}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-[11px] tracking-[0.16em] uppercase px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: statusMeta.bg, color: statusMeta.fg }}
                        >
                          {r.status.replace("_", " ")}
                        </span>
                        {r.cancel_at_period_end ? (
                          <span className="ml-2 text-[10px] text-[#9a1f1f]">ending</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#2c1810]">
                        {r.tier === "free" ? "—" : `${fmtIsk(r.price_amount)} ${r.currency || "ISK"}`}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#2c1810]">
                        {r.tier === "free" ? "—" : fmtDate(r.next_billing_date)}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#9a7a62]">
                        {fmtDate(r.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      <AnimatePresence>
        {selected ? (
          <DetailDrawer
            key={selected.id}
            subscription={selected}
            onClose={() => setSelectedId(null)}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

function StatCard({ icon, label, value, sub, accent = "#ff914d" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white p-4 border border-[#e8ddd3]"
    >
      <div className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-[#9a7a62]">
        <span style={{ color: accent }}>{icon}</span>
        {label}
      </div>
      <div
        className="mt-1.5 font-cormorant font-light"
        style={{ fontSize: "1.9rem", lineHeight: 1, color: "#2c1810" }}
      >
        {value}
      </div>
      {sub ? <div className="mt-1 text-[12px] text-[#9a7a62]">{sub}</div> : null}
    </motion.div>
  );
}

function DetailDrawer({ subscription, onClose }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/memberships/${subscription.id}/events`);
        const data = await res.json().catch(() => ({}));
        if (alive) setEvents(data?.events || []);
      } catch {
        // silent
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [subscription.id]);

  const tierMeta = TIER_COLOR[subscription.tier] || TIER_COLOR.free;
  const TierIcon = tierMeta.Icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end bg-black/40"
      onClick={onClose}
    >
      <motion.aside
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="h-full w-full max-w-xl bg-white shadow-xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-[#f0e8dc] px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-[#9a7a62]">Membership</div>
            <div className="font-cormorant italic font-light text-2xl text-[#2c1810]">
              {subscription.member_name || subscription.member_email}
            </div>
            <div className="text-[12px] text-[#9a7a62]">{subscription.member_email}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#9a7a62] hover:text-[#2c1810]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Meta block */}
        <div className="px-6 py-5 grid grid-cols-2 gap-3 text-[13px]">
          <MetaRow label="Tier">
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full"
              style={{ backgroundColor: tierMeta.bg, color: tierMeta.fg }}
            >
              <TierIcon className="h-3 w-3" strokeWidth={1.8} />
              {TIER_LABEL[subscription.tier] || subscription.tier}
            </span>
          </MetaRow>
          <MetaRow label="Status">{subscription.status.replace("_", " ")}</MetaRow>
          <MetaRow label="Amount">
            {subscription.tier === "free"
              ? "—"
              : subscription.tier === "patron"
              ? `${fmtIsk(subscription.price_amount)} ${subscription.currency || "ISK"} (one-time)`
              : `${fmtIsk(subscription.price_amount)} ${subscription.currency || "ISK"} / ${subscription.interval_unit || "month"}`}
          </MetaRow>
          <MetaRow label="Next bill">{fmtDate(subscription.next_billing_date)}</MetaRow>
          <MetaRow label="Period start">{fmtDate(subscription.current_period_start)}</MetaRow>
          <MetaRow label="Period end">{fmtDate(subscription.current_period_end)}</MetaRow>
          <MetaRow label="Cancel at period end">{subscription.cancel_at_period_end ? "Yes" : "No"}</MetaRow>
          <MetaRow label="Canceled at">{fmtDate(subscription.canceled_at)}</MetaRow>
          <MetaRow label="Joined">{fmtDate(subscription.created_at)}</MetaRow>
          {subscription.tribe_card_id ? (
            <MetaRow label="Tribe card">
              <code className="text-[11px] text-[#6a5040]">{subscription.tribe_card_id.slice(0, 8)}…</code>
            </MetaRow>
          ) : null}
        </div>

        {/* Event timeline */}
        <div className="px-6 pb-8">
          <div className="mb-3 flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-[#9a7a62]">
            <Clock className="h-3.5 w-3.5" strokeWidth={1.6} />
            Audit trail
          </div>
          {loading ? (
            <div className="py-8 flex items-center justify-center text-[#9a7a62]">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading…
            </div>
          ) : events.length === 0 ? (
            <div className="py-6 text-center text-[13px] text-[#9a7a62]">
              No events recorded for this subscription yet.
            </div>
          ) : (
            <ol className="space-y-3">
              {events.map((ev) => (
                <li
                  key={ev.id}
                  className="rounded-xl border border-[#f0e8dc] bg-[#fffaf3] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium text-[#2c1810]">
                      {ev.event_type}
                    </span>
                    <span className="text-[11px] text-[#9a7a62]">
                      {new Date(ev.created_at).toLocaleString("en-GB")}
                    </span>
                  </div>
                  {ev.message ? (
                    <div className="mt-1 text-[12.5px] text-[#6a5040] leading-snug">
                      {ev.message}
                    </div>
                  ) : null}
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11.5px] text-[#8a7261]">
                    {ev.order_id ? <span>order: <code>{ev.order_id}</code></span> : null}
                    {ev.transaction_id ? <span>tx: <code>{ev.transaction_id}</code></span> : null}
                    {ev.action_code ? <span>code: <code>{ev.action_code}</code></span> : null}
                    {Number(ev.amount) ? <span>{fmtIsk(ev.amount)} {ev.currency || "ISK"}</span> : null}
                  </div>
                  {ev.event_type.includes("failed") || ev.event_type.includes("rejected") ? (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#9a1f1f]">
                      <AlertCircle className="h-3 w-3" strokeWidth={1.8} />
                      Payment event needs attention
                    </div>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
        </div>
      </motion.aside>
    </motion.div>
  );
}

function MetaRow({ label, children }) {
  return (
    <div>
      <div className="text-[10px] tracking-[0.2em] uppercase text-[#9a7a62] mb-0.5">{label}</div>
      <div className="text-[13px] text-[#2c1810]">{children || "—"}</div>
    </div>
  );
}
