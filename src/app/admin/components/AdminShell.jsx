"use client";

/**
 * Shared admin chrome — used by every subpage under /admin/*
 *
 * AdminShell       — outer page wrapper. Children are split automatically:
 *                    the first AdminHero/AdminHeader (if present) renders
 *                    full-width (breaking out of the max-width column), and
 *                    everything else is wrapped in a centred content column.
 * AdminHero        — full-width dark espresso band. Carries
 *                    `data-navbar-theme="dark"` so the white site navbar
 *                    stays legible. Holds eyebrow + cormorant title +
 *                    subtitle + optional Back button / action.
 * AdminHeader      — alias of AdminHero (backward compatibility).
 * AdminPanel       — white card with a soft orange top accent.
 * AdminStatCard    — metric card.
 * AdminDivider     — hairline gradient divider.
 * AdminPillButton  — small pill-style filter/tab button.
 *
 * Palette (keep in sync with /admin/page.jsx tile dashboard):
 *   #2c1810  primary text           (warm espresso)
 *   #9a7a62  muted text / captions
 *   #ff914d  orange accent (primary)
 *   #ffb06a  orange secondary
 *   #faf6f2  soft sand surface
 *   #e8ddd3  hairline border
 *   #f0e6d8  stronger border
 *   #1c1208 / #221508 / #281a0c  dark espresso gradient (hero band)
 */

import { Children, isValidElement } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];
const CREAM_BG = "#f9f4ec";

// Same cinematic background as /admin's ProfileHero.
const HERO_IMAGE =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1600,q_auto,f_auto/v1743445323/iceland2_ncnbog.jpg";
const HERO_IMAGE_ALT = "Iceland — coastal mountains and black sand shore";

/* ── Outer frame — auto-splits the first AdminHero from the rest so the hero
 *    can break out to full-width while content is centred in a max-width column.
 *
 *    When AdminShell is rendered from a Server Component, `child.type.__isAdminHero`
 *    is not always reliable after the RSC boundary — pass `hero={<AdminHeader…/>}`
 *    explicitly so the band stays full-bleed to the top. */
export function AdminShell({ children, maxWidth = "max-w-6xl", className = "", hero = null }) {
  const arr = Children.toArray(children);
  let heroNode = hero;
  const rest = [];
  if (heroNode != null) {
    for (const child of arr) {
      rest.push(child);
    }
  } else {
    for (const child of arr) {
      if (!heroNode && isValidElement(child) && child.type && child.type.__isAdminHero) {
        heroNode = child;
      } else {
        rest.push(child);
      }
    }
  }
  return (
    <div
      className="min-h-screen pb-24 overflow-x-hidden"
      style={{ background: CREAM_BG }}
    >
      {heroNode}
      <div className={`${maxWidth} mx-auto px-5 pt-10 ${className}`}>{rest}</div>
    </div>
  );
}

/* ── Cinematic Iceland-image hero band — same background as /admin.
 *    Carries `data-navbar-theme="dark"` so the white site navbar is legible. */
export function AdminHero({
  eyebrow = "Admin",
  title,
  subtitle,
  backHref = "/admin",
  backLabel = "Back",
  action = null,
  /** "compact" for dense pages, "regular" (default) otherwise. */
  size = "regular",
  /** Override the hero background image (same contract as ProfileHero). */
  imageSrc = HERO_IMAGE,
  imageAlt = HERO_IMAGE_ALT,
}) {
  const shellClass =
    size === "compact"
      ? "relative w-screen left-1/2 -translate-x-1/2 overflow-hidden flex flex-col items-center justify-end text-center h-[38vh] min-h-[320px] max-h-[460px] pt-24 pb-10 sm:pt-28 sm:pb-12"
      : "relative w-screen left-1/2 -translate-x-1/2 overflow-hidden flex flex-col items-center justify-end text-center h-[52vh] min-h-[420px] max-h-[600px] pt-24 pb-12 sm:pt-28 sm:pb-16";

  const titleSize =
    size === "compact"
      ? "clamp(2.25rem, 6vw, 3.6rem)"
      : "clamp(2.75rem, 8vw, 4.75rem)";

  return (
    <div className={shellClass} data-navbar-theme="dark">
      {/* Cinematic background image — subtle zoom-in on mount */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.06 }}
        animate={{ scale: 1.0 }}
        transition={{ duration: 2.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        aria-hidden
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      {/* Layered darkening + edge vignettes (matches ProfileHero treatment) */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background: [
            "radial-gradient(ellipse 115% 88% at 50% 46%, rgba(0,0,0,0) 18%, rgba(0,0,0,0.48) 52%, rgba(10,12,18,0.78) 100%)",
            "linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.28) 34%, rgba(0,0,0,0.32) 66%, rgba(0,0,0,0.82) 100%)",
            "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 82%, rgba(0,0,0,0.55) 100%)",
          ].join(","),
        }}
      />
      {/* Warm orange ambient wash — ties the image to the brand palette */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 85% at 6% 0%, rgba(255,145,77,0.18) 0%, transparent 55%), radial-gradient(ellipse 80% 85% at 100% 100%, rgba(255,176,106,0.12) 0%, transparent 60%)",
        }}
      />
      {/* Stronger bottom fade so text sits on darkness */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            "linear-gradient(to top, rgba(10,6,2,0.88) 0%, rgba(10,6,2,0.55) 30%, rgba(10,6,2,0.22) 58%, transparent 82%)",
        }}
      />
      {/* Top warm hairline */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(255,145,77,0.35), transparent)",
        }}
      />

      {/* Everything inside the hero is centred horizontally + bottom-aligned
          vertically (matches the /profile hero). Back → eyebrow → title →
          subtitle → action stack straight down the middle. */}
      <div className="relative z-[1] w-full max-w-4xl mx-auto px-5 sm:px-8 flex flex-col items-center">
        {backHref ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="mb-6 flex justify-center"
          >
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] tracking-[0.15em] uppercase transition-all hover:border-[#ff914d]/60"
              style={{
                background: "rgba(0,0,0,0.35)",
                border: "1px solid rgba(255,145,77,0.4)",
                color: "#f0ebe3",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              <ArrowLeft className="w-3.5 h-3.5" style={{ color: "#ffb06a" }} />
              <span>{backLabel}</span>
            </Link>
          </motion.div>
        ) : null}

        {eyebrow ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05, ease: EASE }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <span
              className="h-px w-10"
              style={{
                background:
                  "linear-gradient(to right, transparent, #ff914d)",
              }}
            />
            <span
              className="text-[11px] uppercase tracking-[0.42em] font-semibold"
              style={{
                color: "#ffb06a",
                textShadow:
                  "0 1px 2px rgba(0,0,0,0.85), 0 0 20px rgba(0,0,0,0.45)",
              }}
            >
              {eyebrow}
            </span>
            <span
              className="h-px w-10"
              style={{
                background:
                  "linear-gradient(to left, transparent, #ff914d)",
              }}
            />
          </motion.div>
        ) : null}

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.14, ease: EASE }}
          className="font-cormorant italic font-light leading-[1.02] text-[#f7efe4] text-center max-w-4xl"
          style={{
            fontSize: titleSize,
            textShadow:
              "0 2px 24px rgba(0,0,0,0.65), 0 0 80px rgba(0,0,0,0.3)",
          }}
        >
          {title}
        </motion.h1>

        {subtitle ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="mt-4 text-[#e4d8c9] text-sm sm:text-base max-w-2xl mx-auto text-center leading-relaxed"
            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.75)" }}
          >
            {subtitle}
          </motion.p>
        ) : null}

        {action ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22, ease: EASE }}
            className="mt-6 flex flex-wrap items-center justify-center gap-2"
          >
            {action}
          </motion.div>
        ) : null}
      </div>

      {/* Bottom warm accent */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, transparent 8%, rgba(255,145,77,0.75) 50%, transparent 92%)",
        }}
      />
      {/* Soft cream fade into content */}
      <div
        className="absolute -bottom-px left-0 right-0 h-10 pointer-events-none"
        aria-hidden
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(249,244,236,0.55))",
        }}
      />
    </div>
  );
}
AdminHero.__isAdminHero = true;

/** Backward-compatible alias — earlier subpages import AdminHeader. */
export const AdminHeader = AdminHero;

export function AdminPanel({
  title,
  subtitle,
  icon: Icon,
  headerAction = null,
  accent = "rgba(255,145,77,0.4)",
  padded = true,
  className = "",
  children,
}) {
  return (
    <div
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{
        background: "#ffffff",
        border: "1.5px solid #f0e6d8",
        boxShadow: "0 2px 14px rgba(60,30,10,0.07)",
      }}
    >
      <div
        className="h-[1.5px]"
        style={{ background: `linear-gradient(to right, ${accent}, transparent 60%)` }}
      />

      {(title || Icon) ? (
        <div className="px-5 py-4 border-b border-[#e8ddd3] flex items-center gap-3">
          {Icon ? (
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,145,77,0.14)" }}
            >
              <Icon className="h-4 w-4 text-[#ff914d]" strokeWidth={1.5} />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            {title ? (
              <p className="text-[#2c1810] text-sm font-semibold leading-tight">
                {title}
              </p>
            ) : null}
            {subtitle ? (
              <p className="text-[#9a7a62] text-xs mt-0.5">{subtitle}</p>
            ) : null}
          </div>
          {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
        </div>
      ) : null}

      <div className={padded ? "p-5" : ""}>{children}</div>
    </div>
  );
}

export function AdminStatCard({
  label,
  value,
  hint,
  icon: Icon,
  highlight = false,
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: EASE }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: "#ffffff",
        border: "1.5px solid #f0e6d8",
        boxShadow: "0 2px 14px rgba(60,30,10,0.07)",
      }}
    >
      <div
        className="h-[1.5px]"
        style={{
          background:
            "linear-gradient(to right, rgba(255,145,77,0.4), transparent 60%)",
        }}
      />
      <div className="p-5">
        <div className="flex items-start gap-3">
          {Icon ? (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,145,77,0.14)" }}
            >
              <Icon className="h-4 w-4 text-[#ff914d]" strokeWidth={1.5} />
            </div>
          ) : null}
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#9a7a62]">
              {label}
            </p>
            <p
              className={`font-cormorant italic text-3xl font-light mt-1 leading-none ${
                highlight ? "text-[#ff914d]" : "text-[#2c1810]"
              }`}
            >
              {value}
            </p>
            {hint ? (
              <p className="mt-2 text-xs text-[#9a7a62]">{hint}</p>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function AdminDivider({ className = "mb-8" }) {
  return (
    <div
      className={`h-px ${className}`}
      style={{
        background:
          "linear-gradient(to right, rgba(255,145,77,0.2), transparent)",
      }}
    />
  );
}

/** Small pill-style filter/tab button used by admin pages. */
export function AdminPillButton({ active = false, onClick, children, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="rounded-full px-4 py-2 text-xs font-semibold transition-colors"
      style={
        active
          ? {
              background: "#ff914d",
              color: "#ffffff",
              boxShadow: "0 2px 10px rgba(255,145,77,0.28)",
            }
          : {
              background: "#faf6f2",
              color: "#9a7a62",
              border: "1px solid #e8ddd3",
            }
      }
    >
      {children}
    </button>
  );
}

export default AdminShell;
