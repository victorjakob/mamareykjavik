"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  Cog6ToothIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import MenuItems from "@/app/admin/manage-menu/MenuItems";
import CreateMenuItem from "@/app/admin/manage-menu/CreateMenuItem";

export default function ManageMenu() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState("items");

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light text-gray-900 tracking-tight">
                Menu Management
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your restaurant&apos;s categories and menu items
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="inline-flex items-center px-4 py-2.5 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                {showCreateForm ? "Hide Form" : "New Item"}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("items")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === "items"
                  ? "border-slate-600 text-slate-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Bars3Icon className="h-4 w-4 inline mr-2" />
              Menu Items
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === "settings"
                  ? "border-slate-600 text-slate-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Cog6ToothIcon className="h-4 w-4 inline mr-2" />
              Settings
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="mb-8"
            >
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white">
                    Create New Menu Item
                  </h2>
                  <p className="text-slate-200 text-sm mt-1">
                    Add a new item to your restaurant menu
                  </p>
                </div>
                <div className="p-6">
                  <CreateMenuItem onSuccess={() => setShowCreateForm(false)} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Tabs */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "items" && <MenuItems />}
          {activeTab === "settings" && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
              <Cog6ToothIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Settings Coming Soon
              </h3>
              <p className="text-gray-500">
                Additional menu management settings will be available here.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
