"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import BookingSummary from "./BookingSummary";
import { useState, useEffect } from "react";

export default function BookingForm({ tour, sessions }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      dateTime: "",
      numberOfPeople: 1,
      name: "",
      email: "",
      phone: "",
      specialRequests: "",
    },
    mode: "onChange",
  });

  const formData = watch();

  // Update selected session when dateTime changes
  useEffect(() => {
    if (formData.dateTime) {
      const session = sessions.find((s) => s.id === formData.dateTime);
      setSelectedSession(session);
      // Reset number of people if it exceeds available spots
      if (session && formData.numberOfPeople > session.available_spots) {
        setValue("numberOfPeople", session.available_spots);
      }
    } else {
      setSelectedSession(null);
    }
  }, [formData.dateTime, sessions, setValue]);

  const onSubmit = async (data) => {
    if (step === 1) {
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      // Find the selected session
      const selectedSession = sessions.find(
        (session) => session.id === data.dateTime
      );

      if (!selectedSession) {
        throw new Error("Selected session not found");
      }

      // Check if there are enough spots
      if (selectedSession.available_spots < data.numberOfPeople) {
        throw new Error("Not enough available spots for this session");
      }

      // Create the booking
      const response = await fetch("/api/tours", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tour_session_id: selectedSession.id,
          customer_name: data.name,
          customer_email: data.email,
          customer_phone: data.phone,
          number_of_tickets: data.numberOfPeople,
          notes: data.specialRequests || null,
          total_amount: data.numberOfPeople * tour.price,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create booking");
      }

      const result = await response.json();

      // ⬇️ this redirects the browser directly to SaltPay’s payment page
      window.location.href = result.paymentUrl;
    } catch (error) {
      console.error("Error creating booking:", error);
      setError(error.message || "Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => setStep(1);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm">
        {/* Progress Indicator */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-center gap-8">
            <div
              className={`flex items-center gap-2 ${
                step === 1 ? "text-[#ff914d]" : "text-gray-400"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border 
                           ${
                             step === 1 ? "border-[#ff914d]" : "border-gray-300"
                           }`}
              >
                1
              </div>
              <span className="text-sm font-medium">Details</span>
            </div>
            <div
              className={`w-12 h-0.5 ${
                step === 2 ? "bg-[#ff914d]" : "bg-gray-200"
              }`}
            />
            <div
              className={`flex items-center gap-2 ${
                step === 2 ? "text-[#ff914d]" : "text-gray-400"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border 
                           ${
                             step === 2 ? "border-[#ff914d]" : "border-gray-300"
                           }`}
              >
                2
              </div>
              <span className="text-sm font-medium">Review</span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Booking Details Section */}
                <div className="space-y-6">
                  <div className="max-w-md mx-auto space-y-4">
                    {/* Date & Time Field */}
                    <div className="group relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-[#ff914d]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          Select Date & Time
                        </span>
                      </label>
                      <select
                        {...register("dateTime", {
                          required:
                            "Please select a date and time for your tour",
                        })}
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 
                                 focus:border-[#ff914d] focus:ring-2 focus:ring-[#ff914d] focus:ring-opacity-50
                                 transition-all duration-300 ease-in-out
                                 group-hover:border-[#ff914d] text-gray-700
                                 shadow-sm hover:shadow-md"
                      >
                        <option value="">Select a date & time</option>
                        {sessions.map((session) => (
                          <option
                            key={session.id}
                            value={session.id}
                            disabled={session.available_spots <= 0}
                          >
                            {new Date(session.start_time).toLocaleString(
                              "en-US",
                              {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )}{" "}
                            - {session.available_spots} spots left
                          </option>
                        ))}
                      </select>
                      {errors.dateTime && (
                        <span className="text-red-500 text-sm mt-2 block">
                          {errors.dateTime.message}
                        </span>
                      )}
                    </div>

                    {/* Number of People Field */}
                    <div className="group relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-[#ff914d]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          Number of People
                        </span>
                      </label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => {
                            const currentValue = parseInt(
                              formData.numberOfPeople || 1
                            );
                            if (currentValue > 1) {
                              setValue("numberOfPeople", currentValue - 1, {
                                shouldValidate: true,
                              });
                            }
                          }}
                          className="px-4 py-3.5 rounded-l-xl border-2 border-gray-200
                                   focus:border-[#ff914d] focus:ring-2 focus:ring-[#ff914d] focus:ring-opacity-50
                                   transition-all duration-300 ease-in-out
                                   group-hover:border-[#ff914d] text-gray-700
                                   shadow-sm hover:shadow-md
                                   flex items-center justify-center"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                        </button>
                        <input
                          type="number"
                          {...register("numberOfPeople", {
                            required: "Please specify the number of people",
                            min: {
                              value: 1,
                              message: "At least 1 person is required",
                            },
                            max: {
                              value: selectedSession?.available_spots || 8,
                              message: `Maximum ${
                                selectedSession?.available_spots || 8
                              } people allowed for this session`,
                            },
                          })}
                          className="w-full px-4 py-3.5 border-y-2 border-gray-200
                                   focus:border-[#ff914d] focus:ring-2 focus:ring-[#ff914d] focus:ring-opacity-50
                                   transition-all duration-300 ease-in-out
                                   group-hover:border-[#ff914d] text-gray-700
                                   shadow-sm hover:shadow-md text-center"
                          readOnly
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const currentValue = parseInt(
                              formData.numberOfPeople || 1
                            );
                            if (
                              currentValue <
                              (selectedSession?.available_spots || 8)
                            ) {
                              setValue("numberOfPeople", currentValue + 1, {
                                shouldValidate: true,
                              });
                            }
                          }}
                          className="px-4 py-3.5 rounded-r-xl border-2 border-gray-200
                                   focus:border-[#ff914d] focus:ring-2 focus:ring-[#ff914d] focus:ring-opacity-50
                                   transition-all duration-300 ease-in-out
                                   group-hover:border-[#ff914d] text-gray-700
                                   shadow-sm hover:shadow-md
                                   flex items-center justify-center"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                      </div>
                      {errors.numberOfPeople && (
                        <span className="text-red-500 text-sm mt-2 block">
                          {errors.numberOfPeople.message}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Personal Information Section */}
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      Contact Information
                    </h3>
                  </div>
                  <div className="max-w-md mx-auto space-y-4">
                    {/* Name Field */}
                    <div className="group relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-[#ff914d]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          Your Name
                        </span>
                      </label>
                      <input
                        type="text"
                        {...register("name", {
                          required: "What should we call you?",
                        })}
                        placeholder="John Doe"
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200
                                 focus:border-[#ff914d] focus:ring-2 focus:ring-[#ff914d] focus:ring-opacity-50
                                 transition-all duration-300 ease-in-out
                                 group-hover:border-[#ff914d] text-gray-700
                                 shadow-sm hover:shadow-md"
                      />
                      {errors.name && (
                        <span className="text-red-500 text-sm mt-2 block">
                          {errors.name.message}
                        </span>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="group relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-[#ff914d]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          Email Address
                        </span>
                      </label>
                      <input
                        type="email"
                        {...register("email", {
                          required: "We need your email to send confirmation",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Please enter a valid email address",
                          },
                        })}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200
                                 focus:border-[#ff914d] focus:ring-2 focus:ring-[#ff914d] focus:ring-opacity-50
                                 transition-all duration-300 ease-in-out
                                 group-hover:border-[#ff914d] text-gray-700
                                 shadow-sm hover:shadow-md"
                      />
                      {errors.email && (
                        <span className="text-red-500 text-sm mt-2 block">
                          {errors.email.message}
                        </span>
                      )}
                    </div>

                    {/* Phone Field */}
                    <div className="group relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-[#ff914d]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          Phone Number
                        </span>
                      </label>
                      <input
                        type="tel"
                        {...register("phone", {
                          required: "We might need to reach you",
                        })}
                        placeholder="+354 123 4567"
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200
                                 focus:border-[#ff914d] focus:ring-2 focus:ring-[#ff914d] focus:ring-opacity-50
                                 transition-all duration-300 ease-in-out
                                 group-hover:border-[#ff914d] text-gray-700
                                 shadow-sm hover:shadow-md"
                      />
                      {errors.phone && (
                        <span className="text-red-500 text-sm mt-2 block">
                          {errors.phone.message}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Special Requests Field */}
                <div className="group relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-[#ff914d]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                      Special Requests
                    </span>
                  </label>
                  <textarea
                    {...register("specialRequests")}
                    rows={4}
                    placeholder="Tell us about any special requirements or requests..."
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200
                             focus:border-[#ff914d] focus:ring-2 focus:ring-[#ff914d] focus:ring-opacity-50
                             transition-all duration-300 ease-in-out
                             group-hover:border-[#ff914d] text-gray-700
                             shadow-sm hover:shadow-md resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-4">
                  <motion.button
                    type="submit"
                    disabled={!isValid || loading}
                    className="px-6 py-3 rounded-lg bg-[#ff914d] text-white font-medium
                             hover:bg-[#ff7a1f] transition-colors duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed
                             focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:ring-offset-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    ) : (
                      <>
                        Continue to Review
                        <svg
                          className="w-4 h-4 ml-2 inline-block"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <BookingSummary
                bookingData={formData}
                tour={tour}
                sessions={sessions}
                onBack={handleBack}
                onSubmit={handleSubmit(onSubmit)}
                loading={loading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
