"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { defaultFormValues, formValidation } from "@/util/auth-util";
import { motion, AnimatePresence } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import GoogleSignin from "./GoogleSignin";
import { useLanguage } from "@/hooks/useLanguage";

export default function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: defaultFormValues,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/profile";
  const { data: session, status } = useSession();
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Create an Account",
      signUpWithEmail: "Or sign up with email",
      name: "Name",
      email: "Email",
      password: "Password",
      termsAccepted: "I accept the terms and conditions",
      emailSubscription: "Subscribe to our newsletter",
      signUpButton: "Sign Up",
      signingUp: "Signing up...",
      registrationFailed: "Registration failed",
    },
    is: {
      title: "Búðu til reikning",
      signUpWithEmail: "Eða skráðu þig með tölvupósti",
      name: "Nafn",
      email: "Tölvupóstur",
      password: "Lykilorð",
      termsAccepted: "Ég samþykki skilmála og skilyrði",
      emailSubscription: "Gerast áskrifandi að fréttabréfi okkar",
      signUpButton: "Skrá sig",
      signingUp: "Skrái...",
      registrationFailed: "Skráning mistókst",
    },
  };

  const t = translations[language];

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

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
        throw new Error(responseData.error || t.registrationFailed);
      }

      // Automatically sign in after successful registration
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        callbackUrl,
        redirect: true,
      });

      // No need to manually push/refresh, NextAuth will handle redirect
      reset(); // Clear the form fields
    } catch (err) {
      console.error("❌ Registration error:", err);
      setError(err.message || t.registrationFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="max-w-md mx-auto mt-8 p-6 bg-orange-50 rounded-lg shadow-md">
      <motion.h2 className="text-2xl font-bold mb-6 text-center">
        {t.title}
      </motion.h2>

      <GoogleSignin callbackUrl="/events" />

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-orange-50 px-2 text-gray-500">
            {t.signUpWithEmail}
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
            {t.name}
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
            {t.email}
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
            {t.password}
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
            <span className="text-sm text-gray-700">{t.termsAccepted}</span>
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
            <span className="text-sm text-gray-700">{t.emailSubscription}</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#ff914d] text-black py-2 px-4 rounded-lg"
        >
          {loading ? t.signingUp : t.signUpButton}
        </button>
      </form>
    </motion.div>
  );
}
