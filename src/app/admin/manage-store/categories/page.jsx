"use client";

import ShowAllCategories from "@/app/admin/manage-store/categories/components/ShowAllCategories";
import CreateCategory from "@/app/admin/manage-store/categories/components/CreateCategory";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ManageStoreCategoriesPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="space-y-6">
      {!showCreateForm ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ShowAllCategories />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <CreateCategory />
          <button
            onClick={() => setShowCreateForm(false)}
            className="mt-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Back to Categories
          </button>
        </motion.div>
      )}
    </div>
  );
}
