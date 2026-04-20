"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";

// ─────────────────────────────────────────────────────────────
// TribeCardVisual
// ─────────────────────────────────────────────────────────────
// One component for the card visual, reused on:
//   • /tribe-card/[token]  (public)
//   • /profile/my-tribe-card
//   • the admin preview
//
// The HTML email uses an inlined copy of the same design
// (in lib/tribeCardEmail.js) so the card "feels the same"
// wherever it appears. Warm handmade gradient, italic serif
// name, prominent % — earthy and quiet, not corporate.
// ─────────────────────────────────────────────────────────────

function durationLabel(duration) {
  switch (duration) {
    case "month":
      return "Valid for one month";
    case "6months":
      return "Valid for six months";
    case "year":
      return "Valid for one year";
    case "unlimited":
      return "No expiration";
    default:
      return "";
  }
}

function statusLabel(card) {
  if (card.status === "revoked") return "Revoked";
  if (card.status === "expired") return "Expired";
  if (card.expires_at && new Date(card.expires_at) < new Date()) return "Expired";
  return "Active";
}

export default function TribeCardVisual({ card }) {
  if (!card) return null;

  const {
    holder_name,
    discount_percent,
    expires_at,
    duration_type,
    issued_at,
  } = card;

  const status = statusLabel(card);
  const isActive = status === "Active";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-[440px] rounded-[22px] overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #fff6ea 0%, #fbe3cb 55%, #f1c9a0 100%)",
        border: "1px solid #eacfb0",
        boxShadow:
          "0 10px 40px -12px rgba(140,70,30,0.35), 0 2px 8px rgba(60,30,10,0.08)",
      }}
    >
      {/* Subtle pattern overlay for "handmade" feel */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.09] mix-blend-multiply"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, #8a3a14 0, transparent 40%), radial-gradient(circle at 80% 70%, #1f5c4b 0, transparent 45%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(138,58,20,0.5) 0, rgba(138,58,20,0.5) 1px, transparent 1px, transparent 8px)",
        }}
      />

      <div className="relative p-6 sm:p-7">
        {/* Top line */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] tracking-[0.32em] uppercase text-[#8a4a20] font-semibold">
            Mama · Tribe
          </p>
          <span
            className={`text-[10px] tracking-[0.18em] uppercase font-semibold px-2 py-0.5 rounded-full ${
              isActive
                ? "bg-[#1f5c4b]/10 text-[#1f5c4b]"
                : "bg-neutral-800/10 text-neutral-700"
            }`}
          >
            {status}
          </span>
        </div>

        {/* Holder name */}
        <p
          className="font-cormorant italic text-[#2c1810] text-[26px] sm:text-[28px] leading-tight mb-6 sm:mb-8"
          style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
        >
          {holder_name}
        </p>

        {/* Discount + expiry */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] tracking-[0.22em] uppercase text-[#8a7261] mb-1">
              Your discount
            </p>
            <p
              className="font-cormorant italic text-[#8a3a14] font-medium leading-none"
              style={{
                fontFamily: "Cormorant Garamond, Georgia, serif",
                fontSize: "64px",
              }}
            >
              {discount_percent}
              <span className="text-[28px] align-top ml-0.5">%</span>
            </p>
            <p className="text-[12px] text-[#6a5040] mt-1">
              off food &amp; events
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] tracking-[0.22em] uppercase text-[#8a7261] mb-1">
              Valid until
            </p>
            <p className="text-[14px] text-[#2c1810] font-semibold">
              {expires_at
                ? format(new Date(expires_at), "d MMM yyyy")
                : "Unlimited"}
            </p>
            <p className="text-[11px] text-[#8a7261] mt-1">
              {durationLabel(duration_type)}
            </p>
          </div>
        </div>

        {/* Bottom meta */}
        {issued_at ? (
          <p className="mt-6 text-[10px] tracking-[0.22em] uppercase text-[#8a7261]/70">
            Issued {format(new Date(issued_at), "d MMM yyyy")}
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}
