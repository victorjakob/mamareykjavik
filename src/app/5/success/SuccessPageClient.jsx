"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";

export default function FiveMealsSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a brief loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const translations = {
    en: {
      title: "Payment Successful! 🎉",
      message:
        "Your 5 Meals for Winter card has been added to your Mama account.",
      emailSent: "A confirmation email has been sent to your email address.",
      howToUse: "How to Use",
      instructions: [
        "Log in to your Mama account",
        "Visit the restaurant during opening hours",
        "Show your phone with your account",
        "Enjoy your soul-warming meal!",
      ],
      specialNote:
        "Remember: Your 5th bowl comes with a free Ceremonial Cacao, tea or coffee ☕",
      viewAccount: "View My Account",
      backHome: "Back to Home",
    },
    is: {
      title: "Greiðsla tókst! 🎉",
      message:
        "5 Réttir fyrir Veturnn kortið þitt hefur verið bætt við Mama prófíl þinn.",
      emailSent: "Staðfestingarpóstur hefur verið sendur á netfangið þitt.",
      howToUse: "Hvernig á að nota",
      instructions: [
        "Skráðu þig inn á Mama.is",
        "Heimsæktu okkur á opnunartíma",
        "Sýndu símann með prófílnum þínum",
        "Njóttu ljúffengar máltíðarinnar!",
      ],
      specialNote:
        "Mundu: 5. bollinn þinn kemur með ókeypis Athafnacacao, te eða kaffi ☕",
      viewAccount: "Skoða Prófilinn Minn",
      backHome: "Til Baka Heim",
    },
  };

  const t = translations[language];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-emerald-50/40 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-emerald-50/40 py-12 sm:py-16">
      <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden text-center"
        >
          {/* Success Icon */}
          <div className="px-8 py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full flex items-center justify-center"
            >
              <span className="text-4xl">✓</span>
            </motion.div>

            <h1
              className="text-3xl sm:text-4xl font-light text-gray-900 mb-4 tracking-tighter"
              style={{ letterSpacing: "-0.02em" }}
            >
              {t.title}
            </h1>

            <p className="text-lg text-gray-600 mb-2 font-light">{t.message}</p>

            <p className="text-sm text-gray-500 mb-8 font-light">
              {t.emailSent}
            </p>

            {/* Instructions */}
            <div className="bg-gradient-to-br from-orange-50/50 to-emerald-50/50 p-6 rounded-xl border border-orange-100/50 mb-8 text-left">
              <h2
                className="text-xl font-light text-gray-900 mb-4 text-center tracking-tighter"
                style={{ letterSpacing: "-0.02em" }}
              >
                {t.howToUse}
              </h2>
              <ul className="space-y-3">
                {t.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full"></div>
                    </div>
                    <p className="text-base text-gray-700 font-light flex-1">
                      {instruction}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Special Note */}
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/50 mb-8">
              <p className="text-sm text-emerald-800 font-light">
                {t.specialNote}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Link
                  href="/profile"
                  className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-8 py-3 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 inline-block"
                >
                  {t.viewAccount}
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
