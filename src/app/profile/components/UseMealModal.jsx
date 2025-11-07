"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Utensils, Minus, Plus } from "lucide-react";

export default function UseMealModal({ isOpen, onClose, totalMealsAvailable, onConfirm, isProcessing }) {
  const [quantity, setQuantity] = useState(1);

  if (!totalMealsAvailable || totalMealsAvailable <= 0) return null;

  const maxMeals = totalMealsAvailable;
  const minMeals = 1;

  const handleIncrement = () => {
    if (quantity < maxMeals) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > minMeals) {
      setQuantity(quantity - 1);
    }
  };

  const handleConfirm = () => {
    if (quantity >= minMeals && quantity <= maxMeals) {
      onConfirm(quantity);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setQuantity(1);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Utensils className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Use Your Meals</h2>
                </div>
                {!isProcessing && (
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Quantity Selector */}
                <div className="mb-8">
                  <div className="flex items-center justify-center gap-6">
                    <motion.button
                      onClick={handleDecrement}
                      disabled={quantity <= minMeals || isProcessing}
                      whileHover={{ scale: quantity > minMeals ? 1.1 : 1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-4 rounded-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="h-6 w-6 text-gray-600" />
                    </motion.button>

                    <motion.div
                      key={quantity}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="min-w-[100px] text-center"
                    >
                      <span className="text-6xl font-bold text-emerald-600">
                        {quantity}
                      </span>
                    </motion.div>

                    <motion.button
                      onClick={handleIncrement}
                      disabled={quantity >= maxMeals || isProcessing}
                      whileHover={{ scale: quantity < maxMeals ? 1.1 : 1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-4 rounded-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="h-6 w-6 text-gray-600" />
                    </motion.button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {!isProcessing && (
                    <button
                      onClick={handleClose}
                      className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <motion.button
                    onClick={handleConfirm}
                    disabled={isProcessing || quantity < minMeals || quantity > maxMeals}
                    whileHover={{ scale: isProcessing ? 1 : 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Utensils className="h-5 w-5" />
                        </motion.div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Utensils className="h-5 w-5" />
                        <span>Confirm Use</span>
                      </>
                    )}
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

