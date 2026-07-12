"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { track } from "@vercel/analytics";

const BOOK_URL = "https://www.dineout.is/mamareykjavik?isolation=true";

export default function BookDeliverLinks({ variant = "dark" }) {
  const isLight = variant === "light";

  return (
    <div
      className={`w-full px-6 pb-24 pt-4 ${isLight ? "bg-[#f9f4ec]" : "bg-[#1a1208]"}`}
    >
      <div className="max-w-2xl mx-auto">
        <div
          className={`h-px bg-gradient-to-r from-transparent to-transparent mb-16 ${
            isLight ? "via-[#1a1410]/12" : "via-[#f0ebe3]/[0.08]"
          }`}
        />

        {/* Fade line ornament */}
        <div className="flex flex-col items-center gap-0 mb-10">
          <div
            className={`w-px h-8 bg-gradient-to-b from-transparent ${
              isLight ? "to-[#1a1410]/18" : "to-white/10"
            }`}
          />
          <div
            className={`w-px h-5 bg-gradient-to-b ${
              isLight
                ? "from-[#1a1410]/18 via-[#1a1410]/28 to-[#ff914d]/55"
                : "from-white/10 via-white/20 to-[#ff914d]/50"
            }`}
          />
          <div className="w-1 h-1 rounded-full bg-[#ff914d]/60 mt-0.5" />
        </div>

        <p
          className={`font-cormorant font-light italic text-center mb-10 leading-tight ${
            isLight ? "text-[#1a1410]" : "text-[#f0ebe3]"
          }`}
          style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)" }}
        >
          Ready to sit down with us?
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* NOTE: no `dt=` prefill — a hardcoded date once shipped here
                and quietly prefilled Dineout with a day in the past. */}
            <Link
              href={BOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                try {
                  track("book_table_click", { location: "book_deliver_links" });
                } catch {}
              }}
              className="inline-flex items-center gap-2 px-7 py-3 bg-[#ff914d] text-black text-sm font-medium tracking-[0.12em] uppercase rounded-full hover:bg-[#ff7a2e] transition-colors duration-200"
            >
              Book a Table
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href="https://wolt.com/en/isl/reykjavik/restaurant/mama-reykjavik"
              target="_blank"
              rel="noopener noreferrer"
              className={
                isLight
                  ? "inline-flex items-center gap-2 px-7 py-3 border border-[#1a1410]/22 text-[#1a1410] text-sm tracking-[0.12em] uppercase rounded-full hover:bg-[#1a1410]/[0.05] hover:border-[#1a1410]/35 transition-all duration-200"
                  : "inline-flex items-center gap-2 px-7 py-3 border border-[#f0ebe3]/25 text-[#f0ebe3] text-sm tracking-[0.12em] uppercase rounded-full hover:bg-[#f0ebe3]/[0.07] hover:border-[#f0ebe3]/40 transition-all duration-200"
              }
            >
              Order Takeaway
            </Link>
          </motion.div>
        </div>

        <p
          className={`text-center text-xs mt-6 ${
            isLight ? "text-[#6b5e52]" : "text-[#7a6a5a]"
          }`}
        >
          Booking opens Dineout, our reservation partner · Prefer to talk?{" "}
          <a
            href="tel:+3547666262"
            className="underline underline-offset-2 hover:text-[#ff914d] transition-colors duration-200 whitespace-nowrap"
          >
            +354 766 6262
          </a>
        </p>

        <p
          className={`text-center text-xs tracking-[0.2em] uppercase mt-8 ${
            isLight ? "text-[#6b5e52]" : "text-[#7a6a5a]"
          }`}
        >
          Looking forward to seeing you at Mama
        </p>
      </div>
    </div>
  );
}
