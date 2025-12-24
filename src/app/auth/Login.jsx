"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import GoogleSignin from "./GoogleSignin";
import { useLanguage } from "@/hooks/useLanguage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/events";
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Welcome Back",
      continueWithEmail: "Or continue with email",
      email: "Email",
      password: "Password",
      forgotPassword: "Forgot Password?",
      loginButton: "Login",
      loggingIn: "Logging in...",
      errorMessage: "An unexpected error occurred",
    },
    is: {
      title: "Velkomin aftur",
      continueWithEmail: "Eða haltu áfram með tölvupósti",
      email: "Tölvupóstur",
      password: "Lykilorð",
      forgotPassword: "Gleymdirðu lykilorðinu?",
      loginButton: "Innskráning",
      loggingIn: "Skrái inn...",
      errorMessage: "Óvænt villa kom upp",
    },
  };

  const t = translations[language];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: true,
      });
      // No need to manually push/refresh, NextAuth will handle redirect
    } catch (err) {
      console.error("❌ Login failed:", err);
      setError(t.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="max-w-md mx-auto mt-8 p-6 bg-orange-50 rounded-lg shadow-md">
      <motion.h2 className="text-2xl font-bold mb-6 text-center">
        {t.title}
      </motion.h2>

      <GoogleSignin callbackUrl={callbackUrl} />

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-orange-50 px-2 text-gray-500">
            {t.continueWithEmail}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            {t.email}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            {t.password}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
          <div className="mt-2 text-right">
            <a
              href="/auth/forgot-password"
              className="text-sm text-[#ff914d] hover:text-[#e67e3d] transition-colors duration-200"
            >
              {t.forgotPassword}
            </a>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#ff914d] text-black py-2 px-4 rounded-lg"
        >
          {loading ? t.loggingIn : t.loginButton}
        </button>
      </form>
    </motion.div>
  );
}
