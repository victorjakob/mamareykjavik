"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";

import AuthForm from "./AuthForm";

function AuthParams({ onModeChange }) {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "login" ? "login" : "signup";

  // Use useEffect to update the mode after initial render
  useEffect(() => {
    onModeChange(mode);
  }, [mode, onModeChange]);

  return null;
}

function AuthContent() {
  const [authMode, setAuthMode] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { language } = useLanguage();

  // If user is already authenticated, redirect to callbackUrl or default
  useEffect(() => {
    if (status === "authenticated" && session) {
      const callbackUrl = searchParams.get("callbackUrl");
      if (callbackUrl) {
        router.replace(decodeURIComponent(callbackUrl));
      } else {
        router.replace("/profile");
      }
    }
  }, [status, session, searchParams, router]);

  const translations = {
    en: {
      logIn: "Log In",
      signUp: "Sign Up",
    },
    is: {
      logIn: "Innskráning",
      signUp: "Nýskráning",
    },
  };

  const t = translations[language];

  const switchMode = (newMode) => {
    // Preserve all query params, just update mode
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("mode", newMode);
    router.push(`/auth?${params.toString()}`);
  };

  return (
    <>
      <AuthParams onModeChange={setAuthMode} />
      {authMode && (
        <main className="auth mt-32 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg p-0.5 bg-orange-100">
              <button
                onClick={() => switchMode("login")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  authMode === "login"
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-orange-600 hover:text-orange-700"
                }`}
              >
                {t.logIn}
              </button>
              <button
                onClick={() => switchMode("signup")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  authMode === "signup"
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-orange-600 hover:text-orange-700"
                }`}
              >
                {t.signUp}
              </button>
            </div>
          </div>
          <AuthForm mode={authMode} />
        </main>
      )}
    </>
  );
}

export default AuthContent;
