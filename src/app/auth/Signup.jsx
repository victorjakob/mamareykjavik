"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { defaultFormValues, formValidation } from "@/util/auth-util";
import { AnimatePresence, motion } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import GoogleSignin from "./GoogleSignin";
import { useLanguage } from "@/hooks/useLanguage";

const inputClass =
  "w-full px-4 py-3 rounded-xl text-[#f0ebe3] text-sm placeholder-[#6a5e52] outline-none transition-all duration-200 focus:border-[#ff914d]/50";
const inputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)",
};
const labelClass = "block text-[#8a7e72] text-xs uppercase tracking-[0.2em] mb-2";

export default function Signup() {
  const searchParams = useSearchParams();
  const invitedEmail = searchParams.get("email") || "";
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: defaultFormValues,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/profile";
  const { status } = useSession();
  const { language } = useLanguage();

  const t = {
    en: {
      title: "Create an Account",
      divider: "or sign up with email",
      name: "Name",
      email: "Email",
      password: "Password",
      terms: "I accept the terms and conditions",
      newsletter: "Subscribe to our newsletter",
      btn: "Sign Up",
      btnLoading: "Signing up…",
      failed: "Registration failed",
    },
    is: {
      title: "Búðu til reikning",
      divider: "eða skráðu þig með tölvupósti",
      name: "Nafn",
      email: "Tölvupóstur",
      password: "Lykilorð",
      terms: "Ég samþykki skilmála og skilyrði",
      newsletter: "Gerast áskrifandi að fréttabréfi okkar",
      btn: "Skrá sig",
      btnLoading: "Skrái…",
      failed: "Skráning mistókst",
    },
  }[language] || {};

  useEffect(() => { if (status === "authenticated") router.replace(callbackUrl); }, [status, router, callbackUrl]);
  useEffect(() => { if (invitedEmail) reset({ ...defaultFormValues, email: invitedEmail }); }, [invitedEmail, reset]);

  const onSubmit = async (data) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password, name: data.name }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || t.failed);
      }
      await signIn("credentials", { email: data.email, password: data.password, callbackUrl, redirect: true });
      reset();
    } catch (err) {
      setError(err.message || t.failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2
        className="font-cormorant font-light italic text-[#f0ebe3] text-center mb-7"
        style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}
      >
        {t.title}
      </h2>

      <GoogleSignin callbackUrl="/events" />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/[0.07]" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 text-[10px] uppercase tracking-[0.25em] text-[#6a5e52]">
            {t.divider}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl px-4 py-3 mb-5 text-sm text-red-300"
            style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.2)" }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className={labelClass}>{t.name}</label>
          <input {...register("name", formValidation.name)} placeholder="Your name" className={inputClass} style={inputStyle} />
          {errors.name && <p className="text-red-400/80 text-xs mt-1.5">{errors.name.message}</p>}
        </div>

        <div>
          <label className={labelClass}>{t.email}</label>
          <input {...register("email", formValidation.email)} placeholder="you@example.com" className={inputClass} style={inputStyle} />
          {errors.email && <p className="text-red-400/80 text-xs mt-1.5">{errors.email.message}</p>}
        </div>

        <div>
          <label className={labelClass}>{t.password}</label>
          <input type="password" {...register("password", formValidation.password)} placeholder="••••••••" className={inputClass} style={inputStyle} />
          {errors.password && <p className="text-red-400/80 text-xs mt-1.5">{errors.password.message}</p>}
        </div>

        <div className="space-y-3 pt-1">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" {...register("termsAccepted", formValidation.termsAccepted)}
              className="mt-0.5 accent-[#ff914d] flex-shrink-0" />
            <span className="text-xs text-[#8a7e72] leading-relaxed">{t.terms}</span>
          </label>
          {errors.termsAccepted && <p className="text-red-400/80 text-xs">{errors.termsAccepted.message}</p>}

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" {...register("emailSubscription")}
              className="mt-0.5 accent-[#ff914d] flex-shrink-0" />
            <span className="text-xs text-[#8a7e72] leading-relaxed">{t.newsletter}</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#ff914d] text-black font-semibold rounded-full text-sm tracking-wide hover:scale-[1.02] hover:bg-[#ff914d]/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_16px_rgba(255,145,77,0.25)] mt-1"
        >
          {loading ? t.btnLoading : t.btn}
        </button>
      </form>
    </div>
  );
}
