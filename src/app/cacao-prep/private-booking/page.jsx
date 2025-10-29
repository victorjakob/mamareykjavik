"use client";

import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useSession } from "next-auth/react";
import { CheckCircle2, XCircle, X } from "lucide-react";

export default function PrivateBookingPage() {
  const { language } = useLanguage();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

  const translations = {
    en: {
      title: "Book a Private Cacao Ceremony",
      description:
        "Fill out the form below to request a private cacao ceremony. We'll get back to you soon!",
      name: "Name",
      namePlaceholder: "Your full name",
      nameRequired: "Name is required",
      nameMinLength: "Name must be at least 2 characters",
      email: "Email",
      emailPlaceholder: "your@email.com",
      emailRequired: "Email is required",
      emailInvalid: "Invalid email address",
      participants: "Number of Participants",
      participantsPlaceholder: "e.g. 5",
      participantsRequired: "Number of participants is required",
      participantsMin: "Must be at least 1 participant",
      location: "Location",
      locationPlaceholder: "Where would you like the ceremony?",
      locationRequired: "Location is required",
      preferredDate: "Preferred Date & Time (Optional)",
      preferredDatePlaceholder: "e.g. Saturday, March 15th, 2 PM",
      additionalNotes: "Additional Notes (Optional)",
      additionalNotesPlaceholder:
        "Any special requests, dietary restrictions, or other information...",
      sending: "Sending...",
      submitBooking: "Submit Booking Request",
      successMessage:
        "Thank you! Your booking request has been sent successfully. We'll get back to you soon!",
      errorMessage:
        "Sorry, there was an error sending your request. Please try again or contact us directly.",
      closeModal: "Close",
    },
    is: {
      title: "Bókaðu Einkakakóathöfn",
      description:
        "Fylltu út formið hér að neðan til að biðja um einkakakóathöfn. Við endurheimtum til þín fljótlega!",
      name: "Nafn",
      namePlaceholder: "Fullt nafn þitt",
      nameRequired: "Nafn er nauðsynlegt",
      nameMinLength: "Nafn verður að vera að minnsta kosti 2 stafir",
      email: "Netfang",
      emailPlaceholder: "þitt@netfang.is",
      emailRequired: "Netfang er nauðsynlegt",
      emailInvalid: "Ógilt netfang",
      participants: "Fjöldi þátttakenda",
      participantsPlaceholder: "t.d. 5",
      participantsRequired: "Fjöldi þátttakenda er nauðsynlegur",
      participantsMin: "Verður að vera að minnsta kosti 1 þátttakandi",
      location: "Staðsetning",
      locationPlaceholder: "Hvar viltu halda athöfnina?",
      locationRequired: "Staðsetning er nauðsynleg",
      preferredDate: "Æskilegur dagur og tími (Valfrjálst)",
      preferredDatePlaceholder: "t.d. Laugardag, 15. mars, kl. 14:00",
      additionalNotes: "Viðbótarupplýsingar (Valfrjálst)",
      additionalNotesPlaceholder:
        "Sérstakar óskir, matarhegðun eða aðrar upplýsingar...",
      sending: "Sendi...",
      submitBooking: "Senda bókunabeiðni",
      successMessage:
        "Takk fyrir! Bókunabeiðnin þín hefur verið send með góðum árangri. Við endurheimtum til þín fljótlega!",
      errorMessage:
        "Því miður var villa við að senda beiðnina þína. Vinsamlegast reyndu aftur eða hafðu samband við okkur beint.",
      closeModal: "Loka",
    },
  };

  const t = translations[language];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  // Autofill email from session
  useEffect(() => {
    if (session?.user?.email) {
      setValue("email", session.user.email);
    }
    if (session?.user?.name) {
      setValue("name", session.user.name);
    }
  }, [session, setValue]);

  const closeModal = () => {
    setSubmitStatus({ type: "", message: "" });
  };

  useEffect(() => {
    if (submitStatus.type === "success") {
      const timer = setTimeout(() => {
        closeModal();
      }, 5000); // Auto-close after 5 seconds for success
      return () => clearTimeout(timer);
    } else if (submitStatus.type === "error") {
      const timer = setTimeout(() => {
        closeModal();
      }, 7000); // Auto-close after 7 seconds for error
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus({ type: "", message: "" });

    try {
      const response = await fetch("/api/sendgrid/private-cacao-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to send booking request");
      }

      setSubmitStatus({
        type: "success",
        message: t.successMessage,
      });
      reset();
    } catch (error) {
      console.error("Error sending booking request:", error);
      setSubmitStatus({
        type: "error",
        message: t.errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t.title}
          </h1>
          <p className="text-base sm:text-lg text-gray-600">{t.description}</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
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
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all duration-300 ${
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
                className="block text-sm font-medium text-gray-700 mb-2"
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
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all duration-300 ${
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
          </div>

          <div>
            <label
              htmlFor="participants"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t.participants}
            </label>
            <input
              {...register("participants", {
                required: t.participantsRequired,
                min: {
                  value: 1,
                  message: t.participantsMin,
                },
                valueAsNumber: true,
              })}
              type="number"
              id="participants"
              min="1"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all duration-300 ${
                errors.participants ? "border-red-500" : "border-gray-200"
              }`}
              placeholder={t.participantsPlaceholder}
            />
            {errors.participants && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-sm text-red-500"
              >
                {errors.participants.message}
              </motion.p>
            )}
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t.location}
            </label>
            <input
              {...register("location", {
                required: t.locationRequired,
              })}
              type="text"
              id="location"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all duration-300 ${
                errors.location ? "border-red-500" : "border-gray-200"
              }`}
              placeholder={t.locationPlaceholder}
            />
            {errors.location && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-sm text-red-500"
              >
                {errors.location.message}
              </motion.p>
            )}
          </div>

          <div>
            <label
              htmlFor="preferredDate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t.preferredDate}
            </label>
            <input
              {...register("preferredDate")}
              type="text"
              id="preferredDate"
              className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all duration-300 border-gray-200"
              placeholder={t.preferredDatePlaceholder}
            />
          </div>

          <div>
            <label
              htmlFor="additionalNotes"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t.additionalNotes}
            </label>
            <textarea
              {...register("additionalNotes")}
              id="additionalNotes"
              rows={4}
              className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all duration-300 resize-none border-gray-200"
              placeholder={t.additionalNotesPlaceholder}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-orange-600 text-white py-4 px-8 rounded-xl text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-orange-700 ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? t.sending : t.submitBooking}
          </motion.button>
        </motion.form>
      </div>

      {/* Success/Error Modal */}
      <AnimatePresence>
        {submitStatus.message && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={closeModal}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 ${
                  submitStatus.type === "success"
                    ? "border-2 border-green-200"
                    : "border-2 border-red-200"
                }`}
              >
                {/* Close Button */}
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={t.closeModal}
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="flex flex-col items-center text-center space-y-4">
                  {submitStatus.type === "success" ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                        delay: 0.1,
                      }}
                    >
                      <CheckCircle2 className="w-16 h-16 text-green-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                        delay: 0.1,
                      }}
                    >
                      <XCircle className="w-16 h-16 text-red-500" />
                    </motion.div>
                  )}

                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`text-xl sm:text-2xl font-semibold ${
                      submitStatus.type === "success"
                        ? "text-green-800"
                        : "text-red-800"
                    }`}
                  >
                    {submitStatus.type === "success" ? "Success!" : "Error"}
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-gray-700 text-sm sm:text-base leading-relaxed"
                  >
                    {submitStatus.message}
                  </motion.p>

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={closeModal}
                    className={`mt-4 px-6 py-2 rounded-lg font-medium transition-colors ${
                      submitStatus.type === "success"
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    {t.closeModal}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
