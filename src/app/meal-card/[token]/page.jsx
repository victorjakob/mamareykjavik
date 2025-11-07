"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Gift, Calendar, Coffee, Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import UseMealModal from "@/app/profile/components/UseMealModal";
import CelebrationModal from "@/app/profile/components/CelebrationModal";

export default function MealCardPage() {
  const params = useParams();
  const token = params.token;

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUseMealModal, setShowUseMealModal] = useState(false);
  const [isUsingMeal, setIsUsingMeal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousMealsRef = useRef(null);

  const fetchCard = async () => {
    try {
      const response = await fetch(`/api/meal-cards/by-token/${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load card");
      }

      // Check if meals changed (trigger animation)
      if (
        previousMealsRef.current !== null &&
        previousMealsRef.current !== data.card.meals_remaining
      ) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1000);
      }

      // Update previous meals ref
      previousMealsRef.current = data.card.meals_remaining;

      setCard(data.card);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCard();
    }
  }, [token]);

  const handleUseMeal = async (quantity) => {
    setIsUsingMeal(true);
    try {
      const response = await fetch("/api/meal-cards/use-meal-by-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          quantity: quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to use meal");
      }

      // Check if any card reached 0 meals (5th meal used)
      const hasCompletedCard = data.updatedCards?.some(
        (card) => card.mealsUsed > 0 && card.meals_remaining === 0
      );

      if (hasCompletedCard) {
        // Show celebration modal
        setShowCelebration(true);
      } else {
        toast.success(
          `${quantity} meal${quantity > 1 ? "s" : ""} used successfully! Enjoy your meal${quantity > 1 ? "s" : ""} 🍽️`
        );
      }

      // Close modal and refresh data
      setShowUseMealModal(false);

      // Refresh the card data
      await fetchCard();
    } catch (error) {
      toast.error(error.message || "Failed to use meal");
    } finally {
      setIsUsingMeal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-emerald-50/40 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-12 w-12 text-orange-500" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-emerald-50/40 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center"
        >
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-light text-gray-900 mb-2">
            Card Not Found
          </h1>
          <p className="text-gray-600">{error}</p>
        </motion.div>
      </div>
    );
  }

  if (!card) {
    return null;
  }

  const isExpired = new Date(card.valid_until) < new Date();
  const isActive = card.status === "paid" && card.meals_remaining > 0 && !isExpired;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-emerald-50/40 pt-24 sm:pt-28 pb-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          {/* Header */}
          <div className="text-right sm:text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-2 tracking-tighter">
              Your Meal Card
            </h1>
            <p className="text-sm sm:text-base text-gray-600">5 Meals for Winter</p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            {/* Status Banner */}
            {!isActive && (
              <div className="bg-gray-100 px-4 sm:px-6 py-3 text-center">
                <p className="text-xs sm:text-sm text-gray-600">
                  {isExpired ? "This card has expired" : 
                   card.meals_remaining === 0 ? "All meals used" : 
                   "Card inactive"}
                </p>
              </div>
            )}

            <div className="p-4 sm:p-6 md:p-8">
              {/* Meals Remaining - Large Display */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-block">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ 
                      scale: 1,
                      rotate: isAnimating ? [0, 1440] : 0,
                    }}
                    transition={{ 
                      scale: { type: "spring", stiffness: 200 },
                      rotate: { duration: 0.8, ease: "easeInOut" }
                    }}
                    className="relative"
                  >
                    <motion.div 
                      className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-orange-500 to-emerald-500 flex items-center justify-center shadow-lg"
                      animate={{
                        scale: isAnimating ? [1, 1.1, 1] : 1,
                      }}
                      transition={{
                        scale: { duration: 0.8, ease: "easeInOut" }
                      }}
                    >
                      <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full bg-white flex flex-col items-center justify-center">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={card.meals_remaining}
                            initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            exit={{ opacity: 0, scale: 0.5, rotateY: -90 }}
                            transition={{ duration: 0.4 }}
                            className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-900"
                          >
                            {card.meals_remaining}
                          </motion.span>
                        </AnimatePresence>
                        <motion.span 
                          className="text-xs sm:text-sm text-gray-500 mt-1"
                          animate={{
                            opacity: isAnimating ? 0 : 1
                          }}
                        >
                          meals left
                        </motion.span>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>

              {/* Card Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-gradient-to-br from-orange-50/50 to-emerald-50/50 p-3 sm:p-4 rounded-xl border border-orange-100/50">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">Valid Period</p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">
                        {format(new Date(card.valid_from), "MMM d, yyyy")}
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">
                        to {format(new Date(card.valid_until), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50/50 to-emerald-50/50 p-3 sm:p-4 rounded-xl border border-orange-100/50">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Coffee className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">Free Drink</p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">
                        When you use your 5th meal!
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Cacao, tea, or coffee ☕
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cardholder Info */}
              <div className="bg-gray-50 p-3 sm:p-4 rounded-xl mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">Cardholder</p>
                <p className="text-sm sm:text-base font-medium text-gray-900 break-words">{card.buyer_name}</p>
                <p className="text-xs sm:text-sm text-gray-600 break-words">{card.buyer_email}</p>
              </div>

              {/* Use Meal Button */}
              {isActive && (
                <motion.button
                  onClick={() => setShowUseMealModal(true)}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Use a Meal
                </motion.button>
              )}

              {/* Instructions */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">
                  How to Use
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                    <span>Show this page at the restaurant</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                    <span>Staff will help you redeem your meal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                    <span>Your card updates instantly after each use</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                    <span>Bookmark this link for easy access!</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs sm:text-sm text-gray-500">
            <p>Made with big love 🌱 Mama</p>
          </div>
        </motion.div>

        {/* Use Meal Modal */}
        <UseMealModal
          isOpen={showUseMealModal}
          onClose={() => setShowUseMealModal(false)}
          totalMealsAvailable={card.meals_remaining}
          onConfirm={handleUseMeal}
          isProcessing={isUsingMeal}
        />

        {/* Celebration Modal */}
        <CelebrationModal
          isOpen={showCelebration}
          onClose={() => setShowCelebration(false)}
        />
      </div>
    </div>
  );
}

