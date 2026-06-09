"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { Leaf } from "lucide-react";

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
// wherever it appears.
//
// "Botanical pop" — warm cream base, the Mama plant-wreath as a
// living hero image, a forest-green discount seal, and leafy
// accents. Earthy and handmade, but with more life and joy than
// the old quiet card.
// ─────────────────────────────────────────────────────────────

const WREATH_SRC = "/wallet-pass/wreath.png";

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
      className="relative w-full max-w-[440px] rounded-[24px] overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #fff8ee 0%, #fbe7d0 52%, #f3cda4 100%)",
        border: "1px solid #ecd2b3",
        boxShadow:
          "0 14px 44px -14px rgba(140,70,30,0.40), 0 2px 8px rgba(60,30,10,0.08)",
      }}
    >
      {/* Soft botanical wash so the card never feels flat */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.10] mix-blend-multiply"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 28%, #2f6b54 0, transparent 42%), radial-gradient(circle at 84% 72%, #b9591f 0, transparent 46%)",
        }}
      />

      {/* The Mama wreath — the living hero image, crowning the top-right */}
      <img
        src={WREATH_SRC}
        alt="Mama"
        aria-hidden
        className="absolute pointer-events-none select-none"
        style={{
          width: 150,
          height: "auto",
          top: 14,
          right: 14,
          opacity: 0.96,
          filter: "drop-shadow(0 6px 14px rgba(90,45,15,0.18))",
        }}
      />

      <div className="relative p-6 sm:p-7">
        {/* Eyebrow + status */}
        <div className="flex flex-col gap-2 items-start">
          <p className="text-[10px] tracking-[0.34em] uppercase text-[#2f6b54] font-semibold inline-flex items-center gap-1.5">
            <Leaf size={12} strokeWidth={2.2} className="text-[#2f6b54]" />
            Mama · Tribe
          </p>
          <span
            className={`text-[10px] tracking-[0.18em] uppercase font-semibold px-2.5 py-0.5 rounded-full ${
              isActive
                ? "bg-[#1f5c4b]/12 text-[#1f5c4b]"
                : "bg-neutral-800/10 text-neutral-700"
            }`}
          >
            {status}
          </span>
        </div>

        {/* Holder name — leave room for the wreath on the right */}
        <p
          className="font-cormorant italic text-[#2c1810] text-[26px] sm:text-[30px] leading-tight mt-8 sm:mt-10 mb-7 pr-[120px]"
          style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
        >
          {holder_name}
        </p>

        {/* Discount seal + expiry */}
        <div className="flex items-end justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Forest-green discount seal — the playful pop */}
            <div
              className="relative flex flex-col items-center justify-center rounded-full text-white shrink-0"
              style={{
                width: 92,
                height: 92,
                background:
                  "radial-gradient(circle at 32% 28%, #2c7a60 0%, #1f5c4b 70%)",
                boxShadow:
                  "0 8px 18px -6px rgba(31,92,75,0.55), inset 0 0 0 2px rgba(255,255,255,0.16)",
              }}
            >
              <span
                className="font-cormorant italic font-medium leading-none"
                style={{
                  fontFamily: "Cormorant Garamond, Georgia, serif",
                  fontSize: 38,
                }}
              >
                {discount_percent}
                <span className="text-[18px] align-top">%</span>
              </span>
              <span className="text-[9px] tracking-[0.22em] uppercase opacity-90 mt-0.5">
                Off
              </span>
            </div>
            <p className="text-[12px] text-[#6a5040] leading-snug max-w-[110px]">
              off food &amp; drinks, every visit
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
          <p className="mt-6 text-[10px] tracking-[0.22em] uppercase text-[#8a7261]/70 inline-flex items-center gap-1.5">
            <Leaf size={10} strokeWidth={2} className="text-[#8a7261]/70" />
            Issued {format(new Date(issued_at), "d MMM yyyy")}
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}
