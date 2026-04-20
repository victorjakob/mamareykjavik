"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  CalendarIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/util/supabase/client";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";

const fetcher = async (key, supabase, email) => {
  const { data, error } = await supabase
    .from("meal_cards").select("*").eq("buyer_email", email).in("status", ["paid"]).order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export default function MyMealCards() {
  const [showExpiredCards, setShowExpiredCards] = useState(false);
  const { data: session } = useSession();

  const { data: mealCards, error, isLoading } = useSWR(
    session ? ["meal_cards", session.user.email] : null,
    ([key, email]) => fetcher(key, supabase, email),
    { revalidateOnFocus: false, revalidateOnReconnect: true, refreshInterval: 30000, dedupingInterval: 5000 }
  );

  const { activeCards, expiredCards } = useMemo(() => {
    const now = new Date();
    return {
      activeCards: mealCards?.filter((c) => new Date(c.valid_until) >= now && c.meals_remaining > 0 && c.status === "paid") || [],
      expiredCards: mealCards?.filter((c) => new Date(c.valid_until) < now || c.meals_remaining === 0 || c.status !== "paid") || [],
    };
  }, [mealCards]);

  const cardsToShow = showExpiredCards ? expiredCards : activeCards;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1208] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-[#1a1208] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center"
        >
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full mx-auto mb-6 flex items-center justify-center">
            <ExclamationCircleIcon className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="font-cormorant font-light italic text-[#f0ebe3] text-2xl mb-3">Please sign in</h1>
          <p className="text-[#a09488] text-sm mb-8">Log in or register to view your meal cards</p>
          <Link href="/auth" className="inline-flex items-center justify-center px-7 py-3 bg-[#ff914d] text-black text-sm font-semibold rounded-full hover:bg-[#ff914d]/90 transition-colors">
            Go to Login Page
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!mealCards?.length) {
    return (
      <div className="min-h-screen bg-[#1a1208] flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-[#ff914d]/10 border border-[#ff914d]/20 rounded-full mx-auto mb-6 flex items-center justify-center">
            <CreditCardIcon className="h-8 w-8 text-[#ff914d]" />
          </div>
          <h1 className="font-cormorant font-light italic text-[#f0ebe3] text-3xl mb-3">My Meal Cards</h1>
          <p className="text-[#a09488] text-sm mb-8">You don&apos;t have any meal cards yet.</p>
          <Link href="/5" className="inline-flex items-center justify-center px-7 py-3 bg-[#ff914d] text-black text-sm font-semibold rounded-full hover:bg-[#ff914d]/90 transition-colors">
            Get 5 Meals for Winter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1208] pt-16">
      <div className="mx-auto max-w-sm px-6 py-12 sm:max-w-xl lg:max-w-6xl xl:max-w-7xl lg:px-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <Link href="/profile" className="inline-flex items-center gap-1.5 text-[#a09488] hover:text-[#d4c8bc] text-xs tracking-wide mb-8 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to Profile
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
                <span className="text-[10px] uppercase tracking-[0.45em] text-[#ff914d]">Your cards</span>
              </div>
              <h1
                className="font-cormorant font-light italic text-[#f0ebe3]"
                style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
              >
                {showExpiredCards ? "Expired Cards" : "Active Meal Cards"}
              </h1>
            </div>
            {(expiredCards.length > 0 || activeCards.length > 0) && (
              <button
                onClick={() => setShowExpiredCards(!showExpiredCards)}
                className="px-4 py-2 border border-white/15 text-[#a09488] text-xs rounded-full hover:border-[#ff914d]/40 hover:text-[#ff914d] transition-all duration-200"
              >
                {showExpiredCards ? "View Active" : "View Expired"}
              </button>
            )}
          </div>
        </motion.div>

        {/* Cards */}
        {cardsToShow.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-[#1e1610] border border-white/8 rounded-2xl"
          >
            <CreditCardIcon className="h-10 w-10 text-[#5a4a3a] mx-auto mb-4" />
            <p className="text-[#a09488] text-sm mb-6">No {showExpiredCards ? "expired" : "active"} meal cards found.</p>
            {!showExpiredCards && (
              <Link href="/5" className="inline-flex items-center justify-center px-6 py-2.5 bg-[#ff914d] text-black text-sm font-semibold rounded-full hover:bg-[#ff914d]/90 transition-colors">
                Get 5 Meals for Winter
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {cardsToShow.map((card, i) => {
              const isValid = new Date(card.valid_until) >= new Date();
              const isActive = card.meals_remaining > 0 && isValid;

              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-[#1e1610] border border-white/8 rounded-2xl p-6 hover:border-white/14 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-5">
                    {/* Left */}
                    <div className="flex-1 space-y-3">
                      <h2 className="font-cormorant font-light italic text-[#f0ebe3]" style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)" }}>
                        5 Meals for Winter
                      </h2>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5 text-[#a09488] text-sm">
                          <CreditCardIcon className="h-4 w-4 text-[#ff914d]/60 flex-shrink-0" />
                          <span>{card.meals_remaining} meal{card.meals_remaining !== 1 ? "s" : ""} remaining</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[#a09488] text-sm">
                          <CalendarIcon className="h-4 w-4 text-[#ff914d]/60 flex-shrink-0" />
                          <span>Valid until {format(new Date(card.valid_until), "PPP")}</span>
                        </div>
                        <p className="text-[#5a4a3a] text-xs pl-6.5">
                          Purchased {format(new Date(card.created_at), "PPP")}
                        </p>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-between gap-3">
                      <div className="text-right">
                        <div className="font-cormorant font-light text-[#ff914d]" style={{ fontSize: "2rem" }}>
                          {card.meals_remaining}
                        </div>
                        <p className="text-[#f0ebe3] text-sm font-medium">{card.price} ISK</p>
                      </div>
                      <div>
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#ff914d]/12 text-[#ff914d]">
                            <CheckCircleIcon className="h-3.5 w-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/8 text-[#a09488]">
                            <ExclamationCircleIcon className="h-3.5 w-3.5" />
                            {card.meals_remaining === 0 ? "Used" : "Expired"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
