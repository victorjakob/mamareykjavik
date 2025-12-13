"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/hooks/useLanguage";
import { formatPrice } from "@/util/IskFormat";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 0.8,
    },
  },
};

const MIN_AMOUNT = 1000;
const MAX_AMOUNT = 50000;
const STEP = 1000;
const SHIPPING_COST = 690;

export default function GiftCardClient({ initialLanguage }) {
  const { language } = useLanguage();
  const [amount, setAmount] = useState(5000);
  const [deliveryMethod, setDeliveryMethod] = useState("email");

  const translations = {
    en: {
      title: "Holiday Gift Card",
      subtitle: "The Perfect Gift",
      description:
        "Give the gift of delicious plant-based meals! Choose any amount and delivery method that works for you.",
      chooseAmount: "Choose Amount",
      chooseDelivery: "Choose Delivery Method",
      emailDelivery: "Email Delivery",
      emailDeliveryDesc: "Instant delivery via email",
      emailDeliveryPrice: "Free",
      pickupDelivery: "Pick Up at Store",
      pickupDeliveryDesc: "Pick up at Mama Reykjavik",
      pickupDeliveryPrice: "Free",
      mailDelivery: "Mail Delivery",
      mailDeliveryDesc: "Physical card sent by mail",
      mailDeliveryPrice: "+690 kr",
      total: "Total",
      buttonText: "Buy Gift Card",
      buttonNote: "Perfect gift for food lovers",
      features: [
        {
          header: "Flexible",
          text: "Choose any amount from 1,000 to 50,000 kr",
        },
        {
          header: "Never Expires",
          text: "Your gift card never expires",
        },
        {
          header: "Easy to Use",
          text: "Use it anytime at Mama Reykjavik",
        },
        {
          header: "Perfect Gift",
          text: "Great for holidays, birthdays, or any occasion",
        },
      ],
      tagline: "Give the gift of good food and good vibes",
      madeWith: "Made with big love 🌱 Mama",
    },
    is: {
      title: "Jólagjöf",
      subtitle: "Fullkomið Gjöf",
      description:
        "Gefðu gjöf af ljúffengum jurtabundnum réttum! Veldu hvaða upphæð og afhendingarmáta sem hentar þér.",
      chooseAmount: "Veldu Upphæð",
      chooseDelivery: "Veldu Afhendingarmáta",
      emailDelivery: "Tölvupóstur",
      emailDeliveryDesc: "Stundarafhending með tölvupósti",
      emailDeliveryPrice: "Ókeypis",
      pickupDelivery: "Afhending í Verslun",
      pickupDeliveryDesc: "Sækja í Mama Reykjavík",
      pickupDeliveryPrice: "Ókeypis",
      mailDelivery: "Póstsending",
      mailDeliveryDesc: "Efnislegt kort sent með pósti",
      mailDeliveryPrice: "+690 kr",
      total: "Samtals",
      buttonText: "Kaupa Gjafakort",
      buttonNote: "Fullkomin gjöf fyrir matarástkennur",
      features: [
        {
          header: "Sveigjanlegt",
          text: "Veldu hvaða upphæð sem er frá 1.000 til 50.000 kr",
        },
        {
          header: "Rennur Aldrei Úr",
          text: "Gjafakortið þitt rennur aldrei út",
        },
        {
          header: "Auðvelt að Nota",
          text: "Notaðu það hvenær sem er í Mama Reykjavík",
        },
        {
          header: "Fullkomin Gjöf",
          text: "Frábært fyrir jólin, afmæli eða hvaða tilefni sem er",
        },
      ],
      tagline: "Gefðu gjöf af góðum mat og góðum stemningum",
      madeWith: "Gert með mikilli ást í Reykjavík 🌱 Mama",
    },
  };

  const t = translations[language];

  const shippingCost = deliveryMethod === "mail" ? SHIPPING_COST : 0;
  const total = amount + shippingCost;

  const handleAmountChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= MIN_AMOUNT && value <= MAX_AMOUNT) {
      setAmount(value);
    }
  };

  const handleAmountInput = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      if (value < MIN_AMOUNT) {
        setAmount(MIN_AMOUNT);
      } else if (value > MAX_AMOUNT) {
        setAmount(MAX_AMOUNT);
      } else {
        // Round to nearest 1000
        const rounded = Math.round(value / STEP) * STEP;
        setAmount(rounded);
      }
    }
  };

  const handleDecrement = () => {
    const newAmount = Math.max(MIN_AMOUNT, amount - STEP);
    setAmount(newAmount);
  };

  const handleIncrement = () => {
    const newAmount = Math.min(MAX_AMOUNT, amount + STEP);
    setAmount(newAmount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-emerald-50/40">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-32 pb-16 sm:pb-20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            {/* Title */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 tracking-tighter mb-4"
              style={{ letterSpacing: "-0.02em" }}
            >
              {t.title}
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-gray-600 mb-12 max-w-2xl mx-auto"
            >
              {t.description}
            </motion.p>

            {/* Amount Selector */}
            <motion.div
              variants={itemVariants}
              className="mb-8 max-w-md mx-auto"
            >
              <label className="block text-sm font-medium text-gray-700 mb-4">
                {t.chooseAmount}
              </label>
              <div className="space-y-4">
                <input
                  type="range"
                  min={MIN_AMOUNT}
                  max={MAX_AMOUNT}
                  step={STEP}
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
                <div className="flex items-center justify-center gap-3">
                  <motion.button
                    type="button"
                    onClick={handleDecrement}
                    disabled={amount <= MIN_AMOUNT}
                    whileHover={{ scale: amount > MIN_AMOUNT ? 1.05 : 1 }}
                    whileTap={{ scale: amount > MIN_AMOUNT ? 0.95 : 1 }}
                    className={`w-10 h-10 flex items-center justify-center text-xl font-semibold rounded-lg border-2 transition-all ${
                      amount <= MIN_AMOUNT
                        ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                        : "border-orange-300 text-orange-600 hover:border-orange-400 hover:bg-orange-50 bg-white"
                    }`}
                    aria-label="Decrease amount by 1000"
                  >
                    −
                  </motion.button>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={MIN_AMOUNT}
                      max={MAX_AMOUNT}
                      step={STEP}
                      value={amount}
                      onChange={handleAmountInput}
                      className="w-32 px-4 py-2 text-center text-xl font-semibold text-gray-900 border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <span className="text-xl font-medium text-gray-700">kr</span>
                  </div>
                  <motion.button
                    type="button"
                    onClick={handleIncrement}
                    disabled={amount >= MAX_AMOUNT}
                    whileHover={{ scale: amount < MAX_AMOUNT ? 1.05 : 1 }}
                    whileTap={{ scale: amount < MAX_AMOUNT ? 0.95 : 1 }}
                    className={`w-10 h-10 flex items-center justify-center text-xl font-semibold rounded-lg border-2 transition-all ${
                      amount >= MAX_AMOUNT
                        ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                        : "border-orange-300 text-orange-600 hover:border-orange-400 hover:bg-orange-50 bg-white"
                    }`}
                    aria-label="Increase amount by 1000"
                  >
                    +
                  </motion.button>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formatPrice(MIN_AMOUNT)}</span>
                  <span>{formatPrice(MAX_AMOUNT)}</span>
                </div>
              </div>
            </motion.div>

            {/* Delivery Method Selector */}
            <motion.div variants={itemVariants} className="mb-8 max-w-2xl mx-auto">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                {t.chooseDelivery}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Email Delivery */}
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeliveryMethod("email")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    deliveryMethod === "email"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 bg-white hover:border-orange-300"
                  }`}
                >
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 mb-1">
                      {t.emailDelivery}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {t.emailDeliveryDesc}
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      {t.emailDeliveryPrice}
                    </div>
                  </div>
                </motion.button>

                {/* Pickup Delivery */}
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeliveryMethod("pickup")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    deliveryMethod === "pickup"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 bg-white hover:border-orange-300"
                  }`}
                >
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 mb-1">
                      {t.pickupDelivery}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {t.pickupDeliveryDesc}
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      {t.pickupDeliveryPrice}
                    </div>
                  </div>
                </motion.button>

                {/* Mail Delivery */}
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeliveryMethod("mail")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    deliveryMethod === "mail"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 bg-white hover:border-orange-300"
                  }`}
                >
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 mb-1">
                      {t.mailDelivery}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {t.mailDeliveryDesc}
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {t.mailDeliveryPrice}
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>

            {/* Total Price */}
            <motion.div variants={itemVariants} className="mb-8">
              <div className="inline-flex items-center gap-4 px-6 py-4 bg-white rounded-xl border-2 border-orange-200 shadow-sm">
                <span className="text-lg font-medium text-gray-700">
                  {t.total}:
                </span>
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(total)}
                </span>
              </div>
            </motion.div>

            {/* Buy Button */}
            <motion.div variants={itemVariants} className="mb-4">
              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Link
                  href={`/giftcard/buy?amount=${amount}&delivery=${deliveryMethod}`}
                  className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-10 py-4 sm:px-12 sm:py-4.5 rounded-xl text-lg sm:text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 inline-block"
                >
                  {t.buttonText}
                </Link>
              </motion.div>
            </motion.div>

            {/* Button Note */}
            <motion.p
              variants={itemVariants}
              className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto font-light italic"
            >
              {t.buttonNote}
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="pt-2 sm:pt-3 pb-12 sm:pb-14">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
          {/* Fancy Border */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="mb-8 sm:mb-10"
          >
            <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-300 to-orange-500"></div>
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-emerald-500"></div>
              <div className="flex-1 h-px bg-gradient-to-r from-emerald-500 via-emerald-300 to-transparent"></div>
            </div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
          >
            {t.features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-gradient-to-br from-orange-50/50 to-emerald-50/50 p-5 sm:p-6 rounded-xl border border-orange-100/50 hover:border-orange-200/70 hover:shadow-md transition-all duration-300"
              >
                <h3
                  className="text-xl sm:text-2xl font-light text-gray-900 mb-2 text-center tracking-tighter"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {feature.header}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-light text-center">
                  {feature.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-gradient-to-br from-orange-50/50 to-emerald-50/50 py-12 sm:py-14">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
            }}
          >
            {/* Tagline */}
            <p className="text-lg sm:text-xl text-gray-700 mb-4 leading-relaxed font-light tracking-tight">
              {t.tagline}
            </p>

            {/* Made with */}
            <p className="text-sm sm:text-base text-gray-500 font-light tracking-tight">
              {t.madeWith}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

