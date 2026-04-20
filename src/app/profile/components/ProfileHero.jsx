"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const DEFAULT_HERO_IMAGE =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1600,q_auto,f_auto/v1743445323/iceland2_ncnbog.jpg";
const DEFAULT_HERO_IMAGE_ALT = "Iceland — coastal mountains and black sand shore";

/** Full-bleed cinematic hero — /profile (default) and reused e.g. /events/manager (compact). */
export default function ProfileHero({
  firstName = "Friend",
  title,
  eyebrow = "Welcome back",
  subtitle = "Your Mama space",
  compact = false,
  /** Override background (e.g. White Lotus banner on /whitelotus/rent). */
  imageSrc = DEFAULT_HERO_IMAGE,
  imageAlt = DEFAULT_HERO_IMAGE_ALT,
}) {
  const headline = title ?? firstName;
  const shellClass = compact
    ? "relative h-[38vh] min-h-[260px] max-h-[420px] w-full overflow-hidden"
    : "relative h-[52vh] min-h-[400px] max-h-[600px] w-full overflow-hidden";
  const innerClass = compact
    ? "relative z-[1] flex h-full flex-col items-center justify-end px-6 pb-7 pt-16 text-center"
    : "relative z-[1] flex h-full flex-col items-center justify-end px-6 pb-12 pt-24 text-center";
  const titleSize = compact
    ? "clamp(2rem, 6.5vw, 3.35rem)"
    : "clamp(2.75rem, 10vw, 4.25rem)";

  return (
    <div className={shellClass} data-navbar-theme="dark">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.06 }}
        animate={{ scale: 1.0 }}
        transition={{ duration: 2.2, ease: [0.25, 0.46, 0.45, 0.94] }}
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

      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background: [
            "radial-gradient(ellipse 115% 88% at 50% 46%, rgba(0,0,0,0) 18%, rgba(0,0,0,0.48) 52%, rgba(10,12,18,0.78) 100%)",
            "linear-gradient(180deg, rgba(0,0,0,0.76) 0%, rgba(0,0,0,0.26) 34%, rgba(0,0,0,0.28) 66%, rgba(0,0,0,0.82) 100%)",
            "linear-gradient(90deg, rgba(0,0,0,0.56) 0%, rgba(0,0,0,0) 16%, rgba(0,0,0,0) 84%, rgba(0,0,0,0.56) 100%)",
            "linear-gradient(180deg, rgba(18,22,30,0.17) 0%, transparent 45%, rgba(18,22,30,0.24) 100%)",
          ].join(","),
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.72) 22%, rgba(0,0,0,0.38) 48%, rgba(0,0,0,0.12) 68%, transparent 82%)",
        }}
      />

      <div className={innerClass}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className={compact ? "mb-3 flex items-center justify-center gap-3" : "mb-4 flex items-center justify-center gap-3"}
        >
          <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#ff914d]/70" />
          <span
            className="text-xs font-medium uppercase tracking-[0.4em] text-[#f0ebe3]"
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.85), 0 0 20px rgba(0,0,0,0.45)" }}
          >
            {eyebrow}
          </span>
          <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#ff914d]/70" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="font-cormorant font-light italic leading-tight text-[#f0ebe3] mb-4 whitespace-pre-line [text-shadow:0_2px_24px_rgba(0,0,0,0.55)]"
          style={{ fontSize: titleSize }}
        >
          {headline}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.45 }}
          className={compact ? "mb-2 flex flex-col items-center gap-0" : "mb-3 flex flex-col items-center gap-0"}
        >
          <div className={`${compact ? "h-6" : "h-8"} w-px bg-gradient-to-b from-transparent to-white/20`} />
          <div className={`${compact ? "h-4" : "h-5"} w-px bg-gradient-to-b from-white/20 via-white/40 to-[#ff914d]/60`} />
          <div className="mt-0.5 h-1 w-1 rounded-full bg-[#ff914d]/70" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.55 }}
          className="text-xs uppercase tracking-[0.22em] text-[#d4cfc6]"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.75)" }}
        >
          {subtitle}
        </motion.p>
      </div>
    </div>
  );
}
