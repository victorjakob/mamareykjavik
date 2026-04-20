"use client";

import Link from "next/link";
import { motion } from "framer-motion";

/** Returns true when we're in the Summer Market "season" (March 1 – August 31) */
export function isSummerMarketSeason() {
  const now = new Date();
  const month = now.getMonth(); // 0 = Jan, 2 = Mar, 5 = June, 7 = August
  return month >= 2 && month <= 7; // March through August
}

export default function SummerMarketCard() {
  return (
    <motion.li
      className="py-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="relative w-full max-w-4xl mx-auto flex items-center gap-5 sm:gap-6 rounded-2xl border border-[#1a1410]/[0.07] bg-gradient-to-br from-white via-[#fffdfb] to-[#faf6f0] px-6 py-6 sm:px-8 sm:py-7 shadow-[0_12px_48px_-20px_rgba(26,20,16,0.12),0_1px_0_rgba(255,255,255,0.9)_inset] transition-[box-shadow,border-color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[#ff914d]/22 hover:shadow-[0_20px_56px_-18px_rgba(255,145,77,0.14),0_1px_0_rgba(255,255,255,0.95)_inset]"
        whileHover={{ y: -3 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <a
          href="https://www.facebook.com/events/1578544503407126/1578544506740459"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#1a1410]/[0.08] bg-white/80 text-[#8a7a6c] shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-[#ff914d]/30 hover:bg-[#ff914d]/[0.06] hover:text-[#ff914d]"
          aria-label="View event on Facebook"
        >
          <svg className="h-[15px] w-[15px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </a>

        <Link href="/summer-market" className="relative flex min-w-0 flex-1 flex-col gap-2.5 text-center sm:text-left sm:pr-16">
          <span className="absolute right-0 top-0 hidden rounded-full border border-[#ff914d]/18 bg-[#ff914d]/[0.07] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[#b85a1c] sm:inline-block">
            Market
          </span>
          <p
            className="font-cormorant font-medium italic leading-[1.2] text-[#1a1410] text-balance"
            style={{ fontSize: "clamp(1.2rem, 2.6vw, 1.55rem)" }}
          >
            Summer Market — June to August
          </p>
          <p className="text-[0.9375rem] font-normal leading-snug tracking-[0.01em] text-[#6b5e52]">
            Fridays – Sundays
          </p>
          <p className="text-[11px] font-normal uppercase tracking-[0.18em] text-[#9a8f85]">
            Indoor market · Free entry · Live music
          </p>
        </Link>
      </motion.div>
    </motion.li>
  );
}
