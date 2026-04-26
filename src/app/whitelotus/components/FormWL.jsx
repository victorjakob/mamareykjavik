"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import PageBackground from "@/app/components/ui/PageBackground";
import ProfileHero from "@/app/profile/components/ProfileHero";

const WL_RENT_HERO_IMAGE =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1600,q_auto,f_auto/v1766576002/wl-cover_yzyuhz.jpg";
import {
  CalendarDaysIcon,
  UserIcon,
  EnvelopeIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

/* ── Field wrapper ───────────────────────────────────────────── */
function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between gap-3">
        <label style={{ color: "#2c1810" }} className="text-sm font-medium">
          {label}
        </label>
        {error ? (
          <span className="text-xs font-medium text-red-500">{error}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/* ── Text input ──────────────────────────────────────────────── */
function Input({ label, name, type = "text", register, required, placeholder, error, icon: Icon }) {
  const [focused, setFocused] = useState(false);
  return (
    <Field label={label} error={error}>
      <div className="relative">
        {Icon ? (
          <Icon
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "#c0a890" }}
          />
        ) : null}
        <input
          type={type}
          {...register(name, { required })}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            background: "#faf6f2",
            border: focused
              ? "1.5px solid #ff914d"
              : error
              ? "1.5px solid #f87171"
              : "1.5px solid #e8ddd3",
            boxShadow: focused ? "0 0 0 3px rgba(255,145,77,0.12)" : "none",
            color: "#2c1810",
            outline: "none",
            transition: "border 0.18s, box-shadow 0.18s",
          }}
          className={[
            "w-full rounded-xl px-4 py-3 text-sm placeholder:text-[#c0a890]",
            Icon ? "pl-11" : "",
          ].join(" ")}
        />
      </div>
    </Field>
  );
}

/* ── Textarea ────────────────────────────────────────────────── */
function Textarea({ label, name, register, placeholder, rows = 5, error }) {
  const [focused, setFocused] = useState(false);
  return (
    <Field label={label} error={error}>
      <textarea
        {...register(name)}
        rows={rows}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          background: "#faf6f2",
          border: focused
            ? "1.5px solid #ff914d"
            : error
            ? "1.5px solid #f87171"
            : "1.5px solid #e8ddd3",
          boxShadow: focused ? "0 0 0 3px rgba(255,145,77,0.12)" : "none",
          color: "#2c1810",
          outline: "none",
          transition: "border 0.18s, box-shadow 0.18s",
          resize: "vertical",
        }}
        className="w-full rounded-xl px-4 py-3 text-sm placeholder:text-[#c0a890]"
      />
    </Field>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function FormWL() {
  const { language } = useLanguage();
  const reduceMotion = useReducedMotion();

  const [startDate, setStartDate] = useState(null);
  const [dateFocused, setDateFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

  const translations = {
    en: {
      kicker: "White Lotus · Bankastræti 2",
      title: "Host your event\nwith us",
      heroSubtitle: "Tell us your plans — we reply within 24–48 hours with options & pricing.",
      backToVenue: "← White Lotus",
      description:
        "Tell us what you're planning — we'll get back to you within 24–48 hours with layout options and pricing.",
      name: "Name",
      namePlaceholder: "Your full name",
      email: "Email",
      emailPlaceholder: "you@example.com",
      eventType: "Event Type",
      eventTypePlaceholder: "e.g. Concert, Workshop, Private Dinner",
      dateTime: "Date & Time",
      dateTimePlaceholder: "Select date and time",
      dateNote: "Select your preferred start time — we'll confirm availability.",
      guestCount: "Expected Guests",
      guestCountPlaceholder: "Number of guests",
      additionalDetails: "Additional Details",
      additionalDetailsPlaceholder:
        "Tell us more about your event, special requirements, or any questions…",
      sending: "Sending…",
      submitInquiry: "Send Inquiry",
      successMessage: "Thank you! Your inquiry has been sent successfully.",
      errorMessage:
        "Something went wrong. Please try again or contact us directly.",
      needAssistance: "Need immediate help? Call us at",
    },
    is: {
      kicker: "White Lotus · Bankastræti 2",
      title: "Haltu viðburðinn\nþinn hjá okkur",
      heroSubtitle:
        "Segðu okkur frá plönum þínum — við svörum innan 24–48 klukkustunda með tillögum og verði.",
      backToVenue: "← Forsíða White Lotus",
      description:
        "Láttu okkur vita hvað þú ert að plana — við sendum þér tillögur á skipulagi og verði innan 24–48 klukkustunda.",
      name: "Nafn",
      namePlaceholder: "Fullt nafn þitt",
      email: "Netfang",
      emailPlaceholder: "þú@example.com",
      eventType: "Tegund viðburðar",
      eventTypePlaceholder: "t.d. Tónleikar, Vinnustofa, Einkakvöldverður",
      dateTime: "Dagsetning og tími",
      dateTimePlaceholder: "Veldu dagsetningu og tíma",
      dateNote: "Veldu æskilegan byrjunartíma — við staðfestum möguleika.",
      guestCount: "Áætlaður gestafjöldi",
      guestCountPlaceholder: "Fjöldi gesta",
      additionalDetails: "Aðrar upplýsingar",
      additionalDetailsPlaceholder:
        "Segðu okkur meira um viðburðinn þinn, sérstakar óskir eða spurningar…",
      sending: "Sendi…",
      submitInquiry: "Senda fyrirspurn",
      successMessage: "Takk fyrir! Fyrirspurnin þín hefur verið send.",
      errorMessage:
        "Eitthvað fór úrskeiðis. Reyndu aftur eða hafðu beint samband.",
      needAssistance: "Þarftu aðstoð strax? Hringdu í okkur:",
    },
  };

  const t = translations[language] || translations.en;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ mode: "onTouched" });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus({ type: "", message: "" });
    try {
      const formData = { ...data, timeAndDate: startDate ? startDate.toLocaleString() : null };
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
    <div className="min-h-screen relative">
      <PageBackground />

      <div className="relative z-10">
        <ProfileHero
          eyebrow={t.kicker}
          title={t.title}
          subtitle={t.heroSubtitle}
          imageSrc={WL_RENT_HERO_IMAGE}
          imageAlt="White Lotus venue — intimate event space in Reykjavík"
        />

        <section
          data-navbar-theme="light"
          className="pb-20 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6"
        >
          <motion.div
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-6">
              <Link
                href="/whitelotus"
                className="text-sm font-medium underline-offset-4 hover:underline"
                style={{ color: "#9a7a62" }}
              >
                {t.backToVenue}
              </Link>
            </div>

        {/* Status banner */}
        <AnimatePresence>
          {submitStatus.message ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
              className={[
                "mb-6 rounded-2xl border px-5 py-4 text-center text-sm",
                submitStatus.type === "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-800",
              ].join(" ")}
            >
              {submitStatus.message}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Form card */}
        <motion.div
          initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl overflow-hidden"
          style={{
            background: "#fefcf8",
            border: "1.5px solid #e8ddd3",
            boxShadow: "0 4px 40px rgba(60,30,10,0.08)",
          }}
        >
          {/* Orange top accent */}
          <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #ff914d 0%, #ffb347 100%)" }} />

          <div className="p-6 sm:p-8 md:p-10">
            {/* Section label row */}
            <div className="flex items-center justify-between gap-3 mb-7">
              <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "#9a7a62" }}>
                Inquiry details
              </p>
              <p className="text-xs" style={{ color: "#c0a890" }}>
                Replies within 24–48 hours
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Identity row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Event type */}
              <Input
                label={t.eventType}
                name="event"
                register={register}
                required
                placeholder={t.eventTypePlaceholder}
                error={errors.event ? "Required" : ""}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date picker */}
                <Field
                  label={t.dateTime}
                  error={!startDate && isSubmitting ? "Required" : ""}
                >
                  <div className="relative">
                    <CalendarDaysIcon
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 z-10"
                      style={{ color: "#c0a890" }}
                    />
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      onCalendarOpen={() => setDateFocused(true)}
                      onCalendarClose={() => setDateFocused(false)}
                      showTimeSelect
                      dateFormat="MMMM d, yyyy h:mm aa"
                      minDate={new Date()}
                      placeholderText={t.dateTimePlaceholder}
                      wrapperClassName="w-full"
                      className="w-full rounded-xl px-4 py-3 pl-11 text-sm placeholder:text-[#c0a890]"
                      style={{
                        background: "#faf6f2",
                        border: dateFocused ? "1.5px solid #ff914d" : "1.5px solid #e8ddd3",
                        color: "#2c1810",
                        outline: "none",
                      }}
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs" style={{ color: "#c0a890" }}>
                    {t.dateNote}
                  </p>
                </Field>

                {/* Guest count */}
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
              <div className="pt-1">
                <motion.button
                  whileHover={reduceMotion ? undefined : { scale: 1.02, y: -1 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full px-8 py-4 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed"
                  style={{
                    background: isSubmitting ? "#f3ede7" : "#ff914d",
                    color: isSubmitting ? "#c0a890" : "#ffffff",
                    boxShadow: isSubmitting ? "none" : "0 4px 20px rgba(255,145,77,0.28)",
                  }}
                >
                  {isSubmitting ? t.sending : t.submitInquiry}
                </motion.button>

                <div className="mt-4 text-center text-xs" style={{ color: "#9a7a62" }}>
                  {t.needAssistance}{" "}
                  <a
                    href="tel:+3547705111"
                    className="font-semibold hover:underline underline-offset-4"
                    style={{ color: "#2c1810" }}
                  >
                    (+354) 770-5111
                  </a>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
        </motion.div>
        </section>
      </div>
    </div>
  );
}
