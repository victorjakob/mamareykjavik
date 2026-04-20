// Oversized 4-digit PIN keypad. Controlled — parent owns the value.
// We don't use the platform number-input because we want big, custom
// tap targets and no software-keyboard sliding up/down jitter.

"use client";

import { motion } from "framer-motion";
import { TONE } from "./ui";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

export default function PinPad({ value, onChange, label, small = false }) {
  const handleKey = (k) => {
    if (k === "⌫") {
      onChange(value.slice(0, -1));
      return;
    }
    if (!/\d/.test(k)) return;
    if (value.length >= 4) return;
    onChange(value + k);
  };

  return (
    <div>
      {label && (
        <p
          className="text-center uppercase text-[10px]"
          style={{ letterSpacing: "0.46em", color: TONE.bronze, marginBottom: "0.85rem" }}
        >
          {label}
        </p>
      )}

      {/* Dots — four quiet pebbles along the threshold */}
      <div className="flex items-center justify-center gap-5 mb-6">
        {[0, 1, 2, 3].map((i) => {
          const filled = i < value.length;
          return (
            <div
              key={i}
              className="rounded-full transition-all"
              style={{
                width: small ? 12 : 14,
                height: small ? 12 : 14,
                background: filled ? TONE.bronze : "transparent",
                border: `1.5px solid ${filled ? TONE.bronze : TONE.lineHi}`,
              }}
            />
          );
        })}
      </div>

      {/* Keypad — flatter, paper buttons; the subtlest shadow */}
      <div
        className="mx-auto grid grid-cols-3"
        style={{
          gap: small ? 10 : 14,
          maxWidth: small ? 260 : 340,
        }}
      >
        {KEYS.map((k, i) => {
          if (!k) return <div key={i} />;
          const isBackspace = k === "⌫";
          return (
            <motion.button
              key={i}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => handleKey(k)}
              className="rounded-2xl flex items-center justify-center"
              style={{
                aspectRatio: "1 / 1",
                fontSize: small ? "1.25rem" : "1.7rem",
                fontFamily: "ui-serif, Georgia, serif",
                fontWeight: 300,
                background: isBackspace ? "transparent" : "#fff",
                border: `1px solid ${isBackspace ? "transparent" : TONE.line}`,
                color: isBackspace ? TONE.muted : TONE.ink,
                boxShadow: isBackspace ? "none" : "0 1px 6px -4px rgba(36,24,16,0.15)",
              }}
            >
              {k}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
