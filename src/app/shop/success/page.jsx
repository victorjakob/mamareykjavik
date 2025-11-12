"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ShopSuccessPage() {
  return (
    <div className="relative min-h-[70vh] overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-emerald-100/40">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-teal-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col items-center justify-center px-6 py-24 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          className="relative mb-10 flex flex-col items-center"
        >
          <div className="mb-6 inline-flex items-center justify-center rounded-full bg-emerald-100/80 p-5 shadow-lg shadow-emerald-200/40">
            <motion.svg
              initial={{ rotate: -12, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 160, damping: 12 }}
              className="h-16 w-16 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </motion.svg>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 100, damping: 15 }}
            className="font-serif text-4xl font-semibold text-emerald-800 md:text-5xl"
          >
            Thank you for your order!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, type: "spring", stiffness: 100, damping: 17 }}
            className="mt-4 max-w-xl text-lg text-emerald-900/80"
          >
            Your payment went through smoothly. Keep an eye on your inbox for a warm
            confirmation from us, and feel free to reach out if you need anything.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, type: "spring", stiffness: 120, damping: 16 }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3 font-semibold text-white shadow-lg shadow-emerald-300/50 transition hover:bg-emerald-600 hover:shadow-emerald-300/60"
          >
            Back to Shop
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center justify-center rounded-full border border-emerald-300/80 px-8 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-100/70"
          >
            Explore Events
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, type: "spring", stiffness: 110, damping: 18 }}
          className="mt-12 grid w-full gap-6 rounded-3xl border border-emerald-100/60 bg-white/70 p-6 shadow-lg shadow-emerald-100/40 backdrop-blur"
        >
          <div className="grid gap-5 text-left sm:grid-cols-3">
            <div className="rounded-2xl bg-emerald-50/70 p-5">
              <p className="font-serif text-lg text-emerald-700">Craving more?</p>
              <p className="mt-2 text-sm text-emerald-900/70">
                Discover our seasonal menu and daily chef specials crafted with love.
              </p>
              <Link
                href="/restaurant/menu"
                className="mt-4 inline-flex text-sm font-semibold text-emerald-700 underline-offset-4 transition hover:text-emerald-600 hover:underline"
              >
                See the menu
              </Link>
            </div>
            <div className="rounded-2xl bg-emerald-50/60 p-5">
              <p className="font-serif text-lg text-emerald-700">White Lotus vibes</p>
              <p className="mt-2 text-sm text-emerald-900/70">
                Dive into ceremonies, concerts, and gatherings that bring people together.
              </p>
              <Link
                href="/whitelotus"
                className="mt-4 inline-flex text-sm font-semibold text-emerald-700 underline-offset-4 transition hover:text-emerald-600 hover:underline"
              >
                Discover the venue
              </Link>
            </div>
            <div className="rounded-2xl bg-emerald-50/50 p-5">
              <p className="font-serif text-lg text-emerald-700">Need a hand?</p>
              <p className="mt-2 text-sm text-emerald-900/70">
                We are always here to help with questions about your order or experience.
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-flex text-sm font-semibold text-emerald-700 underline-offset-4 transition hover:text-emerald-600 hover:underline"
              >
                Email the team
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
