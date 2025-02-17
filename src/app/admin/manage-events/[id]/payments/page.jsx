"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { PropagateLoader } from "react-spinners";
import { motion } from "framer-motion";
import { BanknotesIcon } from "@heroicons/react/24/outline";

export default function EventPayments() {
  const { id } = useParams();
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: insertError } = await supabase
        .from("event-payments")
        .insert([
          {
            event_id: id,
            amount: parseFloat(amount),
            details: details,
          },
        ]);

      if (insertError) throw insertError;

      setSuccess(true);
      setAmount("");
      setDetails("");
      // Redirect back to event manager page
      router.push("/admin/manage-events");
    } catch (err) {
      setError(err.message);
      console.error("Error registering payment:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <PropagateLoader color="#4F46E5" size={12} speedMultiplier={0.8} />
      </div>
    );
  }

  return (
    <div className="mt-8 sm:mt-14 md:mt-36 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-6">
          <BanknotesIcon className="h-8 w-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">Register Payment</h1>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4">
            <div className="text-red-600 font-medium">{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl bg-green-50 p-4">
            <div className="text-green-600 font-medium">
              Payment registered successfully!
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Amount (kr)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
              step="0.01"
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="details"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Payment Details
            </label>
            <textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
              rows={4}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter payment details, notes, or additional information..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            Register Payment
          </button>
        </form>
      </motion.div>
    </div>
  );
}
