"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";
import { formatPrice } from "@/util/IskFormat";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

export default function CustomCardPage() {
  const params = useParams();
  const token = params.token;

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [lastPayment, setLastPayment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchCard = async () => {
    if (!token) {
      setError("Token is required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/custom-cards/by-token/${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load custom card");
      }

      setCard(data.card);
      setError(null);
    } catch (err) {
      setError(err.message);
      setCard(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCard();
    } else {
      setError("Token is required");
      setLoading(false);
    }
  }, [token]);

  const handlePayment = async () => {
    if (!paymentAmount || paymentAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const amount = parseInt(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount > card.remaining_balance) {
      toast.error(
        `Insufficient balance. Available: ${formatPrice(card.remaining_balance)}`
      );
      return;
    }

    setProcessingPayment(true);
    try {
      const response = await fetch(`/api/custom-cards/pay/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process payment");
      }

      setCard(data.card);
      setLastPayment({
        amount: data.amount_paid,
        remaining: data.remaining_balance,
      });
      setPaymentAmount("");
      toast.success(`Payment of ${formatPrice(data.amount_paid)} processed!`);

      setTimeout(() => {
        setLastPayment(null);
      }, 4000);
    } catch (err) {
      toast.error(err.message || "Failed to process payment");
      console.error("Payment error:", err);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-12 w-12 text-gray-400" />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center border border-gray-100"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
          >
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="text-2xl font-light text-gray-900 mb-2"
          >
            Card Not Found
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600"
          >
            {error}
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!card) {
    return null;
  }

  const getExpirationInfo = () => {
    if (card.expiration_type === "none") {
      return { text: "No expiration", color: "text-emerald-600" };
    }
    if (card.expiration_type === "date" && card.expiration_date) {
      return {
        text: `Expires ${format(new Date(card.expiration_date), "MMM d, yyyy")}`,
        color: "text-orange-600",
      };
    }
    if (card.expiration_type === "monthly_reset") {
      return { text: "Resets monthly", color: "text-blue-600" };
    }
    if (card.expiration_type === "monthly_add" && card.monthly_amount) {
      return {
        text: `+${formatPrice(card.monthly_amount)}/month`,
        color: "text-blue-600",
      };
    }
    return { text: "Unknown", color: "text-gray-600" };
  };

  const expirationInfo = getExpirationInfo();
  const isActive = card.status === "active" && card.remaining_balance > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Spacing for logo */}
      <div className="pt-24 pb-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="max-w-md mx-auto"
        >
          {/* Card Name - Minimal */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
            className="text-center mb-8"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-3xl font-light text-gray-900 mb-2 tracking-tight"
            >
              {card.card_name}
            </motion.h1>
            {card.company_person && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-gray-500"
              >
                {card.company_person}
              </motion.p>
            )}
          </motion.div>

          {/* Main Card - Modern Design */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            className="relative mb-6"
          >
            {/* Status Badge */}
            {isActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  delay: 0.4,
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-emerald-500 text-white px-5 py-2 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-2 h-2 bg-white rounded-full"
                  />
                  Active
                </motion.div>
              </motion.div>
            )}

            {/* Card Container - Clean with good contrast */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Subtle decorative gradient */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-emerald-500/10 pointer-events-none"
              />

              {/* Animated subtle pattern */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.05, 0.08, 0.05],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"
              />
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.05, 0.08, 0.05],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-3xl"
              />

              <div className="relative z-10">
                {/* Balance Display - High Contrast */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  className="text-center mb-10"
                >
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-gray-400 text-xs uppercase tracking-wider mb-3 font-medium"
                  >
                    Balance
                  </motion.p>
                  <motion.div
                    key={card.remaining_balance}
                    initial={{ scale: 1.2, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="text-6xl sm:text-7xl font-light text-white mb-3 tracking-tight"
                  >
                    {formatPrice(card.remaining_balance)}
                  </motion.div>
                  {card.amount !== card.remaining_balance && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="text-gray-400 text-sm"
                    >
                      Original: {formatPrice(card.amount)}
                    </motion.p>
                  )}
                </motion.div>

                {/* Payment Section */}
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.5,
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                    }}
                    className="space-y-5"
                  >
                    {/* Success Message */}
                    <AnimatePresence>
                      {lastPayment && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            scale: 0.8,
                            y: -20,
                            rotateX: -90,
                          }}
                          animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: -10 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                          }}
                          className="bg-emerald-500/20 backdrop-blur-sm rounded-2xl p-4 border border-emerald-500/30"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                  delay: 0.2,
                                  type: "spring",
                                  stiffness: 300,
                                }}
                                className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                              >
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{
                                    delay: 0.3,
                                    type: "spring",
                                    stiffness: 300,
                                  }}
                                >
                                  <CheckCircle className="h-6 w-6 text-white" />
                                </motion.div>
                              </motion.div>
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                              >
                                <p className="text-white font-semibold text-sm">
                                  Paid {formatPrice(lastPayment.amount)}
                                </p>
                                <p className="text-gray-300 text-xs">
                                  {formatPrice(lastPayment.remaining)} remaining
                                </p>
                              </motion.div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1, rotate: 90 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setLastPayment(null)}
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Amount Input - High Contrast */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.6,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="space-y-4"
                    >
                      <div className="relative">
                        <motion.input
                          type="number"
                          min="1"
                          max={card.remaining_balance}
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          placeholder="Enter amount"
                          disabled={processingPayment}
                          whileFocus={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl px-6 py-5 text-white placeholder-gray-400 text-xl font-medium focus:outline-none focus:border-white/40 focus:bg-white/15 disabled:opacity-50 transition-all text-center"
                        />
                        <AnimatePresence>
                          {paymentAmount && (
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ type: "spring", stiffness: 300 }}
                              className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium"
                            >
                              kr.
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Pay Button - Prominent */}
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.7,
                          type: "spring",
                          stiffness: 200,
                        }}
                        whileHover={{
                          scale: processingPayment ? 1 : 1.03,
                          y: -2,
                        }}
                        whileTap={{ scale: processingPayment ? 1 : 0.97 }}
                        onClick={handlePayment}
                        disabled={
                          processingPayment ||
                          !paymentAmount ||
                          parseInt(paymentAmount) <= 0 ||
                          parseInt(paymentAmount) > card.remaining_balance
                        }
                        className="w-full bg-white text-slate-900 rounded-2xl py-5 px-6 font-bold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:bg-gray-50 hover:shadow-2xl"
                      >
                        {processingPayment ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2"
                          >
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Processing...</span>
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-center gap-2"
                          >
                            <motion.div
                              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                              transition={{ duration: 0.5 }}
                            >
                              <CreditCard className="h-5 w-5" />
                            </motion.div>
                            <span>Pay Now</span>
                          </motion.div>
                        )}
                      </motion.button>

                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-gray-400 text-xs text-center"
                      >
                        Available: {formatPrice(card.remaining_balance)}
                      </motion.p>
                    </motion.div>
                  </motion.div>
                )}

                {/* Empty State */}
                {!isActive && (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-lg">
                      {card.remaining_balance === 0
                        ? "Card Fully Redeemed"
                        : "Card Inactive"}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* Details Toggle - Clean Design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setShowDetails(!showDetails)}
              className="w-full bg-white rounded-2xl p-5 flex items-center justify-between border border-gray-200 hover:bg-gray-50 transition-all shadow-sm"
            >
              <span className="text-gray-700 font-medium text-sm">
                Card Details
              </span>
              <motion.div
                animate={{ rotate: showDetails ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0, y: -10 }}
                  animate={{ height: "auto", opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="overflow-hidden"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mt-3 bg-white rounded-2xl p-5 space-y-4 border border-gray-200 shadow-sm"
                  >
                    {/* Expiration */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.2,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="flex items-center justify-between py-2 border-b border-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Expiration
                        </span>
                      </div>
                      <span
                        className={`text-sm font-medium ${expirationInfo.color}`}
                      >
                        {expirationInfo.text}
                      </span>
                    </motion.div>

                    {/* Created Date */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.3,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="flex items-center justify-between py-2 border-b border-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Created</span>
                      </div>
                      <span className="text-sm text-gray-700">
                        {format(new Date(card.created_at), "MMM d, yyyy")}
                      </span>
                    </motion.div>

                    {/* Original Amount */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.4,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="flex items-center justify-between py-2"
                    >
                      <span className="text-sm text-gray-600">
                        Original Amount
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatPrice(card.amount)}
                      </span>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Footer - Minimal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <p className="text-gray-400 text-xs">Mama Reykjavik</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
