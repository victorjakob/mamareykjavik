"use client";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

export default function PaymentButton({
  isProcessing,
  onClick,
  disabled,
  children,
}) {
  const { language } = useLanguage();
  const processingLabel =
    language === "is" ? "Ganga frá greiðslu..." : "Processing Payment...";

  return (
    <motion.button
      type="submit"
      onClick={onClick}
      disabled={disabled || isProcessing}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className="w-full py-4 rounded-full bg-[#ff914d] text-[#1a1510] text-sm uppercase tracking-[0.18em] font-light hover:bg-[#ff7a28] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff914d]/50 disabled:opacity-60 disabled:cursor-not-allowed"
      aria-busy={isProcessing}
      aria-live="polite"
    >
      {isProcessing ? (
        <div className="flex items-center justify-center gap-3">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {processingLabel}
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
}
