"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import AdminGuard from "../../AdminGuard";
import {
  Inbox,
  Users,
  Clock,
  ShieldX,
  Search,
  Loader2,
  Check,
  X,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Plus,
  Copy,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { AdminShell, AdminHero } from "@/app/admin/components/AdminShell";

// ───────────────────────────────────────────────────────
// /admin/cards/tribe-cards — main admin dashboard
// ───────────────────────────────────────────────────────

const DURATION_OPTIONS = [
  { value: "month", label: "1 month" },
  { value: "6months", label: "6 months" },
  { value: "year", label: "1 year" },
  { value: "unlimited", label: "Unlimited" },
];
const DISCOUNT_PRESETS = [15, 20, 25];
const SOURCE_OPTIONS = [
  { value: "legacy", label: "Legacy" },
  { value: "paid-tribe", label: "Paid Tribe" },
  { value: "gift", label: "Gift" },
  { value: "friends-family", label: "Friends & Family" },
  { value: "other", label: "Other" },
];

export default function ManageTribeCardsPage() {
  return (
    <AdminGuard>
      <ManageTribeCards />
    </AdminGuard>
  );
}

function ManageTribeCards() {
  const searchParams = useSearchParams();
  const initialRequestId = searchParams.get("request");

  const [tab, setTab] = useState(initialRequestId ? "requests" : "cards");
  const [requestStatus, setRequestStatus] = useState("pending");
  const [cardStatus, setCardStatus] = useState("all");
  const [query, setQuery] = useState("");

  const [cards, setCards] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const [approveModal, setApproveModal] = useState(null); // request row
  const [editModal, setEditModal] = useState(null); // card row
  const [createModal, setCreateModal] = useState(false);

  const fetchCards = useCallback(async () => {
    setLoadingCards(true);
    try {
      const res = await fetch("/api/admin/tribe-cards");
      const data = await res.json();
      if (res.ok) setCards(data.cards || []);
      else toast.error(data.error || "Failed to load cards");
    } catch {
      toast.error("Failed to load cards");
    } finally {
      setLoadingCards(false);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const res = await fetch(
        `/api/admin/tribe-cards/requests?status=${requestStatus}`,
      );
      const data = await res.json();
      if (res.ok) setRequests(data.requests || []);
      else toast.error(data.error || "Failed to load requests");
    } catch {
      toast.error("Failed to load requests");
    } finally {
      setLoadingRequests(false);
    }
  }, [requestStatus]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // If we arrive with ?request=<id>, auto-open approve modal.
  useEffect(() => {
    if (!initialRequestId || requests.length === 0) return;
    const r = requests.find((x) => x.id === initialRequestId);
    if (r) setApproveModal(r);
  }, [initialRequestId, requests]);

  const stats = useMemo(() => {
    const now = new Date();
    const active = cards.filter(
      (c) =>
        c.status === "active" &&
        (!c.expires_at || new Date(c.expires_at) >= now),
    ).length;
    const expired = cards.filter(
      (c) =>
        c.status === "expired" ||
        (c.status === "active" &&
          c.expires_at &&
          new Date(c.expires_at) < now),
    ).length;
    const revoked = cards.filter((c) => c.status === "revoked").length;
    const pendingRequests = requests.filter((r) => r.status === "pending").length;
    return { total: cards.length, active, expired, revoked, pendingRequests };
  }, [cards, requests]);

  const filteredCards = useMemo(() => {
    let list = cards;
    const now = new Date();
    if (cardStatus !== "all") {
      list = list.filter((c) => {
        const derived =
          c.status === "active" &&
          c.expires_at &&
          new Date(c.expires_at) < now
            ? "expired"
            : c.status;
        return derived === cardStatus;
      });
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (c) =>
          (c.holder_name || "").toLowerCase().includes(q) ||
          (c.holder_email || "").toLowerCase().includes(q) ||
          (c.holder_phone || "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [cards, cardStatus, query]);

  return (
    <AdminShell>
      <AdminHero
        eyebrow="Admin · Cards"
        title="Tribe Cards"
        subtitle="Review new requests, issue cards, and manage the tribe"
        backHref="/admin/cards"
        backLabel="Back to Cards"
      />

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatTile label="Pending requests" value={stats.pendingRequests} icon={Inbox} highlight />
          <StatTile label="Active" value={stats.active} icon={Users} />
          <StatTile label="Expired" value={stats.expired} icon={Clock} />
          <StatTile label="Revoked" value={stats.revoked} icon={ShieldX} />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-5 border-b border-[#eadfd2]">
          <TabButton active={tab === "requests"} onClick={() => setTab("requests")}>
            Requests
            {stats.pendingRequests > 0 ? (
              <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-[10px] font-semibold rounded-full bg-[#ff914d] text-white">
                {stats.pendingRequests}
              </span>
            ) : null}
          </TabButton>
          <TabButton active={tab === "cards"} onClick={() => setTab("cards")}>
            Cards ({stats.total})
          </TabButton>
          <TabButton active={tab === "lifecycle"} onClick={() => setTab("lifecycle")}>
            Expiry &amp; upsell
          </TabButton>
        </div>

        {tab === "lifecycle" ? (
          <LifecycleView onChanged={fetchCards} />
        ) : tab === "requests" ? (
          <RequestsView
            requests={requests}
            loading={loadingRequests}
            status={requestStatus}
            onStatusChange={setRequestStatus}
            onApprove={(r) => setApproveModal(r)}
            onReject={async (r) => {
              const notes = window.prompt(
                "Optional note to include (leave blank to skip):",
                "",
              );
              const sendEmail = window.confirm(
                "Send the holder a soft rejection email? (Cancel = no email)",
              );
              const res = await fetch(
                `/api/admin/tribe-cards/requests/${r.id}`,
                {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "reject",
                    review_notes: notes || null,
                    sendEmail,
                  }),
                },
              );
              const data = await res.json();
              if (res.ok) {
                toast.success("Request rejected");
                fetchRequests();
              } else {
                toast.error(data.error || "Failed to reject");
              }
            }}
          />
        ) : (
          <CardsView
            cards={filteredCards}
            loading={loadingCards}
            status={cardStatus}
            onStatusChange={setCardStatus}
            query={query}
            onQueryChange={setQuery}
            onEdit={(c) => setEditModal(c)}
            onCreate={() => setCreateModal(true)}
            onRevoke={async (c) => {
              if (
                !window.confirm(
                  `Revoke ${c.holder_name}'s tribe card? They will no longer receive the discount.`,
                )
              )
                return;
              const res = await fetch(`/api/admin/tribe-cards/${c.id}`, {
                method: "DELETE",
              });
              if (res.ok) {
                toast.success("Card revoked");
                fetchCards();
              } else {
                toast.error("Failed to revoke");
              }
            }}
          />
        )}

      {/* Modals */}
      <AnimatePresence>
        {approveModal ? (
          <ApproveModal
            request={approveModal}
            onClose={() => setApproveModal(null)}
            onApproved={() => {
              setApproveModal(null);
              fetchRequests();
              fetchCards();
            }}
          />
        ) : null}
        {editModal ? (
          <EditCardModal
            card={editModal}
            onClose={() => setEditModal(null)}
            onSaved={() => {
              setEditModal(null);
              fetchCards();
            }}
          />
        ) : null}
        {createModal ? (
          <CreateCardModal
            onClose={() => setCreateModal(false)}
            onCreated={() => {
              setCreateModal(false);
              fetchCards();
            }}
          />
        ) : null}
      </AnimatePresence>
    </AdminShell>
  );
}

// ─── Small pieces ───────────────────────────────────────

// ─── Lifecycle: expiry housekeeping + paid-Tribe upsell ───────────────────
// Backed by /api/admin/tribe-cards/lifecycle. The daily cron does the same
// work at 06:30 UTC; the buttons here let you preview (dry run) or run it
// now, and send the one-off invitation to unlimited-card holders.
function LifecycleView({ onChanged }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null); // "run-dry" | "run" | "invite-dry" | "invite"
  const [report, setReport] = useState(null);
  const [inviteEmails, setInviteEmails] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tribe-cards/lifecycle");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load");
      setData(json);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function act(action, dryRun) {
    const key = `${action}${dryRun ? "-dry" : ""}`;
    if (!dryRun) {
      const what =
        action === "run"
          ? "Run the lifecycle now? This flips overdue cards to expired, pushes wallet updates and SENDS the due emails."
          : "Send the paid-Tribe invitation to every unlimited-card holder who hasn't received it? This SENDS real emails.";
      if (!window.confirm(what)) return;
    }
    setBusy(key);
    setReport(null);
    try {
      const onlyEmails = inviteEmails
        .split(/[\s,;]+/)
        .map((e) => e.trim())
        .filter(Boolean);
      const res = await fetch("/api/admin/tribe-cards/lifecycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          dryRun,
          onlyEmails: action === "invite" && onlyEmails.length ? onlyEmails : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setReport({ action, ...json });
      if (!dryRun) {
        toast.success(action === "run" ? "Lifecycle run complete" : "Invitations sent");
        load();
        onChanged?.();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(null);
    }
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#ff914d]" />
      </div>
    );
  }
  if (!data) return null;
  const c = data.counts;
  const n = c.notifications;

  const summaryOf = (r) => {
    if (!r) return null;
    if (r.action === "run") {
      return `${r.dryRun ? "Would expire" : "Expired"} ${r.expired.length} · ${r.dryRun ? "would warn" : "warned"} ${r.warned.length} · ${r.dryRun ? "would follow up" : "followed up"} ${r.followedUp.length} · skipped ${r.skippedLiveMember.length} paid members`;
    }
    return `${r.dryRun ? "Would invite" : "Invited"} ${r.invited.length} · already invited ${r.alreadyInvited.length} · skipped ${r.skippedLiveMember.length} paid members`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile label="Expiring in 30 days" value={c.expiringSoon} icon={Clock} highlight />
        <StatTile label="Overdue, not yet flipped" value={c.overdueNotFlipped} icon={ShieldX} highlight />
        <StatTile label="Unlimited cards" value={c.unlimited} icon={Users} />
        <StatTile label="Converted to paid" value={c.converted} icon={Check} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#eadfd2] bg-white p-5">
          <p className="text-[10px] uppercase tracking-wide text-[#9a7a62] mb-1">Daily housekeeping</p>
          <h3 className="font-semibold text-[#2c1810] mb-2">Expiry emails &amp; wallet updates</h3>
          <p className="text-sm text-[#6a5040] mb-4 leading-relaxed">
            Runs every morning at 06:30 UTC. Cards past their date flip to expired, the wallet pass
            reads &ldquo;Expired&rdquo;, and holders get the 30-day warning, the expiry note and one
            follow-up two weeks later — each once, never to paid members.
          </p>
          <p className="text-xs text-[#9a7a62] mb-4">
            Sent so far: {n.expiring_30d} warnings · {n.expired} expiry notes · {n.expired_followup} follow-ups
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => act("run", true)}
              disabled={!!busy}
              className="px-4 py-2 rounded-full text-sm font-semibold border border-[#eadfd2] text-[#2c1810] hover:bg-[#fff6ea] disabled:opacity-50"
            >
              {busy === "run-dry" ? "Previewing…" : "Preview (dry run)"}
            </button>
            <button
              onClick={() => act("run", false)}
              disabled={!!busy}
              className="px-4 py-2 rounded-full text-sm font-semibold bg-[#ff914d] text-white hover:bg-[#e8803f] disabled:opacity-50"
            >
              {busy === "run" ? "Running…" : "Run now"}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-[#eadfd2] bg-white p-5">
          <p className="text-[10px] uppercase tracking-wide text-[#9a7a62] mb-1">One-off</p>
          <h3 className="font-semibold text-[#2c1810] mb-2">Invite unlimited cards to the paid Tribe</h3>
          <p className="text-sm text-[#6a5040] mb-3 leading-relaxed">
            Their card stays as it is. This is a single warm invitation to join for 2,000 kr./month.
            Each card gets it once; paid members are skipped. Sent so far: {n.tribe_invite}.
          </p>
          <input
            value={inviteEmails}
            onChange={(e) => setInviteEmails(e.target.value)}
            placeholder="Optional: only these emails (comma separated) — e.g. yourself, to test"
            className="w-full mb-3 px-3 py-2 text-sm rounded-lg border border-[#eadfd2] focus:outline-none focus:border-[#ff914d]"
          />
          <div className="flex gap-2">
            <button
              onClick={() => act("invite", true)}
              disabled={!!busy}
              className="px-4 py-2 rounded-full text-sm font-semibold border border-[#eadfd2] text-[#2c1810] hover:bg-[#fff6ea] disabled:opacity-50"
            >
              {busy === "invite-dry" ? "Previewing…" : "Preview (dry run)"}
            </button>
            <button
              onClick={() => act("invite", false)}
              disabled={!!busy}
              className="px-4 py-2 rounded-full text-sm font-semibold bg-[#2c1810] text-white hover:bg-[#3d2418] disabled:opacity-50"
            >
              {busy === "invite" ? "Sending…" : "Send invitation"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#eadfd2] bg-white p-5">
        <p className="text-[10px] uppercase tracking-wide text-[#9a7a62] mb-1">After a design change</p>
        <h3 className="font-semibold text-[#2c1810] mb-2">Refresh every wallet pass</h3>
        <p className="text-sm text-[#6a5040] mb-4 leading-relaxed">
          Pings every phone that holds an active card so Apple and Google Wallet re-download the pass
          with the current artwork. Safe to run any time; nothing is emailed.
        </p>
        <button
          onClick={async () => {
            if (!window.confirm("Push the current pass design to every active card?")) return;
            setBusy("refresh");
            try {
              const res = await fetch("/api/admin/tribe-cards/lifecycle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "refresh-passes", dryRun: false }),
              });
              const json = await res.json();
              if (!res.ok) throw new Error(json.error || "Failed");
              toast.success(`Refreshed ${json.pushed} of ${json.total} cards`);
            } catch (err) {
              toast.error(err.message);
            } finally {
              setBusy(null);
            }
          }}
          disabled={!!busy}
          className="px-4 py-2 rounded-full text-sm font-semibold border border-[#eadfd2] text-[#2c1810] hover:bg-[#fff6ea] disabled:opacity-50"
        >
          {busy === "refresh" ? "Refreshing…" : "Refresh all passes"}
        </button>
      </div>

      {report ? (
        <div className="rounded-xl border border-[#eadfd2] bg-[#faf6f2] p-5">
          <p className="text-sm font-semibold text-[#2c1810] mb-2">
            {report.dryRun ? "Preview" : "Result"} — {summaryOf(report)}
          </p>
          <pre className="text-[11px] text-[#4e3c30] whitespace-pre-wrap max-h-72 overflow-auto">
            {JSON.stringify(
              report.action === "run"
                ? { expired: report.expired, warned: report.warned, followedUp: report.followedUp }
                : { invited: report.invited, alreadyInvited: report.alreadyInvited },
              null,
              2,
            )}
          </pre>
        </div>
      ) : null}

      {data.recentNotifications?.length ? (
        <div className="rounded-xl border border-[#eadfd2] bg-white overflow-hidden">
          <div className="px-5 py-3 border-b border-[#eadfd2]">
            <p className="text-sm font-semibold text-[#2c1810]">Recent emails</p>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {data.recentNotifications.slice(0, 20).map((r, i) => (
                <tr key={i} className="border-b border-[#f3ece4] last:border-0">
                  <td className="px-5 py-2 text-[#2c1810]">{r.sent_to}</td>
                  <td className="px-3 py-2"><Chip>{r.kind}</Chip></td>
                  <td className="px-3 py-2 text-[#9a7a62] whitespace-nowrap">{format(new Date(r.sent_at), "d MMM yyyy")}</td>
                  <td className="px-3 py-2 text-[#c0392b] text-xs">{r.metadata?.error || (r.metadata?.skipped ? "skipped (no Resend key)" : "")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {data.recentRuns?.length ? (
        <p className="text-xs text-[#9a7a62]">
          Last cron run: {format(new Date(data.recentRuns[0].started_at), "d MMM yyyy HH:mm")} ·{" "}
          {data.recentRuns[0].status}
          {data.recentRuns[0].error ? ` · ${data.recentRuns[0].error}` : ""}
        </p>
      ) : (
        <p className="text-xs text-[#9a7a62]">The daily cron hasn&apos;t run yet.</p>
      )}
    </div>
  );
}

function StatTile({ label, value, icon: Icon, highlight = false }) {
  return (
    <div
      className={`rounded-xl p-4 border ${highlight && value > 0 ? "border-[#ff914d]/40 bg-[#fff6ea]" : "border-[#eadfd2] bg-white"}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon
          className={`w-4 h-4 ${highlight && value > 0 ? "text-[#ff914d]" : "text-[#9a7a62]"}`}
          strokeWidth={1.5}
        />
        <p className="text-[10px] uppercase tracking-wide text-[#9a7a62]">{label}</p>
      </div>
      <p
        className={`font-cormorant italic font-light text-3xl ${highlight && value > 0 ? "text-[#ff914d]" : "text-[#2c1810]"}`}
        style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
      >
        {value}
      </p>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-[1px] flex items-center ${
        active
          ? "border-[#ff914d] text-[#2c1810]"
          : "border-transparent text-[#9a7a62] hover:text-[#2c1810]"
      }`}
    >
      {children}
    </button>
  );
}

function Chip({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-neutral-100 text-neutral-700",
    green: "bg-emerald-100 text-emerald-800",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-800",
    slate: "bg-slate-100 text-slate-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function statusChip(card) {
  const now = new Date();
  if (card.status === "revoked") return <Chip tone="red">Revoked</Chip>;
  if (
    card.status === "expired" ||
    (card.expires_at && new Date(card.expires_at) < now)
  )
    return <Chip tone="slate">Expired</Chip>;
  return <Chip tone="green">Active</Chip>;
}

// ─── Requests list ──────────────────────────────────────

function RequestsView({ requests, loading, status, onStatusChange, onApprove, onReject }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {["pending", "approved", "rejected", "all"].map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(s)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold capitalize transition-colors ${
              status === s
                ? "bg-[#ff914d] text-white"
                : "bg-white border border-[#eadfd2] text-[#7a6a5a] hover:text-[#2c1810]"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-6 h-6 text-[#ff914d] animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="py-16 text-center text-[#9a7a62] text-sm">
          No {status !== "all" ? status : ""} requests.
        </div>
      ) : (
        <div className="space-y-2.5">
          {requests.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-[#eadfd2] bg-white p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[#2c1810] font-semibold text-[15px]">{r.name}</p>
                  <Chip tone={r.status === "pending" ? "amber" : r.status === "approved" ? "green" : "slate"}>
                    {r.status}
                  </Chip>
                </div>
                <div className="flex items-center gap-3 flex-wrap mt-1 text-[12px] text-[#7a6a5a]">
                  <span className="inline-flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {r.email}
                  </span>
                  {r.phone ? (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {r.phone}
                    </span>
                  ) : null}
                  <span>· {format(new Date(r.created_at), "d MMM yyyy, HH:mm")}</span>
                </div>
                {r.message ? (
                  <p className="text-[13px] text-[#5a4030] mt-2 leading-relaxed italic">
                    “{r.message}”
                  </p>
                ) : null}
              </div>
              {r.status === "pending" ? (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onApprove(r)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#1f5c4b] text-white rounded-lg text-[12px] font-semibold hover:bg-[#154237]"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => onReject(r)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#eadfd2] text-[#7a6a5a] rounded-lg text-[12px] font-semibold hover:text-[#c76a2b]"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Cards list ─────────────────────────────────────────

function CardsView({ cards, loading, status, onStatusChange, query, onQueryChange, onEdit, onCreate, onRevoke }) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {["all", "active", "expired", "revoked"].map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold capitalize transition-colors ${
                status === s
                  ? "bg-[#ff914d] text-white"
                  : "bg-white border border-[#eadfd2] text-[#7a6a5a] hover:text-[#2c1810]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[#9a7a62] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search name, email, phone"
              className="pl-9 pr-3 py-2 rounded-full border border-[#eadfd2] bg-white text-[13px] text-[#2c1810] placeholder:text-[#b8a796] focus:outline-none focus:border-[#c76a2b] w-60"
            />
          </div>
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#c76a2b] text-white rounded-full text-[12px] font-semibold hover:bg-[#a5551f]"
          >
            <Plus className="w-3.5 h-3.5" /> New card
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-6 h-6 text-[#ff914d] animate-spin" />
        </div>
      ) : cards.length === 0 ? (
        <div className="py-16 text-center text-[#9a7a62] text-sm">
          No cards {status !== "all" ? `in status "${status}"` : ""}.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-[#9a7a62] border-b border-[#eadfd2]">
                <th className="py-2.5 pr-3">Holder</th>
                <th className="py-2.5 pr-3">Email</th>
                <th className="py-2.5 pr-3">Discount</th>
                <th className="py-2.5 pr-3">Duration</th>
                <th className="py-2.5 pr-3">Expires</th>
                <th className="py-2.5 pr-3">Source</th>
                <th className="py-2.5 pr-3">Status</th>
                <th className="py-2.5 pr-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((c) => (
                <tr key={c.id} className="border-b border-[#f2ebe1] hover:bg-[#fff6ea]/50">
                  <td className="py-2.5 pr-3 text-[#2c1810] font-medium">{c.holder_name}</td>
                  <td className="py-2.5 pr-3 text-[#5a4030]">{c.holder_email}</td>
                  <td className="py-2.5 pr-3 text-[#8a3a14] font-semibold">{c.discount_percent}%</td>
                  <td className="py-2.5 pr-3 text-[#5a4030] capitalize">{c.duration_type.replace(/s$/, "s").replace(/(\d)months/, "$1 months")}</td>
                  <td className="py-2.5 pr-3 text-[#5a4030]">
                    {c.expires_at ? format(new Date(c.expires_at), "d MMM yyyy") : "—"}
                  </td>
                  <td className="py-2.5 pr-3 text-[#5a4030] text-[12px] capitalize">{c.source.replace("-", " ")}</td>
                  <td className="py-2.5 pr-3">{statusChip(c)}</td>
                  <td className="py-2.5 pr-0 text-right">
                    <div className="inline-flex items-center gap-1">
                      <a
                        href={`/tribe-card/${c.access_token}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Open public card"
                        className="p-1.5 text-[#7a6a5a] hover:text-[#c76a2b]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        title="Copy link"
                        onClick={() => {
                          const url = `${window.location.origin}/tribe-card/${c.access_token}`;
                          navigator.clipboard.writeText(url);
                          toast.success("Link copied");
                        }}
                        className="p-1.5 text-[#7a6a5a] hover:text-[#c76a2b]"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {c.status === "active" ? (
                        <button
                          title="Email the card to the holder again"
                          onClick={async () => {
                            if (!window.confirm(`Send the Tribe Card email to ${c.holder_email}?`)) return;
                            const res = await fetch(`/api/admin/tribe-cards/${c.id}/resend`, { method: "POST" });
                            const data = await res.json().catch(() => ({}));
                            if (res.ok) toast.success(`Card emailed to ${data.to}`);
                            else toast.error(data.error || "Failed to send");
                          }}
                          className="p-1.5 text-[#7a6a5a] hover:text-[#2c1810]"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                      ) : null}
                      <button
                        title="Edit"
                        onClick={() => onEdit(c)}
                        className="p-1.5 text-[#7a6a5a] hover:text-[#2c1810]"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {c.status !== "revoked" ? (
                        <button
                          title="Revoke"
                          onClick={() => onRevoke(c)}
                          className="p-1.5 text-[#7a6a5a] hover:text-[#c05a1a]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Modals ─────────────────────────────────────────────

function ModalShell({ onClose, children, title }) {
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const modal = (
    <motion.div
      className="fixed inset-0 z-[260] flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 10, opacity: 0 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.24)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            className="font-cormorant italic text-[#2c1810] text-2xl"
            style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
          >
            {title}
          </h3>
          <button onClick={onClose} className="text-[#9a7a62] hover:text-[#2c1810]">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );

  if (!portalReady || typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}

function ApproveModal({ request, onClose, onApproved }) {
  const [discount, setDiscount] = useState(20);
  const [duration, setDuration] = useState("year");
  const [source, setSource] = useState("legacy");
  const [sendEmail, setSendEmail] = useState(true);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/tribe-cards/requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          discount_percent: discount,
          duration_type: duration,
          source,
          sendEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(`Approved — ${request.name}`);
      onApproved();
    } catch (err) {
      toast.error(err.message || "Failed to approve");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell onClose={onClose} title={`Approve ${request.name}`}>
      <p className="text-[#5a4030] text-[13px] mb-4">
        {request.email}
        {request.phone ? ` · ${request.phone}` : ""}
      </p>

      <FormBlock label="Discount">
        <div className="flex items-center gap-2 flex-wrap">
          {DISCOUNT_PRESETS.map((d) => (
            <button
              key={d}
              onClick={() => setDiscount(d)}
              className={`px-3 py-1.5 rounded-full text-[13px] font-semibold ${
                discount === d
                  ? "bg-[#c76a2b] text-white"
                  : "bg-white border border-[#eadfd2] text-[#5a4030] hover:text-[#2c1810]"
              }`}
            >
              {d}%
            </button>
          ))}
          <input
            type="number"
            min={1}
            max={100}
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="w-20 px-3 py-1.5 rounded-lg border border-[#eadfd2] text-[13px] text-[#2c1810]"
          />
        </div>
      </FormBlock>

      <FormBlock label="Duration">
        <div className="flex items-center gap-2 flex-wrap">
          {DURATION_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setDuration(o.value)}
              className={`px-3 py-1.5 rounded-full text-[13px] font-semibold ${
                duration === o.value
                  ? "bg-[#1f5c4b] text-white"
                  : "bg-white border border-[#eadfd2] text-[#5a4030] hover:text-[#2c1810]"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </FormBlock>

      <FormBlock label="Source">
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[#eadfd2] text-[13px] text-[#2c1810] bg-white"
        >
          {SOURCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </FormBlock>

      <label className="flex items-center gap-2 text-[13px] text-[#5a4030] mt-1 mb-5">
        <input
          type="checkbox"
          checked={sendEmail}
          onChange={(e) => setSendEmail(e.target.checked)}
        />
        Send welcome email with the card
      </label>

      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-full text-[13px] text-[#7a6a5a] hover:text-[#2c1810]"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1f5c4b] text-white rounded-full text-[13px] font-semibold hover:bg-[#154237] disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          Approve &amp; issue card
        </button>
      </div>
    </ModalShell>
  );
}

function EditCardModal({ card, onClose, onSaved }) {
  const [form, setForm] = useState({
    holder_name: card.holder_name,
    holder_phone: card.holder_phone || "",
    discount_percent: card.discount_percent,
    duration_type: card.duration_type,
    source: card.source,
    status: card.status,
    notes: card.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/tribe-cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Saved");
      onSaved();
    } catch (err) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell onClose={onClose} title={`Edit ${card.holder_name}`}>
      <p className="text-[#7a6a5a] text-[12px] mb-4">{card.holder_email}</p>
      <FormBlock label="Name">
        <input
          value={form.holder_name}
          onChange={(e) => update("holder_name", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[#eadfd2] text-[13px]"
        />
      </FormBlock>
      <FormBlock label="Phone">
        <input
          value={form.holder_phone}
          onChange={(e) => update("holder_phone", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[#eadfd2] text-[13px]"
        />
      </FormBlock>
      <FormBlock label="Discount">
        <input
          type="number"
          min={1}
          max={100}
          value={form.discount_percent}
          onChange={(e) => update("discount_percent", Number(e.target.value))}
          className="w-24 px-3 py-2 rounded-lg border border-[#eadfd2] text-[13px]"
        />
      </FormBlock>
      <FormBlock label="Duration (renews expiry from today)">
        <select
          value={form.duration_type}
          onChange={(e) => update("duration_type", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[#eadfd2] text-[13px] bg-white"
        >
          {DURATION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </FormBlock>
      <FormBlock label="Source">
        <select
          value={form.source}
          onChange={(e) => update("source", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[#eadfd2] text-[13px] bg-white"
        >
          {SOURCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </FormBlock>
      <FormBlock label="Status">
        <select
          value={form.status}
          onChange={(e) => update("status", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[#eadfd2] text-[13px] bg-white"
        >
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="revoked">Revoked</option>
        </select>
      </FormBlock>
      <FormBlock label="Notes">
        <textarea
          rows={2}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[#eadfd2] text-[13px] resize-none"
        />
      </FormBlock>

      <div className="flex items-center justify-end gap-2 mt-2">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-full text-[13px] text-[#7a6a5a]"
        >
          Cancel
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#c76a2b] text-white rounded-full text-[13px] font-semibold hover:bg-[#a5551f] disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          Save
        </button>
      </div>
    </ModalShell>
  );
}

function CreateCardModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    holder_name: "",
    holder_email: "",
    holder_phone: "",
    discount_percent: 20,
    duration_type: "year",
    source: "legacy",
    sendEmail: true,
  });
  const [saving, setSaving] = useState(false);
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/tribe-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Card created");
      onCreated();
    } catch (err) {
      toast.error(err.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell onClose={onClose} title="New Tribe Card">
      <FormBlock label="Holder name *">
        <input
          value={form.holder_name}
          onChange={(e) => update("holder_name", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[#eadfd2] text-[13px]"
        />
      </FormBlock>
      <FormBlock label="Email *">
        <input
          type="email"
          value={form.holder_email}
          onChange={(e) => update("holder_email", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[#eadfd2] text-[13px]"
        />
      </FormBlock>
      <FormBlock label="Phone">
        <input
          value={form.holder_phone}
          onChange={(e) => update("holder_phone", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[#eadfd2] text-[13px]"
        />
      </FormBlock>
      <FormBlock label="Discount">
        <input
          type="number"
          min={1}
          max={100}
          value={form.discount_percent}
          onChange={(e) => update("discount_percent", Number(e.target.value))}
          className="w-24 px-3 py-2 rounded-lg border border-[#eadfd2] text-[13px]"
        />
      </FormBlock>
      <FormBlock label="Duration">
        <select
          value={form.duration_type}
          onChange={(e) => update("duration_type", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[#eadfd2] text-[13px] bg-white"
        >
          {DURATION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </FormBlock>
      <FormBlock label="Source">
        <select
          value={form.source}
          onChange={(e) => update("source", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[#eadfd2] text-[13px] bg-white"
        >
          {SOURCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </FormBlock>
      <label className="flex items-center gap-2 text-[13px] text-[#5a4030] mt-1 mb-5">
        <input
          type="checkbox"
          checked={form.sendEmail}
          onChange={(e) => update("sendEmail", e.target.checked)}
        />
        Send welcome email
      </label>

      <div className="flex items-center justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 rounded-full text-[13px] text-[#7a6a5a]">
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#c76a2b] text-white rounded-full text-[13px] font-semibold hover:bg-[#a5551f] disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Create
        </button>
      </div>
    </ModalShell>
  );
}

function FormBlock({ label, children }) {
  return (
    <div className="mb-3.5">
      <p className="text-[11px] uppercase tracking-[0.14em] text-[#7a6a5a] font-semibold mb-1.5">
        {label}
      </p>
      {children}
    </div>
  );
}
