"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import Link from "next/link";
import { supabase } from "@/util/supabase/client";
import { useSession } from "next-auth/react";
import { Sparkles, Gift, ChefHat, Utensils } from "lucide-react";
import { toast } from "react-hot-toast";
import UseMealModal from "./UseMealModal";
import CelebrationModal from "./CelebrationModal";

const fetcher = async (key, supabase, email) => {
  const { data, error } = await supabase
    .from("meal_cards")
    .select("*")
    .eq("buyer_email", email)
    .in("status", ["paid"])
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export default function MealCardsWidget() {
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isUsingMeal, setIsUsingMeal] = useState(false);
  const [showUseMealModal, setShowUseMealModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const swrKey = session ? ["meal_cards", session.user.email] : null;

  const {
    data: mealCards,
    error,
    isLoading,
    mutate,
  } = useSWR(
    swrKey,
    ([key, email]) => fetcher(key, supabase, email),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000,
      dedupingInterval: 5000,
    }
  );

  // Get active meal cards
  const activeCards = mealCards?.filter((card) => {
    const now = new Date();
    return (
      new Date(card.valid_until) >= now &&
      card.meals_remaining > 0 &&
      card.status === "paid"
    );
  }) || [];

  const totalMealsRemaining = activeCards.reduce(
    (sum, card) => sum + card.meals_remaining,
    0
  );

  // Get the first active card (most recent)
  const firstActiveCard = activeCards[0];

  // Open the use meal modal
  const handleOpenUseMealModal = () => {
    if (!firstActiveCard) {
      toast.error("No active meal cards found");
      return;
    }
    setShowUseMealModal(true);
  };

  // Handle confirming meal use from modal
  const handleConfirmUseMeal = async (quantity) => {
    if (!activeCards.length || isUsingMeal) return;

    setIsUsingMeal(true);

    try {
      const response = await fetch("/api/meal-cards/use-meal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
      
      // Refresh the meal cards data - force revalidation
      await mutate(undefined, { revalidate: true });
    } catch (error) {
      toast.error(error.message || "Failed to use meal");
    } finally {
      setIsUsingMeal(false);
    }
  };

  // Animate in on mount if there are cards
  useEffect(() => {
    if (activeCards.length > 0 && !hasAnimated) {
      const timer = setTimeout(() => setHasAnimated(true), 300);
      return () => clearTimeout(timer);
    }
  }, [activeCards.length, hasAnimated]);

  return (
    <>
      {/* Celebration Modal - Always render outside conditional */}
      <CelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
      />

      {/* Don't show widget if no active cards */}
      {!isLoading && !error && activeCards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={
            hasAnimated
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 20, scale: 0.95 }
          }
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.2,
          }}
          className="relative mb-8"
        >
      {/* Special Meal Cards Widget */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-400 to-emerald-500 p-1 shadow-2xl"
      >
        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-orange-400 via-emerald-400 to-orange-400 opacity-50"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            backgroundSize: "200% 200%",
          }}
        />

        <div className="relative bg-white rounded-[22px] p-6 sm:p-8">
          {/* Header with sparkle animation */}
          <div className="flex items-center justify-between mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="flex items-center gap-3"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              >
                <Gift className="h-8 w-8 text-orange-500" />
              </motion.div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Your Meal Cards
                </h3>
                <p className="text-sm text-gray-600 font-light">
                  {totalMealsRemaining} meal{totalMealsRemaining !== 1 ? "s" : ""} ready to enjoy!
                </p>
              </div>
            </motion.div>

            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-orange-50 hover:bg-orange-100 transition-colors"
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Sparkles className="h-5 w-5 text-orange-600" />
              </motion.div>
            </motion.button>
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-4 mb-6"
          >
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 border border-emerald-200/50">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">
                  Meals Left
                </span>
              </div>
              <p className="text-3xl font-bold text-emerald-600">
                {totalMealsRemaining}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4 border border-orange-200/50">
              <div className="flex items-center gap-2 mb-2">
                <ChefHat className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">
                  Active Cards
                </span>
              </div>
              <p className="text-3xl font-bold text-orange-600">
                {activeCards.length}
              </p>
            </div>
          </motion.div>

          {/* Expandable Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  {activeCards.map((card, index) => {
                    const isValid = new Date(card.valid_until) >= new Date();
                    return (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50/50 to-emerald-50/50 rounded-xl border border-orange-100/50"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            5 Meals for Winter
                          </p>
                          <p className="text-sm text-gray-600">
                            Valid until: {format(new Date(card.valid_until), "PPP")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-orange-600">
                            {card.meals_remaining}
                          </p>
                          <p className="text-xs text-gray-500">meals</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 grid grid-cols-2 gap-3"
                >
                  <motion.button
                    onClick={handleOpenUseMealModal}
                    disabled={isUsingMeal || !firstActiveCard}
                    whileHover={{ scale: isUsingMeal ? 1 : 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed"
                  >
                    {isUsingMeal ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Utensils className="h-5 w-5" />
                        </motion.div>
                        <span>Using...</span>
                      </>
                    ) : (
                      <>
                        <Utensils className="h-5 w-5" />
                        <span>Use a Meal</span>
                      </>
                    )}
                  </motion.button>
                  <Link
                    href="/profile/my-meal-cards"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-center"
                  >
                    <Gift className="h-5 w-5" />
                    <span>View Details</span>
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Buttons when collapsed */}
          {!isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 gap-3"
            >
              <motion.button
                onClick={handleOpenUseMealModal}
                disabled={isUsingMeal || !firstActiveCard}
                whileHover={{ scale: isUsingMeal ? 1 : 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed"
              >
                {isUsingMeal ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Utensils className="h-5 w-5" />
                    </motion.div>
                    <span>Using...</span>
                  </>
                ) : (
                  <>
                    <Utensils className="h-5 w-5" />
                    <span>Use a Meal</span>
                  </>
                )}
              </motion.button>
              <Link
                href="/profile/my-meal-cards"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-center"
              >
                <Gift className="h-5 w-5" />
                <span>View Cards</span>
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
      
      {/* Use Meal Modal */}
      <UseMealModal
        isOpen={showUseMealModal}
        onClose={() => setShowUseMealModal(false)}
        totalMealsAvailable={totalMealsRemaining}
        onConfirm={handleConfirmUseMeal}
        isProcessing={isUsingMeal}
      />
    </motion.div>
      )}
    </>
  );
}

