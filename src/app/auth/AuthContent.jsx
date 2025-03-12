"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

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

  const switchMode = (newMode) => {
    router.push(`/auth?mode=${newMode}`);
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
                Log In
              </button>
              <button
                onClick={() => switchMode("signup")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  authMode === "signup"
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-orange-600 hover:text-orange-700"
                }`}
              >
                Sign Up
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
