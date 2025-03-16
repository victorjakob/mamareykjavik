"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WorkCredit = ({ userEmail }) => {
  const [creditAmount, setCreditAmount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deductAmount, setDeductAmount] = useState("");
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    fetchCredit();
  }, []);

  const fetchCredit = async () => {
    try {
      const response = await fetch("/api/user/get-work-credit");
      if (!response.ok) {
        throw new Error("Failed to fetch credit");
      }
      const data = await response.json();
      setCreditAmount(data.amount);
    } catch (error) {
      console.error("❌ Error fetching credit:", error);
      setCreditAmount(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeductCredit = async (e) => {
    e.preventDefault();
    setError("");

    if (!deductAmount || deductAmount <= 0) {
      setError("Please enter a valid positive amount");
      return;
    }

    // Show confirmation dialog instead of immediate processing
    setShowConfirmation(true);
  };

  const confirmPayment = async () => {
    try {
      const response = await fetch("/api/user/update-work-credit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: -Math.abs(deductAmount) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update credit");
      }

      // Success animation and reset
      setShowConfirmation(false);
      fetchCredit();
      setDeductAmount("");
    } catch (error) {
      setError(error.message);
      console.error("❌ Error updating credit:", error);
    }
  };

  if (loading || creditAmount === null) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="work-credit p-4 sm:p-6 bg-white rounded-lg shadow-lg max-w-sm mx-auto my-4"
    >
      <motion.h3
        className="text-xl sm:text-2xl font-bold mb-3 text-center"
        whileHover={{ scale: 1.05 }}
      >
        Work Credit
      </motion.h3>

      <motion.div
        className="text-center mb-4"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <p className="text-2xl sm:text-3xl font-bold text-green-600">
          {creditAmount} kr
        </p>
        <p className="text-sm text-gray-600">Available Credit</p>
      </motion.div>

      <form onSubmit={handleDeductCredit} className="space-y-3">
        <div className="flex flex-col items-center space-y-2">
          <label htmlFor="deductAmount" className="text-sm text-gray-700">
            Amount to Pay:
          </label>
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="number"
            id="deductAmount"
            min="0"
            step="0"
            value={deductAmount}
            onChange={(e) => setDeductAmount(parseFloat(e.target.value))}
            className="border p-2 rounded w-full max-w-[200px] text-center text-lg"
            placeholder="0"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full max-w-[200px] bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md hover:bg-blue-600 transition-colors"
          >
            Pay Now
          </motion.button>
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-sm text-center"
          >
            {error}
          </motion.p>
        )}
      </form>

      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white p-4 rounded-lg shadow-xl w-[90%] max-w-xs"
            >
              <h4 className="text-lg font-bold mb-3">Confirm Payment</h4>
              <p className="text-sm mb-4">
                Are you sure you want to use {deductAmount} kr from your credit?
              </p>
              <div className="flex justify-end gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowConfirmation(false)}
                  className="px-3 py-1.5 text-sm rounded-full border border-gray-300"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={confirmPayment}
                  className="px-3 py-1.5 text-sm rounded-full bg-blue-500 text-white"
                >
                  Confirm
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WorkCredit;
