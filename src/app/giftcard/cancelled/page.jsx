"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";

export default function GiftCardCancelled() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Payment Cancelled",
      message: "Your gift card purchase was cancelled.",
      backToGiftCard: "Back to Gift Card",
      backHome: "Back to Home",
    },
    is: {
      title: "Greiðsla Hætt Við",
      message: "Kaup á gjafakorti voru hætt við.",
      backToGiftCard: "Til Baka í Gjafakort",
      backHome: "Til Baka Heim",
    },
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-emerald-50/40 py-12 sm:py-16">
      <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden text-center"
        >
          <div className="px-8 py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <span className="text-4xl">✕</span>
            </motion.div>

            <h1
              className="text-3xl sm:text-4xl font-light text-gray-900 mb-4 tracking-tighter"
              style={{ letterSpacing: "-0.02em" }}
            >
              {t.title}
            </h1>

            <p className="text-lg text-gray-600 mb-8 font-light">
              {t.message}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Link
                  href="/giftcard"
                  className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-8 py-3 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 inline-block"
                >
                  {t.backToGiftCard}
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Link
                  href="/"
                  className="bg-white border border-orange-500/30 text-orange-600 hover:bg-orange-50/50 hover:border-orange-500 px-8 py-3 rounded-xl text-base font-medium shadow-sm hover:shadow-md transition-all duration-300 inline-block"
                >
                  {t.backHome}
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

