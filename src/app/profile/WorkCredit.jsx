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
  const [showPay, setShowPay] = useState(false);

  useEffect(() => { fetchCredit(); fetchHistory(); }, []);

  const fetchCredit = async () => {
    try {
      const r = await fetch("/api/user/get-work-credit");
      if (!r.ok) throw new Error();
      const d = await r.json();
      setCreditAmount(d.amount);
    } catch { setCreditAmount(null); }
    finally { setLoading(false); }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const r = await fetch("/api/user/get-my-work-credit-history");
      if (!r.ok) throw new Error();
      const d = await r.json();
      setHistory(d.history || []);
    } catch { setHistory([]); }
    finally { setHistoryLoading(false); }
  };

  const handleDeductCredit = async (e) => {
    e.preventDefault();
    setError("");
    if (!deductAmount || deductAmount <= 0) { setError("Enter a valid amount"); return; }
    setShowConfirmation(true);
  };

  const confirmPayment = async () => {
    setSubmitting(true);
    try {
      const r = await fetch("/api/user/update-work-credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: -Math.abs(deductAmount) }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed");
      setShowConfirmation(false);
      setShowPay(false);
      fetchCredit();
      fetchHistory();
      setDeductAmount("");
    } catch (err) {
      setError(err.message);
    } finally { setSubmitting(false); }
  };

  if (loading || creditAmount === null) return null;

  // ── Zero balance: compact pill ──
  if (creditAmount === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <div
          className="rounded-[24px] px-5 py-4"
          style={{
            background: "linear-gradient(180deg, #fffdf9 0%, #fff8f1 100%)",
            border: "1.5px solid #eadfce",
            boxShadow: "0 10px 28px rgba(60,30,10,0.08), 0 2px 10px rgba(60,30,10,0.04)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] mb-0.5" style={{ color: "#9a7a62" }}>Mama Coins</p>
              <p className="font-cormorant italic text-2xl" style={{ color: "#2c1810" }}>0 kr</p>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: "#9a7a62" }}
            >
              <ClockIcon className="h-3.5 w-3.5" />
              History
              {showHistory ? <ChevronUpIcon className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />}
            </button>
          </div>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-3 pt-3"
                style={{ borderTop: "1px solid #e8ddd3" }}
              >
                {historyLoading ? (
                  <p className="text-sm text-center py-1" style={{ color: "#9a7a62" }}>Loading...</p>
                ) : history.length === 0 ? (
                  <p className="text-sm text-center py-1" style={{ color: "#9a7a62" }}>No history yet</p>
                ) : (
                  <HistoryList history={history} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }

  // ── Positive balance: loyalty card ──
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <div
          className="relative rounded-[24px] overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #fffdf9 0%, #fff8f1 100%)",
            border: "1.5px solid #eadfce",
            boxShadow: "0 10px 28px rgba(60,30,10,0.08), 0 2px 10px rgba(60,30,10,0.04)",
          }}
        >
          {/* Card shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff914d]/15 to-transparent" />

          {/* Watermark circle */}
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-[#ff914d]/3 pointer-events-none" />
          <div className="absolute -right-4 top-4 w-24 h-24 rounded-full bg-[#ff914d]/2 pointer-events-none" />

          <div className="relative p-5">
            {/* Top row */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.42em] mb-1" style={{ color: "#ff914d" }}>Mama Coins</p>
                <p className="font-cormorant font-light italic leading-none" style={{ fontSize: "2.4rem", color: "#ff914d" }}>
                  {creditAmount.toLocaleString()}
                  <span className="text-lg ml-1.5" style={{ color: "#ff914d" }}>kr</span>
                </p>
                <p className="text-xs tracking-wide mt-0.5" style={{ color: "#9a7a62" }}>Available credit</p>
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => { setShowPay(!showPay); setShowHistory(false); }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${showPay ? "bg-[#ff914d] text-white" : "text-[#ff914d] hover:bg-[#fff8f2]"}`}
                  style={{ border: showPay ? "none" : "1px solid #f0e6d8" }}
                >
                  Pay
                </button>
                <button
                  onClick={() => { setShowHistory(!showHistory); setShowPay(false); }}
                  className="px-3 py-1.5 text-xs rounded-full transition-all duration-200"
                  style={{
                    backgroundColor: showHistory ? "#f3f0ec" : "transparent",
                    color: showHistory ? "#2c1810" : "#9a7a62",
                    border: "1px solid #e8ddd3"
                  }}
                >
                  History
                </button>
              </div>
            </div>

            {/* Pay panel */}
            <AnimatePresence>
              {showPay && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <form onSubmit={handleDeductCredit} className="pt-3" style={{ borderTop: "1px solid #e8ddd3" }}>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={deductAmount}
                        onChange={(e) => setDeductAmount(parseFloat(e.target.value))}
                        className="flex-1 text-base text-center rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#ff914d]/40 transition-colors"
                        style={{ backgroundColor: "#faf6f2", border: "1px solid #e8ddd3", color: "#2c1810" }}
                        placeholder="Amount in kr"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-[#ff914d] text-black text-base font-semibold rounded-xl hover:bg-[#ff914d]/90 transition-colors"
                      >
                        Pay now
                      </button>
                    </div>
                    {error && <p className="text-red-600 text-sm mt-2 text-center">{error}</p>}
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* History panel */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3" style={{ borderTop: "1px solid #e8ddd3" }}>
                    {historyLoading ? (
                      <p className="text-sm text-center py-2" style={{ color: "#9a7a62" }}>Loading...</p>
                    ) : history.length === 0 ? (
                      <p className="text-sm text-center py-2" style={{ color: "#9a7a62" }}>No history yet</p>
                    ) : (
                      <HistoryList history={history} />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Confirm modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 16 }}
              className="rounded-2xl p-6 w-full max-w-xs"
              style={{ background: "#ffffff", border: "1.5px solid #f0e6d8", boxShadow: "0 2px 14px rgba(60,30,10,0.07)" }}
            >
              <p className="text-[11px] uppercase tracking-[0.4em] mb-1" style={{ color: "#ff914d" }}>Confirm payment</p>
              <p className="font-cormorant font-light italic text-2xl mb-1" style={{ color: "#2c1810" }}>
                {deductAmount} kr
              </p>
              <p className="text-sm mb-6" style={{ color: "#9a7a62" }}>from your Mama Coins</p>
              <div className="flex gap-2">
                <button onClick={() => setShowConfirmation(false)} className="flex-1 py-2.5 text-base rounded-full transition-colors" style={{ backgroundColor: "#f3f0ec", color: "#2c1810", border: "1px solid #e8ddd3" }}>
                  Cancel
                </button>
                <button onClick={confirmPayment} disabled={submitting} className="flex-1 py-2.5 text-base bg-[#ff914d] text-white font-semibold rounded-full hover:bg-[#ff914d]/90 disabled:opacity-50 transition-colors">
                  {submitting ? "Processing..." : "Confirm"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

function HistoryList({ history }) {
  return (
    <div className="max-h-44 overflow-y-auto space-y-1.5">
      {history.map((entry) => {
        const isAdd = entry.type === "add";
        const date = new Date(entry.created_at).toLocaleDateString("en-US", {
          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
        });
        return (
          <div key={entry.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-black/20">
            <div>
              {entry.note && <p className="text-[#c4b8aa] text-sm">{entry.note}</p>}
              <p className="text-[#a09488] text-xs">{date}</p>
            </div>
            <span className={`text-sm font-medium ${isAdd ? "text-[#ff914d]" : "text-[#c4b8aa]"}`}>
              {isAdd ? "+" : "−"}{Math.abs(entry.amount).toLocaleString()} kr
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default WorkCredit;
