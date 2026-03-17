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
      initial={{ opacity: 0, y: 25, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div
        className="relative w-full max-w-4xl mx-auto flex items-center gap-4 rounded-xl border-2 border-[#d4b896] bg-gradient-to-br from-[#faf6f0] to-[#f5ede3] px-5 py-4 hover:border-[#c4a67a] transition-colors"
        whileHover={{
          scale: 1.01,
          boxShadow: "0 8px 20px rgba(94,70,48,0.12)",
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <a
          href="https://www.facebook.com/events/1578544503407126/1578544506740459"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-[#d4b896]/30 text-[#6b5a4a] hover:bg-[#d4b896]/50 transition-colors"
          aria-label="View event on Facebook"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </a>

        <Link href="/summer-market" className="relative flex-1 min-w-0 block text-center sm:text-left">
          <span className="absolute top-3 right-3 hidden rounded-full bg-[#a07c50] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white sm:inline-block">
            Market
          </span>
          <p className="text-base font-semibold text-[#2a1e14]">
            Summer Market — June to August
          </p>
          <p className="mt-1 text-sm text-[#6b5a4a]">Fridays – Sundays</p>
          <p className="mt-0.5 text-sm text-[#6b5a4a]">
            Indoor market · Free entry · Live music
          </p>
        </Link>
      </motion.div>
    </motion.li>
  );
}
