"use client";

// /admin/memberships — Mama Membership CMS
// ─────────────────────────────────────────
// Operator cockpit for Mama memberships.
//
// Layout:
//   1. Attention band      — 4 red-dot counters, click to filter the table
//   2. Dunning queue       — every grace_period sub with retry context + actions
//   3. Roll-up cards       — Members · MRR (with delta vs last month) · Tribe · High Ticket
//                            · New 30d · Churn 30d, plus an 8-week sparkline
//   4. Filter bar          — status / tier / search (same as before)
//   5. Members table       — click row → detail drawer
//   6. Activity feed       — last 15 lifecycle events across all members
//   7. Detail drawer       — audit trail + Retry / Comp / Resend-receipt actions
//
// Mutations happen through dedicated POST endpoints, so cancel / checkout / etc.
// still flow through the existing state machine. This page never bypasses it.

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
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
  TrendingDown,
  Clock,
  AlertCircle,
  AlertTriangle,
  CalendarClock,
  CreditCard,
  RefreshCcw,
  Gift,
  Mail,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
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

const EVENT_COLOR = {
  renewal_succeeded:       { bg: "#e7f3ea", fg: "#1f5c4b", dot: "#1f9e6e" },
  initial_charge_succeeded:{ bg: "#e7f3ea", fg: "#1f5c4b", dot: "#1f9e6e" },
  renewal_attempted:       { bg: "#f5efe6", fg: "#6a5040", dot: "#c0a890" },
  renewal_failed:          { bg: "#fdecec", fg: "#9a1f1f", dot: "#d64545" },
  checkout_created:        { bg: "#fff3e0", fg: "#c76a2b", dot: "#ff914d" },
  subscription_canceled:   { bg: "#f2ece3", fg: "#8a7261", dot: "#b5a08e" },
  admin_comp:              { bg: "#f0ebf7", fg: "#5c3d85", dot: "#7e54b8" },
  admin_retry_triggered:   { bg: "#eef4fb", fg: "#1f4b8a", dot: "#4785d6" },
  admin_receipt_resent:    { bg: "#eef4fb", fg: "#1f4b8a", dot: "#4785d6" },
};
const eventMeta = (t) => EVENT_COLOR[t] || { bg: "#f5efe6", fg: "#6a5040", dot: "#c0a890" };
const prettifyEvent = (t) =>
  String(t || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function fmtDateTime(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
function fmtIsk(n) {
  const v = Number(n || 0);
  return new Intl.NumberFormat("en-IS", { style: "decimal", maximumFractionDigits: 0 }).format(v);
}
function relTime(iso) {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
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
  const [totals, setTotals] = useState({
    all: 0, byStatus: {}, byTier: {}, mrrIsk: 0, mrrLastMonthIsk: 0,
    pastDue: 0, gracePeriod: 0, endingSoon: 0, noCardOnFile: 0,
    newMembers30d: 0, churned30d: 0, paidMembersWeekly: [],
  });
  const [dunning, setDunning] = useState([]);
  const [activity, setActivity] = useState([]);
  const [attention, setAttention] = useState({ endingSoonIds: [], noCardIds: [] });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [tier, setTier] = useState("");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [attentionFilter, setAttentionFilter] = useState(null); // "ending_soon" | "no_card" | null
  const [toast, setToast] = useState(null);

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
      setTotals({
        all: 0, byStatus: {}, byTier: {}, mrrIsk: 0, mrrLastMonthIsk: 0,
        pastDue: 0, gracePeriod: 0, endingSoon: 0, noCardOnFile: 0,
        newMembers30d: 0, churned30d: 0, paidMembersWeekly: [],
        ...(data?.totals || {}),
      });
      setDunning(data?.dunning || []);
      setActivity(data?.activity || []);
      setAttention(data?.attention || { endingSoonIds: [], noCardIds: [] });
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

  // Counter-click handlers set server-side filter (status) or client-side attentionFilter.
  const activateAttention = (key) => {
    if (key === "past_due") {
      setStatus("past_due"); setAttentionFilter(null);
    } else if (key === "grace_period") {
      setStatus("grace_period"); setAttentionFilter(null);
    } else if (key === "ending_soon") {
      setStatus(""); setAttentionFilter("ending_soon");
    } else if (key === "no_card") {
      setStatus(""); setAttentionFilter("no_card");
    }
  };
  const clearFilters = () => { setStatus(""); setTier(""); setQ(""); setAttentionFilter(null); };

  // Client-side attention filter narrows already-fetched rows.
  const displayedRows = useMemo(() => {
    if (!attentionFilter) return rows;
    const set = new Set(
      attentionFilter === "ending_soon" ? attention.endingSoonIds :
      attentionFilter === "no_card"     ? attention.noCardIds : []
    );
    return rows.filter((r) => set.has(r.id));
  }, [rows, attentionFilter, attention]);

  const paidCount = (totals.byTier?.tribe || 0) + (totals.byTier?.patron || 0);
  const mrrDelta = (totals.mrrIsk || 0) - (totals.mrrLastMonthIsk || 0);
  const mrrDeltaPct = totals.mrrLastMonthIsk
    ? Math.round((mrrDelta / totals.mrrLastMonthIsk) * 100)
    : null;

  const totalAttention = totals.pastDue + totals.gracePeriod + totals.endingSoon + totals.noCardOnFile;

  const showToast = (message, variant = "ok") => {
    setToast({ message, variant, id: Date.now() });
    setTimeout(() => setToast((t) => (t && t.message === message ? null : t)), 3200);
  };

  return (
    <>
      {/* 1. Attention band */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2 text-[11px] tracking-[0.22em] uppercase text-[#9a7a62]">
          <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.8} />
          {totalAttention > 0 ? `${totalAttention} items need attention` : "All quiet — nothing needs attention"}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <AttentionCard
            label="Failed renewals"
            count={totals.pastDue}
            Icon={AlertCircle}
            tone={totals.pastDue > 0 ? "red" : "muted"}
            onClick={() => activateAttention("past_due")}
            active={status === "past_due" && !attentionFilter}
            sub="Paused · needs new card"
          />
          <AttentionCard
            label="Retrying now"
            count={totals.gracePeriod}
            Icon={RefreshCcw}
            tone={totals.gracePeriod > 0 ? "orange" : "muted"}
            onClick={() => activateAttention("grace_period")}
            active={status === "grace_period" && !attentionFilter}
            sub="In dunning · auto-retries"
          />
          <AttentionCard
            label="Ending this month"
            count={totals.endingSoon}
            Icon={CalendarClock}
            tone={totals.endingSoon > 0 ? "amber" : "muted"}
            onClick={() => activateAttention("ending_soon")}
            active={attentionFilter === "ending_soon"}
            sub="Cancel-at-period-end"
          />
          <AttentionCard
            label="No card on file"
            count={totals.noCardOnFile}
            Icon={CreditCard}
            tone={totals.noCardOnFile > 0 ? "red" : "muted"}
            onClick={() => activateAttention("no_card")}
            active={attentionFilter === "no_card"}
            sub="Token missing"
          />
        </div>
      </div>

      {/* 2. Dunning queue — only render if something is dunning */}
      {dunning.length > 0 ? (
        <DunningQueue
          items={dunning}
          onRetryDone={(msg) => { showToast(msg); load(); }}
          onOpenMember={(id) => setSelectedId(id)}
        />
      ) : null}

      {/* 3. Roll-ups — Members / MRR momentum / Tribe / High Ticket  */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <StatCard
          icon={<Users className="h-4 w-4" strokeWidth={1.6} />}
          label="Members"
          value={String(totals.all || 0)}
          sub={`${totals.byStatus?.active || 0} active · ${totals.newMembers30d} new 30d`}
        />
        <MrrMomentumCard
          mrr={totals.mrrIsk}
          delta={mrrDelta}
          deltaPct={mrrDeltaPct}
          paid={paidCount}
          weekly={totals.paidMembersWeekly}
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

      {/* Small secondary row: churn, new, etc. */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 text-[12px]">
        <MiniStat label="New members · 30d" value={totals.newMembers30d} tone="green" />
        <MiniStat label="Churned · 30d" value={totals.churned30d} tone={totals.churned30d > 0 ? "red" : "muted"} />
        <MiniStat label="In grace" value={totals.gracePeriod} tone={totals.gracePeriod > 0 ? "orange" : "muted"} />
        <MiniStat label="Past due" value={totals.pastDue} tone={totals.pastDue > 0 ? "red" : "muted"} />
      </div>

      {/* 4. Filter bar */}
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
            <button type="button" onClick={() => setQ("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#c0a890] hover:text-[#2c1810]">
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setAttentionFilter(null); }}
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

        {attentionFilter ? (
          <button
            type="button"
            onClick={() => setAttentionFilter(null)}
            className="rounded-full border border-[#ffd9c0] bg-[#fff0e0] px-3 py-1.5 text-[12px] text-[#c76a2b] hover:bg-[#ffe2cc]"
          >
            {attentionFilter === "ending_soon" ? "Ending this month" : "No card on file"}
            <X className="inline h-3 w-3 ml-1" />
          </button>
        ) : null}

        {(status || tier || q || attentionFilter) ? (
          <button type="button" onClick={clearFilters} className="text-[12px] text-[#9a7a62] hover:text-[#2c1810] px-2">
            Clear all
          </button>
        ) : null}
      </div>

      {/* 5 & 6. Main grid: Table (left) + Activity feed (right on md+) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 mb-6">
        {/* Members table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1.5px solid #e8ddd3", background: "#fefcf8" }}
        >
          {loading ? (
            <div className="py-12 flex items-center justify-center text-[#9a7a62]">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading memberships…
            </div>
          ) : displayedRows.length === 0 ? (
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
                  {displayedRows.map((r) => {
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

        {/* Activity feed */}
        <ActivityFeed activity={activity} onOpen={(id) => setSelectedId(id)} />
      </div>

      {/* 7. Detail drawer */}
      <AnimatePresence>
        {selected ? (
          <DetailDrawer
            key={selected.id}
            subscription={selected}
            onClose={() => setSelectedId(null)}
            onAction={(msg) => { showToast(msg); load(); }}
          />
        ) : null}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast ? (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-5 right-5 z-[300] max-w-sm rounded-xl bg-[#2c1810] text-white px-4 py-3 text-[13px] shadow-xl"
          >
            <div className="flex items-center gap-2">
              {toast.variant === "err"
                ? <AlertCircle className="h-4 w-4 text-[#ffb8b8]" />
                : <CheckCircle2 className="h-4 w-4 text-[#9de0b8]" />
              }
              <span>{toast.message}</span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Attention band card
// ─────────────────────────────────────────────────────────────────────────────

function AttentionCard({ label, count, Icon, tone = "muted", onClick, active, sub }) {
  const toneStyles = {
    red:    { dot: "#d64545", ring: "#ffd5d5" },
    orange: { dot: "#c76a2b", ring: "#ffe2cc" },
    amber:  { dot: "#d69e1f", ring: "#fbe4b5" },
    muted:  { dot: "#c0a890", ring: "#e8ddd3" },
  }[tone] || { dot: "#c0a890", ring: "#e8ddd3" };

  const hasItems = count > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative rounded-2xl bg-white p-4 border text-left transition-all"
      style={{
        borderColor: active ? "#ff914d" : "#e8ddd3",
        boxShadow: active ? "0 0 0 2px #ffd9c0" : "none",
      }}
    >
      <div className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-[#9a7a62]">
        <span style={{ color: toneStyles.dot }}><Icon className="h-4 w-4" strokeWidth={1.7} /></span>
        {label}
        {hasItems ? (
          <span
            className="ml-auto inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: toneStyles.dot }}
          />
        ) : null}
      </div>
      <div
        className="mt-1.5 font-cormorant font-light"
        style={{ fontSize: "1.9rem", lineHeight: 1, color: hasItems ? "#2c1810" : "#9a7a62" }}
      >
        {count}
      </div>
      {sub ? <div className="mt-1 text-[12px] text-[#9a7a62]">{sub}</div> : null}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dunning queue panel
// ─────────────────────────────────────────────────────────────────────────────

function friendlyReason(code, message) {
  if (!code && !message) return "Decline reason not recorded";
  const c = String(code || "").padStart(3, "0");
  const map = {
    "100": "Card declined — possibly low balance",
    "101": "Card expired",
    "102": "Card declined by bank",
    "111": "Invalid card number",
    "116": "Not enough balance",
    "119": "Card temporarily restricted",
    "121": "Transaction limit reached",
    "129": "Bank requires authentication",
    "907": "Bank temporarily unreachable",
    "909": "Transport / system error",
  };
  return map[c] || message || `Declined (code ${c})`;
}

function DunningQueue({ items, onRetryDone, onOpenMember }) {
  return (
    <div
      className="rounded-2xl mb-6 overflow-hidden"
      style={{ border: "1.5px solid #ffd5d5", background: "linear-gradient(180deg, #fff7f0 0%, #ffffff 100%)" }}
    >
      <div className="px-5 py-3 border-b border-[#ffe0d5] flex items-center gap-2">
        <RefreshCcw className="h-4 w-4 text-[#c76a2b]" strokeWidth={1.8} />
        <span className="text-[12px] tracking-[0.2em] uppercase text-[#c76a2b] font-medium">
          Dunning queue · {items.length} in retry
        </span>
      </div>
      <div className="divide-y divide-[#ffe9d9]">
        {items.map((m) => (
          <DunningRow
            key={m.id}
            item={m}
            onRetryDone={onRetryDone}
            onOpen={() => onOpenMember(m.id)}
          />
        ))}
      </div>
    </div>
  );
}

function DunningRow({ item, onRetryDone, onOpen }) {
  const [retrying, setRetrying] = useState(false);
  const reason = friendlyReason(item.last_action_code, item.last_message);

  const handleRetry = async (e) => {
    e.stopPropagation();
    if (retrying) return;
    setRetrying(true);
    try {
      const res = await fetch(`/api/admin/memberships/${item.id}/retry`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onRetryDone?.(data?.error || "Retry failed");
      } else {
        const action = data?.result?.action;
        if (action === "renewed") onRetryDone?.(`Renewed · next bill ${fmtDate(data.result.nextBillingDate)}`);
        else if (action === "retry_scheduled") onRetryDone?.(`Still declining — retry ${fmtDate(data.result.retryOn)}`);
        else if (action === "past_due") onRetryDone?.(`Moved to past due (${data.result.reason})`);
        else onRetryDone?.(`Result: ${action}`);
      }
    } catch (err) {
      onRetryDone?.(String(err?.message || err));
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div
      className="px-5 py-4 flex flex-wrap items-center gap-3 hover:bg-[#fff0e0] cursor-pointer transition-colors"
      onClick={onOpen}
    >
      <div className="flex-1 min-w-[220px]">
        <div className="text-[14px] font-medium text-[#2c1810]">
          {item.member_name || item.member_email}
        </div>
        <div className="text-[12px] text-[#9a7a62]">{item.member_email}</div>
      </div>
      <div className="min-w-[180px]">
        <div className="text-[12.5px] text-[#9a1f1f]">{reason}</div>
        <div className="text-[11px] text-[#9a7a62]">
          Attempt {item.attempt_number} · {relTime(item.failed_at)}
        </div>
      </div>
      <div className="min-w-[150px] text-[12.5px] text-[#2c1810]">
        <div>
          <CalendarClock className="inline h-3.5 w-3.5 mr-1 text-[#c76a2b]" strokeWidth={1.8} />
          Retry {fmtDate(item.next_billing_date)}
        </div>
        <div className="text-[11px] text-[#9a7a62]">{fmtIsk(item.price_amount)} {item.currency || "ISK"}</div>
      </div>
      <button
        type="button"
        onClick={handleRetry}
        disabled={retrying}
        className="rounded-full bg-[#ff914d] text-white px-3 py-1.5 text-[12px] font-medium hover:bg-[#e6793a] disabled:opacity-60"
      >
        {retrying ? <Loader2 className="inline h-3.5 w-3.5 animate-spin" /> : "Retry now"}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MRR momentum card
// ─────────────────────────────────────────────────────────────────────────────

function MrrMomentumCard({ mrr, delta, deltaPct, paid, weekly }) {
  const up = delta > 0, flat = delta === 0;
  const Arrow = up ? ArrowUpRight : ArrowDownRight;
  const color = flat ? "#9a7a62" : up ? "#1f9e6e" : "#d64545";
  const deltaText = flat ? "No change vs. last month"
    : `${up ? "+" : ""}${fmtIsk(delta)} ISK${deltaPct !== null ? ` (${up ? "+" : ""}${deltaPct}%)` : ""} vs. last month`;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white p-4 border border-[#e8ddd3]">
      <div className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-[#9a7a62]">
        <TrendingUp className="h-4 w-4 text-[#1f5c4b]" strokeWidth={1.6} />
        MRR
      </div>
      <div className="mt-1.5 font-cormorant font-light" style={{ fontSize: "1.9rem", lineHeight: 1, color: "#2c1810" }}>
        {fmtIsk(mrr)} <span className="text-[13px] text-[#9a7a62]" style={{ fontFamily: "inherit" }}>ISK</span>
      </div>
      <div className="mt-1.5 flex items-center gap-1 text-[12px]" style={{ color }}>
        {!flat ? <Arrow className="h-3.5 w-3.5" strokeWidth={2} /> : null}
        {deltaText}
      </div>
      <div className="mt-1 text-[12px] text-[#9a7a62]">{paid} paying members</div>
      <Sparkline data={weekly} />
    </motion.div>
  );
}

function Sparkline({ data }) {
  if (!Array.isArray(data) || data.length === 0) return null;
  const w = 220, h = 36, pad = 3;
  const values = data.map((d) => d.count || 0);
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1 || 1)) * (w - pad * 2);
    const y = h - pad - ((d.count - min) / range) * (h - pad * 2);
    return [x, y];
  });
  const path = pts.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg className="mt-2" width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <path d={path} fill="none" stroke="#1f5c4b" strokeWidth="1.5" />
      {last ? <circle cx={last[0]} cy={last[1]} r="2.5" fill="#1f5c4b" /> : null}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared mini stat + stat card
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, accent = "#ff914d" }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white p-4 border border-[#e8ddd3]">
      <div className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-[#9a7a62]">
        <span style={{ color: accent }}>{icon}</span>
        {label}
      </div>
      <div className="mt-1.5 font-cormorant font-light" style={{ fontSize: "1.9rem", lineHeight: 1, color: "#2c1810" }}>
        {value}
      </div>
      {sub ? <div className="mt-1 text-[12px] text-[#9a7a62]">{sub}</div> : null}
    </motion.div>
  );
}

function MiniStat({ label, value, tone = "muted" }) {
  const colors = {
    green:  "#1f9e6e",
    red:    "#d64545",
    orange: "#c76a2b",
    muted:  "#9a7a62",
  };
  return (
    <div className="rounded-xl border border-[#f0e8dc] bg-white/60 px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.2em] text-[#9a7a62]">{label}</div>
      <div className="mt-0.5 text-[18px]" style={{ color: colors[tone] || colors.muted }}>
        {value}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Activity feed
// ─────────────────────────────────────────────────────────────────────────────

function ActivityFeed({ activity, onOpen }) {
  return (
    <aside className="rounded-2xl bg-white border border-[#e8ddd3] overflow-hidden h-fit sticky top-4">
      <div className="px-4 py-3 border-b border-[#f0e8dc] flex items-center gap-2">
        <Activity className="h-3.5 w-3.5 text-[#ff914d]" strokeWidth={1.8} />
        <span className="text-[11px] tracking-[0.2em] uppercase text-[#9a7a62]">Recent activity</span>
      </div>
      {activity.length === 0 ? (
        <div className="px-4 py-6 text-center text-[12.5px] text-[#9a7a62]">Quiet · no events yet.</div>
      ) : (
        <ol className="max-h-[720px] overflow-y-auto">
          {activity.map((ev) => {
            const meta = eventMeta(ev.event_type);
            return (
              <li
                key={ev.id}
                onClick={() => onOpen?.(ev.subscription_id)}
                className="px-4 py-3 border-b border-[#f5efe6] last:border-0 hover:bg-[#fff7ef] cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: meta.dot }} />
                    <span className="text-[12.5px] font-medium" style={{ color: meta.fg }}>
                      {prettifyEvent(ev.event_type)}
                    </span>
                  </div>
                  <span className="text-[10.5px] text-[#9a7a62] flex-shrink-0">{relTime(ev.created_at)}</span>
                </div>
                <div className="mt-0.5 text-[11.5px] text-[#6a5040] truncate">{ev.member_email}</div>
                {ev.amount ? (
                  <div className="text-[11px] text-[#9a7a62]">{fmtIsk(ev.amount)} {ev.currency || "ISK"}</div>
                ) : null}
                {ev.action_code ? (
                  <div className="text-[10.5px] text-[#9a1f1f]">code {ev.action_code}</div>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Detail drawer
// ─────────────────────────────────────────────────────────────────────────────

function DetailDrawer({ subscription, onClose, onAction }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [portalReady, setPortalReady] = useState(false);
  const [busy, setBusy] = useState(null); // "retry" | "comp" | "receipt" | null

  useEffect(() => { setPortalReady(true); }, []);

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
    return () => { alive = false; };
  }, [subscription.id]);

  const runAction = async (kind) => {
    if (busy) return;
    setBusy(kind);
    try {
      let res, data, message;
      if (kind === "retry") {
        res = await fetch(`/api/admin/memberships/${subscription.id}/retry`, { method: "POST" });
        data = await res.json().catch(() => ({}));
        const action = data?.result?.action;
        if (!res.ok) message = data?.error || "Retry failed";
        else if (action === "renewed") message = `Renewed · next bill ${fmtDate(data.result.nextBillingDate)}`;
        else if (action === "retry_scheduled") message = `Still declining — retry ${fmtDate(data.result.retryOn)}`;
        else if (action === "past_due") message = `Moved to past due (${data.result.reason || "hard fail"})`;
        else message = `Result: ${action}`;
      } else if (kind === "comp") {
        res = await fetch(`/api/admin/memberships/${subscription.id}/comp`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ days: 30 }),
        });
        data = await res.json().catch(() => ({}));
        message = res.ok
          ? `Comped 30 days · new end ${fmtDate(data.newPeriodEnd)}`
          : (data?.error || "Comp failed");
      } else if (kind === "receipt") {
        res = await fetch(`/api/admin/memberships/${subscription.id}/resend-receipt`, { method: "POST" });
        data = await res.json().catch(() => ({}));
        message = res.ok ? "Receipt resent ✓" : (data?.error || "Failed to resend");
      }
      onAction?.(message);
      // Refresh event list locally
      const ev = await fetch(`/api/admin/memberships/${subscription.id}/events`).then((r) => r.json()).catch(() => ({}));
      setEvents(ev?.events || events);
    } catch (err) {
      onAction?.(String(err?.message || err));
    } finally {
      setBusy(null);
    }
  };

  const tierMeta = TIER_COLOR[subscription.tier] || TIER_COLOR.free;
  const TierIcon = tierMeta.Icon;
  const isPaid = subscription.tier !== "free";

  const drawer = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[260] flex justify-end bg-black/40"
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
          <button type="button" onClick={onClose} className="p-2 text-[#9a7a62] hover:text-[#2c1810]" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action buttons (paid subs only) */}
        {isPaid ? (
          <div className="px-6 py-3 border-b border-[#f0e8dc] flex flex-wrap gap-2 bg-[#fffaf3]">
            <ActionBtn
              busy={busy === "retry"}
              onClick={() => runAction("retry")}
              Icon={RefreshCcw}
              label="Retry renewal now"
              tooltip="Charge the card on file immediately"
            />
            <ActionBtn
              busy={busy === "comp"}
              onClick={() => runAction("comp")}
              Icon={Gift}
              label="Comp 30 days"
              tooltip="Extend period end by one month (no charge)"
            />
            <ActionBtn
              busy={busy === "receipt"}
              onClick={() => runAction("receipt")}
              Icon={Mail}
              label="Resend receipt"
              tooltip="Resend the most recent successful-charge email"
            />
          </div>
        ) : null}

        {/* Meta block */}
        <div className="px-6 py-5 grid grid-cols-2 gap-3 text-[13px]">
          <MetaRow label="Tier">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ backgroundColor: tierMeta.bg, color: tierMeta.fg }}>
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
              {events.map((ev) => {
                const meta = eventMeta(ev.event_type);
                return (
                  <li key={ev.id} className="rounded-xl border border-[#f0e8dc] bg-[#fffaf3] px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-medium flex items-center gap-2" style={{ color: meta.fg }}>
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.dot }} />
                        {prettifyEvent(ev.event_type)}
                      </span>
                      <span className="text-[11px] text-[#9a7a62]">
                        {new Date(ev.created_at).toLocaleString("en-GB")}
                      </span>
                    </div>
                    {ev.message ? (
                      <div className="mt-1 text-[12.5px] text-[#6a5040] leading-snug">{ev.message}</div>
                    ) : null}
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11.5px] text-[#8a7261]">
                      {ev.order_id ? <span>order: <code>{ev.order_id}</code></span> : null}
                      {ev.transaction_id ? <span>tx: <code>{ev.transaction_id}</code></span> : null}
                      {ev.action_code ? <span>code: <code>{ev.action_code}</code></span> : null}
                      {Number(ev.amount) ? <span>{fmtIsk(ev.amount)} {ev.currency || "ISK"}</span> : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </motion.aside>
    </motion.div>
  );

  if (!portalReady || typeof document === "undefined") return null;
  return createPortal(drawer, document.body);
}

function ActionBtn({ busy, onClick, Icon, label, tooltip }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      title={tooltip}
      className="inline-flex items-center gap-1.5 rounded-full border border-[#e8ddd3] bg-white px-3 py-1.5 text-[12px] text-[#2c1810] hover:bg-[#fff7ef] hover:border-[#ff914d] disabled:opacity-60 transition"
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5 text-[#ff914d]" strokeWidth={1.8} />}
      {label}
    </button>
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
