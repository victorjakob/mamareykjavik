"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      if (newPassword !== confirmPassword) {
        setMessage("Passwords do not match!");
        return;
      }

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      setMessage(data.message);

      if (res.ok) {
        setTimeout(() => router.push("/auth"), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div className="max-w-md mx-auto mt-32 mb-11 p-6 bg-orange-50 shadow-md rounded-lg">
      <motion.h2 className="text-2xl font-bold mb-6 text-center">
        Reset Password
      </motion.h2>

      <AnimatePresence>
        {message && (
          <motion.div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleResetPassword} className="space-y-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            New Password
          </label>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#ff914d] text-black py-2 px-4 rounded-lg hover:bg-[#e67e3d] transition-colors duration-200 disabled:bg-[#ffab7d] disabled:cursor-not-allowed"
        >
          {isLoading ? "Resetting Password..." : "Reset Password"}
        </button>
      </form>
    </motion.div>
  );
}
