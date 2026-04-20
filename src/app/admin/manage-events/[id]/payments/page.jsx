"use client";
import { useState } from "react";
import { supabase } from "@/util/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

const inputCls = `w-full px-4 py-3 rounded-xl text-sm text-[#2c1810] placeholder-[#9a7a62]
  bg-[#faf6f2] border border-[#e8ddd3]
  focus:outline-none focus:border-[#ff914d]/60 focus:ring-1 focus:ring-[#ff914d]/30
  transition-all duration-200`;

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
        .insert([{ event_id: id, amount: parseFloat(amount), details }]);
      if (insertError) throw insertError;
      setSuccess(true);
      setAmount(""); setDetails("");
      router.push("/admin/manage-events");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-5">
      <div className="max-w-xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* Header */}
          <div className="mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,145,77,0.14)" }}>
              <BanknotesIcon className="h-5 w-5 text-[#ff914d]" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#ff914d]/80">Admin · Events</p>
              <h1 className="font-cormorant italic text-[#2c1810] text-3xl font-light">Register Payment</h1>
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-xl px-4 py-3 text-sm text-[#ff8080]"
              style={{ background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.15)" }}>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-xl px-4 py-3 text-sm text-[#ff914d]"
              style={{ background: "rgba(255,145,77,0.08)", border: "1px solid rgba(255,145,77,0.2)" }}>
              Payment registered successfully!
            </div>
          )}

          <div className="rounded-2xl overflow-hidden"
            style={{
              background: "#ffffff",
              border: "1.5px solid #f0e6d8",
              boxShadow: "0 2px 14px rgba(60,30,10,0.07)",
            }}>
            <div className="h-[1.5px]" style={{ background: "linear-gradient(to right, rgba(255,145,77,0.4), transparent 60%)" }} />
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="amount" className="block text-xs font-medium text-[#9a7a62] mb-2 tracking-wide">
                    Amount (kr)
                  </label>
                  <input type="number" id="amount" value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required min="0" step="0.01"
                    className={inputCls} placeholder="0" />
                </div>
                <div>
                  <label htmlFor="details" className="block text-xs font-medium text-[#9a7a62] mb-2 tracking-wide">
                    Payment details
                  </label>
                  <textarea id="details" value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    required rows={4}
                    className={inputCls}
                    placeholder="Notes or additional information…" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                  style={{ background: "#ff914d", color: "#000" }}>
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Registering…</> : "Register Payment"}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
