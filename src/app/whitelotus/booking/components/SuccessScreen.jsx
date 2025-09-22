import { motion } from "framer-motion";
import { useEffect } from "react";
import Link from "next/link";

export default function SuccessScreen({ submissionId, t }) {
  useEffect(() => {
    // Clear saved data on success
    localStorage.removeItem("wl-booking-data");
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4"
    >
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5, type: "spring", bounce: 0.6 }}
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>

          {/* Success Message */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-2xl font-bold text-slate-800 mb-4"
          >
            {t("successTitle")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-slate-600 mb-6"
          >
            {t("successMessage")}
          </motion.p>

          {/* Reference ID */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="bg-slate-50 rounded-xl p-4 mb-6"
          >
            <p className="text-sm text-slate-600 mb-2">{t("referenceId")}</p>
            <p className="font-mono text-lg font-bold text-slate-800">{submissionId}</p>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="text-sm text-slate-600 mb-8"
          >
            <p className="mb-2">Við munum:</p>
            <ul className="text-left space-y-1">
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Hafa samband innan 24 klukkustunda</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Ræða nánar um viðburðinn</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Senda þér verðtilboð</span>
              </li>
            </ul>
          </motion.div>

          {/* Back to Home Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
          >
            <Link href="/whitelotus">
              <motion.button
                className="w-full bg-slate-700 text-white py-4 px-6 rounded-xl font-medium hover:bg-slate-800 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t("backToHome")}
              </motion.button>
            </Link>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.5 }}
            className="mt-6 pt-6 border-t border-gray-200"
          >
            <p className="text-xs text-slate-500">
              Spurningar? Hafðu samband á{" "}
              <a href="mailto:team@whitelotus.is" className="text-slate-600 hover:underline">
                team@whitelotus.is
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

