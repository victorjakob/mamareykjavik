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

  const { data: mealCards, error, isLoading, mutate } = useSWR(
    swrKey,
    ([key, email]) => fetcher(key, supabase, email),
    { revalidateOnFocus: false, revalidateOnReconnect: true, refreshInterval: 30000, dedupingInterval: 5000 }
  );

  const activeCards = mealCards?.filter((card) => {
    const now = new Date();
    return new Date(card.valid_until) >= now && card.meals_remaining > 0 && card.status === "paid";
  }) || [];

  const totalMealsRemaining = activeCards.reduce((sum, card) => sum + card.meals_remaining, 0);
  const firstActiveCard = activeCards[0];

  const handleOpenUseMealModal = () => {
    if (!firstActiveCard) { toast.error("No active meal cards found"); return; }
    setShowUseMealModal(true);
  };

  const handleConfirmUseMeal = async (quantity) => {
    if (!activeCards.length || isUsingMeal) return;
    setIsUsingMeal(true);
    try {
      const response = await fetch("/api/meal-cards/use-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to use meal");
      const hasCompletedCard = data.updatedCards?.some((card) => card.mealsUsed > 0 && card.meals_remaining === 0);
      if (hasCompletedCard) {
        setShowCelebration(true);
      } else {
        toast.success(`${quantity} meal${quantity > 1 ? "s" : ""} used successfully! Enjoy your meal${quantity > 1 ? "s" : ""} 🍽️`);
      }
      setShowUseMealModal(false);
      await mutate(undefined, { revalidate: true });
    } catch (error) {
      toast.error(error.message || "Failed to use meal");
    } finally {
      setIsUsingMeal(false);
    }
  };

  useEffect(() => {
    if (activeCards.length > 0 && !hasAnimated) {
      const timer = setTimeout(() => setHasAnimated(true), 300);
      return () => clearTimeout(timer);
    }
  }, [activeCards.length, hasAnimated]);

  return (
    <>
      <CelebrationModal isOpen={showCelebration} onClose={() => setShowCelebration(false)} />

      {!isLoading && !error && activeCards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={hasAnimated ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 16, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.2 }}
          className="mb-6"
        >
          <div
            className="border rounded-[24px] overflow-hidden"
            style={{
              border: "1.5px solid #eadfce",
              background: "linear-gradient(180deg, #fffdf9 0%, #fff8f1 100%)",
              boxShadow: "0 10px 28px rgba(60,30,10,0.08), 0 2px 10px rgba(60,30,10,0.04)",
            }}
          >

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "#fff8f2" }}>
                  <Gift className="h-4 w-4 text-[#ff914d]" />
                </div>
                <div>
                  <h3 className="font-medium text-base" style={{ color: "#2c1810" }}>Your Meal Cards</h3>
                  <p className="text-sm mt-0.5" style={{ color: "#9a7a62" }}>
                    {totalMealsRemaining} meal{totalMealsRemaining !== 1 ? "s" : ""} ready to enjoy
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ border: "1px solid #e8ddd3" }}
              >
                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ type: "spring", stiffness: 250 }}>
                  <Sparkles className="h-3.5 w-3.5" style={{ color: "#9a7a62" }} />
                </motion.div>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 px-6 pb-4">
              <div className="rounded-xl p-4" style={{ backgroundColor: "#fff8f2" }}>
                <p className="text-xs uppercase tracking-[0.28em] mb-1" style={{ color: "#9a7a62" }}>Meals Left</p>
                <p className="font-cormorant font-light text-[#ff914d]" style={{ fontSize: "1.8rem" }}>
                  {totalMealsRemaining}
                </p>
              </div>
              <div className="rounded-xl p-4" style={{ backgroundColor: "#fff8f2" }}>
                <p className="text-xs uppercase tracking-[0.28em] mb-1" style={{ color: "#9a7a62" }}>Active Cards</p>
                <p className="font-cormorant font-light" style={{ fontSize: "1.8rem", color: "#2c1810" }}>
                  {activeCards.length}
                </p>
              </div>
            </div>

            {/* Expandable card details */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 space-y-2 pt-4" style={{ borderTop: "1px solid #e8ddd3" }}>
                    {activeCards.map((card, index) => (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className="flex items-center justify-between p-3.5 rounded-xl"
                        style={{ backgroundColor: "#fff8f2" }}
                      >
                        <div>
                          <p className="text-base font-medium" style={{ color: "#2c1810" }}>5 Meals for Winter</p>
                          <p className="text-sm mt-0.5" style={{ color: "#9a7a62" }}>
                            Valid until {format(new Date(card.valid_until), "PPP")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-cormorant font-light text-[#ff914d] text-2xl">{card.meals_remaining}</p>
                          <p className="text-xs" style={{ color: "#9a7a62" }}>meals</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 px-6 pb-5">
              <motion.button
                onClick={handleOpenUseMealModal}
                disabled={isUsingMeal || !firstActiveCard}
                whileHover={{ scale: isUsingMeal ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 py-3 bg-[#ff914d] text-black text-base font-semibold rounded-full hover:bg-[#ff914d]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUsingMeal ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Utensils className="h-4 w-4" />
                    </motion.div>
                    <span>Using...</span>
                  </>
                ) : (
                  <>
                    <Utensils className="h-4 w-4" />
                    <span>Use a Meal</span>
                  </>
                )}
              </motion.button>
              <Link
                href="/profile/my-meal-cards"
                className="flex items-center justify-center gap-2 py-3 text-base rounded-full transition-all duration-200 text-center"
                style={{ border: "1px solid #e8ddd3", color: "#2c1810" }}
              >
                <Gift className="h-4 w-4" />
                <span>View Cards</span>
              </Link>
            </div>
          </div>

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
