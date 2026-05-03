// Manage attendees — staff-only CRUD for the active gatekeeper.
//
// Reachable from the in-kiosk Staff menu (lock icon → PIN → "Manage
// attendees"). Lets the host fix typos, swap an email, mark someone as
// arrived (or undo it), and delete an accidental walk-in.
//
// Reads:    GET    /api/events/gatekeeper/[slug]/tickets
// Toggles:  POST   /api/events/gatekeeper/[slug]/checkin
// Edits:    PATCH  /api/events/gatekeeper/[slug]/ticket
// Deletes:  DELETE /api/events/gatekeeper/[slug]/ticket

"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowLeft,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Save,
  X,
  AlertTriangle,
  Users,
  Mail,
  Loader2,
} from "lucide-react";
import {
  TONE,
  SACRED_GRADIENT,
  Eyebrow,
  KioskTitle,
  ThresholdRule,
  EnsoCircle,
} from "./ui";

const STATUS_LABELS = {
  paid: "Pre-paid",
  door: "At the door",
  cash: "Cash · door",
  card: "Card · door",
  transfer: "Transfer · door",
  exchange: "Exchange · door",
};

function statusLabel(status) {
  return STATUS_LABELS[status] || status || "—";
}

function fmtDate(d) {
  if (!d) return "";
  try {
    return format(new Date(d), "MMM d · HH:mm");
  } catch {
    return "";
  }
}

export default function ManageAttendees({ slug, event, onExit }) {
  const [tickets, setTickets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editDraft, setEditDraft] = useState({ buyer_name: "", buyer_email: "" });
  const [busyId, setBusyId] = useState(null); // id of row being mutated
  const [actionError, setActionError] = useState(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/events/gatekeeper/${slug}/tickets`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not load attendees");
      setTickets(data.tickets || []);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const stats = useMemo(() => {
    const list = tickets || [];
    const total = list.length;
    const arrived = list.filter((t) => t.used).length;
    return { total, arrived, remaining: total - arrived };
  }, [tickets]);

  const filtered = useMemo(() => {
    const list = tickets || [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (t) =>
        (t.buyer_name || "").toLowerCase().includes(q) ||
        (t.buyer_email || "").toLowerCase().includes(q),
    );
  }, [tickets, search]);

  const startEdit = (ticket) => {
    setActionError(null);
    setConfirmDeleteId(null);
    setEditingId(ticket.id);
    setEditDraft({
      buyer_name: ticket.buyer_name || "",
      buyer_email: ticket.buyer_email || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({ buyer_name: "", buyer_email: "" });
  };

  const saveEdit = async (ticket) => {
    setBusyId(ticket.id);
    setActionError(null);
    try {
      const res = await fetch(`/api/events/gatekeeper/${slug}/ticket`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_id: ticket.id,
          buyer_name: editDraft.buyer_name,
          buyer_email: editDraft.buyer_email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not save");
      setTickets((prev) =>
        (prev || []).map((t) => (t.id === ticket.id ? { ...t, ...data.ticket } : t)),
      );
      setEditingId(null);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const toggleUsed = async (ticket) => {
    setBusyId(ticket.id);
    setActionError(null);
    try {
      const res = await fetch(`/api/events/gatekeeper/${slug}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket_id: ticket.id, used: !ticket.used }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not update");
      setTickets((prev) =>
        (prev || []).map((t) => (t.id === ticket.id ? { ...t, used: data.ticket.used } : t)),
      );
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const deleteTicket = async (ticket) => {
    setBusyId(ticket.id);
    setActionError(null);
    try {
      const res = await fetch(`/api/events/gatekeeper/${slug}/ticket`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket_id: ticket.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not delete");
      setTickets((prev) => (prev || []).filter((t) => t.id !== ticket.id));
      setConfirmDeleteId(null);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="relative" style={{ minHeight: "100dvh", background: SACRED_GRADIENT }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between"
        style={{
          padding: "clamp(1rem, 2vw, 1.4rem) clamp(1.2rem, 3vw, 2.2rem)",
          background: "rgba(255,250,244,0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: `1px solid ${TONE.line}`,
        }}
      >
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
          style={{
            background: "#fff",
            border: `1.5px solid ${TONE.line}`,
            color: TONE.sepia,
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to check-in
        </button>
        <div className="text-right">
          <p
            className="text-[10px] uppercase font-semibold"
            style={{ letterSpacing: "0.35em", color: TONE.bronze }}
          >
            Manage attendees
          </p>
          <p className="text-sm" style={{ color: TONE.sepia }}>
            {event?.name} · {fmtDate(event?.date)}
          </p>
        </div>
      </div>

      {/* Quiet ensō behind the hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{ right: "-6%", top: "1%" }}
      >
        <EnsoCircle size={320} stroke={1} color={TONE.bronze} opacity={0.07} drawIn />
      </div>

      <div
        className="relative mx-auto w-full"
        style={{ maxWidth: 960, padding: "clamp(1.5rem, 3vw, 2.5rem)" }}
      >
        <Eyebrow>Door list</Eyebrow>
        <div className="mt-3"><ThresholdRule width={48} /></div>
        <div className="mt-5">
          <KioskTitle weight="poetic">
            <span style={{ color: TONE.ink }}>Everyone on the list.</span>
          </KioskTitle>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 max-w-md">
          <StatPill label="On list" value={stats.total} icon={Users} />
          <StatPill label="Arrived" value={stats.arrived} icon={CheckCircle2} tone="ok" />
          <StatPill
            label="Waiting"
            value={stats.remaining}
            icon={RotateCcw}
            tone="ember"
          />
        </div>

        {/* Search */}
        <div className="mt-7 flex items-center gap-2">
          <div
            className="flex flex-1 items-center gap-3 rounded-2xl px-4 py-3"
            style={{ background: "#fff", border: `1.5px solid ${TONE.line}` }}
          >
            <Search className="h-5 w-5" style={{ color: TONE.muted }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className="flex-1 bg-transparent text-base font-semibold focus:outline-none"
              style={{ color: TONE.ink }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="rounded-full p-1"
                style={{ color: TONE.muted }}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Action error */}
        {actionError && (
          <div
            className="mt-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold"
            style={{
              background: "#fdecea",
              color: TONE.danger,
              border: `1px solid #e8c3bc`,
            }}
          >
            <AlertTriangle className="h-4 w-4" /> {actionError}
          </div>
        )}

        {/* List */}
        <div className="mt-6">
          {loading && (
            <div className="flex items-center gap-2 text-sm" style={{ color: TONE.sepia }}>
              <Loader2 className="h-4 w-4 animate-spin" /> Loading attendees…
            </div>
          )}

          {loadError && (
            <div
              className="rounded-2xl px-4 py-3 text-sm font-semibold"
              style={{
                background: "#fdecea",
                color: TONE.danger,
                border: `1px solid #e8c3bc`,
              }}
            >
              {loadError}
            </div>
          )}

          {!loading && !loadError && filtered.length === 0 && (
            <div
              className="rounded-2xl px-5 py-6 text-center text-sm"
              style={{
                background: TONE.paper,
                color: TONE.sepia,
                border: `1px solid ${TONE.line}`,
              }}
            >
              {tickets && tickets.length === 0
                ? "No attendees yet — they'll appear here as soon as someone is checked in."
                : "Nobody matches that search."}
            </div>
          )}

          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {filtered.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="rounded-2xl p-5"
                  style={{
                    background: t.used ? "#f4ede0" : "#fff",
                    border: `1.5px solid ${t.used ? TONE.lineHi : TONE.line}`,
                  }}
                >
                  {editingId === t.id ? (
                    <EditRow
                      ticket={t}
                      draft={editDraft}
                      setDraft={setEditDraft}
                      onCancel={cancelEdit}
                      onSave={() => saveEdit(t)}
                      busy={busyId === t.id}
                    />
                  ) : (
                    <ViewRow
                      ticket={t}
                      onEdit={() => startEdit(t)}
                      onToggle={() => toggleUsed(t)}
                      onDelete={() => {
                        setActionError(null);
                        setConfirmDeleteId(t.id);
                      }}
                      onConfirmDelete={() => deleteTicket(t)}
                      onCancelDelete={() => setConfirmDeleteId(null)}
                      confirming={confirmDeleteId === t.id}
                      busy={busyId === t.id}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <p
          className="mt-10 text-center text-xs italic font-[ui-serif]"
          style={{ color: TONE.muted, letterSpacing: "0.05em" }}
        >
          Edits and deletes happen immediately. Use sparingly — the totals on
          the close-out report follow whatever's in the list.
        </p>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function StatPill({ label, value, icon: Icon, tone = "ink" }) {
  const colorByTone = {
    ink: TONE.ink,
    ok: TONE.ok,
    ember: TONE.ember,
  };
  return (
    <div
      className="flex flex-col items-start rounded-2xl px-4 py-3"
      style={{ background: "#fff", border: `1px solid ${TONE.line}` }}
    >
      <div
        className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase"
        style={{ color: TONE.muted, letterSpacing: "0.2em" }}
      >
        {Icon ? <Icon className="h-3 w-3" /> : null}
        {label}
      </div>
      <div
        className="font-[ui-serif] text-2xl font-semibold"
        style={{ color: colorByTone[tone] }}
      >
        {value}
      </div>
    </div>
  );
}

function ViewRow({
  ticket,
  onEdit,
  onToggle,
  onDelete,
  onConfirmDelete,
  onCancelDelete,
  confirming,
  busy,
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className="text-lg font-semibold sm:text-xl"
            style={{ color: TONE.ink }}
          >
            {ticket.buyer_name || "—"}
          </p>
          {ticket.used && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase"
              style={{
                background: "rgba(107,122,82,0.12)",
                color: TONE.ok,
                border: `1px solid rgba(107,122,82,0.25)`,
                letterSpacing: "0.18em",
              }}
            >
              <CheckCircle2 className="h-3 w-3" /> Arrived
            </span>
          )}
        </div>
        <p
          className="mt-1 flex items-center gap-1.5 text-sm"
          style={{ color: TONE.sepia }}
        >
          {ticket.buyer_email ? (
            <>
              <Mail className="h-3.5 w-3.5" />
              <span className="truncate">{ticket.buyer_email}</span>
            </>
          ) : (
            <span className="italic" style={{ color: TONE.muted }}>
              No email on file
            </span>
          )}
        </p>
        <div
          className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold uppercase"
          style={{ color: TONE.muted, letterSpacing: "0.16em" }}
        >
          <span>{statusLabel(ticket.status)}</span>
          {ticket.quantity > 1 && <span>· × {ticket.quantity}</span>}
          {ticket.gatekeeper_tip > 0 && (
            <span style={{ color: TONE.bronze }}>
              + {Math.round(ticket.gatekeeper_tip).toLocaleString()} ISK tip
            </span>
          )}
        </div>
      </div>

      {confirming ? (
        <div className="flex flex-shrink-0 flex-col gap-2 sm:items-end">
          <p
            className="text-xs font-semibold uppercase"
            style={{ color: TONE.danger, letterSpacing: "0.18em" }}
          >
            Delete this entry?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancelDelete}
              disabled={busy}
              className="rounded-full px-4 py-2 text-xs font-semibold uppercase"
              style={{
                background: "#fff",
                border: `1.5px solid ${TONE.line}`,
                color: TONE.sepia,
                letterSpacing: "0.18em",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirmDelete}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase"
              style={{
                background: TONE.danger,
                color: "#fff",
                letterSpacing: "0.18em",
              }}
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-shrink-0 flex-wrap gap-2 sm:flex-nowrap">
          <RowAction
            icon={ticket.used ? RotateCcw : CheckCircle2}
            label={ticket.used ? "Undo" : "Check in"}
            onClick={onToggle}
            tone={ticket.used ? "ghost" : "primary"}
            busy={busy}
          />
          <RowAction icon={Pencil} label="Edit" onClick={onEdit} tone="ghost" />
          <RowAction
            icon={Trash2}
            label="Delete"
            onClick={onDelete}
            tone="danger"
          />
        </div>
      )}
    </div>
  );
}

function RowAction({ icon: Icon, label, onClick, tone = "ghost", busy }) {
  const styles = {
    primary: {
      background: TONE.ink,
      color: TONE.paper,
      border: `1.5px solid ${TONE.ink}`,
    },
    ghost: {
      background: "#fff",
      color: TONE.sepia,
      border: `1.5px solid ${TONE.line}`,
    },
    danger: {
      background: "#fff",
      color: TONE.danger,
      border: `1.5px solid #e8c3bc`,
    },
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase disabled:opacity-50"
      style={{ ...styles[tone], letterSpacing: "0.18em" }}
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Icon className="h-3.5 w-3.5" />
      )}
      {label}
    </button>
  );
}

function EditRow({ ticket, draft, setDraft, onCancel, onSave, busy }) {
  const valid = draft.buyer_name.trim().length > 0;
  return (
    <div className="flex flex-col gap-4">
      <div
        className="text-[10px] font-semibold uppercase"
        style={{ color: TONE.bronze, letterSpacing: "0.3em" }}
      >
        Editing · {ticket.buyer_name || "no name"}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FieldStack label="Name">
          <input
            type="text"
            value={draft.buyer_name}
            onChange={(e) => setDraft({ ...draft, buyer_name: e.target.value })}
            className="w-full rounded-xl px-4 py-3 text-base font-semibold focus:outline-none"
            style={{
              background: "#fff",
              border: `1.5px solid ${TONE.lineHi}`,
              color: TONE.ink,
            }}
            placeholder="First Last"
            autoFocus
          />
        </FieldStack>
        <FieldStack label="Email">
          <input
            type="email"
            value={draft.buyer_email}
            onChange={(e) => setDraft({ ...draft, buyer_email: e.target.value })}
            className="w-full rounded-xl px-4 py-3 text-base font-semibold focus:outline-none"
            style={{
              background: "#fff",
              border: `1.5px solid ${TONE.lineHi}`,
              color: TONE.ink,
            }}
            placeholder="name@example.com"
            inputMode="email"
          />
        </FieldStack>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-full px-4 py-2 text-xs font-semibold uppercase"
          style={{
            background: "#fff",
            border: `1.5px solid ${TONE.line}`,
            color: TONE.sepia,
            letterSpacing: "0.18em",
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!valid || busy}
          className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-semibold uppercase disabled:opacity-50"
          style={{
            background: TONE.ink,
            color: TONE.paper,
            letterSpacing: "0.18em",
          }}
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Save changes
        </button>
      </div>
    </div>
  );
}

function FieldStack({ label, children }) {
  return (
    <label className="block">
      <span
        className="mb-1.5 block text-[10px] font-semibold uppercase"
        style={{ color: TONE.muted, letterSpacing: "0.22em" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
