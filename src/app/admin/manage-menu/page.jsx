"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MenuItems from "@/app/admin/manage-menu/MenuItems";
import CreateMenuItem from "@/app/admin/manage-menu/CreateMenuItem";

export default function ManageMenu() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 mt-28">
      <h1 className="text-3xl text-center font-bold mb-8">Manage Menu</h1>

      <div className="space-y-4">
        <motion.button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 rounded text-sm text-orange-600 border border-orange-800 hover:bg-orange-50 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:ring-offset-1 transition-colors duration-200"
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
        >
          {showCreateForm ? "Hide Create Form" : "Create New Menu Item"}
        </motion.button>

        <AnimatePresence>
          {showCreateForm && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <CreateMenuItem />
            </motion.section>
          )}
        </AnimatePresence>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <MenuItems />
        </motion.section>
      </div>
    </div>
  );
}
