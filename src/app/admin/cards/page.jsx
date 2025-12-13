"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminGuard from "../AdminGuard";
import Link from "next/link";
import {
  CreditCard,
  Gift,
  Loader2,
  ArrowRight,
  TrendingUp,
  Users,
} from "lucide-react";

export default function CardsOverview() {
  const [mealCardStats, setMealCardStats] = useState({
    total: 0,
    active: 0,
    used: 0,
    expired: 0,
  });
  const [giftCardStats, setGiftCardStats] = useState({
    total: 0,
    active: 0,
    used: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch meal cards stats
      const mealCardsResponse = await fetch("/api/admin/meal-cards");
      if (mealCardsResponse.ok) {
        const mealCardsData = await mealCardsResponse.json();
        const cards = mealCardsData.cards || [];
        const now = new Date();

        const active = cards.filter(
          (c) =>
            c.status === "paid" &&
            c.meals_remaining > 0 &&
            new Date(c.valid_until) > now
        ).length;
        const used = cards.filter(
          (c) => c.meals_remaining === 0 && c.status === "paid"
        ).length;
        const expired = cards.filter(
          (c) => new Date(c.valid_until) < now
        ).length;

        setMealCardStats({
          total: cards.length,
          active,
          used,
          expired,
        });
      }

      // Fetch gift cards stats
      const giftCardsResponse = await fetch("/api/admin/gift-cards");
      if (giftCardsResponse.ok) {
        const giftCardsData = await giftCardsResponse.json();
        const cards = giftCardsData.cards || [];

        const active = cards.filter(
          (c) => c.status === "paid" && c.remaining_balance > 0
        ).length;
        const used = cards.filter(
          (c) => c.remaining_balance === 0 && c.status === "paid"
        ).length;
        const pending = cards.filter((c) => c.status === "pending").length;

        setGiftCardStats({
          total: cards.length,
          active,
          used,
          pending,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-32 pb-16 flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-orange-600 animate-spin" />
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Cards Management
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Overview and management of meal cards and gift cards
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Meal Cards Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <CreditCard className="h-6 w-6 text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Meal Cards
                  </h2>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mealCardStats.total}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {mealCardStats.active}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Used</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {mealCardStats.used}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expired</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {mealCardStats.expired}
                  </p>
                </div>
              </div>
              <Link
                href="/admin/cards/manage-meal-cards"
                className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
              >
                Manage Meal Cards <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            {/* Gift Cards Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <Gift className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Gift Cards
                  </h2>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {giftCardStats.total}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {giftCardStats.active}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Used</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {giftCardStats.used}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {giftCardStats.pending}
                  </p>
                </div>
              </div>
              <Link
                href="/admin/cards/giftcards"
                className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Manage Gift Cards <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Link
                href="/admin/cards/manage-meal-cards"
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out block"
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative flex items-center">
                  <div className="flex-shrink-0">
                    <CreditCard className="h-10 w-10 text-orange-600" />
                  </div>
                  <div className="ml-6">
                    <h2 className="text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                      Manage Meal Cards
                    </h2>
                    <p className="mt-1 text-gray-600">
                      View and manage all meal card purchases
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Link
                href="/admin/cards/giftcards"
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out block"
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative flex items-center">
                  <div className="flex-shrink-0">
                    <Gift className="h-10 w-10 text-emerald-600" />
                  </div>
                  <div className="ml-6">
                    <h2 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                      Manage Gift Cards
                    </h2>
                    <p className="mt-1 text-gray-600">
                      View and manage all gift card purchases
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}

