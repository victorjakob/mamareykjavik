"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Coffee, Gift } from "lucide-react";

export default function CelebrationModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative">
              {/* Confetti/Sparkle Animation */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      x: "50%",
                      y: "50%",
                      opacity: 1,
                      scale: 0,
                    }}
                    animate={{
                      x: `${50 + (Math.random() - 0.5) * 100}%`,
                      y: `${50 + (Math.random() - 0.5) * 100}%`,
                      opacity: [1, 1, 0],
                      scale: [0, 1, 0],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                    className="absolute"
                  >
                    <Sparkles className="h-4 w-4 text-orange-500" />
                  </motion.div>
                ))}
              </div>

              <div className="relative bg-gradient-to-br from-orange-500 via-emerald-500 to-orange-500 p-1">
                <div className="bg-white rounded-[22px] p-8 text-center">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="mb-6"
                  >
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <Gift className="h-12 w-12 text-white" />
                    </div>
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold text-gray-900 mb-4"
                  >
                    🎉 Celebration! 🎉
                  </motion.h2>

                  {/* Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4 mb-6"
                  >
                    <p className="text-lg text-gray-700">
                      You've used all 5 meals!
                    </p>
                    <div className="bg-gradient-to-br from-orange-50 to-emerald-50 rounded-xl p-4 border border-orange-200">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <Coffee className="h-6 w-6 text-emerald-600" />
                        <p className="text-xl font-bold text-gray-900">
                          Free Drink on Us!
                        </p>
                      </div>
                      <p className="text-gray-600">
                        Enjoy a free Ceremonial Cacao, tea, or coffee ☕
                      </p>
                    </div>
                  </motion.div>

                  {/* Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    onClick={onClose}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Awesome! 🎊
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


