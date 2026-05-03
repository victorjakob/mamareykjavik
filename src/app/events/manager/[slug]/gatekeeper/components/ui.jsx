// Shared tablet-first primitives for the Gatekeeper kiosk.
//
// The aesthetic is tao / temple / soft ritual — quiet and held, not loud.
// An ensō (the zen circle) is the recurring motif. Orange has been relegated
// to a small ember; bronze and moss do most of the accent work. Deep ink on
// bone paper gives it the feel of a hand-printed program.

"use client";

import { motion } from "framer-motion";

// ── Brand tokens ────────────────────────────────────────────────────────────
// The palette is kept modest on purpose — a ceremony doesn't need 20 colors.
export const TONE = {
  // Surfaces
  paper:    "#f7f2e8",   // main bone (quieter than previous cream)
  bone:     "#f7f2e8",   // alias of paper
  warm:     "#efe7d5",   // card surface washes
  cream:    "#ede4d2",   // deeper surface washes
  dust:     "#d9ccb4",   // quiet dividers in hero surfaces
  // Text
  ink:      "#241810",   // deep cocoa (pushed slightly darker)
  sepia:    "#6f523a",
  muted:    "#9a8772",
  // Hairlines
  line:     "#e5d9c4",
  lineHi:   "#d9c9ae",   // slightly deeper, for emphasis borders
  // Sacred accents (use sparingly)
  bronze:   "#9a744a",   // primary accent — bronze / temple door
  bronzeHi: "#b89468",
  bronzeLo: "#7a5a34",
  moss:     "#6b7a52",   // secondary accent — quiet jade
  ember:    "#d9691e",   // very small ceremonial spark (formerly "orange")
  // Signals
  ok:       "#6b7a52",   // we repurpose moss for OK — softer than emerald
  danger:   "#b34a3d",   // quiet rust instead of fire-engine red
  // Legacy aliases (keep so existing component calls don't break)
  gold:     "#9a744a",   // re-mapped to bronze
  orange:   "#d9691e",   // re-mapped to ember
  orangeHi: "#d9691e",
  orangeLo: "#a84f14",
};

// A whisper gradient — bone to dust. Use this where a surface needs depth
// without shouting. Never use the old orange gradient as a hero again.
export const SACRED_GRADIENT = `linear-gradient(180deg, ${TONE.paper} 0%, ${TONE.cream} 100%)`;
// An ink-dominant gradient for deep surfaces (the reconciliation hero, etc.)
export const INK_GRADIENT    = `linear-gradient(145deg, #3a281c 0%, ${TONE.ink} 55%, #1a100a 100%)`;
// Preserved for back-compat but now a soft ember, not a loud orange.
export const ORANGE_GRADIENT = `linear-gradient(145deg, ${TONE.bronzeHi} 0%, ${TONE.bronze} 55%, ${TONE.bronzeLo} 100%)`;

// ── Ensō ───────────────────────────────────────────────────────────────────
// The open circle of zen painting — drawn in one breath. We use it three
// ways: static watermark, breathing success mark, and draw-in success reveal.
export function EnsoCircle({
  size = 240,
  stroke = 1.25,
  color,
  opacity = 0.12,
  breathing = false,
  drawIn = false,
  className = "",
  style = {},
}) {
  const c = color || TONE.ink;
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const gap = 22; // the "open" end of the ensō

  // For draw-in, we animate strokeDashoffset; for breathing we animate scale+opacity.
  const drawInit = { strokeDashoffset: circumference, opacity: 0 };
  const drawAnim = { strokeDashoffset: gap, opacity };
  const breathInit = { scale: 0.985, opacity: opacity * 0.7 };
  const breathAnim = { scale: [0.985, 1.015, 0.985], opacity: [opacity * 0.7, opacity, opacity * 0.7] };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      style={style}
      aria-hidden
    >
      <motion.circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke={c}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={drawIn ? circumference : `${circumference - gap} ${gap}`}
        transform="rotate(-105 60 60)"
        initial={drawIn ? drawInit : breathing ? breathInit : { opacity }}
        animate={drawIn ? drawAnim : breathing ? breathAnim : { opacity }}
        transition={
          drawIn
            ? { duration: 1.4, ease: [0.22, 1, 0.36, 1] }
            : breathing
            ? { duration: 5.2, repeat: Infinity, ease: "easeInOut" }
            : undefined
        }
      />
    </svg>
  );
}

// ── Small seal dot — a single bronze mark, used as a quiet emphasis ────────
export function SealDot({ size = 8, color, className = "", style = {} }) {
  return (
    <span
      className={className}
      aria-hidden
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color || TONE.bronze,
        ...style,
      }}
    />
  );
}

// ── Threshold line — a thin horizontal rule with a seal dot at center. Used
// below eyebrows on ceremonial screens. ────────────────────────────────────
export function ThresholdRule({ color, width = 96 }) {
  const c = color || TONE.bronze;
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center gap-3"
      style={{ width: "fit-content" }}
    >
      <span style={{ display: "block", width, height: 1, background: `linear-gradient(90deg, transparent, ${c}55, ${c})` }} />
      <SealDot size={5} color={c} />
      <span style={{ display: "block", width, height: 1, background: `linear-gradient(90deg, ${c}, ${c}55, transparent)` }} />
    </span>
  );
}

// ── Eyebrow ─────────────────────────────────────────────────────────────────
// Kept the uppercase + letter-spacing language, but the weight is lighter and
// the accent color is bronze now — less "marketing header", more "printed label".
export function Eyebrow({ children, align = "left" }) {
  return (
    <p
      className="uppercase text-[10px] font-medium"
      style={{
        letterSpacing: "0.46em",
        color: TONE.bronze,
        textAlign: align,
      }}
    >
      {children}
    </p>
  );
}

// ── KioskTitle ──────────────────────────────────────────────────────────────
// `weight="poetic"` keeps the original ceremonial face (light italic serif)
// for welcome / done screens. `weight="strong"` (default) is a heavier,
// non-italic title that scans in a single glance — used for action screens
// (picker, walk-in, payment, tip) so door staff and guests can read the
// instruction immediately.
export function KioskTitle({ children, weight = "strong" }) {
  if (weight === "poetic") {
    return (
      <h1
        className="font-[ui-serif] font-extralight italic leading-[1.04]"
        style={{
          fontSize: "clamp(2rem, 5.5vw, 3.4rem)",
          color: TONE.ink,
          letterSpacing: "-0.005em",
        }}
      >
        {children}
      </h1>
    );
  }
  return (
    <h1
      className="font-[ui-serif] font-semibold leading-[1.05]"
      style={{
        fontSize: "clamp(2rem, 5.4vw, 3.2rem)",
        color: TONE.ink,
        letterSpacing: "-0.012em",
      }}
    >
      {children}
    </h1>
  );
}

// ── BigButton ───────────────────────────────────────────────────────────────
// Default tone is "ink" now — a deep cocoa button with a quiet bronze shine.
// The ceremonial "sacred" tone is for the one-true-primary action on a screen
// (bone field, ink type, bronze seal ring). Old "orange" is kept for back-compat
// but also re-mapped to the new ember tone.
export function BigButton({
  children,
  onClick,
  disabled,
  tone = "ink",
  type = "button",
  fullWidth = true,
  compact = false,
}) {
  const common = {
    fontSize: compact ? "clamp(0.85rem, 1.6vw, 1rem)" : "clamp(1rem, 1.9vw, 1.25rem)",
    padding: compact
      ? "clamp(0.95rem, 1.6vw, 1.1rem) clamp(1.3rem, 2vw, 1.8rem)"
      : "clamp(1.15rem, 2.2vw, 1.6rem) clamp(1.6rem, 2.5vw, 2.2rem)",
    letterSpacing: "0.22em",
  };

  const stylesByTone = {
    ink: {
      background: INK_GRADIENT,
      color: TONE.paper,
      boxShadow: "0 14px 40px -22px rgba(36,24,16,0.5), inset 0 1px 0 rgba(255,245,225,0.08)",
    },
    sacred: {
      background: TONE.paper,
      color: TONE.ink,
      border: `1.5px solid ${TONE.bronze}`,
      boxShadow: `0 10px 34px -18px ${TONE.bronze}55, inset 0 1px 0 #fff`,
    },
    orange: {
      // Re-purposed "orange" (back-compat) — now a subtle ember gradient
      background: ORANGE_GRADIENT,
      color: TONE.paper,
      boxShadow: "0 14px 36px -18px rgba(154,116,74,0.55)",
    },
    dark: {
      background: TONE.ink,
      color: TONE.paper,
      boxShadow: "0 14px 36px -18px rgba(43,31,21,0.45)",
    },
    ghost: {
      background: "transparent",
      color: TONE.ink,
      border: `1.5px solid ${TONE.lineHi}`,
    },
    danger: {
      background: "transparent",
      color: TONE.danger,
      border: `1.5px solid #e8c3bc`,
    },
  };

  return (
    <motion.button
      whileTap={{ scale: 0.975 }}
      whileHover={{ y: disabled ? 0 : -1 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`${fullWidth ? "w-full" : ""} relative inline-flex items-center justify-center rounded-[18px] font-medium uppercase disabled:opacity-50 disabled:cursor-not-allowed transition-transform`}
      style={{ ...stylesByTone[tone], ...common }}
    >
      {children}
    </motion.button>
  );
}

// ── Panel ───────────────────────────────────────────────────────────────────
// Cards now sit on warm bone with a single hairline — no drop shadow cloud.
export function Panel({ children, className = "", padded = true, tone = "default" }) {
  const variants = {
    default: {
      background: TONE.paper,
      border: `1px solid ${TONE.line}`,
    },
    warm: {
      background: TONE.warm,
      border: `1px solid ${TONE.line}`,
    },
  };
  return (
    <div
      className={`rounded-[20px] ${className}`}
      style={{
        ...variants[tone],
        boxShadow: "0 1px 0 rgba(255,250,238,0.6) inset",
        padding: padded ? "clamp(1.25rem, 2.5vw, 2rem)" : 0,
      }}
    >
      {children}
    </div>
  );
}

// ── BigInput ────────────────────────────────────────────────────────────────
// Larger, easier-to-scan label. Required fields get no extra marker (most are
// required by default). Optional fields show a quiet inline "· optional" hint
// right next to the label so the eye reads it as one phrase.
export function BigInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoFocus,
  inputMode,
  maxLength,
  required,
  hideOptionalBadge,
}) {
  const showOptional = !required && !hideOptionalBadge;
  return (
    <label className="block">
      <span
        className="mb-2.5 block uppercase font-semibold"
        style={{
          letterSpacing: "0.18em",
          color: TONE.ink,
          fontSize: "clamp(0.78rem, 1.25vw, 0.88rem)",
        }}
      >
        {label}
        {showOptional && (
          <span
            className="font-semibold"
            style={{
              color: TONE.sepia,
              letterSpacing: "0.18em",
              marginLeft: 10,
              fontSize: "1em",
            }}
          >
            · OPTIONAL
          </span>
        )}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        inputMode={inputMode}
        maxLength={maxLength}
        className="w-full rounded-2xl px-5 py-4 focus:outline-none transition-colors font-semibold"
        style={{
          background: "transparent",
          borderBottom: `1.5px solid ${TONE.lineHi}`,
          borderTop: "1.5px solid transparent",
          borderLeft: "1.5px solid transparent",
          borderRight: "1.5px solid transparent",
          borderRadius: 0,
          color: TONE.ink,
          fontSize: "clamp(1.15rem, 2vw, 1.3rem)",
          fontFamily: "ui-serif, Georgia, serif",
          paddingLeft: 4,
          paddingRight: 4,
        }}
      />
    </label>
  );
}

// ── TogglePill ──────────────────────────────────────────────────────────────
// The slider switch is retired in favor of a quiet two-state row: a small
// bronze seal appears when "on". The whole row is tappable.
export function TogglePill({ checked, onChange, label, sub }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full text-left rounded-[18px] px-5 py-4 flex items-center justify-between gap-4 transition-all"
      style={{
        background: checked ? TONE.warm : "transparent",
        border: `1px solid ${checked ? TONE.bronze + "66" : TONE.line}`,
      }}
    >
      <div className="flex items-center gap-4 min-w-0">
        <span
          aria-hidden
          className="shrink-0 flex items-center justify-center rounded-full transition-all"
          style={{
            width: 22,
            height: 22,
            border: `1.5px solid ${checked ? TONE.bronze : TONE.lineHi}`,
            background: checked ? TONE.paper : "transparent",
          }}
        >
          {checked && <SealDot size={9} color={TONE.bronze} />}
        </span>
        <div className="min-w-0">
          <p className="font-medium truncate" style={{ color: TONE.ink, fontSize: "clamp(1rem, 1.7vw, 1.1rem)" }}>
            {label}
          </p>
          {sub && (
            <p className="mt-0.5 text-sm" style={{ color: TONE.muted }}>
              {sub}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

// ── BigCheckbox ─────────────────────────────────────────────────────────────
export function BigCheckbox({ checked, onChange, label, sub }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full text-left rounded-[18px] px-5 py-4 flex items-start gap-4 transition-all"
      style={{
        background: checked ? TONE.warm : "transparent",
        border: `1px solid ${checked ? TONE.bronze + "66" : TONE.line}`,
      }}
    >
      <span
        className="mt-0.5 shrink-0 flex items-center justify-center rounded-md"
        style={{
          width: 26,
          height: 26,
          background: checked ? TONE.bronze : "transparent",
          border: `1.5px solid ${checked ? TONE.bronze : TONE.lineHi}`,
          transition: "all 0.18s",
        }}
      >
        {checked && (
          <svg width="13" height="10" viewBox="0 0 14 11" fill="none">
            <path d="M1 5.5L5 9.5L13 1" stroke={TONE.paper} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <div>
        <p className="font-medium" style={{ color: TONE.ink, fontSize: "clamp(1rem, 1.6vw, 1.1rem)" }}>
          {label}
        </p>
        {sub && (
          <p className="mt-0.5 text-sm" style={{ color: TONE.muted }}>
            {sub}
          </p>
        )}
      </div>
    </button>
  );
}

// ── KioskSpinner ───────────────────────────────────────────────────────────
// A breathing ensō instead of a rotating ring. Less frantic, more "holding".
export function KioskSpinner({ label = "Loading" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16">
      <div style={{ position: "relative", width: 64, height: 64 }}>
        <EnsoCircle size={64} stroke={1.5} color={TONE.bronze} opacity={0.55} breathing />
      </div>
      <p className="uppercase text-[10px]" style={{ color: TONE.muted, letterSpacing: "0.4em" }}>
        {label}
      </p>
    </div>
  );
}
