"use client";

import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function PromoCodeModal({
  isOpen,
  onClose,
  editingPromoCode,
  children,
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed top-0 left-0 right-0 bottom-0 bg-gray-600 bg-opacity-50 z-50"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(75, 85, 99, 0.5)",
          zIndex: 50,
          margin: 0,
          padding: 0,
        }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mx-auto w-11/12 max-w-4xl shadow-2xl rounded-2xl bg-white max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {editingPromoCode
                    ? "Edit Promo Code"
                    : "Create New Promo Code"}
                </h3>
                <p className="text-orange-100 mt-1">
                  {editingPromoCode
                    ? "Update your promotional code settings"
                    : "Set up a new promotional code for your events"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-orange-100 hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-orange-400"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
            {children}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
