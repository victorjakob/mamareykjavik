import { motion } from "framer-motion";
import { PlayIcon } from "@heroicons/react/24/solid";
import { ArrowLeft } from "lucide-react";

const NavigationButtons = ({
  onBack,
  onContinue,
  canGoBack,
  canContinue,
  isLoading,
  t,
}) => (
  <div className="flex justify-center items-center gap-6">
    {/* Back Button - Smaller and subtle */}
    {canGoBack && (
      <motion.button
        onClick={onBack}
        disabled={isLoading}
        className="
          w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
          bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 hover:border-slate-500/70
        "
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft className="w-4 h-4 text-slate-300" />
      </motion.button>
    )}

    {/* Continue Button */}
    <motion.button
      onClick={onContinue}
      disabled={!canContinue || isLoading}
      className={`
        px-8 py-4 flex items-center gap-3 transition-all duration-300
        ${
          canContinue && !isLoading
            ? "text-white"
            : "text-slate-500 cursor-not-allowed opacity-50"
        }
      `}
      whileHover={
        canContinue && !isLoading
          ? {
              letterSpacing: "0.1em",
            }
          : {}
      }
      whileTap={canContinue && !isLoading ? { scale: 0.98 } : {}}
      transition={{
        letterSpacing: {
          type: "spring",
          stiffness: 400,
          damping: 25,
        },
      }}
    >
      {isLoading ? (
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="font-medium">Senda...</span>
        </div>
      ) : (
        <>
          <span className="font-medium">{canGoBack ? "Áfram" : "Byrja"}</span>
          <PlayIcon className="h-5 w-5" />
        </>
      )}
    </motion.button>
  </div>
);

export default function BookingLayout({
  children,
  currentStepIndex,
  onBack,
  onContinue,
  canGoBack,
  canContinue,
  isLoading,
  t,
}) {
  const isWelcomeScreen = currentStepIndex === 0;

  return (
    <div className="min-h-screen relative">
      {/* Fixed Logo */}
      <motion.div
        initial={{ scale: 1, opacity: 1 }}
        animate={
          !isWelcomeScreen
            ? {
                scale: 0.3,
                x: 0,
                y: 0,
              }
            : {
                scale: 1,
                x: 0,
                y: 0,
              }
        }
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.8,
        }}
        className={`
          fixed left-0 right-0 flex justify-center z-20
          ${isWelcomeScreen ? "top-1/3" : "top-8"}
        `}
        style={{
          transition: "top 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80">
          <img
            src="/whitelotus/whitelotuslogowhite.png"
            alt="White Lotus Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </motion.div>

      {/* Content Area */}
      <div
        className={`flex justify-center px-4 ${isWelcomeScreen ? "min-h-screen pt-48 items-start" : "min-h-screen pt-32 items-center"}`}
      >
        {children}
      </div>

      {/* Fixed Navigation */}
      <div className="fixed bottom-16 left-0 right-0 flex justify-center z-20">
        <NavigationButtons
          onBack={onBack}
          onContinue={onContinue}
          canGoBack={canGoBack}
          canContinue={canContinue}
          isLoading={isLoading}
          t={t}
        />
      </div>
    </div>
  );
}
