"use client";

// /admin/subscribers — Subscriber Command
// ───────────────────────────────────────
// One place to see every email the business holds and run the weekly letter,
// so Resend never has to be opened. Pulls everything from
// /api/admin/subscribers/* (master list) + /api/newsletter/* (weekly draft).
//
//   · Reach / on-list / unsubscribed / awaiting-approval stat cards
//   · 12-week growth + where every email comes from
//   · Consolidate all business emails → master list → push to Resend
//   · The weekly letter waiting for approval (approve / edit / highlight)
//   · Recent unsubscribes + a searchable list of everyone

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import AdminGuard from "../AdminGuard";
import {
  AdminShell,
  AdminHero,
  AdminPanel,
  AdminStatCard,
} from "@/app/admin/components/AdminShell";
import {
  Users,
  UserCheck,
  UserMinus,
  Send,
  RefreshCw,
  Search,
  Star,
  PenLine,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Mailbox,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";

const ORANGE = "#ff914d";
const TEXT_DARK = "#2c1810";
const TEXT_MUTED = "#9a7a62";
const HAIRLINE = "#e8ddd3";
const SOFT_BG = "#faf6f2";

const fmt = (n) => (n == null ? "—" : Number(n).toLocaleString());

// Turn raw API errors into something actionable. The most common one here is a
// Resend "sending only" key, which can't touch contacts/audiences/broadcasts.
function friendlyError(msg) {
  const m = String(msg || "");
  if (/only send emails|restricted to only send|not allowed|permission|full access/i.test(m)) {
    return "Your Resend API key can only send emails — it needs full access (Contacts + Broadcasts). In Resend → API Keys, create a Full-access key and set it as RESEND_API_KEY in Vercel, then redeploy.";
  }
  return m;
}

// ── 12-week growth, tiny inline SVG (no chart dependency) ──────────
function GrowthChart({ data }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(1, ...data.map((d) => d.count));
  const W = 560;
  const H = 130;
  const pad = 16;
  const slot = (W - pad * 2) / data.length;
  const bw = slot * 0.56;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="Weekly new subscribers, last 12 weeks"
      style={{ display: "block" }}
    >
      {data.map((d, i) => {
        const bh = Math.round(((H - pad * 2) * d.count) / max);
        const x = pad + i * slot + (slot - bw) / 2;
        const y = H - pad - bh;
        const isLast = i === data.length - 1;
        return (
          <g key={d.week}>
            <rect
              x={x}
              y={y}
              width={bw}
              height={Math.max(bh, d.count > 0 ? 3 : 1)}
              rx={3}
              fill={isLast ? ORANGE : "rgba(255,145,77,0.32)"}
            />
            {d.count > 0 ? (
              <text
                x={x + bw / 2}
                y={y - 5}
                textAnchor="middle"
                fontSize="10"
                fill={TEXT_MUTED}
              >
                {d.count}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

// ── Where every email comes from — horizontal bars ────────────────
function SourceBars({ sources }) {
  if (!sources || sources.length === 0) {
    return <p className="text-sm text-[#9a7a62]">No sources yet.</p>;
  }
  const max = Math.max(1, ...sources.map((s) => s.count));
  return (
    <div className="space-y-2.5">
      {sources.map((s) => (
        <div key={s.key} className="flex items-center gap-3">
          <div className="w-36 shrink-0 text-[13px] text-[#3a2a1c] truncate">
            {s.label}
          </div>
          <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: "#f0e6d8" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(4, (s.count / max) * 100)}%`,
                background: "linear-gradient(to right, #ff914d, #ffb06a)",
              }}
            />
          </div>
          <div className="w-12 text-right text-[13px] font-semibold text-[#2c1810]">
            {fmt(s.count)}
          </div>
        </div>
      ))}
    </div>
  );
}

const STATUS_STYLE = {
  subscribed: { bg: "rgba(31,158,110,0.12)", fg: "#1f5c4b", label: "Subscribed" },
  unsubscribed: { bg: "rgba(154,31,31,0.10)", fg: "#9a1f1f", label: "Unsubscribed" },
  pending: { bg: "rgba(255,145,77,0.14)", fg: "#a75a1a", label: "Pending" },
};
function StatusTag({ status }) {
  const s = STATUS_STYLE[status] || { bg: "#f0e6d8", fg: TEXT_MUTED, label: status };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ background: s.bg, color: s.fg }}
    >
      {s.label}
    </span>
  );
}

// Clickable, sort-aware column header.
function SortTh({ label, col, sort, dir, onSort, alignRight }) {
  const active = sort === col;
  return (
    <th className={`py-2 pr-3 ${alignRight ? "text-right" : ""}`}>
      <button
        type="button"
        onClick={() => onSort(col)}
        className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] font-semibold"
        style={{ color: active ? ORANGE : TEXT_MUTED }}
      >
        {label}
        {active ? (
          dir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        ) : null}
      </button>
    </th>
  );
}

// One label/value row inside the profile modal. Hidden when empty.
function DetailRow({ label, value }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex justify-between gap-4 py-2 border-b last:border-0" style={{ borderColor: "#f4ece2" }}>
      <span className="text-[10px] uppercase tracking-[0.15em] text-[#9a7a62] shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-[#2c1810] text-right">{value}</span>
    </div>
  );
}

// Profile + manage modal for one subscriber.
function DetailModal({ email, detail, loading, managing, onClose, onManage }) {
  if (!email) return null;
  const sub = detail?.subscriber || null;
  const enr = detail?.enrichment || null;
  const status = sub?.status;
  const d = (x) =>
    x ? new Date(x).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(20,12,4,0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: "#fff", border: "1px solid #f0e6d8" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-[1.5px]" style={{ background: "linear-gradient(to right, rgba(255,145,77,0.5), transparent 60%)" }} />
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b" style={{ borderColor: HAIRLINE }}>
          <div className="min-w-0">
            <p className="font-cormorant italic text-2xl text-[#2c1810] leading-tight truncate">
              {sub?.name || email.split("@")[0]}
            </p>
            <p className="text-xs text-[#9a7a62] truncate">{email}</p>
          </div>
          <button onClick={onClose} className="shrink-0 p-1.5 rounded-full hover:bg-[#faf6f2]">
            <X className="w-4 h-4 text-[#9a7a62]" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto" style={{ maxHeight: "calc(85vh - 150px)" }}>
          {loading ? (
            <div className="py-10 text-center text-[#9a7a62]"><Loader2 className="w-5 h-5 animate-spin inline" /></div>
          ) : !sub ? (
            <p className="text-sm text-[#9a7a62]">Not on the list yet — no subscriber record for this address.</p>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-2">
                <StatusTag status={status} />
                {sub.resend_synced_at ? (
                  <span className="text-xs text-[#1f9e6e] inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> In Resend
                  </span>
                ) : (
                  <span className="text-xs text-[#b8a08e]">Not in Resend yet</span>
                )}
              </div>
              <div className="rounded-xl px-4 py-1" style={{ background: "#faf6f2", border: "1px solid #f0e6d8" }}>
                <DetailRow label="Source" value={sub.first_source} />
                <DetailRow label="All sources" value={Array.isArray(sub.sources) && sub.sources.length ? sub.sources.join(", ") : null} />
                <DetailRow label="Consent" value={sub.consent_basis} />
                <DetailRow label="Subscribed" value={d(sub.subscribed_at)} />
                <DetailRow label="Unsubscribed" value={d(sub.unsubscribed_at)} />
                <DetailRow label="Account since" value={d(enr?.account?.registered_at)} />
                <DetailRow label="Role" value={enr?.account?.role} />
                <DetailRow label="Tickets" value={enr?.tickets?.total ? `${enr.tickets.paid} paid · ${enr.tickets.total} total` : null} />
                <DetailRow label="Last ticket" value={d(enr?.tickets?.last_at)} />
                <DetailRow label="Membership" value={enr?.membership ? `${enr.membership.tier} (${enr.membership.status})` : null} />
                <DetailRow label="Tribe card" value={enr?.tribe_card ? enr.tribe_card.status : null} />
              </div>
              <div className="mt-5 flex justify-end gap-2">
                {status === "unsubscribed" ? (
                  <button
                    onClick={() => onManage("resubscribe")}
                    disabled={managing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold text-white disabled:opacity-50"
                    style={{ background: ORANGE }}
                  >
                    {managing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Re-subscribe
                  </button>
                ) : (
                  <button
                    onClick={() => onManage("unsubscribe")}
                    disabled={managing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold disabled:opacity-50"
                    style={{ background: "#fff", color: "#9a1f1f", border: "1px solid rgba(154,31,31,0.3)" }}
                  >
                    {managing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Unsubscribe
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SubscribersPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState(null);
  const [syncingAll, setSyncingAll] = useState(false);

  // sending the weekly letter
  const [sendingId, setSendingId] = useState(null);

  // list
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [list, setList] = useState(null);
  const [listLoading, setListLoading] = useState(false);
  const [sort, setSort] = useState("subscribed_at");
  const [dir, setDir] = useState("desc");

  // profile modal
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [managing, setManaging] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/subscribers/stats");
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to load");
      setStats(data);
      setErrMsg(null);
    } catch (err) {
      setErrMsg(friendlyError(err?.message || err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const loadList = useCallback(async () => {
    setListLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", String(page));
      params.set("sort", sort);
      params.set("dir", dir);
      const res = await fetch(`/api/admin/subscribers/list?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed");
      setList(data);
    } catch (err) {
      toast.error(friendlyError(err?.message || err));
    } finally {
      setListLoading(false);
    }
  }, [q, statusFilter, page, sort, dir]);

  useEffect(() => {
    const t = setTimeout(loadList, 250);
    return () => clearTimeout(t);
  }, [loadList]);

  async function approveDraft(draft) {
    if (
      !window.confirm(
        `Send "${draft.subject}" to your subscribers now? This cannot be undone.`,
      )
    )
      return;
    setSendingId(draft.id);
    const t = toast.loading("Sending the letter…");
    try {
      const res = await fetch(`/api/newsletter/send/${draft.id}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Send failed");
      toast.success("Sent. The letter is on its way.", { id: t });
      await loadStats();
    } catch (err) {
      toast.error(friendlyError(err?.message || err), { id: t });
    } finally {
      setSendingId(null);
    }
  }

  // One-click full sync: import the Resend audience, fold in every business
  // contact, honour all opt-outs, then push everyone subscribed into Resend.
  async function runSyncAll() {
    if (
      !window.confirm(
        "Sync now? This loads everyone into your Resend audience and respects all unsubscribes. Takes a minute or two.",
      )
    )
      return;
    const headers = { "Content-Type": "application/json" };
    setSyncingAll(true);
    const t = toast.loading("Syncing… this can take a minute.");
    try {
      let res = await fetch("/api/admin/subscribers/import-resend", {
        method: "POST",
        headers,
        body: JSON.stringify({ mode: "commit" }),
      });
      let data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Import failed");

      res = await fetch("/api/admin/subscribers/sync", {
        method: "POST",
        headers,
        body: JSON.stringify({ mode: "commit" }),
      });
      data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Add failed");

      res = await fetch("/api/admin/subscribers/reconcile", {
        method: "POST",
        headers,
        body: JSON.stringify({ mode: "commit" }),
      });
      data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Reconcile failed");

      // Push everyone subscribed into the Resend audience, batch by batch.
      let guard = 0;
      for (;;) {
        guard += 1;
        if (guard > 100) break;
        const p = await (
          await fetch("/api/admin/subscribers/push-resend", {
            method: "POST",
            headers,
            body: JSON.stringify({ limit: 50 }),
          })
        ).json();
        if (!p.ok) throw new Error(p.error || "Push failed");
        toast.loading(`Syncing… ${fmt(p.remaining ?? 0)} left`, { id: t });
        if (p.done || p.remaining === 0 || (p.processed || 0) === 0) break;
      }
      toast.success("Done — everyone's in your Resend audience.", { id: t });
      await loadStats();
    } catch (err) {
      toast.error(friendlyError(err?.message || err), { id: t });
    } finally {
      setSyncingAll(false);
    }
  }

  async function emailPreview(draftId) {
    const t = toast.loading("Sending you the preview…");
    try {
      const res = await fetch("/api/admin/subscribers/send-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed");
      toast.success(`Preview emailed to ${(data.sent_to || []).join(", ")}`, { id: t });
    } catch (err) {
      toast.error(friendlyError(err?.message || err), { id: t });
    }
  }

  async function regenerateDraft(draftId) {
    if (
      !window.confirm(
        "Pull in the latest events and rebuild this letter? Your wording and featured pick are kept.",
      )
    )
      return;
    const t = toast.loading("Pulling in the latest events…");
    try {
      const res = await fetch("/api/admin/subscribers/regenerate-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed");
      toast.success(
        `Rebuilt with ${data.eventsCount} event${data.eventsCount === 1 ? "" : "s"} — open Edit to preview.`,
        { id: t },
      );
      await loadStats();
    } catch (err) {
      toast.error(friendlyError(err?.message || err), { id: t });
    }
  }

  function toggleSort(col) {
    if (sort === col) {
      setDir((dd) => (dd === "asc" ? "desc" : "asc"));
    } else {
      setSort(col);
      setDir(col === "subscribed_at" ? "desc" : "asc");
    }
    setPage(1);
  }

  const openDetail = useCallback(async (email) => {
    setSelectedEmail(email);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/subscribers/detail?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to load");
      setDetail(data);
    } catch (err) {
      toast.error(friendlyError(err?.message || err));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  function closeDetail() {
    setSelectedEmail(null);
    setDetail(null);
  }

  async function manage(action) {
    if (!selectedEmail) return;
    const verb = action === "unsubscribe" ? "Unsubscribe" : "Re-subscribe";
    if (!window.confirm(`${verb} ${selectedEmail}?`)) return;
    setManaging(true);
    const t = toast.loading(`${verb.toLowerCase()}…`);
    try {
      const res = await fetch("/api/admin/subscribers/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selectedEmail, action }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed");
      toast.success(`${verb}d.`, { id: t });
      await Promise.all([openDetail(selectedEmail), loadList(), loadStats()]);
    } catch (err) {
      toast.error(friendlyError(err?.message || err), { id: t });
    } finally {
      setManaging(false);
    }
  }

  const totals = stats?.totals || {};
  const reach = stats?.reach || {};
  const pendingDrafts = stats?.pending_drafts || [];

  return (
    <AdminGuard>
      <AdminShell
        maxWidth="max-w-6xl"
        hero={
          <AdminHero
            eyebrow="Admin"
            title="Subscribers"
            subtitle="Your whole audience in one place — sources, growth, and the weekly letter. No need to open Resend."
            backHref="/admin"
            backLabel="Back to admin"
            size="compact"
            action={
              <>
                <button
                  onClick={runSyncAll}
                  disabled={syncingAll}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold transition-all disabled:opacity-60"
                  style={{ background: ORANGE, color: "#fff", boxShadow: "0 2px 12px rgba(255,145,77,0.32)" }}
                  title="Load everyone into your Resend audience (respects unsubscribes)"
                >
                  {syncingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  {syncingAll ? "Syncing…" : "Sync now"}
                </button>
                <button
                  onClick={loadStats}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold transition-all"
                  style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,145,77,0.4)", color: "#f0ebe3" }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </button>
              </>
            }
          />
        }
      >
        {errMsg ? (
          <div className="mb-6 rounded-xl p-4 text-sm" style={{ background: "rgba(154,31,31,0.08)", color: "#9a1f1f", border: "1px solid rgba(154,31,31,0.2)" }}>
            Couldn’t load the dashboard: {errMsg}
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center py-24 text-[#9a7a62]">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading your audience…
          </div>
        ) : (
          <div className="space-y-6 -mt-2">
            {/* ── Stat cards ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <AdminStatCard
                label="Reach (all contacts)"
                value={fmt(reach.business_total)}
                hint="Distinct emails across the whole business"
                icon={Users}
                highlight
              />
              <AdminStatCard
                label="On the list"
                value={fmt(totals.subscribed)}
                hint={`${fmt(stats?.resend?.synced)} synced to Resend`}
                icon={UserCheck}
                delay={0.05}
              />
              <AdminStatCard
                label="Unsubscribed"
                value={fmt(totals.unsubscribed)}
                hint="Honoured everywhere"
                icon={UserMinus}
                delay={0.1}
              />
              <AdminStatCard
                label="Awaiting approval"
                value={fmt(pendingDrafts.length)}
                hint="Weekly letters ready to send"
                icon={Send}
                delay={0.15}
              />
            </div>

            {/* ── Weekly letter awaiting approval ────────────────── */}
            <AdminPanel title="This week’s letter" subtitle="Drafted automatically every Monday — approve, edit, or pick a highlight" icon={Mailbox}>
              {pendingDrafts.length === 0 ? (
                <p className="text-sm text-[#9a7a62]">
                  Nothing waiting. The next letter drafts on Monday — or{" "}
                  <Link href="/admin/email/newsletter" className="font-semibold" style={{ color: ORANGE }}>
                    compose one now
                  </Link>
                  .
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingDrafts.map((d) => (
                    <div
                      key={d.id}
                      className="flex flex-wrap items-center gap-3 justify-between rounded-xl p-4"
                      style={{ background: SOFT_BG, border: `1px solid ${HAIRLINE}` }}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-cormorant italic text-xl text-[#2c1810] leading-tight">
                            {d.subject || "This Monday at Mama"}
                          </p>
                          {d.has_highlight ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,145,77,0.14)", color: "#a75a1a" }}>
                              <Star className="w-3 h-3" /> Highlight set
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-[#9a7a62] mt-0.5">
                          Sends {d.send_date} · {d.n_events} event{d.n_events === 1 ? "" : "s"} · status {d.status}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => regenerateDraft(d.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-semibold"
                          style={{ background: "#fff", color: TEXT_DARK, border: `1px solid ${HAIRLINE}` }}
                          title="Pull in the latest events and rebuild this letter (keeps your wording + featured pick)"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                        </button>
                        <button
                          onClick={() => emailPreview(d.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-semibold"
                          style={{ background: "#fff", color: TEXT_DARK, border: `1px solid ${HAIRLINE}` }}
                          title="Email this preview to you + team@mama.is"
                        >
                          <Mailbox className="w-3.5 h-3.5" /> Email me
                        </button>
                        <Link
                          href={`/newsletters/${d.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold"
                          style={{ background: "#fff", color: TEXT_DARK, border: `1px solid ${HAIRLINE}` }}
                        >
                          <PenLine className="w-3.5 h-3.5" /> Edit
                        </Link>
                        <button
                          onClick={() => approveDraft(d)}
                          disabled={sendingId === d.id}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold text-white"
                          style={{ background: ORANGE, boxShadow: "0 2px 10px rgba(255,145,77,0.28)" }}
                        >
                          {sendingId === d.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          Approve &amp; send
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {stats?.last_sent ? (
                <p className="text-xs text-[#9a7a62] mt-3">
                  Last sent: {stats.last_sent.subject} ({stats.last_sent.send_date})
                </p>
              ) : null}
            </AdminPanel>

            {/* ── Growth + sources ───────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AdminPanel title="Growth" subtitle="New subscribers per week, last 12 weeks">
                <GrowthChart data={stats?.growth} />
              </AdminPanel>
              <AdminPanel title="Where emails come from" subtitle="Across people currently on the list">
                <SourceBars sources={stats?.sources} />
              </AdminPanel>
            </div>

            {/* ── Searchable list ────────────────────────────────── */}
            <AdminPanel title="Everyone on the list" subtitle="Search and browse the master list" icon={Users}>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: TEXT_MUTED }} />
                  <input
                    value={q}
                    onChange={(e) => {
                      setPage(1);
                      setQ(e.target.value);
                    }}
                    placeholder="Search by email or name…"
                    className="w-full pl-9 pr-3 py-2 rounded-full text-sm outline-none"
                    style={{ background: "#fff", border: `1px solid ${HAIRLINE}`, color: TEXT_DARK }}
                  />
                </div>
                {["", "subscribed", "unsubscribed"].map((s) => (
                  <button
                    key={s || "all"}
                    onClick={() => {
                      setPage(1);
                      setStatusFilter(s);
                    }}
                    className="rounded-full px-3.5 py-2 text-xs font-semibold"
                    style={
                      statusFilter === s
                        ? { background: ORANGE, color: "#fff" }
                        : { background: SOFT_BG, color: TEXT_MUTED, border: `1px solid ${HAIRLINE}` }
                    }
                  >
                    {s === "" ? "All" : s === "subscribed" ? "Subscribed" : "Unsubscribed"}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <SortTh label="Email" col="email" sort={sort} dir={dir} onSort={toggleSort} />
                      <SortTh label="Name" col="name" sort={sort} dir={dir} onSort={toggleSort} />
                      <SortTh label="Source" col="first_source" sort={sort} dir={dir} onSort={toggleSort} />
                      <SortTh label="Status" col="status" sort={sort} dir={dir} onSort={toggleSort} />
                      <SortTh label="Subscribed" col="subscribed_at" sort={sort} dir={dir} onSort={toggleSort} />
                      <th className="py-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-[#9a7a62]">In Resend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listLoading ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#9a7a62]">
                          <Loader2 className="w-4 h-4 animate-spin inline" />
                        </td>
                      </tr>
                    ) : list?.rows?.length ? (
                      list.rows.map((r) => (
                        <tr
                          key={r.email}
                          onClick={() => openDetail(r.email)}
                          className="border-t cursor-pointer transition-colors hover:bg-[#faf6f2]"
                          style={{ borderColor: "#f0e6d8" }}
                        >
                          <td className="py-2 pr-3 text-[#2c1810]">{r.email}</td>
                          <td className="py-2 pr-3 text-[#6b5849]">{r.name || "—"}</td>
                          <td className="py-2 pr-3 text-[#6b5849]">{r.first_source || "—"}</td>
                          <td className="py-2 pr-3"><StatusTag status={r.status} /></td>
                          <td className="py-2 pr-3 text-[#6b5849] whitespace-nowrap">
                            {r.subscribed_at ? new Date(r.subscribed_at).toLocaleDateString() : "—"}
                          </td>
                          <td className="py-2">
                            {r.resend_synced_at ? (
                              <CheckCircle2 className="w-4 h-4" style={{ color: "#1f9e6e" }} />
                            ) : (
                              <span className="text-xs text-[#b8a08e]">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#9a7a62]">
                          Nobody here yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {list && list.total_pages > 1 ? (
                <div className="flex items-center justify-between mt-4 text-sm">
                  <span className="text-[#9a7a62]">
                    {fmt(list.total)} total · page {list.page} of {list.total_pages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={list.page <= 1}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold disabled:opacity-40"
                      style={{ background: SOFT_BG, border: `1px solid ${HAIRLINE}`, color: TEXT_DARK }}
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(list.total_pages, p + 1))}
                      disabled={list.page >= list.total_pages}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold disabled:opacity-40"
                      style={{ background: SOFT_BG, border: `1px solid ${HAIRLINE}`, color: TEXT_DARK }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </AdminPanel>

            <div className="text-center pt-2">
              <a
                href="https://resend.com/audiences"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#b8a08e] hover:text-[#9a7a62]"
              >
                Open Resend audience <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        <DetailModal
          email={selectedEmail}
          detail={detail}
          loading={detailLoading}
          managing={managing}
          onClose={closeDetail}
          onManage={manage}
        />
      </AdminShell>
    </AdminGuard>
  );
}
