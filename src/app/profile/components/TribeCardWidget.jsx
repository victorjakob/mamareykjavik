"use client";

// TribeCardWidget
// ───────────────
// Compact sidebar widget that mirrors the MealCardsWidget style.
// Shows the signed-in user's active Tribe Card (discount %, expiry)
// with a quick link to the full card page. If the user has no card,
// shows a soft CTA to request one.

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Sparkles, ArrowRight } from "lucide-react";

function formatDate(d) {
  if (!d) return "Unlimited";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusLabel(card) {
  if (!card) return null;
  if (card.status === "revoked") return "Revoked";
  if (card.status === "expired") return "Expired";
  if (card.expires_at && new Date(card.expires_at) < new Date()) return "Expired";
  return "Active";
}

export default function TribeCardWidget() {
  const { data: session, status: sessionStatus } = useSession();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (sessionStatus !== "authenticated") return undefined;
    let alive = true;
    async function run() {
      try {
        const res = await fetch("/api/tribe-cards/mine");
        const data = await res.json().catch(() => ({}));
        if (alive) setCard(data.card || null);
      } catch {
        // silent — widget just hides if something goes wrong
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [sessionStatus]);

  useEffect(() => {
    if (!loading && !hasAnimated) {
      const t = setTimeout(() => setHasAnimated(true), 200);
      return () => clearTimeout(t);
    }
  }, [loading, hasAnimated]);

  if (sessionStatus !== "authenticated") return null;
  if (loading) return null;

  // ── Empty state: soft CTA to request a card ─────────────────────────
  if (!card) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={hasAnimated ? { opacity: 1, y: 0 } : undefined}
        transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.1 }}
        className="mb-6"
      >
        <Link
          href="/tribe-card"
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
              <Sparkles className="h-4 w-4 text-[#c76a2b]" strokeWidth={1.6} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium" style={{ color: "#2c1810" }}>
                Tribe Card
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: "#9a7a62" }}>
                Request a digital card
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

  // ── Active / expired / revoked state ────────────────────────────────
  const label = statusLabel(card);
  const isActive = label === "Active";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={hasAnimated ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.12 }}
      className="mb-6"
    >
      <Link href="/profile/my-tribe-card" className="group block">
        <div
          className="rounded-[24px] overflow-hidden transition-shadow duration-200 group-hover:shadow-[0_10px_28px_rgba(60,30,10,0.12)]"
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
                style={{ backgroundColor: "#fff6ea" }}
              >
                <Sparkles className="h-4 w-4 text-[#c76a2b]" strokeWidth={1.6} />
              </div>
              <div>
                <h3 className="font-medium text-base" style={{ color: "#2c1810" }}>
                  Your Tribe Card
                </h3>
                {!isActive ? (
                  <p className="text-sm mt-0.5" style={{ color: "#9a7a62" }}>
                    {label === "Expired"
                      ? "This card has expired"
                      : "This card has been revoked"}
                  </p>
                ) : null}
              </div>
            </div>
            {!isActive ? (
              <span
                className="text-[10px] tracking-[0.16em] uppercase px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: label === "Revoked" ? "#fdecec" : "#f2ece3",
                  color: label === "Revoked" ? "#9a1f1f" : "#8a7261",
                }}
              >
                {label}
              </span>
            ) : null}
          </div>

          {/* Discount + validity */}
          <div className="grid grid-cols-2 gap-3 px-6 pb-5">
            <div className="rounded-xl p-4" style={{ backgroundColor: "#fff6ea" }}>
              <p
                className="text-xs uppercase tracking-[0.22em] mb-1"
                style={{ color: "#9a7a62" }}
              >
                Discount
              </p>
              <p
                className="font-cormorant font-light text-[#c76a2b] inline-flex items-center gap-0.5"
                style={{ fontSize: "1.9rem", lineHeight: 1 }}
              >
                <span>{card.discount_percent}</span>
                <span className="text-base">%</span>
              </p>
            </div>
            <div className="rounded-xl p-4" style={{ backgroundColor: "#fff6ea" }}>
              <p
                className="text-xs uppercase tracking-[0.22em] mb-1"
                style={{ color: "#9a7a62" }}
              >
                Valid until
              </p>
              <p
                className="font-cormorant font-light"
                style={{ fontSize: "1.1rem", color: "#2c1810", lineHeight: 1.15 }}
              >
                {card.expires_at ? formatDate(card.expires_at) : "Unlimited"}
              </p>
            </div>
          </div>

          {/* Footer — CTA */}
          <div
            className="flex items-center justify-between px-6 py-3.5"
            style={{ borderTop: "1px solid #f0e8dc", background: "#fffaf3" }}
          >
            <span className="text-[12px]" style={{ color: "#9a7a62" }}>
              Open your card
            </span>
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              style={{ color: "#c76a2b" }}
              strokeWidth={1.8}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
