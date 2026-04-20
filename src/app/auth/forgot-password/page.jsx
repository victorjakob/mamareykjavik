"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const IMG_BG =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto/v1752238745/ceremonial-cacao-cup_twp40h.jpg";
const LOGO_WHITE =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_240,h_280,c_limit,q_auto,f_auto/v1776035352/Mama_white_fj5nfg.png";

const inputClass =
  "w-full px-4 py-3 rounded-xl text-[#f0ebe3] text-sm placeholder-[#6a5e52] outline-none transition-all duration-200 focus:border-[#ff914d]/50";
const inputStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" };

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0b08] text-[#f0ebe3] relative flex items-center justify-center px-6 py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image src={IMG_BG} alt="" fill priority sizes="100vw" className="object-cover scale-105 blur-sm" />
        <div className="absolute inset-0 bg-[#0e0b08]/85" />
      </div>

      {/* Orb */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,145,77,0.06) 0%, transparent 70%)", filter: "blur(60px)" }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Image src={LOGO_WHITE} alt="Mama Reykjavik" width={52} height={52} className="object-contain mx-auto opacity-85" />
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
            <span className="text-[10px] uppercase tracking-[0.35em] text-[#ff914d]">Account</span>
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-[#ff914d]/50" />
          </div>

          <h1
            className="font-cormorant font-light italic text-[#f0ebe3] text-center mb-3"
            style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}
          >
            Forgot Password?
          </h1>
          <p className="text-[#8a7e72] text-xs text-center leading-relaxed mb-7">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl px-4 py-3 mb-5 text-sm text-emerald-300"
                style={{ background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.18)" }}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[#8a7e72] text-xs uppercase tracking-[0.2em] mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#ff914d] text-black font-semibold rounded-full text-sm tracking-wide hover:scale-[1.02] hover:bg-[#ff914d]/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_16px_rgba(255,145,77,0.25)]"
            >
              {isLoading ? "Sending…" : "Send Reset Link"}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link href="/auth?mode=login" className="text-[10px] uppercase tracking-[0.25em] text-[#6a5e52] hover:text-[#a09488] transition-colors duration-200">
              ← Back to login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
