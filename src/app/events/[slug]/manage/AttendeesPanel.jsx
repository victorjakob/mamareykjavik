"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Search,
  Loader2,
  CheckCircle2,
  Circle,
  Users,
  AlertCircle,
  Undo2,
  X,
  Info,
  UserX,
} from "lucide-react";

const ORANGE = "#ff914d";
const DARK = "#2c1810";
const MUTED = "#9a7a62";
const BORDER = "#f0e6d8";
const GREEN = "#0f9d6b";

const STATUS_LABEL = {
  paid: "Online",
  card: "Card",
  door: "Door",
  cash: "Cash",
  transfer: "Transfer",
};

// "5.000 kr" — Icelandic thousands separator, no decimals.
const fmtKr = (v) =>
  v == null ? null : `${Number(v).toLocaleString("is-IS")} kr`;

const fmtDateTime = (v) =>
  v
    ? new Date(v).toLocaleString("en-GB", {
        timeZone: "Atlantic/Reykjavik",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

function Row({ label, children }) {
  if (children == null || children === "" || children === false) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2" style={{ borderTop: `1px solid ${BORDER}` }}>
      <span className="shrink-0 text-sm" style={{ color: MUTED }}>{label}</span>
      <span className="min-w-0 break-all text-right text-sm" style={{ color: DARK }}>{children}</span>
    </div>
  );
}

// Everything about one ticket in one place: purchase details, check-in and
// refund. Refunds go through the existing /api/admin/tickets/[id]/refund
// endpoint (admin or event host only), which refunds through Teya, marks the
// ticket and emails the buyer.
function TicketModal({ ticket, canRefund, onClose, onPatch, onToggle, toggling, onCancel }) {
  const total = Number(ticket.total_price || 0);
  const refunded = Number(ticket.refund_amount || 0);
  const remaining = Math.max(0, total - refunded);
  const [refundOpen, setRefundOpen] = useState(false);
  const [amount, setAmount] = useState(String(remaining));
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelBusy, setCancelBusy] = useState(false);

  async function doCancel() {
    if (cancelBusy) return;
    setCancelBusy(true);
    try {
      await onCancel();
    } finally {
      setCancelBusy(false);
    }
  }

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isCardOnline = ["paid", "card"].includes(ticket.status);
  const fully = ticket.refund_status === "refunded" || (refunded > 0 && remaining <= 0);
  const whyNot = fully
    ? "Already fully refunded."
    : !isCardOnline
    ? `Paid by ${(STATUS_LABEL[ticket.status] || ticket.status || "").toLowerCase()} — refund it by hand, outside the website.`
    : total <= 0
    ? "Nothing was paid for this ticket."
    : !ticket.has_transaction
    ? "Bought before we saved Teya transaction ids — refund it in the Teya portal."
    : !canRefund
    ? "Log in as the host or an admin to refund."
    : null;

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return setErr("Amount must be a positive number.");
    if (amt > remaining) return setErr(`Max refundable is ${fmtKr(remaining)}.`);
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/tickets/${ticket.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, reason: reason.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Refund failed.");
      toast.success(`Refunded ${fmtKr(data.refundAmount)} — ${ticket.buyer_name} has been emailed.`);
      if (data.dbWarning) toast.error(data.dbWarning);
      onPatch({
        refund_status: data.refundStatus,
        refund_amount: data.refundTotal,
        refunded_at: new Date().toISOString(),
      });
      setRefundOpen(false);
    } catch (e2) {
      setErr(e2.message || "Refund failed.");
    } finally {
      setBusy(false);
    }
  }

  const used = !!ticket.used;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{ background: "rgba(44,24,16,0.35)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold" style={{ color: DARK }}>{ticket.buyer_name || "—"}</p>
            {ticket.buyer_email && (
              <a href={`mailto:${ticket.buyer_email}`} className="truncate text-sm underline-offset-2 hover:underline" style={{ color: ORANGE }}>
                {ticket.buyer_email}
              </a>
            )}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={{ color: MUTED }}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <Row label="Tickets">{ticket.quantity}{ticket.variant_name ? ` · ${ticket.variant_name}` : ""}</Row>
          <Row label="Price each">{fmtKr(ticket.price)}</Row>
          <Row label="Total paid">{fmtKr(ticket.total_price)}</Row>
          <Row label="Payment">{STATUS_LABEL[ticket.status] || ticket.status}{ticket.gatekeeper ? " · walk-in at door" : ""}</Row>
          {ticket.gatekeeper_tip > 0 && <Row label="Tip">{fmtKr(ticket.gatekeeper_tip)}</Row>}
          <Row label="Purchased">{fmtDateTime(ticket.created_at)}</Row>
          <Row label="Order id">{ticket.order_id}</Row>
          <Row label="Checked in">{used ? "Yes" : "No"}</Row>
          {refunded > 0 && (
            <Row label="Refunded">
              <span style={{ color: "#b23b2d" }}>
                {fmtKr(refunded)}
                {ticket.refund_status === "partial" ? " (partial)" : ""}
                {ticket.refunded_at ? ` · ${fmtDateTime(ticket.refunded_at)}` : ""}
              </span>
            </Row>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onToggle}
            disabled={toggling}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium disabled:opacity-60"
            style={
              used
                ? { background: "#e7f7ee", color: GREEN, border: `1.5px solid #b7e6cd` }
                : { background: "#fff", color: DARK, border: `1.5px solid #e8ddd3` }
            }
          >
            {toggling ? <Loader2 className="h-4 w-4 animate-spin" /> : used ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
            {used ? "Checked in · undo" : "Check in"}
          </button>
          {!refundOpen && (
            <button
              type="button"
              disabled={!!whyNot}
              onClick={() => {
                setErr(null);
                setAmount(String(remaining));
                setRefundOpen(true);
              }}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: "#fff", color: "#b23b2d", border: "1.5px solid #f3c9c2" }}
            >
              <Undo2 className="h-4 w-4" />
              Refund
            </button>
          )}
        </div>
        {whyNot && !refundOpen && (
          <p className="mt-2 text-xs" style={{ color: MUTED }}>{whyNot}</p>
        )}

        {canRefund && !refundOpen && (
          <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${BORDER}` }}>
            {!confirmCancel ? (
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className="inline-flex items-center gap-1.5 text-sm"
                style={{ color: MUTED }}
              >
                <UserX className="h-4 w-4" />
                Remove from guest list
              </button>
            ) : (
              <div className="rounded-xl p-4" style={{ background: "#fff5f4" }}>
                <p className="mb-1 text-sm font-medium" style={{ color: "#b23b2d" }}>
                  Remove {ticket.buyer_name} ({ticket.quantity} {ticket.quantity === 1 ? "ticket" : "tickets"})?
                </p>
                <p className="mb-3 text-xs" style={{ color: "#8a4b3d" }}>
                  They disappear from the guest list, sales stats and capacity, and the seat opens up.
                  This does not send money back
                  {isCardOnline && remaining > 0 && total > 0
                    ? ` — ${fmtKr(remaining)} paid online is still unrefunded. Refund first if they should get it back.`
                    : "."}{" "}
                  No email is sent.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmCancel(false)}
                    className="rounded-full bg-white px-4 py-2 text-sm"
                    style={{ color: MUTED, border: `1.5px solid #e8ddd3` }}
                  >
                    Keep
                  </button>
                  <button
                    type="button"
                    onClick={doCancel}
                    disabled={cancelBusy}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                    style={{ background: "#c2410c" }}
                  >
                    {cancelBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4" />}
                    Remove attendee
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {refundOpen && (
          <form onSubmit={submit} className="mt-4 rounded-xl p-4" style={{ background: "#faf6f0" }}>
            <label className="mb-1 block text-xs" style={{ color: MUTED }}>Refund amount (kr)</label>
            <input
              type="number"
              min="1"
              max={remaining}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mb-1 w-full rounded-lg bg-white px-3 py-2 text-sm outline-none"
              style={{ border: `1px solid ${BORDER}`, color: DARK }}
            />
            <p className="mb-3 text-xs" style={{ color: MUTED }}>
              Full refund is {fmtKr(remaining)}. Lower it for a partial refund.
            </p>
            <label className="mb-1 block text-xs" style={{ color: MUTED }}>Note to guest (optional)</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={300}
              placeholder="e.g. Can’t make it, refunded as agreed"
              className="mb-3 w-full rounded-lg bg-white px-3 py-2 text-sm outline-none"
              style={{ border: `1px solid ${BORDER}`, color: DARK }}
            />
            {err && (
              <p className="mb-3 rounded-lg px-3 py-2 text-sm" style={{ background: "#fff5f4", color: "#b23b2d" }}>{err}</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRefundOpen(false)}
                className="rounded-full px-4 py-2.5 text-sm"
                style={{ color: MUTED, border: `1.5px solid #e8ddd3`, background: "#fff" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                style={{ background: ORANGE }}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Undo2 className="h-4 w-4" />}
                Refund {Number(amount) > 0 ? fmtKr(Number(amount)) : ""}
              </button>
            </div>
            <p className="mt-2 text-xs" style={{ color: MUTED }}>
              Money goes back to their card via Teya and they get an email.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AttendeesPanel({ slug, canRefund = false }) {
  const [tickets, setTickets] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/events/${slug}/manage/attendees`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Couldn't load attendees");
        if (alive) setTickets(data.tickets || []);
      } catch (e) {
        if (alive) setError(e.message || "Couldn't load attendees");
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  const totals = useMemo(() => {
    const list = tickets || [];
    const guests = list.reduce((s, t) => s + (t.quantity || 0), 0);
    const checkedIn = list.reduce((s, t) => s + (t.used ? t.quantity || 0 : 0), 0);
    const revenue = list.reduce(
      (s, t) => s + Number(t.total_price || 0) - Number(t.refund_amount || 0),
      0
    );
    return { guests, checkedIn, revenue };
  }, [tickets]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = (tickets || []).filter(
      (t) =>
        !q ||
        (t.buyer_name || "").toLowerCase().includes(q) ||
        (t.buyer_email || "").toLowerCase().includes(q)
    );
    // Sort alphabetically by guest name (Icelandic-aware).
    return base
      .slice()
      .sort((a, b) =>
        (a.buyer_name || "").localeCompare(b.buyer_name || "", "is", { sensitivity: "base" })
      );
  }, [tickets, query]);

  async function toggle(t) {
    if (busyId) return;
    setBusyId(t.id);
    const nextUsed = !t.used;
    setTickets((prev) => prev.map((x) => (x.id === t.id ? { ...x, used: nextUsed } : x)));
    try {
      const res = await fetch(`/events/${slug}/manage/attendees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: t.id, used: nextUsed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
    } catch (e) {
      setTickets((prev) => prev.map((x) => (x.id === t.id ? { ...x, used: t.used } : x)));
      toast.error(e.message || "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center rounded-xl px-6 py-10 text-center" style={{ background: "#fff5f4" }}>
        <AlertCircle className="mb-3 h-6 w-6" style={{ color: "#dc2626" }} />
        <p className="text-sm" style={{ color: "#b23b2d" }}>{error}</p>
      </div>
    );
  }

  if (tickets === null) {
    return (
      <div className="flex items-center justify-center py-16" style={{ color: MUTED }}>
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl px-6 py-12 text-center" style={{ background: "#faf6f0" }}>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "#fff3ea" }}>
          <Users className="h-6 w-6" style={{ color: ORANGE }} strokeWidth={1.75} />
        </div>
        <p className="text-sm" style={{ color: MUTED }}>No registrations yet. They'll appear here as tickets sell.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-4">
          <span className="text-sm" style={{ color: DARK }}>
            <strong style={{ fontWeight: 600 }}>{totals.guests}</strong> {totals.guests === 1 ? "guest" : "guests"}
          </span>
          <span className="text-sm" style={{ color: GREEN }}>
            <strong style={{ fontWeight: 600 }}>{totals.checkedIn}</strong> checked in
          </span>
          {totals.revenue > 0 && (
            <span className="text-sm" style={{ color: DARK }}>
              <strong style={{ fontWeight: 600 }}>{fmtKr(totals.revenue)}</strong> paid
            </span>
          )}
        </div>
        <div className="relative ml-auto">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: MUTED }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email"
            className="rounded-full py-2 pl-9 pr-3 text-sm outline-none"
            style={{ background: "#faf6f0", border: `1px solid ${BORDER}`, color: DARK, minWidth: 200 }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((t) => {
          const used = !!t.used;
          const busy = busyId === t.id;
          return (
            <div
              key={t.id}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{
                background: used ? "#f1faf5" : "#fff",
                border: `1px solid ${used ? "#cfeede" : BORDER}`,
              }}
            >
              <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setOpenId(t.id)}>
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium" style={{ color: DARK }}>
                    {t.buyer_name || "—"}
                  </span>
                  {t.quantity > 1 && (
                    <span className="rounded-full px-1.5 py-0.5 text-[11px]" style={{ background: "#fff3ea", color: "#8a4b22" }}>
                      ×{t.quantity}
                    </span>
                  )}
                  {t.gatekeeper && (
                    <span className="rounded-full px-1.5 py-0.5 text-[11px]" style={{ background: "#faf6f0", color: MUTED }}>
                      walk-in
                    </span>
                  )}
                  {t.refund_status === "refunded" && (
                    <span className="rounded-full px-1.5 py-0.5 text-[11px]" style={{ background: "#fdecea", color: "#b23b2d" }}>
                      refunded
                    </span>
                  )}
                  {t.refund_status === "partial" && (
                    <span className="rounded-full px-1.5 py-0.5 text-[11px]" style={{ background: "#fdecea", color: "#b23b2d" }}>
                      refunded {fmtKr(t.refund_amount)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 truncate text-xs" style={{ color: MUTED }}>
                  <span className="truncate">{t.buyer_email || ""}</span>
                  <span aria-hidden>·</span>
                  <span>{STATUS_LABEL[t.status] || t.status}</span>
                  {t.variant_name ? <span className="truncate">· {t.variant_name}</span> : null}
                  {t.total_price != null && (
                    <span className="shrink-0">
                      · {fmtKr(t.total_price)}
                      {t.quantity > 1 && t.price != null
                        ? ` (${t.quantity}×${fmtKr(t.price)})`
                        : ""}
                    </span>
                  )}
                  {t.gatekeeper && t.gatekeeper_tip > 0 && (
                    <span className="shrink-0">· tip {fmtKr(t.gatekeeper_tip)}</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpenId(t.id)}
                className="inline-flex shrink-0 items-center justify-center rounded-full p-2 transition-colors hover:bg-[#faf6f0]"
                style={{ color: MUTED, border: `1.5px solid #e8ddd3` }}
                aria-label={`Details for ${t.buyer_name}`}
                title="Details, refund"
              >
                <Info className="h-4 w-4" strokeWidth={1.9} />
              </button>

              <button
                type="button"
                onClick={() => toggle(t)}
                disabled={busy}
                aria-label={used ? `Undo check-in for ${t.buyer_name}` : `Check in ${t.buyer_name}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-60"
                style={
                  used
                    ? { background: "#e7f7ee", color: GREEN, border: `1.5px solid #b7e6cd` }
                    : { background: "#fff", color: DARK, border: `1.5px solid #e8ddd3` }
                }
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : used ? (
                  <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                ) : (
                  <Circle className="h-4 w-4" strokeWidth={1.9} />
                )}
                {used ? "Checked in" : "Check in"}
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm" style={{ color: MUTED }}>No guests match "{query}".</p>
        )}
      </div>

      {openId && tickets.find((x) => x.id === openId) && (
        <TicketModal
          ticket={tickets.find((x) => x.id === openId)}
          canRefund={canRefund}
          onClose={() => setOpenId(null)}
          onPatch={(patch) =>
            setTickets((prev) => prev.map((x) => (x.id === openId ? { ...x, ...patch } : x)))
          }
          onToggle={() => toggle(tickets.find((x) => x.id === openId))}
          toggling={busyId === openId}
          onCancel={async () => {
            const t = tickets.find((x) => x.id === openId);
            try {
              const res = await fetch(`/events/${slug}/manage/attendees`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ticketId: openId, action: "cancel" }),
              });
              const data = await res.json().catch(() => ({}));
              if (!res.ok) throw new Error(data.error || "Couldn't remove attendee");
              setTickets((prev) => prev.filter((x) => x.id !== openId));
              setOpenId(null);
              toast.success(`${t?.buyer_name || "Attendee"} removed from the guest list.`);
            } catch (e) {
              toast.error(e.message || "Couldn't remove attendee");
            }
          }}
        />
      )}
    </div>
  );
}
