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
    <div className="max-w-2xl mx-auto px-4 ">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8  p-8 rounded-2xl "
      >
        <div>
          <label
            htmlFor="name"
            className="block text-base font-normal pl-3 text-gray-700 mb-2"
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
            className={`w-full px-5 py-3 border-2 rounded-xl focus:ring-4 focus:ring-[#455318]/20 focus:border-[#455318] outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm ${
              errors.name ? "border-red-500" : "border-gray-200"
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
            className="block text-base font-normal pl-3 text-gray-700 mb-2"
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
            className={`w-full px-5 py-3 border-2 rounded-xl focus:ring-4 focus:ring-[#455318]/20 focus:border-[#455318] outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm ${
              errors.email ? "border-red-500" : "border-gray-200"
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
            className="block text-base font-normal pl-3 text-gray-700 mb-2"
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
            className={`w-full px-5 py-3 border-2 rounded-xl focus:ring-4 focus:ring-[#455318]/20 focus:border-[#455318] outline-none transition-all duration-300 resize-none bg-white/50 backdrop-blur-sm ${
              errors.message ? "border-red-500" : "border-gray-200"
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
            className={`p-4 rounded-xl ${
              submitStatus.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {submitStatus.message}
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: "#698d42" }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-[#455318] text-white py-4 px-8 rounded-xl text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-[#698d42] ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? t.sending : t.sendMessage}
        </motion.button>
      </motion.form>
    </div>
  );
}
