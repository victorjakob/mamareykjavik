"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AdminGuard from "./AdminGuard";
import Link from "next/link";
import {
  PlusCircle,
  CalendarRange,
  Users,
  Coffee,
  ShoppingBag,
  Map,
  Loader2,
  CreditCard,
} from "lucide-react";

export default function AdminDashboard() {
  const [navigatingTo, setNavigatingTo] = useState(null);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
              Admin Dashboard
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Welcome to your command center. Manage events, users, and more
              from one central location.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Link
                href="/admin/manage-trips"
                onClick={() => setNavigatingTo("/admin/manage-trips")}
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out block"
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative flex items-center">
                  <div className="flex-shrink-0">
                    {navigatingTo === "/admin/manage-trips" ? (
                      <Loader2 className="h-10 w-10 text-teal-600 animate-spin" />
                    ) : (
                      <Map className="h-10 w-10 text-teal-600" />
                    )}
                  </div>
                  <div className="ml-6">
                    <h2 className="text-2xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                      Manage Trips
                    </h2>
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
                href="/admin/create-event"
                onClick={() => setNavigatingTo("/admin/create-event")}
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out block"
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative flex items-center">
                  <div className="flex-shrink-0">
                    {navigatingTo === "/admin/create-event" ? (
                      <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                    ) : (
                      <PlusCircle className="h-10 w-10 text-indigo-600" />
                    )}
                  </div>
                  <div className="ml-6">
                    <h2 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      Create New Event
                    </h2>
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
                href="/admin/manage-events"
                onClick={() => setNavigatingTo("/admin/manage-events")}
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out block"
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative flex items-center">
                  <div className="flex-shrink-0">
                    {navigatingTo === "/admin/manage-events" ? (
                      <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
                    ) : (
                      <CalendarRange className="h-10 w-10 text-purple-600" />
                    )}
                  </div>
                  <div className="ml-6">
                    <h2 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      Manage Events
                    </h2>
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
                href="/admin/manage-users"
                onClick={() => setNavigatingTo("/admin/manage-users")}
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out block"
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative flex items-center">
                  <div className="flex-shrink-0">
                    {navigatingTo === "/admin/manage-users" ? (
                      <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                    ) : (
                      <Users className="h-10 w-10 text-blue-600" />
                    )}
                  </div>
                  <div className="ml-6">
                    <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      Manage Users
                    </h2>
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
                href="/admin/manage-menu"
                onClick={() => setNavigatingTo("/admin/manage-menu")}
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out block"
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative flex items-center">
                  <div className="flex-shrink-0">
                    {navigatingTo === "/admin/manage-menu" ? (
                      <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
                    ) : (
                      <Coffee className="h-10 w-10 text-emerald-600" />
                    )}
                  </div>
                  <div className="ml-6">
                    <h2 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                      Manage Menu
                    </h2>
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
                href="/admin/manage-store"
                onClick={() => setNavigatingTo("/admin/manage-store")}
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out block"
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative flex items-center">
                  <div className="flex-shrink-0">
                    {navigatingTo === "/admin/manage-store" ? (
                      <Loader2 className="h-10 w-10 text-pink-600 animate-spin" />
                    ) : (
                      <ShoppingBag className="h-10 w-10 text-pink-600" />
                    )}
                  </div>
                  <div className="ml-6">
                    <h2 className="text-2xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors">
                      Manage Store
                    </h2>
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
                href="/admin/work-credit"
                onClick={() => setNavigatingTo("/admin/work-credit")}
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out block"
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative flex items-center">
                  <div className="flex-shrink-0">
                    {navigatingTo === "/admin/work-credit" ? (
                      <Loader2 className="h-10 w-10 text-amber-600 animate-spin" />
                    ) : (
                      <Coffee className="h-10 w-10 text-amber-600" />
                    )}
                  </div>
                  <div className="ml-6">
                    <h2 className="text-2xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                      Work Credits
                    </h2>
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
                href="/admin/manage-meal-cards"
                onClick={() => setNavigatingTo("/admin/manage-meal-cards")}
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out block"
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative flex items-center">
                  <div className="flex-shrink-0">
                    {navigatingTo === "/admin/manage-meal-cards" ? (
                      <Loader2 className="h-10 w-10 text-orange-600 animate-spin" />
                    ) : (
                      <CreditCard className="h-10 w-10 text-orange-600" />
                    )}
                  </div>
                  <div className="ml-6">
                    <h2 className="text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                      Meal Cards
                    </h2>
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
