"use client";

// MembershipWidget
// ────────────────
// Sidebar card for /profile that mirrors TribeCardWidget's visual language.
// Reads /api/membership/me and renders:
//   - no membership → soft CTA to /membership
//   - active membership → tier, price, next bill, cancel button
//   - pending_payment → "finishing checkout" state
//   - cancel_at_period_end → "ends on <date>" state with resubscribe link
//   - grace_period → "payment retrying" with nudge to update card
//
// No payment-method tokens ever come down to the client; this widget only
// uses the summary endpoint.

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { HandHeart, Sparkles, Leaf, ArrowRight, Loader2, AlertCircle, X } from "lucide-react";

function formatDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatIsk(n) {
  const v = Number(n || 0);
  return new Intl.NumberFormat("en-IS", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(v);
}

const TIER_META = {
  free: {
    label: "Free",
    tagline: "You're in the circle.",
    Icon: Leaf,
    accent: "#8a6a3f",
    bg: "#fff6ea",
  },
  tribe: {
    label: "Tribe",
    tagline: "",
    Icon: Sparkles,
    accent: "#c76a2b",
    bg: "#fff0e0",
  },
  patron: {
    label: "High Ticket",
    tagline: "Retreats, VIP, and bespoke offerings.",
    Icon: HandHeart,
    accent: "#1f5c4b",
    bg: "#e6ece4",
  },
};

export default function MembershipWidget() {
  const { status: sessionStatus } = useSession();
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const reload = useCallback(async () => {
    try {
      const res = await fetch("/api/membership/me");
      const data = await res.json().catch(() => ({}));
      setMembership(data?.membership || null);
    } catch {
      // silent — widget just hides
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionStatus !== "authenticated") return undefined;
    let alive = true;
    (async () => {
      if (alive) await reload();
    })();
    return () => {
      alive = false;
    };
  }, [sessionStatus, reload]);

  useEffect(() => {
    if (!loading && !hasAnimated) {
      const timer = setTimeout(() => setHasAnimated(true), 150);
      return () => clearTimeout(timer);
    }
  }, [loading, hasAnimated]);

  async function handleCancel() {
    setCancelError("");
    setCanceling(true);
    try {
      const res = await fetch("/api/membership/cancel", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not cancel.");
      setConfirmOpen(false);
      await reload();
    } catch (err) {
      setCancelError(err?.message || "Could not cancel.");
    } finally {
      setCanceling(false);
    }
  }

  if (sessionStatus !== "authenticated") return null;
  if (loading) return null;

  // ── Empty state ─────────────────────────────────────────────────────
  if (!membership || ["canceled", "past_due"].includes(membership.status)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={hasAnimated ? { opacity: 1, y: 0 } : undefined}
        transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.1 }}
        className="mb-6"
      >
        <Link
          href="/membership"
          className="group block rounded-[24px] overflow-hidden"
          style={{
            border: "1.5px solid #eadfce",
            background: "linear-gradient(180deg, #fffdf9 0%, #fff8f1 100%)",
            boxShadow: "0 10px 28px rgba(60,30,10,0.08), 0 2px 10px rgba(60,30,10,0.04)",
          }}
        >
          <div className="flex items-center gap-3 px-5 py-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#fff6ea" }}
            >
              <HandHeart className="h-4 w-4 text-[#c76a2b]" strokeWidth={1.6} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium" style={{ color: "#2c1810" }}>
                Mama Membership
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: "#9a7a62" }}>
                {membership?.status === "canceled"
                  ? "Your membership ended — rejoin any time"
                  : membership?.status === "past_due"
                  ? "A payment didn't go through — update and rejoin"
                  : "Free, Tribe, or High Ticket — take your seat"}
              </p>
            </div>
            <ArrowRight
              className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
              style={{ color: "#c0a890" }}
              strokeWidth={1.8}
            />
          </div>
        </Link>
      </motion.div>
    );
  }

  const meta = TIER_META[membership.tier] || TIER_META.free;
  const Icon = meta.Icon;
  const isPaid = membership.tier !== "free";
  const isHighTicket = membership.tier === "patron";
  const isEnding = membership.cancelAtPeriodEnd && membership.currentPeriodEnd;
  const isGrace = membership.status === "grace_period";
  const isPending = membership.status === "pending_payment";

  const statusPill = isPending
    ? { label: "Pending", bg: "#fff3e0", color: "#c76a2b" }
    : isGrace
    ? { label: "Payment retrying", bg: "#fdecec", color: "#9a1f1f" }
    : isEnding
    ? { label: "Ending", bg: "#f2ece3", color: "#8a7261" }
    : null;

  const nextBillLabel = isPending
    ? "Awaiting first payment"
    : isEnding
    ? `Ends ${formatDate(membership.currentPeriodEnd)}`
    : isHighTicket
    ? membership.currentPeriodEnd
      ? `Through ${formatDate(membership.currentPeriodEnd)}`
      : "Active"
    : membership.nextBillingDate
    ? `Renews ${formatDate(membership.nextBillingDate)}`
    : membership.currentPeriodEnd
    ? `Valid until ${formatDate(membership.currentPeriodEnd)}`
    : "Always";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={hasAnimated ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.12 }}
      className="mb-6"
    >
      <div
        className="rounded-[24px] overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #fffdf9 0%, #fff8f1 100%)",
          border: "1.5px solid #eadfce",
          boxShadow: "0 10px 28px rgba(60,30,10,0.08), 0 2px 10px rgba(60,30,10,0.04)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: meta.bg }}
            >
              <Icon className="h-4 w-4" style={{ color: meta.accent }} strokeWidth={1.6} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h3 className="font-medium text-base" style={{ color: "#2c1810" }}>
                  Mama · {meta.label}
                </h3>
                {statusPill ? (
                  <span
                    className="text-[10px] tracking-[0.16em] uppercase px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: statusPill.bg, color: statusPill.color }}
                  >
                    {statusPill.label}
                  </span>
                ) : null}
              </div>
              {meta.tagline ? (
                <p className="text-sm mt-0.5" style={{ color: "#9a7a62" }}>
                  {meta.tagline}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Price + next bill */}
        <div className="grid grid-cols-2 gap-3 px-6 pb-5">
          <div className="rounded-xl p-4" style={{ backgroundColor: meta.bg }}>
            <p className="text-xs uppercase tracking-[0.22em] mb-1" style={{ color: "#9a7a62" }}>
              {isPaid ? (isHighTicket ? "One-time" : "Per month") : "Price"}
            </p>
            <p
              className="font-cormorant font-light inline-flex items-center gap-1"
              style={{ fontSize: "1.6rem", lineHeight: 1, color: meta.accent }}
            >
              <span>{isPaid ? `${formatIsk(membership.priceAmount)}` : "Free"}</span>
              {isPaid ? <span className="text-sm text-[#9a7a62]">ISK</span> : null}
            </p>
          </div>
          <div className="rounded-xl p-4" style={{ backgroundColor: meta.bg }}>
            <p className="text-xs uppercase tracking-[0.22em] mb-1" style={{ color: "#9a7a62" }}>
              {isEnding ? "Access until" : isPaid ? (isHighTicket ? "Period" : "Next bill") : "Valid"}
            </p>
            <p
              className="font-cormorant font-light"
              style={{ fontSize: "1.1rem", color: "#2c1810", lineHeight: 1.15 }}
            >
              {nextBillLabel}
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div
          className="flex items-center justify-between px-6 py-3.5 gap-3 flex-wrap"
          style={{ borderTop: "1px solid #f0e8dc", background: "#fffaf3" }}
        >
          {membership.tier !== "patron" && !isEnding ? (
            <Link
              href="/membership"
              className="text-[12px] tracking-[0.16em] uppercase text-[#c76a2b] hover:text-[#8f4620] transition-colors inline-flex items-center gap-1"
            >
              {membership.tier === "free" ? "Upgrade" : "Join High Ticket"}
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} />
            </Link>
          ) : isEnding ? (
            <Link
              href="/membership"
              className="text-[12px] tracking-[0.16em] uppercase text-[#c76a2b] hover:text-[#8f4620] transition-colors inline-flex items-center gap-1"
            >
              Rejoin
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} />
            </Link>
          ) : (
            <span className="text-[12px] text-[#9a7a62]">Thank you for holding us up.</span>
          )}

          {!isEnding && !isPending ? (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="text-[12px] tracking-[0.16em] uppercase text-[#9a7a62] hover:text-[#2c1810] transition-colors"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </div>

      {/* ── Cancel confirmation ─────────────────────────────────────── */}
      {typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {confirmOpen ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[120] flex items-center justify-center px-5 bg-black/55 backdrop-blur-sm"
                  onClick={() => (canceling ? null : setConfirmOpen(false))}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                    className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-[0_30px_80px_rgba(0,0,0,0.28)]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => (canceling ? null : setConfirmOpen(false))}
                      className="absolute top-3 right-3 p-1 rounded-full text-[#9a7a62] hover:text-[#2c1810]"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" strokeWidth={1.8} />
                    </button>

                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: "#fff3e0" }}
                      >
                        <AlertCircle className="h-4 w-4 text-[#c76a2b]" strokeWidth={1.8} />
                      </div>
                      <h3
                        className="font-cormorant italic text-2xl font-light"
                        style={{ color: "#2c1810" }}
                      >
                        Cancel your membership?
                      </h3>
                    </div>

                    <p className="text-[14px] text-[#6a5040] leading-relaxed mb-5">
                      {isPaid
                        ? `You'll keep your benefits until ${formatDate(
                            membership.currentPeriodEnd,
                          )}. No further payments will be taken.`
                        : "Your free membership will end immediately. You can rejoin any time."}
                    </p>

                    {cancelError ? (
                      <div className="mb-4 rounded-lg bg-[#fdecec] border border-[#e5c1c1] px-3 py-2 text-[12.5px] text-[#9a1f1f]">
                        {cancelError}
                      </div>
                    ) : null}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmOpen(false)}
                        disabled={canceling}
                        className="flex-1 rounded-full border border-[#e8ddd3] px-4 py-2.5 text-[13px] tracking-[0.16em] uppercase text-[#6a5040] hover:bg-[#fff7f0] disabled:opacity-60"
                      >
                        Keep it
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={canceling}
                        className="flex-1 rounded-full bg-[#2c1810] px-4 py-2.5 text-[13px] tracking-[0.16em] uppercase text-[#fff6ea] hover:bg-[#3d2417] disabled:opacity-60 inline-flex items-center justify-center gap-2"
                      >
                        {canceling ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.8} />
                            <span>One moment…</span>
                          </>
                        ) : (
                          "Cancel"
                        )}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </motion.div>
  );
}
