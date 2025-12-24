"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useLanguage } from "@/hooks/useLanguage";
import {
  CalendarDaysIcon,
  UserIcon,
  EnvelopeIcon,
  UsersIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between gap-3">
        <label className="text-sm font-medium text-gray-900">{label}</label>
        {error ? (
          <span className="text-xs font-medium text-red-600">{error}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function Input({
  label,
  name,
  type = "text",
  register,
  required,
  placeholder,
  error,
  icon: Icon,
}) {
  return (
    <Field label={label} error={error}>
      <div className="relative">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        ) : null}

        <input
          type={type}
          {...register(name, { required })}
          placeholder={placeholder}
          className={[
            "w-full rounded-xl border bg-white/80 backdrop-blur px-4 py-3 text-gray-900 placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-[#ff914d]/60 focus:border-transparent",
            "transition",
            Icon ? "pl-11" : "",
            error ? "border-red-300 ring-1 ring-red-200" : "border-black/10",
          ].join(" ")}
        />
      </div>
    </Field>
  );
}

function Textarea({ label, name, register, placeholder, rows = 5, error }) {
  return (
    <Field label={label} error={error}>
      <textarea
        {...register(name)}
        rows={rows}
        placeholder={placeholder}
        className={[
          "w-full rounded-xl border bg-white/80 backdrop-blur px-4 py-3 text-gray-900 placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-[#ff914d]/60 focus:border-transparent",
          "transition resize-y",
          error ? "border-red-300 ring-1 ring-red-200" : "border-black/10",
        ].join(" ")}
      />
    </Field>
  );
}

export default function FormWL() {
  const { language } = useLanguage();
  const reduceMotion = useReducedMotion();

  const [startDate, setStartDate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

  const translations = {
    en: {
      title: "Rent White Lotus Venue",
      description:
        "Transform your event into an unforgettable experience at White Lotus. Fill out the form below and let us help bring your vision to life.",
      name: "Name",
      namePlaceholder: "Your full name",
      email: "Email",
      emailPlaceholder: "you@example.com",
      eventType: "Event Type",
      eventTypePlaceholder:
        "e.g. Dance, Concert, Private Event, Birthday Party",
      dateTime: "Date & Time",
      dateTimePlaceholder: "Select date and time",
      guestCount: "Expected Guest Count",
      guestCountPlaceholder: "Number of guests",
      additionalDetails: "Additional Details",
      additionalDetailsPlaceholder:
        "Tell us more about your event, special requirements, or any questions you have...",
      sending: "Sending...",
      submitInquiry: "Submit Inquiry",
      successMessage: "Thank you! Your inquiry has been sent successfully.",
      errorMessage:
        "Sorry, there was an error sending your inquiry. Please try again or contact us directly.",
      needAssistance: "Need immediate assistance? Call us at",
    },
    is: {
      title: "Leigðu White Lotus salinn",
      description:
        "Umbreyttu viðburðinum þínum í ógleymanlega upplifun hjá White Lotus. Fylltu út formið hér að neðan og leyfðu okkur að hjálpa þér að gera sýn þína að veruleika.",
      name: "Nafn",
      namePlaceholder: "Fullt nafn þitt",
      email: "Netfang",
      emailPlaceholder: "þú@example.com",
      eventType: "Tegund viðburðar",
      eventTypePlaceholder:
        "t.d. Dansleikur, Tónleikar, Einkaviðburður, Afmæli",
      dateTime: "Dagsetning og tími",
      dateTimePlaceholder: "Veldu dagsetningu og tíma",
      guestCount: "Áætlaður gestafjöldi",
      guestCountPlaceholder: "Fjöldi gesta",
      additionalDetails: "Aðrar upplýsingar",
      additionalDetailsPlaceholder:
        "Segðu okkur meira um viðburðinn þinn, sérstakar óskir eða spurningar sem þú hefur...",
      sending: "Sendi...",
      submitInquiry: "Senda fyrirspurn",
      successMessage:
        "Takk fyrir! Fyrirspurnin þín hefur verið send með góðum árangri.",
      errorMessage:
        "Því miður kom upp villa við að senda fyrirspurnina þína. Vinsamlegast reyndu aftur eða hafðu samband við okkur beint.",
      needAssistance: "Þarftu aðstoð strax? Hringdu í okkur í síma",
    },
  };

  const t = translations[language] || translations.en;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
  });

  const motionProps = useMemo(() => {
    if (reduceMotion) {
      return {
        initial: false,
        animate: undefined,
        whileInView: undefined,
        transition: undefined,
      };
    }
    return {};
  }, [reduceMotion]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus({ type: "", message: "" });

    try {
      const formData = {
        ...data,
        timeAndDate: startDate ? startDate.toLocaleString() : null,
      };

      const response = await fetch("/api/sendgrid/email-wl-rent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to send email");

      setSubmitStatus({ type: "success", message: t.successMessage });
      reset();
      setStartDate(null);
    } catch (err) {
      console.error("Error sending email:", err);
      setSubmitStatus({ type: "error", message: t.errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative pt-28 sm:pt-28 md:pt-32 pb-14 sm:pb-16 px-4 sm:px-6 lg:px-8">
      {/* subtle lux top line (no background blocks, just a whisper) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-black/10 to-transparent" />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 backdrop-blur px-4 py-2 text-xs tracking-[0.18em] uppercase text-gray-700">
            <SparklesIcon className="w-4 h-4 text-gray-700/80" />
            White Lotus
          </div>

          <h1 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-gray-900">
            {t.title}
          </h1>

          <p className="mt-4 max-w-2xl text-base sm:text-lg text-gray-600 mx-auto">
            {t.description}
          </p>

          <div className="mt-6 h-[2px] w-28 mx-auto bg-gradient-to-r from-transparent via-black/20 to-transparent rounded-full" />
        </div>

        {/* Status banner */}
        <AnimatePresence>
          {submitStatus.message ? (
            <motion.div
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={[
                "mb-6 rounded-2xl border px-5 py-4 text-center backdrop-blur",
                submitStatus.type === "success"
                  ? "border-green-200 bg-green-50/70 text-green-800"
                  : "border-red-200 bg-red-50/70 text-red-800",
              ].join(" ")}
            >
              {submitStatus.message}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Form shell */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.08)] overflow-hidden"
        >
          <div className="p-5 sm:p-8 md:p-10">
            {/* little section label */}
            <div className="flex items-center justify-between gap-3 mb-7">
              <div className="text-sm font-semibold text-gray-900">
                Inquiry details
              </div>
              <div className="text-xs text-gray-500">
                Usually responds within 24–48 hours
              </div>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5 sm:space-y-6"
            >
              {/* Identity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <Input
                  label={t.name}
                  name="name"
                  register={register}
                  required
                  placeholder={t.namePlaceholder}
                  error={errors.name ? "Required" : ""}
                  icon={UserIcon}
                />
                <Input
                  label={t.email}
                  name="email"
                  type="email"
                  register={register}
                  required
                  placeholder={t.emailPlaceholder}
                  error={errors.email ? "Required" : ""}
                  icon={EnvelopeIcon}
                />
              </div>

              {/* Event */}
              <Input
                label={t.eventType}
                name="event"
                register={register}
                required
                placeholder={t.eventTypePlaceholder}
                error={errors.event ? "Required" : ""}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {/* Date */}
                <Field
                  label={t.dateTime}
                  error={!startDate && isSubmitting ? "Required" : ""}
                >
                  <div className="relative">
                    <CalendarDaysIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      showTimeSelect
                      dateFormat="MMMM d, yyyy h:mm aa"
                      minDate={new Date()}
                      placeholderText={t.dateTimePlaceholder}
                      className={[
                        "w-full rounded-xl border bg-white/80 backdrop-blur px-4 py-3 text-gray-900 placeholder:text-gray-400",
                        "focus:outline-none focus:ring-2 focus:ring-[#ff914d]/60 focus:border-transparent transition",
                        "pl-11 border-black/10",
                      ].join(" ")}
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Select your preferred start time — we’ll confirm
                    availability.
                  </p>
                </Field>

                {/* Guests */}
                <Input
                  label={t.guestCount}
                  name="guestCount"
                  type="text"
                  register={register}
                  required
                  placeholder={t.guestCountPlaceholder}
                  error={errors.guestCount ? "Required" : ""}
                  icon={UsersIcon}
                />
              </div>

              <Textarea
                label={t.additionalDetails}
                name="comments"
                register={register}
                placeholder={t.additionalDetailsPlaceholder}
                rows={5}
                error={errors.comments ? "Required" : ""}
              />

              {/* CTA */}
              <div className="pt-2">
                <motion.button
                  whileHover={reduceMotion ? undefined : { y: -1 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                  type="submit"
                  disabled={isSubmitting}
                  className={[
                    "w-full rounded-xl px-5 py-3.5 text-base sm:text-lg font-semibold",
                    "text-white shadow-[0_16px_45px_rgba(255,145,77,0.32)]",
                    "bg-gradient-to-r from-[#ff914d] to-[#ff7a2f]",
                    "hover:brightness-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff914d]/70",
                    "transition disabled:opacity-50 disabled:cursor-not-allowed",
                  ].join(" ")}
                >
                  {isSubmitting ? t.sending : t.submitInquiry}
                </motion.button>

                <div className="mt-4 text-center text-xs sm:text-sm text-gray-600">
                  {t.needAssistance}{" "}
                  <a
                    href="tel:+3546167855"
                    className="font-semibold text-gray-900 hover:underline underline-offset-4"
                  >
                    (+354) 616-7855
                  </a>
                </div>
              </div>
            </form>
          </div>

          {/* bottom hairline */}
          <div className="h-[1px] bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
}
