"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function StarRating({ label, value, onChange, size = "md" }) {
  const [hoverValue, setHoverValue] = useState(0);
  const [burst, setBurst] = useState({ key: 0, at: 0 });
  const displayValue = hoverValue || value;
  const buttonSize = size === "sm" ? "h-11 w-11 md:h-10 md:w-10" : "h-12 w-12 md:h-11 md:w-11";
  const focusValue = value >= 1 ? value : 1;

  const sparkVectors = [
    { x: -14, y: -12, s: 0.95, r: -18 },
    { x: 16, y: -10, s: 0.85, r: 14 },
    { x: -18, y: 8, s: 0.75, r: -6 },
    { x: 18, y: 10, s: 0.9, r: 10 },
    { x: 0, y: -18, s: 0.7, r: 0 },
    { x: 0, y: 20, s: 0.65, r: 0 },
  ];

  const triggerBurst = (n) => setBurst((prev) => ({ key: prev.key + 1, at: n }));

  const onRadioKeyDown = (e, n) => {
    if (!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"].includes(e.key)) return;
    e.preventDefault();
    let next = n;
    if (e.key === "Home") next = 1;
    else if (e.key === "End") next = 5;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = Math.max(1, n - 1);
    else if (e.key === "ArrowRight" || e.key === "ArrowDown") next = Math.min(5, n + 1);
    onChange(next);
  };

  return (
    <div className="w-full">
      <div
        className="mt-4 w-full max-w-[320px] mx-auto flex justify-between rounded-full px-3 py-2"
        style={{
          background: (value >= 1 || hoverValue >= 1)
            ? "rgba(255,145,77,0.08)"
            : "rgba(255,255,255,0.04)",
          border: (value >= 1 || hoverValue >= 1)
            ? "1px solid rgba(255,145,77,0.20)"
            : "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(8px)",
        }}
        role="radiogroup"
        aria-label={label}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const active = displayValue >= n;
          const selected = value === n;
          const tabbable = (value >= 1 ? selected : n === 1) || n === focusValue;
          return (
            <motion.button
              key={n}
              type="button"
              role="radio"
              className={[
                buttonSize,
                "relative rounded-full flex items-center justify-center text-[24px] leading-none",
                "transition-all duration-200 ease-out will-change-transform active:scale-[0.98]",
                active
                  ? "text-[#ff914d] drop-shadow-[0_2px_10px_rgba(255,145,77,0.4)]"
                  : "text-white/20 hover:text-[#ff914d]/50",
              ].join(" ")}
              animate={{ scale: selected ? 1.08 : 1, y: selected ? -1 : 0 }}
              transition={{ type: "spring", stiffness: 520, damping: 28 }}
              whileTap={{ scale: 0.92 }}
              aria-label={`${n} of 5`}
              aria-checked={selected}
              tabIndex={tabbable ? 0 : -1}
              onClick={() => { triggerBurst(n); onChange(n); }}
              onKeyDown={(e) => onRadioKeyDown(e, n)}
              onMouseEnter={() => setHoverValue(n)}
              onMouseLeave={() => setHoverValue(0)}
              onFocus={() => setHoverValue(n)}
              onBlur={() => setHoverValue(0)}
            >
              <AnimatePresence>
                {burst.at === n ? (
                  <motion.span
                    key={`${burst.key}-${n}`}
                    className="pointer-events-none absolute inset-0"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {sparkVectors.map((v, i) => (
                      <motion.span
                        key={i}
                        className="absolute left-1/2 top-1/2 text-[12px] text-[#ff914d]/80"
                        initial={{ x: 0, y: 0, opacity: 0, scale: 0.6, rotate: 0 }}
                        animate={{ x: v.x, y: v.y, opacity: [0, 0.95, 0], scale: [0.6, v.s, 0.5], rotate: v.r }}
                        transition={{ duration: 0.55, ease: "easeOut", delay: i * 0.01 }}
                        style={{ transform: "translate(-50%, -50%)" }}
                        aria-hidden="true"
                      >✦</motion.span>
                    ))}
                  </motion.span>
                ) : null}
              </AnimatePresence>
              ★
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
