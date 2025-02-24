"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { defaultFormValues, signUpUser } from "@/util/auth-util";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabase } from "@/lib/SupabaseProvider";

export default function Signup() {
  const { supabase } = useSupabase();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: defaultFormValues,
  });

  const onSubmit = async (data) => {
    setError(null);
    setLoading(true);

    try {
      await signUpUser({
        email: data.email,
        password: data.password,
        name: data.name,
        emailSubscription: data.emailSubscription,
        termsAccepted: data.termsAccepted,
      });

      router.push("/");
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="max-w-md mx-auto mt-8 p-6 bg-orange-50 rounded-lg shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        className="text-2xl font-bold mb-6 text-center"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        Create an Account
      </motion.h2>

      <AnimatePresence>
        {error && (
          <motion.div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)}>
        <motion.div
          className="mb-4"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Name
          </label>
          <input
            {...register("name", {
              required: "Name is required",
            })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff914d]"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </motion.div>

        <motion.div
          className="mb-4"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff914d]"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </motion.div>

        <motion.div
          className="mb-6"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <input
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff914d]"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </motion.div>

        <motion.div
          className="mb-4"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register("emailSubscription")}
              className="mr-2 focus:ring-[#ff914d] focus:ring-offset-0"
            />
            <span className="text-sm text-gray-600">
              Subscribe to our newsletter
            </span>
          </label>
        </motion.div>

        <motion.div
          className="mb-6"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register("termsAccepted", {
                required: "You must accept the terms of service",
              })}
              className="mr-2 focus:ring-[#ff914d] focus:ring-offset-0"
            />
            <span className="text-sm text-gray-600">
              I accept the terms of service
            </span>
          </label>
          {errors.termsAccepted && (
            <p className="text-red-500 text-xs mt-1">
              {errors.termsAccepted.message}
            </p>
          )}
        </motion.div>

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full bg-[#ff914d] text-black py-2 px-4 rounded-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff914d]"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </motion.button>
      </form>
    </motion.div>
  );
}
