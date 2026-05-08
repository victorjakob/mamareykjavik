"use client";

/**
 * MarketUi — primitives for the Summer Market page on the new dark theme.
 *
 * Mirrors the design language used in:
 *   - /cacao-prep (CacaoPrepRedesign)
 *   - /whitelotus (WhiteLotusPageRedesign)
 *   - /kornhladan (KornhladanPage)
 *   - HomePageRedesign
 *
 * Palette (Mama warm-ink):
 *   bg base       #1f1712
 *   bg lifted     #291f17
 *   bg deep       #0e0b08
 *   text cream    #f0ebe3
 *   text muted    #a09488
 *   text subtle   #6a5e52
 *   accent orange #ff914d
 *   border        rgba(255,255,255,0.06)
 */

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const EASE = [0.22, 1, 0.36, 1];

// ── FadeUp ────────────────────────────────────────────────────────────────────
export function FadeUp({ children, delay = 0, className = "", y = 24 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Backwards-compatible alias for existing imports.
export const Reveal = FadeUp;

// ── Eyebrow ───────────────────────────────────────────────────────────────────
export function SectionEyebrow({ children, align = "center", className = "" }) {
  if (align === "center") {
    return (
      <FadeUp className={`flex items-center justify-center gap-3 mb-5 ${className}`}>
        <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/45" />
        <span className="text-[10px] uppercase tracking-[0.4em] text-[#ff914d]">
          {children}
        </span>
        <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/45" />
      </FadeUp>
    );
  }
  return (
    <FadeUp className={`flex items-center gap-3 mb-5 ${className}`}>
      <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/45" />
      <span className="text-[10px] uppercase tracking-[0.4em] text-[#ff914d]">
        {children}
      </span>
    </FadeUp>
  );
}

// ── Heading ───────────────────────────────────────────────────────────────────
export function SectionHeading({ children, className = "", align = "center" }) {
  const textAlign = align === "center" ? "text-center mx-auto" : "";
  return (
    <FadeUp delay={0.05}>
      <h2
        className={`font-cormorant font-light italic text-[#f0ebe3] leading-[1.08] max-w-3xl ${textAlign} ${className}`}
        style={{ fontSize: "clamp(2rem, 5vw, 3.6rem)" }}
      >
        {children}
      </h2>
    </FadeUp>
  );
}

// ── CTA Button ────────────────────────────────────────────────────────────────
export function CTAButton({
  href,
  onClick,
  children,
  variant = "primary",
  className = "",
  target,
  rel,
}) {
  const styles =
    variant === "secondary"
      ? "border border-white/25 text-[#f0ebe3] hover:bg-white/10 hover:border-white/55 backdrop-blur-sm"
      : variant === "ghost"
      ? "text-[#a09488] hover:text-[#f0ebe3] hover:underline underline-offset-8 px-2 py-2"
      : "bg-[#ff914d] text-black hover:bg-[#ff914d]/90 shadow-[0_0_32px_rgba(255,145,77,0.32)] font-semibold";

  const base =
    variant === "ghost"
      ? `inline-flex items-center text-sm uppercase tracking-[0.18em] transition-colors duration-200 ${styles} ${className}`
      : `inline-flex items-center justify-center px-8 py-3.5 text-sm tracking-wide rounded-full transition-all duration-200 ${styles} ${className}`;

  const motionProps = {
    whileHover: variant === "ghost" ? {} : { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring", stiffness: 320, damping: 24 },
  };

  if (onClick) {
    return (
      <motion.button type="button" onClick={onClick} className={base} {...motionProps}>
        {children}
      </motion.button>
    );
  }
  return (
    <motion.a href={href} target={target} rel={rel} className={base} {...motionProps}>
      {children}
    </motion.a>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className = "",
  innerClassName = "",
  background = "base",
}) {
  const bg = background === "lifted" ? "bg-[#291f17]" : background === "deep" ? "bg-[#0e0b08]" : "bg-[#1f1712]";
  return (
    <section
      id={id}
      data-navbar-theme="dark"
      className={`relative w-full ${bg} px-6 py-24 md:py-32 ${className}`}
    >
      <div className={`relative z-10 mx-auto max-w-6xl ${innerClassName}`}>
        {(eyebrow || title || description) && (
          <div className="mb-14">
            {eyebrow ? <SectionEyebrow align="center">{eyebrow}</SectionEyebrow> : null}
            {title ? <SectionHeading align="center">{title}</SectionHeading> : null}
            {description ? (
              <FadeUp delay={0.1}>
                <p className="mx-auto mt-6 max-w-2xl text-center text-base sm:text-lg leading-[1.9] text-[#a09488]">
                  {description}
                </p>
              </FadeUp>
            ) : null}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

// ── SoftCard (info card) ──────────────────────────────────────────────────────
export function SoftCard({ title, content, className = "", delay = 0 }) {
  return (
    <FadeUp delay={delay} className="h-full">
      <article
        className={`h-full rounded-2xl p-7 transition-colors duration-300 hover:border-white/12 ${className}`}
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#ff914d]">
          {title}
        </p>
        <div
          className="mt-5 space-y-1.5 font-cormorant font-light text-[#f0ebe3]"
          style={{ fontSize: "clamp(1.05rem, 1.6vw, 1.3rem)" }}
        >
          {content.map((line) => (
            <p key={line} className="leading-snug">
              {line}
            </p>
          ))}
        </div>
      </article>
    </FadeUp>
  );
}

// ── BulletList ────────────────────────────────────────────────────────────────
export function BulletList({ items }) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-[#a09488]">
          <span
            className="mt-3 h-px w-3 flex-none bg-[#ff914d]/65"
            aria-hidden="true"
          />
          <span className="leading-7 text-base">{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ── PhotoCard ─────────────────────────────────────────────────────────────────
export function PhotoCard({
  src,
  alt,
  className = "",
  imgClassName = "",
  priority = false,
  delay = 0,
  sizes,
  withScrim = true,
}) {
  return (
    <FadeUp delay={delay} className={className}>
      <div className="relative h-full w-full overflow-hidden rounded-sm">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes || "(max-width: 768px) 100vw, 50vw"}
          className={`object-cover transition-transform duration-700 hover:scale-[1.03] ${imgClassName}`}
        />
        {withScrim ? (
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-[#1f1712]/55 via-transparent to-transparent"
          />
        ) : null}
      </div>
    </FadeUp>
  );
}

// ── MoodPill (small caption pill) ─────────────────────────────────────────────
export function MoodPill({ children, className = "", delay = 0 }) {
  return (
    <FadeUp
      delay={delay}
      className={`inline-flex items-center rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-[10px] uppercase tracking-[0.32em] text-[#a09488] backdrop-blur-sm ${className}`}
    >
      {children}
    </FadeUp>
  );
}
