"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import AuthForm from "./AuthForm";

const IMG_BG =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto/v1752238745/ceremonial-cacao-cup_twp40h.jpg";

function AuthParams({ onModeChange }) {
  const searchParams = useSearchParams();
  const explicitMode = searchParams.get("mode");
  const callbackUrl = searchParams.get("callbackUrl");
  const mode =
    explicitMode === "login" || explicitMode === "signup"
      ? explicitMode
      : callbackUrl
      ? "login"
      : "signup";

  useEffect(() => { onModeChange(mode); }, [mode, onModeChange]);
  return null;
}

function AuthContent() {
  const [authMode, setAuthMode] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { language } = useLanguage();

  useEffect(() => {
    if (status === "authenticated" && session) {
      const callbackUrl = searchParams.get("callbackUrl");
      router.replace(callbackUrl ? decodeURIComponent(callbackUrl) : "/profile");
    }
  }, [status, session, searchParams, router]);

  const t = {
    en: { logIn: "Log In", signUp: "Sign Up" },
    is: { logIn: "Innskráning", signUp: "Nýskráning" },
  }[language] || { logIn: "Log In", signUp: "Sign Up" };

  const switchMode = (newMode) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("mode", newMode);
    router.push(`/auth?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#0e0b08] text-[#f0ebe3] relative flex items-center justify-center px-6 py-24 overflow-hidden">
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
        <div className="absolute inset-0 bg-[#0e0b08]/85" />
      </div>

      {/* Ambient orb */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,145,77,0.06) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <AuthParams onModeChange={setAuthMode} />

      {authMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md"
        >
          {/* Tab switcher */}
          <div
            className="flex rounded-full p-1 mb-8 mx-auto w-fit"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {["login", "signup"].map((mode) => (
              <button
                key={mode}
                onClick={() => switchMode(mode)}
                className="relative px-7 py-2 rounded-full text-sm font-medium transition-all duration-300"
                style={{
                  background: authMode === mode ? "#ff914d" : "transparent",
                  color: authMode === mode ? "#000" : "#a09488",
                }}
              >
                {mode === "login" ? t.logIn : t.signUp}
              </button>
            ))}
          </div>

          {/* Form card */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
            }}
          >
            <AuthForm mode={authMode} />
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default AuthContent;
