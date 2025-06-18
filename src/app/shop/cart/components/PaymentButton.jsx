import { motion } from "framer-motion";

export default function PaymentButton({
  isProcessing,
  onClick,
  disabled,
  children,
}) {
  return (
    <motion.button
      type="submit"
      onClick={onClick}
      disabled={disabled || isProcessing}
      whileTap={{ scale: 0.97 }}
      className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
      aria-busy={isProcessing}
      aria-live="polite"
    >
      {isProcessing ? (
        <div className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing Payment...
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
}
