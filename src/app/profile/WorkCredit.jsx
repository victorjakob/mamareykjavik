"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClockIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

const WorkCredit = ({ userEmail }) => {
  const [creditAmount, setCreditAmount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deductAmount, setDeductAmount] = useState("");
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchCredit();
    fetchHistory();
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

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch("/api/user/get-my-work-credit-history");
      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }
      const data = await response.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error("❌ Error fetching history:", error);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
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
    setSubmitting(true);
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
      fetchHistory(); // Refresh history after payment
      setDeductAmount("");
    } catch (error) {
      setError(error.message);
      console.error("❌ Error updating credit:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Show component if loading is done and creditAmount is not null (including 0)
  if (loading || creditAmount === null) return null;

  // Minimal view when amount is 0
  if (creditAmount === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="work-credit p-3 bg-white rounded-lg shadow-sm max-w-sm mx-auto my-2"
      >
        <p className="text-sm text-gray-600 text-center mb-2">
          Mama Coins <span className="font-medium text-gray-700">0</span>
        </p>
        
        {/* History Section for 0 balance */}
        <div className="border-t border-gray-200 pt-2 mt-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between text-xs text-gray-600 hover:text-gray-900 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-3 w-3" />
              <span>View History</span>
              {history.length > 0 && (
                <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                  {history.length}
                </span>
              )}
            </div>
            {showHistory ? (
              <ChevronUpIcon className="h-3 w-3" />
            ) : (
              <ChevronDownIcon className="h-3 w-3" />
            )}
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2"
              >
                {historyLoading ? (
                  <p className="text-xs text-gray-500 text-center py-2">
                    Loading...
                  </p>
                ) : history.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-2">
                    No history yet
                  </p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5">
                    {history.map((entry) => {
                      const isAdd = entry.type === "add";
                      const isUse = entry.type === "use";
                      const date = new Date(entry.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      );

                      return (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start justify-between p-1.5 bg-gray-50 rounded text-xs"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-1.5">
                              <span
                                className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                  isAdd
                                    ? "bg-green-100 text-green-700"
                                    : isUse
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {isAdd ? "+" : isUse ? "-" : ""}
                                {Math.abs(entry.amount).toLocaleString()} kr
                              </span>
                            </div>
                            {entry.note && (
                              <p className="text-gray-600 mt-0.5 text-xs truncate">
                                {entry.note}
                              </p>
                            )}
                            <p className="text-gray-400 mt-0.5 text-xs">
                              {date}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }

  // Full view when amount is greater than 0
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
        Mama Coins
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

      {/* History Section */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4" />
            <span>View History</span>
            {history.length > 0 && (
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                {history.length}
              </span>
            )}
          </div>
          {showHistory ? (
            <ChevronUpIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )}
        </button>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              {historyLoading ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Loading history...
                </p>
              ) : history.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No history yet
                </p>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {history.map((entry) => {
                    const isAdd = entry.type === "add";
                    const isUse = entry.type === "use";
                    const date = new Date(entry.created_at).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    );

                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start justify-between p-2 bg-gray-50 rounded text-xs"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                isAdd
                                  ? "bg-green-100 text-green-700"
                                  : isUse
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {isAdd ? "+" : isUse ? "-" : ""}
                              {Math.abs(entry.amount).toLocaleString()} kr
                            </span>
                          </div>
                          {entry.note && (
                            <p className="text-gray-600 mt-1 text-xs">
                              {entry.note}
                            </p>
                          )}
                          <p className="text-gray-400 mt-1">{date}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
                  whileHover={{ scale: submitting ? 1 : 1.05 }}
                  whileTap={{ scale: submitting ? 1 : 0.95 }}
                  onClick={confirmPayment}
                  className="px-3 py-1.5 text-sm rounded-full bg-blue-500 text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? "Processing..." : "Confirm"}
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
