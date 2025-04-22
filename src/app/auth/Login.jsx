"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import GoogleSignin from "./GoogleSignin";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials!");
      } else {
        router.push("/events");
        router.refresh();
      }
    } catch (err) {
      console.error("❌ Login failed:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="max-w-md mx-auto mt-8 p-6 bg-orange-50 rounded-lg shadow-md">
      <motion.h2 className="text-2xl font-bold mb-6 text-center">
        Welcome Back
      </motion.h2>

      <GoogleSignin callbackUrl="/events" />

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-orange-50 px-2 text-gray-500">
            Or continue with email
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
            Email
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
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
          <div className="mt-2 text-right">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-[#ff914d] hover:text-[#e67e3d] transition-colors duration-200"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#ff914d] text-black py-2 px-4 rounded-lg"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </motion.div>
  );
}
