"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import TiltHover3D from "@/app/components/ui/TiltHover3D";

const MARKET_IMAGE =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto/v1773298882/439272940_7763780680338594_8587813285967019389_n_y6jy7u.jpg";

/** Returns true when we're in the Summer Market "season" (March 1 – August 31) */
export function isSummerMarketSeason() {
  const now = new Date();
  const month = now.getMonth(); // 0 = Jan, 2 = Mar, 5 = June, 7 = August
  return month >= 2 && month <= 7; // March through August
}

export default function SummerMarketCard() {
  return (
    <motion.li
      initial={{ opacity: 0, y: 25, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Link href="/summer-market" className="block group">
        <motion.div
          className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row gap-5 py-6 sm:py-7"
          whileHover={{ y: -3 }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        >
          {/* Image — matches the regular event cards */}
          <TiltHover3D
            className="w-full sm:w-72 shrink-0"
            innerClassName="group/image relative aspect-[16/9] overflow-hidden rounded-lg shadow-[0_14px_44px_-16px_rgba(26,20,16,0.28)]"
          >
            <Image
              src={MARKET_IMAGE}
              alt="White Lotus Summer Market"
              fill
              sizes="(max-width: 640px) 100vw, 288px"
              className="object-cover"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/image:opacity-100"
              style={{ transform: "translateZ(0.1px)" }}
            />
            {/* Ongoing badge */}
            <span
              className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#b85a1c] shadow-sm backdrop-blur-sm"
              style={{ transform: "translateZ(0.1px)" }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff914d] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#ff914d]" />
              </span>
              Ongoing
            </span>
          </TiltHover3D>

          {/* Text content */}
          <div className="flex-1 flex flex-col justify-between text-center sm:text-left">
            <div>
              <h3 className="font-cormorant text-[1.55rem] sm:text-[clamp(1.3rem,3vw,1.75rem)] font-semibold sm:font-medium italic text-[#1a1410] leading-[1.02] sm:leading-tight tracking-[-0.015em] mb-2">
                Summer Market
              </h3>
              <p className="text-sm text-[#5a4a3a] leading-relaxed mb-3 line-clamp-2">
                A warm indoor weekend market with handmade pieces, wellness goods,
                beautiful objects, and ambient live music.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              {/* Dates, then time */}
              <div className="space-y-1">
                <p className="text-xs font-medium tracking-[0.14em] text-[#1a1410]/80">
                  June – July · Fridays – Sundays
                </p>
                <p className="text-xs uppercase tracking-[0.18em] text-[#6b5e52]">
                  13:00 – 19:00
                </p>
              </div>

              {/* Info */}
              <div className="text-sm sm:text-right">
                <p className="font-medium text-[#ff914d]">Free entry</p>
                <p className="text-xs text-[#6b5e52]">Indoor market · Live music</p>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.li>
  );
}
