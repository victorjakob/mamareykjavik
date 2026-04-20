"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const IMG_BG =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto,w_1920/v1776000793/front-img_pcepoh.heic";
const LOGO_WHITE =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_240,h_280,c_limit,q_auto,f_auto/v1776035352/Mama_white_fj5nfg.png";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-[#f0ebe3] relative overflow-hidden px-6">

      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={IMG_BG}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover scale-105 blur-sm"
        />
        <div className="absolute inset-0 bg-[#0e0b08]/75" />
      </div>

      {/* Ambient orbs */}
      <motion.div
        className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,145,77,0.07) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(201,184,158,0.05) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Giant watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        aria-hidden
      >
        <span
          className="font-cormorant font-light italic text-white/[0.04]"
          style={{ fontSize: "clamp(14rem, 40vw, 32rem)", lineHeight: 1 }}
        >
          404
        </span>
      </div>

      {/* Content */}
      <div className="relative text-center max-w-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <Image
            src={LOGO_WHITE}
            alt="Mama Reykjavik"
            width={64}
            height={64}
            className="object-contain mx-auto opacity-85"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-center gap-3 mb-5"
        >
          <div className="w-8 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#ff914d]">
            Lost in the ether
          </span>
          <div className="w-8 h-px bg-gradient-to-l from-transparent to-[#ff914d]/50" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-5"
          style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)" }}
        >
          This page has wandered off
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-[#8a7e72] text-sm leading-relaxed mb-10 max-w-sm mx-auto"
        >
          The page you were looking for doesn&apos;t exist — but there&apos;s
          plenty of warmth waiting for you back at Mama.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href="/"
            className="px-9 py-3.5 bg-[#ff914d] text-black font-semibold rounded-full text-sm tracking-wide hover:scale-[1.04] hover:bg-[#ff914d]/90 transition-all duration-200 shadow-[0_2px_20px_rgba(255,145,77,0.35)]"
          >
            Back to Mama
          </Link>
          <Link
            href="/events"
            className="px-9 py-3.5 border border-white/20 text-[#f0ebe3] rounded-full text-sm tracking-wide hover:bg-white/10 hover:border-white/35 transition-all duration-200"
          >
            See events
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
