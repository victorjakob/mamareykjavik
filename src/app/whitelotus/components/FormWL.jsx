"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useLanguage } from "@/hooks/useLanguage";

const Input = ({
  label,
  name,
  type = "text",
  register,
  required,
  placeholder,
  className = "",
}) => {
  return (
    <div className="flex flex-col">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        {...register(name, { required })}
        placeholder={placeholder}
        className={`rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#ff914d] hover:border-[#ff914d] transition-all duration-200 ${className}`}
      />
    </div>
  );
};

const Textarea = ({ label, name, register, placeholder, rows = 4 }) => {
  return (
    <div className="flex flex-col">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        {...register(name)}
        rows={rows}
        placeholder={placeholder}
        className="rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#ff914d] hover:border-[#ff914d] transition-all duration-200"
      />
    </div>
  );
};

export default function FormWL() {
  const { language } = useLanguage();
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
      const formData = {
        ...data,
        timeAndDate: startDate ? startDate.toLocaleString() : null,
      };

      const response = await fetch("/api/sendgrid/email-wl-rent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      setSubmitStatus({
        type: "success",
        message: t.successMessage,
      });
      reset();
      setStartDate(null);
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
    <div className="pt-16 md:pt-28 py-8 md:py-16 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-right md:text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4 w-[50%] ml-auto md:w-full md:ml-0">
            {t.title}
          </h1>
          <p className="max-w-[90%] text-base md:text-lg text-gray-600 mx-auto px-2">
            {t.description}
          </p>
        </div>

        {submitStatus.message && (
          <div
            className={`mb-6 p-4 rounded-lg text-center ${
              submitStatus.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {submitStatus.message}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white rounded-xl md:rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-4 sm:p-8 md:p-10">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 md:space-y-6"
            >
              <div className="grid grid-cols-1 gap-y-4 md:gap-y-6 md:gap-x-4 md:grid-cols-2">
                <Input
                  label={t.name}
                  name="name"
                  register={register}
                  required
                  placeholder={t.namePlaceholder}
                  className="transition-all duration-200"
                />
                <Input
                  label={t.email}
                  name="email"
                  type="email"
                  register={register}
                  required
                  placeholder={t.emailPlaceholder}
                />
              </div>

              <Input
                label={t.eventType}
                name="event"
                register={register}
                required
                placeholder={t.eventTypePlaceholder}
              />

              <div className="grid grid-cols-1 gap-y-4 md:gap-y-6 md:gap-x-4 md:grid-cols-2">
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.dateTime}
                  </label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    minDate={new Date()}
                    placeholderText={t.dateTimePlaceholder}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#ff914d] hover:border-[#ff914d] transition-all duration-200"
                    required
                  />
                </div>
                <Input
                  label={t.guestCount}
                  name="guestCount"
                  type="text"
                  register={register}
                  required
                  placeholder={t.guestCountPlaceholder}
                />
              </div>

              <Textarea
                label={t.additionalDetails}
                name="comments"
                register={register}
                placeholder={t.additionalDetailsPlaceholder}
                rows={4}
              />

              <div className="pt-2 md:pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg md:rounded-xl shadow-sm text-base md:text-lg font-medium text-white bg-[#ff914d] hover:bg-[#ff8033] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff914d] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? t.sending : t.submitInquiry}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>

        <div className="mt-6 md:mt-8 text-center text-gray-600">
          <p className="text-xs md:text-sm">
            {t.needAssistance}{" "}
            <a
              href="tel:+3546167855"
              className="text-[#ff914d] hover:text-[#ff8033]"
            >
              (+354) 616-7855
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
