"use client";

import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";

export default function ContactForm() {
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

  const translations = {
    en: {
      name: "Name",
      namePlaceholder: "Your name",
      nameRequired: "Name is required",
      nameMinLength: "Name must be at least 2 characters",
      email: "Email",
      emailPlaceholder: "your@email.com",
      emailRequired: "Email is required",
      emailInvalid: "Invalid email address",
      message: "Message",
      messagePlaceholder: "Your message...",
      messageRequired: "Message is required",
      messageMinLength: "Message must be at least 10 characters",
      sending: "Sending...",
      sendMessage: "Send Message",
      successMessage: "Thank you! Your message has been sent successfully. :)",
      errorMessage:
        "Sorry, there was an error sending your message. Please try again or contact us directly.",
    },
    is: {
      name: "Nafn",
      namePlaceholder: "Nafn þitt",
      nameRequired: "Nafn er nauðsynlegt",
      nameMinLength: "Nafn verður að vera að minnsta kosti 2 stafir",
      email: "Netfang",
      emailPlaceholder: "þitt@netfang.is",
      emailRequired: "Netfang er nauðsynlegt",
      emailInvalid: "Ógilt netfang",
      message: "Skilaboð",
      messagePlaceholder: "Skilaboðin þín...",
      messageRequired: "Skilaboð eru nauðsynleg",
      messageMinLength: "Skilaboð verða að vera að minnsta kosti 10 stafir",
      sending: "Sendi...",
      sendMessage: "Senda skilaboð",
      successMessage:
        "Takk fyrir! Skilaboðin þín hafa verið send með góðum árangri. :)",
      errorMessage:
        "Því miður var villa við að senda skilaboðin þín. Vinsamlegast reyndu aftur eða hafðu samband við okkur beint.",
    },
  };

  const t = translations[language];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus({ type: "", message: "" });

    try {
      const response = await fetch("/api/sendgrid/contact-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      setSubmitStatus({
        type: "success",
        message: t.successMessage,
      });
      reset();
    } catch (error) {
      console.error("Error sending email:", error);
      setSubmitStatus({
        type: "error",
        message: t.errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-[2rem] bg-white/80 p-5 shadow-[0_18px_60px_rgba(60,30,10,0.10)] ring-1 ring-[#eadfd2] backdrop-blur-sm sm:p-8"
      >
        <div>
          <label
            htmlFor="name"
            className="mb-2 block pl-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#9a7a62]"
          >
            {t.name}
          </label>
          <input
            {...register("name", {
              required: t.nameRequired,
              minLength: {
                value: 2,
                message: t.nameMinLength,
              },
            })}
            type="text"
            id="name"
            className={`w-full rounded-2xl border px-5 py-4 text-[#2c1810] outline-none transition-all duration-200 placeholder:text-[#b8a998] focus:border-[#ff914d] focus:ring-4 focus:ring-[#ff914d]/15 ${
              errors.name ? "border-red-400 bg-red-50/40" : "border-[#e8ddd3] bg-[#fffaf5]"
            }`}
            placeholder={t.namePlaceholder}
          />
          {errors.name && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-sm text-red-500"
            >
              {errors.name.message}
            </motion.p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block pl-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#9a7a62]"
          >
            {t.email}
          </label>
          <input
            {...register("email", {
              required: t.emailRequired,
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t.emailInvalid,
              },
            })}
            type="email"
            id="email"
            className={`w-full rounded-2xl border px-5 py-4 text-[#2c1810] outline-none transition-all duration-200 placeholder:text-[#b8a998] focus:border-[#ff914d] focus:ring-4 focus:ring-[#ff914d]/15 ${
              errors.email ? "border-red-400 bg-red-50/40" : "border-[#e8ddd3] bg-[#fffaf5]"
            }`}
            placeholder={t.emailPlaceholder}
          />
          {errors.email && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-sm text-red-500"
            >
              {errors.email.message}
            </motion.p>
          )}
        </div>

        <div>
          <label
            htmlFor="message"
            className="mb-2 block pl-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#9a7a62]"
          >
            {t.message}
          </label>
          <textarea
            {...register("message", {
              required: t.messageRequired,
              minLength: {
                value: 10,
                message: t.messageMinLength,
              },
            })}
            id="message"
            rows={6}
            className={`w-full resize-none rounded-2xl border px-5 py-4 text-[#2c1810] outline-none transition-all duration-200 placeholder:text-[#b8a998] focus:border-[#ff914d] focus:ring-4 focus:ring-[#ff914d]/15 ${
              errors.message ? "border-red-400 bg-red-50/40" : "border-[#e8ddd3] bg-[#fffaf5]"
            }`}
            placeholder={t.messagePlaceholder}
          />
          {errors.message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-sm text-red-500"
            >
              {errors.message.message}
            </motion.p>
          )}
        </div>

        {submitStatus.message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`rounded-2xl p-4 text-sm ${
              submitStatus.type === "success"
                ? "bg-green-50 text-green-800 ring-1 ring-green-200"
                : "bg-red-50 text-red-800 ring-1 ring-red-200"
            }`}
          >
            {submitStatus.message}
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className={`w-full rounded-full bg-[#ff914d] px-8 py-4 text-sm font-semibold tracking-wide text-[#1a1410] transition-all duration-200 hover:bg-[#ff914d]/90 ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? t.sending : t.sendMessage}
        </motion.button>
      </motion.form>
    </div>
  );
}
