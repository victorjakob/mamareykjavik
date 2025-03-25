"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { defaultFormValues, formValidation } from "@/util/auth-util";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import GoogleSignin from "./GoogleSignin";

export default function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: defaultFormValues,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data) => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
        }),
      });

      if (!res.ok) {
        const responseData = await res.json();
        throw new Error(responseData.error || "Registration failed");
      }

      // Automatically sign in after successful registration
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      router.push("/profile"); // You can change this to your desired redirect path
      router.refresh();
    } catch (err) {
      console.error("❌ Registration error:", err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="max-w-md mx-auto mt-8 p-6 bg-orange-50 rounded-lg shadow-md">
      <motion.h2 className="text-2xl font-bold mb-6 text-center">
        Create an Account
      </motion.h2>

      <GoogleSignin callbackUrl="/events" />

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-orange-50 px-2 text-gray-500">
            Or sign up with email
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

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Name
          </label>
          <input
            {...register("name", formValidation.name)}
            className="w-full px-3 py-2 border rounded-lg"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            {...register("email", formValidation.email)}
            className="w-full px-3 py-2 border rounded-lg"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <input
            type="password"
            {...register("password", formValidation.password)}
            className="w-full px-3 py-2 border rounded-lg"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register("termsAccepted", formValidation.termsAccepted)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">
              I accept the terms and conditions
            </span>
          </label>
          {errors.termsAccepted && (
            <p className="text-red-500 text-xs mt-1">
              {errors.termsAccepted.message}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register("emailSubscription")}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">
              Subscribe to our newsletter
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#ff914d] text-black py-2 px-4 rounded-lg"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </motion.div>
  );
}
