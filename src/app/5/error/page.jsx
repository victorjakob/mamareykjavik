"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ShoppingBag, Mail } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export default function FiveMealsError() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Payment Error",
      message: "Something went wrong with your payment.",
      note: "No charges were made to your account. Please try again or contact us if the problem persists.",
      tryAgain: "Try Again",
      backToOffer: "Back to Offer",
      contactUs: "Contact Support",
      backHome: "Back to Home",
    },
    is: {
      title: "Greiðsluvilla",
      message: "Eitthvað fór úrskeiðis með greiðsluna þína.",
      note: "Engar skuldfærslur voru gerðar á reikninginn þinn. Vinsamlegast reyndu aftur eða hafðu samband við okkur ef vandamálið er viðvarandi.",
      tryAgain: "Reyna Aftur",
      backToOffer: "Til Baka í Tilboð",
      contactUs: "Hafa Samband",
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
              className="w-20 h-20 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center"
            >
              <AlertCircle className="h-12 w-12 text-red-500" />
            </motion.div>

            <h1 className="text-3xl sm:text-4xl font-light text-gray-900 mb-4 tracking-tighter" style={{ letterSpacing: "-0.02em" }}>
              {t.title}
            </h1>

            <p className="text-lg text-gray-600 mb-2 font-light">
              {t.message}
            </p>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
              <p className="text-sm text-red-800 font-light">
                {t.note}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
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

            {/* Contact Support */}
            <div className="pt-6 border-t border-gray-200">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors"
              >
                <Mail className="h-4 w-4" />
                {t.contactUs}
              </Link>
            </div>

            <div className="mt-4">
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

