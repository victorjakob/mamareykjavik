"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function MenuHero() {
  return (
    <div className="relative h-[78vh] min-h-[520px] w-full overflow-hidden">
      {/* Background image — Ken Burns zoom-out */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.07 }}
        animate={{ scale: 1.0 }}
        transition={{ duration: 2.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Image
          src="https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1600,q_auto,f_auto/v1762326608/dahl_aumxpm.jpg"
          alt="Mama Reykjavik food"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      {/* Deep cinematic vignette — match events hero (black + slight cool edge) */}
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
      {/* Bottom fade — black only (hands off to cream section below the hero) */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.72) 12%, rgba(0,0,0,0.28) 36%, transparent 64%)",
        }}
      />

      {/* Content — anchored to bottom like events page */}
      <div className="relative h-full flex flex-col items-center justify-end pb-14 px-6 text-center">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-3 mb-5"
        >
          <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
          <span className="text-xs uppercase tracking-[0.4em] text-[#ff914d]">Mama Reykjavík</span>
          <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/50" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-5"
          style={{ fontSize: "clamp(3rem, 8vw, 5.5rem)" }}
        >
          The Menu
        </motion.h1>

        {/* Fade-line ornament */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col items-center gap-0 mb-4"
        >
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-white/20" />
          <div className="w-px h-5 bg-gradient-to-b from-white/20 via-white/40 to-[#ff914d]/60" />
          <div className="w-1 h-1 rounded-full bg-[#ff914d]/70 mt-0.5" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-[#7a6a5a] text-xs tracking-[0.22em] uppercase"
        >
          served all day, every day
        </motion.p>
      </div>
    </div>
  );
}
