import { motion } from "framer-motion";

export default function ErrorScreen({ error, onRetry, t }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4"
    >
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5, type: "spring", bounce: 0.6 }}
            className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.div>

          {/* Error Message */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-2xl font-bold text-slate-800 mb-4"
          >
            {t("errorTitle")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-slate-600 mb-6"
          >
            {error || t("submitError")}
          </motion.p>

          {/* Retry Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <motion.button
              onClick={onRetry}
              className="w-full bg-red-600 text-white py-4 px-6 rounded-xl font-medium hover:bg-red-700 transition-colors mb-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t("retry")}
            </motion.button>
          </motion.div>

          {/* Alternative Contact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="text-sm text-slate-600"
          >
            <p className="mb-2">{t("orContactDirectly")}</p>
            <div className="space-y-2">
              <a 
                href="mailto:team@whitelotus.is" 
                className="block text-slate-700 hover:underline"
              >
                📧 team@whitelotus.is
              </a>
              <a 
                href="tel:+3541234567" 
                className="block text-slate-700 hover:underline"
              >
                📞 +354 123 4567
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

