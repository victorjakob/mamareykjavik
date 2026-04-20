"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { signIn } from "next-auth/react";
import GoogleSignin from "./GoogleSignin";
import { useLanguage } from "@/hooks/useLanguage";

const inputClass =
  "w-full px-4 py-3 rounded-xl text-[#f0ebe3] text-sm placeholder-[#6a5e52] outline-none transition-all duration-200 focus:border-[#ff914d]/50";
const inputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)",
};
const labelClass = "block text-[#8a7e72] text-xs uppercase tracking-[0.2em] mb-2";

export default function Login() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const callbackUrl = searchParams.get("callbackUrl") || "/events";
  const { language } = useLanguage();

  const t = {
    en: {
      title: "Welcome Back",
      divider: "or continue with email",
      email: "Email",
      password: "Password",
      forgot: "Forgot password?",
      btn: "Log In",
      btnLoading: "Logging in…",
    },
    is: {
      title: "Velkomin aftur",
      divider: "eða haltu áfram með tölvupósti",
      email: "Tölvupóstur",
      password: "Lykilorð",
      forgot: "Gleymdirðu lykilorðinu?",
      btn: "Innskráning",
      btnLoading: "Skrái inn…",
    },
  }[language] || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn("credentials", { email, password, callbackUrl, redirect: true });
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2
        className="font-cormorant font-light italic text-[#f0ebe3] text-center mb-7"
        style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}
      >
        {t.title}
      </h2>

      <GoogleSignin callbackUrl={callbackUrl} />

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/[0.07]" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 text-[10px] uppercase tracking-[0.25em] text-[#6a5e52]"
            style={{ background: "rgba(14,11,8,0)" }}>
            {t.divider}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl px-4 py-3 mb-5 text-sm text-red-300"
            style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.2)" }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelClass}>{t.email}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelClass}>{t.password}</label>
            <a
              href="/auth/forgot-password"
              className="text-[10px] uppercase tracking-[0.2em] text-[#ff914d]/70 hover:text-[#ff914d] transition-colors duration-200"
            >
              {t.forgot}
            </a>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#ff914d] text-black font-semibold rounded-full text-sm tracking-wide hover:scale-[1.02] hover:bg-[#ff914d]/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_16px_rgba(255,145,77,0.25)] mt-2"
        >
          {loading ? t.btnLoading : t.btn}
        </button>
      </form>
    </div>
  );
}
