"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "./hooks/useTranslations";
import { useBookingFlow } from "./hooks/useBookingFlow";
import { validateBookingData } from "./utils/validation";
import { submitBooking } from "../../../lib/booking-client";

export const dynamic = "force-dynamic";

// Import components
import WelcomeQuestion from "./components/WelcomeQuestion";
import ContactQuestion from "./components/ContactQuestion";
import FirstTimeQuestion from "./components/FirstTimeQuestion";
import ServicesQuestion from "./components/ServicesQuestion";
import FoodQuestion from "./components/FoodQuestion";
import DrinksQuestion from "./components/DrinksQuestion";
import EventManagerQuestion from "./components/EventManagerQuestion";
import GuestCountQuestion from "./components/GuestCountQuestion";
import TechAndMusicQuestion from "./components/TechAndMusicQuestion";
import RoomSetupQuestion from "./components/RoomSetupQuestion";
import TableclothQuestion from "./components/TableclothQuestion";
import DateTimeQuestion from "./components/DateTimeQuestion";
import NotesQuestion from "./components/NotesQuestion";
import ReviewQuestion from "./components/ReviewQuestion";
import SuccessScreen from "./components/SuccessScreen";
import ErrorScreen from "./components/ErrorScreen";
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";

// Component mapping
const componentMap = {
  WelcomeQuestion,
  ContactQuestion,
  FirstTimeQuestion,
  ServicesQuestion,
  FoodQuestion,
  DrinksQuestion,
  EventManagerQuestion,
  GuestCountQuestion,
  TechAndMusicQuestion,
  RoomSetupQuestion,
  TableclothQuestion,
  DateTimeQuestion,
  NotesQuestion,
  ReviewQuestion,
};

export default function WhiteLotusBooking() {
  const router = useRouter();
  const { t } = useTranslations();
  const shouldReduceMotion = useReducedMotion();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submissionId, setSubmissionId] = useState(null);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const {
    currentStep,
    currentStepIndex,
    totalSteps,
    formData,
    updateFormData,
    goToNextStep,
    goToPreviousStep,
    canGoBack,
    canContinue,
    getCurrentQuestion,
    isComplete,
  } = useBookingFlow();

  const onContinue = useCallback(async () => {
    if (currentStepIndex === 0) {
      // Special animation sequence for first step
      setIsAnimatingOut(true);
      // Wait for animations to complete before proceeding
      setTimeout(() => {
        goToNextStep();
      }, 1000); // Total animation duration
    } else if (currentStepIndex === totalSteps - 1) {
      // Final submission
      setIsLoading(true);
      setError(null);

      try {
        const validationResult = validateBookingData(formData);

        if (!validationResult.isValid) {
          setError(validationResult.errors.join(", "));
          setIsLoading(false);
          return;
        }

        const result = await submitBooking(formData);
        setSubmissionId(result.id);
        goToNextStep();
      } catch (err) {
        console.error("Submission error:", err);
        setError(err.message || t("submitError"));
      } finally {
        setIsLoading(false);
      }
    } else {
      goToNextStep();
    }
  }, [currentStepIndex, totalSteps, formData, goToNextStep, t]);

  const onPrevious = useCallback(() => {
    if (canGoBack) {
      goToPreviousStep();
    }
  }, [canGoBack, goToPreviousStep]);

  // Get current question component
  const currentQuestionName = getCurrentQuestion();
  const CurrentQuestion =
    currentQuestionName && componentMap[currentQuestionName]
      ? componentMap[currentQuestionName]
      : null;

  // Render success or error screens
  if (submissionId) {
    return <SuccessScreen submissionId={submissionId} t={t} />;
  }

  if (error && currentStepIndex === totalSteps) {
    return <ErrorScreen error={error} onRetry={() => setError(null)} t={t} />;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Black Background - Fixed and Full Coverage */}
      <div className="fixed inset-0 bg-black" />

      {/* Background Image - Fixed and Centered with dynamic opacity */}
      <motion.div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat bg-fixed sm:bg-fixed"
        style={{
          backgroundImage:
            "url('https://res.cloudinary.com/dy8q4hf0k/image/upload/v1766576002/wl-cover_yzyuhz.jpg')",
        }}
        animate={{
          opacity: currentStepIndex === 0 ? 0.2 : 0.1,
        }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.6,
          ease: [0.4, 0.0, 0.2, 1],
        }}
      />

      <div className="relative z-10 h-screen flex flex-col">
        {/* Logo Section - Welcome screen only */}
        {currentStepIndex === 0 && (
          <motion.div
            className="flex items-center justify-center"
            animate={{
              height: "50vh",
            }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.8,
              ease: [0.4, 0.0, 0.2, 1],
              type: "spring",
              stiffness: 80,
              damping: 25,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{
                scale: isAnimatingOut ? 0.8 : 1,
                opacity: isAnimatingOut ? 0 : 1,
              }}
              transition={{
                delay: isAnimatingOut ? 0.3 : 0,
                duration: shouldReduceMotion ? 0 : isAnimatingOut ? 0.4 : 0.6,
                ease: [0.4, 0.0, 0.2, 1],
              }}
            >
              <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 xl:w-96 xl:h-96">
                <Image
                  src="/whitelotus/whitelotuslogowhite.png"
                  alt="White Lotus Logo"
                  width={384}
                  height={384}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Floating Logo - Only appears after starting booking process, hidden on mobile */}
        {currentStepIndex > 0 && (
          <motion.div
            className="hidden md:block fixed top-4 pt-12 pl-12 left-4 z-40"
            initial={{
              opacity: 0,
              y: -30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.6,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            <div className="w-24 h-24 lg:w-32 lg:h-32 xl:w-36 xl:h-36">
              <Image
                src="/whitelotus/whitelotuslogowhite.png"
                alt="White Lotus Logo"
                width={144}
                height={144}
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>
        )}

        {/* Progress Bar - Only show after first step, floating */}
        {currentStepIndex > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.6,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="fixed top-12 left-0 right-0 z-40 flex justify-center px-4"
          >
            <div className="w-72 sm:w-80 md:w-96">
              {/* Progress Bar Container */}
              <div
                className="relative"
                role="progressbar"
                aria-label={`Bókun ferli: skref ${currentStepIndex} af ${totalSteps - 1}`}
                aria-valuenow={currentStepIndex}
                aria-valuemin={1}
                aria-valuemax={totalSteps - 1}
              >
                {/* Background Track */}
                <div className="h-1 bg-slate-800/50 rounded-full overflow-hidden">
                  {/* Progress Fill */}
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#a77d3b] to-[#a77d3b]/80 rounded-full origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{
                      scaleX: Math.max(
                        0,
                        Math.min(
                          1,
                          (currentStepIndex - 1) / Math.max(1, totalSteps - 2)
                        )
                      ),
                    }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.8,
                      ease: [0.4, 0.0, 0.2, 1],
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Floating Navigation Buttons - Only show after first step */}
        {currentStepIndex > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.6,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="fixed bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-50 flex items-center justify-center px-4 sm:px-6 gap-4 sm:gap-6 md:gap-8"
          >
            {/* Back Button - Positioned absolutely to the left */}
            {canGoBack && (
              <motion.button
                onClick={onPrevious}
                disabled={isLoading}
                className="
                    absolute -left-20 sm:-left-24 md:-left-28 lg:-left-32 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-colors duration-300
                    border border-[#a77d3b]/40 hover:border-[#a77d3b]/60
                    hover:shadow-lg
                  "
                aria-label="Fara til baka"
                whileHover={
                  shouldReduceMotion
                    ? {}
                    : {
                        scale: 1.05,
                        borderColor: "#a77d3b",
                      }
                }
                whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={
                  shouldReduceMotion
                    ? {}
                    : {
                        duration: 0.3,
                        ease: [0.25, 0.1, 0.25, 1],
                      }
                }
              >
                <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#a77d3b]" />
              </motion.button>
            )}

            {/* Continue Button - Always centered */}
            <motion.button
              onClick={(e) => {
                if (isLoading) {
                  e.preventDefault();
                  return;
                }
                if (!canContinue) {
                  // Trigger visual feedback in ServicesQuestion if agreements are missing
                  if (
                    currentStep?.id === "services" &&
                    formData.services?.includes("neither")
                  ) {
                    const event = new CustomEvent("showAgreementError");
                    window.dispatchEvent(event);
                  }
                  e.preventDefault();
                  return;
                }
                onContinue();
              }}
              disabled={isLoading}
              className={`
                px-4 py-2 sm:px-5 md:px-6 lg:px-8 sm:py-2 md:py-3 flex items-center gap-1 sm:gap-2 md:gap-2 transition-all duration-300 
                border border-[#a77d3b]/40 hover:border-[#a77d3b]
                bg-[#a77d3b]/90 hover:bg-[#a77d3b]
                rounded-full
                text-sm sm:text-sm md:text-base shadow-lg hover:shadow-xl
                ${
                  canContinue && !isLoading
                    ? "font-light"
                    : "cursor-not-allowed opacity-50"
                }
              `}
              aria-label="Halda áfram"
              whileHover={
                canContinue && !isLoading && !shouldReduceMotion
                  ? {
                      scale: 1.02,
                      x: 1,
                      borderColor: "#a77d3b",
                    }
                  : {}
              }
              whileTap={
                canContinue && !isLoading && !shouldReduceMotion
                  ? { scale: 0.98 }
                  : {}
              }
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={shouldReduceMotion ? {} : { opacity: 1 }}
              transition={
                shouldReduceMotion
                  ? {}
                  : {
                      duration: 0.3,
                      ease: [0.25, 0.1, 0.25, 1],
                    }
              }
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-[#fefff5] border-t-transparent rounded-full animate-spin" />
                  <span className="font-light text-[#fefff5]">Senda...</span>
                </div>
              ) : currentStepIndex === totalSteps - 1 ? (
                <span className="font-light text-[#fefff5]">Staðfesta</span>
              ) : (
                <>
                  <span className="font-light text-[#fefff5]">Áfram</span>
                  <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#fefff5]" />
                </>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Content Section - Full height when logo is hidden */}
        <motion.div
          className="flex flex-col flex-1"
          animate={{
            height: currentStepIndex === 0 ? "50vh" : "100vh",
          }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.8,
            ease: [0.4, 0.0, 0.2, 1],
            type: "spring",
            stiffness: 80,
            damping: 25,
          }}
        >
          {/* Welcome Text or Form Content - Upper portion */}
          <motion.div
            className={`flex-1 flex justify-center px-6 ${
              currentStepIndex === 0 ? "items-start" : "items-center"
            } ${currentStepIndex > 0 ? "pt-20 pb-32 sm:pt-16 sm:pb-28 md:pt-12 md:pb-24" : ""}`}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              delay: currentStepIndex === 0 ? 0.3 : 0.1,
              ease: [0.4, 0.0, 0.2, 1],
            }}
          >
            <AnimatePresence mode="wait">
              {CurrentQuestion ? (
                currentStepIndex === 0 ? (
                  <motion.div
                    key="welcome"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: isAnimatingOut ? 0 : 1,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: shouldReduceMotion
                        ? 0
                        : isAnimatingOut
                          ? 0.5
                          : 0.9,
                      delay: isAnimatingOut ? 0 : 0.3,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className="text-center max-w-lg"
                  >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extralight text-[#fefff5] mb-4 sm:mb-6">
                      Velkomin í White Lotus
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl font-extralight text-[#fefff5] leading-relaxed px-4 sm:px-0 mb-8 sm:mb-10">
                      Láttu okkur hjálpa þér að skipuleggja fullkominn viðburð
                    </p>

                    {/* Start Button */}
                    <div className="flex justify-center">
                      <motion.button
                        onClick={onContinue}
                        disabled={isLoading || isAnimatingOut}
                        className={`
                          px-6 sm:px-8 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 transition-colors duration-300 
                          border border-[#a77d3b]/40 hover:border-[#a77d3b]/60
                          bg-slate-900/80 hover:bg-slate-800/90 backdrop-blur-md rounded-full
                          text-sm sm:text-base shadow-lg hover:shadow-xl
                          ${
                            !isLoading && !isAnimatingOut
                              ? "font-light"
                              : "text-slate-500 cursor-not-allowed opacity-50"
                          }
                        `}
                        aria-label="Byrja bókun"
                        whileHover={
                          !isLoading && !shouldReduceMotion && !isAnimatingOut
                            ? {
                                scale: 1.05,
                                x: 2,
                                borderColor: "#a77d3b",
                                boxShadow: "0 0 20px rgba(167, 125, 59, 0.3)",
                              }
                            : {}
                        }
                        whileTap={
                          !isLoading && !shouldReduceMotion && !isAnimatingOut
                            ? { scale: 0.95 }
                            : {}
                        }
                        initial={
                          shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }
                        }
                        animate={
                          shouldReduceMotion
                            ? {}
                            : {
                                opacity: isAnimatingOut ? 0 : 1,
                              }
                        }
                        transition={
                          shouldReduceMotion
                            ? {}
                            : {
                                delay: isAnimatingOut ? 0 : 0.6,
                                duration: isAnimatingOut ? 0.5 : 0.8,
                                ease: [0.25, 0.1, 0.25, 1],
                                letterSpacing: {
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 25,
                                },
                              }
                        }
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-[#a77d3b] border-t-transparent rounded-full animate-spin" />
                            <span className="font-light text-[#fefff5]">
                              Senda...
                            </span>
                          </div>
                        ) : (
                          <>
                            <span className="font-light bg-gradient-to-b from-[#fefff5] to-[#a77d3b] bg-clip-text text-transparent">
                              Byrja bókun
                            </span>
                            <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#a77d3b]" />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`step-${currentStepIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.6,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className="w-full max-w-4xl p-2 sm:p-4"
                  >
                    <CurrentQuestion
                      formData={formData}
                      updateFormData={updateFormData}
                      t={t}
                      onContinue={onContinue}
                    />
                  </motion.div>
                )
              ) : (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <p className="text-slate-400">Loading...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
