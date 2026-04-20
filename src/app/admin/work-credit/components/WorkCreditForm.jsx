"use client";
import { EnvelopeIcon, CurrencyDollarIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

export default function WorkCreditForm({ email, amount, isLoading, onEmailChange, onAmountChange, onSubmit }) {
  const inputCls = `w-full pl-10 pr-4 py-3 rounded-xl text-sm text-[#2c1810] placeholder-[#9a7a62]
    bg-[#faf6f2] border border-[#e8ddd3]
    focus:outline-none focus:border-[#ff914d]/60 focus:ring-1 focus:ring-[#ff914d]/30
    transition-all duration-200`;

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div>
        <label htmlFor="wc-email" className="block text-xs font-medium text-[#9a7a62] mb-2 tracking-wide">
          User Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <EnvelopeIcon className="h-4 w-4 text-[#5a4a40]" />
          </div>
          <input id="wc-email" type="email" required value={email} onChange={onEmailChange}
            className={inputCls} placeholder="user@example.com" />
        </div>
      </div>

      <div>
        <label htmlFor="wc-amount" className="block text-xs font-medium text-[#9a7a62] mb-2 tracking-wide">
          Credit Amount (ISK)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <CurrencyDollarIcon className="h-4 w-4 text-[#5a4a40]" />
          </div>
          <input id="wc-amount" type="number" step="1" required value={amount} onChange={onAmountChange}
            className={`${inputCls} pr-10`} placeholder="0" />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-xs text-[#9a7a62]">kr</span>
          </div>
        </div>
      </div>

      <button type="submit" disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: "#ff914d", color: "#000" }}
      >
        {isLoading
          ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
          : <><PlusIcon className="h-4 w-4" /> Add Credit</>
        }
      </button>
    </form>
  );
}
