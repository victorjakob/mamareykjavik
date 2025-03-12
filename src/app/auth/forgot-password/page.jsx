"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e) => {
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
    <motion.div className=" max-w-md mx-auto mt-32 mb-11 p-6 bg-orange-50 rounded-lg shadow-md">
      <motion.h2 className="text-2xl font-bold mb-6 text-center">
        Forgot Password
      </motion.h2>

      <AnimatePresence>
        {message && (
          <motion.div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleForgotPassword} className="space-y-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#ff914d] text-black py-2 px-4 rounded-lg hover:bg-[#e67e3d] transition-colors duration-200 disabled:bg-[#ffab7d] disabled:cursor-not-allowed"
        >
          {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
        </button>
      </form>
    </motion.div>
  );
}
