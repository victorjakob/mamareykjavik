import { motion } from "framer-motion";

const methods = [
  {
    value: "pickup",
    label: "Store Pickup",
    description: "Ready right away",
    icon: (
      <svg
        className="w-8 h-8 mb-2 text-emerald-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
        />
      </svg>
    ),
  },
  {
    value: "delivery",
    label: "Home Delivery",
    description: "2-5 business days",
    icon: (
      <svg
        className="w-8 h-8 mb-2 text-emerald-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
];

export default function DeliveryMethodSelector({ value, onChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      <h3 className="text-lg font-semibold text-center text-gray-800 mb-4">
        How would you like to receive your order?
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {methods.map((method) => (
          <motion.label
            key={method.value}
            whileTap={{ scale: 0.97 }}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center text-center select-none focus-within:ring-2 focus-within:ring-emerald-400 ${
              value === method.value
                ? "border-emerald-600 bg-emerald-50"
                : "border-gray-200 hover:border-emerald-200"
            }`}
            tabIndex={0}
            aria-checked={value === method.value}
            role="radio"
            htmlFor={`delivery-method-${method.value}`}
          >
            <input
              type="radio"
              id={`delivery-method-${method.value}`}
              name="deliveryMethod"
              value={method.value}
              checked={value === method.value}
              onChange={() => onChange(method.value)}
              className="hidden"
              aria-labelledby={`delivery-method-label-${method.value}`}
            />
            {method.icon}
            <span
              id={`delivery-method-label-${method.value}`}
              className="font-medium text-gray-800"
            >
              {method.label}
            </span>
            <span className="text-sm text-gray-500">{method.description}</span>
          </motion.label>
        ))}
      </div>
    </motion.div>
  );
}
