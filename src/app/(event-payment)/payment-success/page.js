"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <svg
            className="mx-auto h-16 w-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-3xl font-bold text-gray-900 mb-4"
        >
          Payment Successful!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-gray-600 mb-4"
        >
          Your tickets have been sent to your email.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-gray-600 mb-8"
        >
          Create an account or sign in to view your tickets in your profile.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="flex justify-center space-x-4"
        >
          <Link href="/events">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#4B5563" }}
              whileTap={{ scale: 0.9 }}
              className="px-6 py-3 rounded-xl text-white bg-gray-600 font-medium transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Explore more events
            </motion.button>
          </Link>
          <Link href="/profile/my-tickets">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#047857" }}
              whileTap={{ scale: 0.9 }}
              className="px-6 py-3 rounded-xl text-white bg-emerald-700 font-medium transition-all duration-300 shadow-md hover:shadow-lg"
            >
              View my tickets
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
