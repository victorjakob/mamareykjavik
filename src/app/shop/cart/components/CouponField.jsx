"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

export default function CouponField({
  couponCode,
  setCouponCode,
  onApply,
  couponError,
}) {
  const { language } = useLanguage();

  const t =
    language === "is"
      ? {
          placeholder: "Sláðu inn kóða",
          apply: "Nota",
          aria: "Afsláttarkóði",
          label: "Afsláttarkóði",
        }
      : {
          placeholder: "Enter promo code",
          apply: "Apply",
          aria: "Coupon code",
          label: "Coupon code",
        };

  return (
    <AnimatePresence>
      <motion.div
        key="coupon-field"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.4 }}
        className="mb-8 pt-6 mt-6 border-t border-white/10"
      >
        <form onSubmit={onApply} className="flex gap-3" aria-label={t.aria}>
          <label htmlFor="coupon" className="sr-only">
            {t.label}
          </label>
          <input
            id="coupon"
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder={t.placeholder}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#0e0b08] border border-white/10 text-[#f0ebe3] placeholder-[#8a7e72] focus:border-[#ff914d] focus:ring-2 focus:ring-[#ff914d]/20 focus:outline-none transition-all duration-300"
            aria-describedby={couponError ? "coupon-error" : undefined}
          />
          <motion.button
            type="submit"
            whileTap={{ scale: 0.96 }}
            className="px-6 py-2.5 rounded-xl border border-white/15 text-[#f0ebe3] text-xs uppercase tracking-[0.2em] font-light hover:border-[#ff914d] hover:text-[#ff914d] transition-all duration-300"
          >
            {t.apply}
          </motion.button>
        </form>
        {couponError && (
          <div
            id="coupon-error"
            className="mt-2 text-sm text-[#ff914d]"
            role="alert"
          >
            {couponError}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
