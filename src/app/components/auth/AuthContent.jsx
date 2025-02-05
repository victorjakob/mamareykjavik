"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Signup from "./Signup";
import Login from "./Login";

function AuthContent() {
  const searchParams = useSearchParams();
  const defaultMode = searchParams.get("mode") === "login" ? "login" : "signup";
  const [authMode, setAuthMode] = useState(defaultMode);

  return (
    <motion.div
      className="min-h-screen mt-32 py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <motion.div
          className="flex justify-center mb-8"
          whileHover={{ scale: 1.02 }}
        >
          <div className="inline-flex rounded-lg border border-gray-200 p-1.5 bg-white shadow-lg">
            <motion.button
              onClick={() => setAuthMode("signup")}
              className={`px-6 py-3 rounded-md text-sm font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff914d] ${
                authMode === "signup"
                  ? "bg-[#ff914d] text-black shadow-md"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
              whileTap={{ scale: 0.95 }}
              aria-pressed={authMode === "signup"}
              aria-label="Switch to signup form"
            >
              Sign Up
            </motion.button>
            <motion.button
              onClick={() => setAuthMode("login")}
              className={`px-6 py-3 rounded-md text-sm font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff914d] ${
                authMode === "login"
                  ? "bg-[#ff914d] text-black shadow-md"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
              whileTap={{ scale: 0.95 }}
              aria-pressed={authMode === "login"}
              aria-label="Switch to login form"
            >
              Login
            </motion.button>
          </div>
        </motion.div>

        <div role="main" aria-label={`${authMode} form`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={authMode}
              initial={{ opacity: 0, x: authMode === "signup" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: authMode === "signup" ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              {authMode === "signup" ? <Signup /> : <Login />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default AuthContent;
