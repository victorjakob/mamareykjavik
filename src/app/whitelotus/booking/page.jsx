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
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on client side to prevent hydration mismatch
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

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
    if (currentStepIndex === totalSteps - 1) {
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
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/whitelotus/white.jpeg')",
          backgroundAttachment: isMobile ? "scroll" : "fixed",
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
        {/* Logo Section - Responsive animated height */}
        <motion.div
          className="flex items-center justify-center"
          animate={{
            height: currentStepIndex === 0 ? "50vh" : "25vh",
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
              scale: currentStepIndex === 0 ? 1 : 0.65,
              opacity: 1,
            }}
            transition={{
              delay: currentStepIndex === 0 ? 0.2 : 0.1,
              duration: shouldReduceMotion ? 0 : 0.8,
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

        {/* Progress Bar - Only show after first step */}
        {currentStepIndex > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex mt-2 sm:mt-3 mb-1 sm:mb-2 justify-center px-4 sm:px-6"
          >
            <div className="w-full max-w-md">
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

                {/* Progress Dots */}
                <div className="flex justify-between mt-3">
                  {Array.from({ length: totalSteps - 1 }, (_, index) => (
                    <motion.div
                      key={index}
                      className={`
                        w-2 h-2 rounded-full transition-all duration-300
                        ${
                          index < currentStepIndex - 1
                            ? "bg-[#a77d3b] scale-110"
                            : index === currentStepIndex - 1
                              ? "bg-[#a77d3b]/60 scale-125"
                              : "bg-slate-600/50"
                        }
                      `}
                      animate={{
                        scale:
                          index === currentStepIndex - 1
                            ? 1.25
                            : index < currentStepIndex - 1
                              ? 1.1
                              : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Content Section - Responsive animated height */}
        <motion.div
          className="flex flex-col justify-between flex-1"
          animate={{
            height: currentStepIndex === 0 ? "50vh" : "75vh",
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
            className="flex-1 flex items-start justify-center px-6"
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
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{
                      duration: 0.6,
                      ease: [0.4, 0.0, 0.2, 1],
                    }}
                    className="text-center max-w-lg"
                  >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extralight text-[#fefff5] mb-4 sm:mb-6">
                      Velkomin í White Lotus
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl font-extralight text-[#fefff5] leading-relaxed px-4 sm:px-0">
                      Láttu okkur hjálpa þér að skipuleggja fullkominn viðburð
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`step-${currentStepIndex}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{
                      duration: 0.6,
                      ease: [0.4, 0.0, 0.2, 1],
                    }}
                    className="w-full max-w-2xl p-2 sm:p-4"
                  >
                    <CurrentQuestion
                      formData={formData}
                      updateFormData={updateFormData}
                      t={t}
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

          {/* Navigation - Bottom portion */}
          <motion.div
            className="pb-6 sm:pb-8 md:pb-12 px-4 sm:px-6 flex justify-center"
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.6,
              delay: currentStepIndex === 0 ? 0.5 : 0.2,
              ease: [0.4, 0.0, 0.2, 1],
            }}
          >
            <motion.div
              className="flex justify-center items-center gap-3 sm:gap-4"
              layout
              transition={{
                duration: shouldReduceMotion ? 0 : 0.8,
                ease: [0.4, 0.0, 0.2, 1],
                type: "spring",
                stiffness: 200,
                damping: 25,
              }}
            >
              {/* Back Button */}
              <AnimatePresence>
                {canGoBack && (
                  <motion.button
                    onClick={onPrevious}
                    disabled={isLoading}
                    className="
                       w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300
                       bg-slate-900/50 hover:bg-slate-800/70 border border-[#a77d3b]/30 hover:border-[#a77d3b]/50
                       backdrop-blur-sm
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
                    initial={
                      shouldReduceMotion
                        ? { opacity: 1 }
                        : {
                            opacity: 0,
                            x: -30,
                            scale: 0.8,
                            rotate: -15,
                          }
                    }
                    animate={
                      shouldReduceMotion
                        ? {}
                        : {
                            opacity: 1,
                            x: 0,
                            scale: 1,
                            rotate: 0,
                          }
                    }
                    exit={
                      shouldReduceMotion
                        ? {}
                        : {
                            opacity: 0,
                            x: -30,
                            scale: 0.8,
                            rotate: -15,
                          }
                    }
                    transition={
                      shouldReduceMotion
                        ? {}
                        : {
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                            delay: 0.2,
                          }
                    }
                  >
                    <motion.div
                      initial={{ x: -5, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                    >
                      <ChevronLeftIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#a77d3b]" />
                    </motion.div>
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Continue Button */}
              <motion.button
                onClick={onContinue}
                disabled={!canContinue || isLoading}
                className={`
                  px-6 sm:px-8 md:px-10 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 transition-all duration-300 
                  border border-[#a77d3b]/30 hover:border-[#a77d3b]/50
                  bg-slate-900/30 hover:bg-slate-800/50 backdrop-blur-sm rounded-full
                  text-sm sm:text-base
                  ${
                    canContinue && !isLoading
                      ? "font-light"
                      : "text-slate-500 cursor-not-allowed opacity-50"
                  }
                `}
                aria-label={
                  currentStepIndex === 0 ? "Byrja bókun" : "Halda áfram"
                }
                whileHover={
                  canContinue && !isLoading && !shouldReduceMotion
                    ? {
                        scale: 1.02,
                        letterSpacing: "0.05em",
                        borderColor: "#a77d3b",
                      }
                    : {}
                }
                whileTap={
                  canContinue && !isLoading && !shouldReduceMotion
                    ? { scale: 0.98 }
                    : {}
                }
                initial={
                  shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }
                }
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                layout
                transition={
                  shouldReduceMotion
                    ? {}
                    : {
                        delay: 0.2,
                        letterSpacing: {
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        },
                        layout: {
                          type: "spring",
                          stiffness: 200,
                          damping: 25,
                          duration: 0.8,
                        },
                      }
                }
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-[#a77d3b] border-t-transparent rounded-full animate-spin" />
                    <span className="font-light text-[#fefff5]">Senda...</span>
                  </div>
                ) : (
                  <>
                    <span className="font-light bg-gradient-to-b from-[#fefff5] to-[#a77d3b] bg-clip-text text-transparent">
                      {currentStepIndex === 0 ? "Byrja" : "Áfram"}
                    </span>
                    <ChevronRightIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#a77d3b]" />
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
