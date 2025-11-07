"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { XCircle, ArrowLeft, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export default function FiveMealsCancelled() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Payment Cancelled",
      message: "Your payment was cancelled. No charges were made.",
      note: "If you changed your mind, you can always come back and complete your purchase.",
      tryAgain: "Try Again",
      backToOffer: "Back to Offer",
      backHome: "Back to Home",
    },
    is: {
      title: "Greiðslu Hætt",
      message: "Greiðslunni þinni var hætt. Engar skuldfærslur voru gerðar.",
      note: "Ef þú skipti um skoðun geturðu alltaf komið til baka og klárað kaupin.",
      tryAgain: "Reyna Aftur",
      backToOffer: "Til Baka í Tilboð",
      backHome: "Til Baka Heim",
    },
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-emerald-50/40 py-12 sm:py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden text-center"
        >
          {/* Icon */}
          <div className="px-8 py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <XCircle className="h-12 w-12 text-gray-500" />
            </motion.div>

            <h1 className="text-3xl sm:text-4xl font-light text-gray-900 mb-4 tracking-tighter" style={{ letterSpacing: "-0.02em" }}>
              {t.title}
            </h1>

            <p className="text-lg text-gray-600 mb-2 font-light">
              {t.message}
            </p>

            <p className="text-sm text-gray-500 mb-8 font-light">
              {t.note}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Link
                  href="/5/buy"
                  className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-8 py-3 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {t.tryAgain}
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Link
                  href="/5"
                  className="bg-white border border-orange-500/30 text-orange-600 hover:bg-orange-50/50 hover:border-orange-500 px-8 py-3 rounded-xl text-base font-medium shadow-sm hover:shadow-md transition-all duration-300 inline-flex items-center gap-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                  {t.backToOffer}
                </Link>
              </motion.div>
            </div>

            <div className="mt-6">
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                {t.backHome}
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center text-xs sm:text-sm text-gray-500 mt-8">
          <p>Made with big love 🌱 Mama</p>
        </div>
      </div>
    </div>
  );
}

