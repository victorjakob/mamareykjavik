"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Signup from "./Signup";
import Login from "./Login";

function AuthContent() {
  const searchParams = useSearchParams();
  const defaultMode = searchParams.get("mode") === "login" ? "login" : "signup";
  const [authMode, setAuthMode] = useState(defaultMode);

  return (
    <div className="min-h-screen mt-32 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border border-gray-200 p-1.5 bg-white shadow-lg">
            <button
              onClick={() => setAuthMode("signup")}
              className={`px-6 py-3 rounded-md text-sm font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                authMode === "signup"
                  ? "bg-blue-600 text-white shadow-md transform scale-105"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
              aria-pressed={authMode === "signup"}
              aria-label="Switch to signup form"
            >
              Sign Up
            </button>
            <button
              onClick={() => setAuthMode("login")}
              className={`px-6 py-3 rounded-md text-sm font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                authMode === "login"
                  ? "bg-blue-600 text-white shadow-md transform scale-105"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
              aria-pressed={authMode === "login"}
              aria-label="Switch to login form"
            >
              Login
            </button>
          </div>
        </div>

        <div role="main" aria-label={`${authMode} form`}>
          {authMode === "signup" ? <Signup /> : <Login />}
        </div>
      </div>
    </div>
  );
}

export default AuthContent;
