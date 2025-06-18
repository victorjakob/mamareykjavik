import { motion, AnimatePresence } from "framer-motion";

export default function CouponField({
  couponCode,
  setCouponCode,
  onApply,
  couponError,
}) {
  return (
    <AnimatePresence>
      <motion.div
        key="coupon-field"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4 }}
        className="mb-8 pt-6 mt-6 border-t border-gray-200"
      >
        <form
          onSubmit={onApply}
          className="flex gap-3"
          aria-label="Coupon code"
        >
          <label htmlFor="coupon" className="sr-only">
            Coupon code
          </label>
          <input
            id="coupon"
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Enter promo code"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
            aria-describedby={couponError ? "coupon-error" : undefined}
          />
          <motion.button
            type="submit"
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
          >
            Apply
          </motion.button>
        </form>
        {couponError && (
          <div
            id="coupon-error"
            className="mt-2 text-sm text-red-500"
            role="alert"
          >
            {couponError}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
