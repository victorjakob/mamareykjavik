"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";

const IMG_BG =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto/v1752238745/ceremonial-cacao-cup_twp40h.jpg";
const LOGO_WHITE =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_240,h_280,c_limit,q_auto,f_auto/v1776035352/Mama_white_fj5nfg.png";

const inputClass =
  "w-full px-4 py-3 rounded-xl text-[#f0ebe3] text-sm placeholder-[#6a5e52] outline-none transition-all duration-200 focus:border-[#ff914d]/50";
const inputStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" };

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);
    try {
      if (newPassword !== confirmPassword) {
        setIsError(true);
        setMessage("Passwords do not match.");
        return;
      }
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      setIsError(!res.ok);
      setMessage(data.message);
      if (res.ok) setTimeout(() => router.push("/auth"), 2000);
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
            className="font-cormorant font-light italic text-[#f0ebe3] text-center mb-7"
            style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}
          >
            Reset Password
          </h1>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl px-4 py-3 mb-5 text-sm"
                style={
                  isError
                    ? { background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.2)", color: "#fca5a5" }
                    : { background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.18)", color: "#6ee7b7" }
                }
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[#8a7e72] text-xs uppercase tracking-[0.2em] mb-2">New Password</label>
              <input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-[#8a7e72] text-xs uppercase tracking-[0.2em] mb-2">Confirm Password</label>
              <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputClass} style={inputStyle} />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#ff914d] text-black font-semibold rounded-full text-sm tracking-wide hover:scale-[1.02] hover:bg-[#ff914d]/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_16px_rgba(255,145,77,0.25)]"
            >
              {isLoading ? "Resetting…" : "Reset Password"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
