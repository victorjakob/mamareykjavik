"use client";
import { motion } from "framer-motion";

export default function ContactSupport() {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-purple-600 rounded-2xl p-8 text-center text-white">
      <h3 className="text-2xl font-light mb-4 tracking-wide">
        Need Custom Brand Materials?
      </h3>
      <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
        We're here to help you maintain brand consistency. Contact us for custom
        designs, additional formats, or brand consultation.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-white text-orange-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          Contact Brand Team
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 border-2 border-white text-white rounded-xl font-medium hover:bg-white hover:text-orange-600 transition-colors"
        >
          Request Custom Assets
        </motion.button>
      </div>
    </div>
  );
}
