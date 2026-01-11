import { motion } from "framer-motion";
import { useEffect } from "react";
import Link from "next/link";

export default function SuccessScreen({ submissionId, t }) {
  useEffect(() => {
    // For testing: Keep form data so user can submit again without refilling
    // localStorage.removeItem("wl-booking-data");
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4"
    >
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-slate-900/80 backdrop-blur-sm border border-[#a77d3b]/30 rounded-2xl shadow-2xl p-8 text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.4,
              duration: 0.5,
              type: "spring",
              bounce: 0.6,
            }}
            className="w-20 h-20 bg-gradient-to-r from-[#a77d3b] to-[#a77d3b]/80 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg
              className="w-10 h-10 text-[#fefff5]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>

          {/* Success Message */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-2xl font-extralight text-[#fefff5] mb-4"
          >
            {t("successTitle")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-[#fefff5]/80 font-light mb-6"
          >
            {t("successMessage")}
          </motion.p>

          {/* Reference ID */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="bg-[#a77d3b]/20 border border-[#a77d3b]/40 rounded-xl p-4 mb-6"
          >
            <p className="text-sm text-[#fefff5]/70 font-light mb-2">
              {t("referenceId")}
            </p>
            <p className="font-mono text-lg font-bold text-[#a77d3b]">
              {submissionId}
            </p>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="text-sm text-[#fefff5]/80 mb-8"
          >
            <p className="mb-3 font-light text-[#fefff5]">{t("nextSteps")}</p>
            <ul className="text-left space-y-2">
              <li className="flex items-center space-x-2">
                <span className="text-[#a77d3b]">✓</span>
                <span className="font-light">
                  {t("receivedInfo")}
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-[#a77d3b]">✓</span>
                <span className="font-light">{t("willContact")}</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-[#a77d3b]">✓</span>
                <span className="font-light">{t("finalizeDetails")}</span>
              </li>
            </ul>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            className="space-y-3"
          >
            <Link href={`/whitelotus/booking/${submissionId}`}>
              <motion.button
                className="w-full bg-[#a77d3b] text-[#fefff5] py-4 px-6 rounded-xl font-light hover:bg-[#a77d3b]/90 transition-colors shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t("viewBooking")}
              </motion.button>
            </Link>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.5 }}
            className="mt-6 pt-6 border-t border-[#a77d3b]/30"
          >
            <p className="text-xs text-[#fefff5]/60 font-light">
              {t("questionsContact")}{" "}
              <a
                href="mailto:team@whitelotus.is"
                className="text-[#a77d3b] hover:underline"
              >
                team@whitelotus.is
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
