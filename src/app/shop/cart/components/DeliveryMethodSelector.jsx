"use client";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

const methodDefs = [
  {
    value: "pickup",
    en: { label: "Store Pickup", description: "Ready right away" },
    is: { label: "Sækja í verslun", description: "Tilbúið strax" },
    icon: (
      <svg
        className="w-7 h-7 mb-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
  {
    value: "delivery",
    en: { label: "Home Delivery", description: "2–5 business days" },
    is: { label: "Heimsending", description: "2–5 virkir dagar" },
    icon: (
      <svg
        className="w-7 h-7 mb-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
];

export default function DeliveryMethodSelector({ value, onChange }) {
  const { language } = useLanguage();

  const heading =
    language === "is"
      ? "Hvernig viltu fá pöntunina?"
      : "How would you like to receive your order?";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#a09488] text-center mb-5">
        {heading}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {methodDefs.map((method) => {
          const loc = method[language] || method.en;
          const active = value === method.value;
          return (
            <motion.label
              key={method.value}
              whileTap={{ scale: 0.98 }}
              className={`p-5 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col items-center text-center select-none focus-within:ring-2 focus-within:ring-[#ff914d]/40 ${
                active
                  ? "border-[#ff914d] bg-[#ff914d]/[0.06] text-[#ff914d]"
                  : "border-white/10 bg-[#0e0b08] text-[#c4b8aa] hover:border-[#ff914d]/40 hover:text-[#f0ebe3]"
              }`}
              tabIndex={0}
              aria-checked={active}
              role="radio"
              htmlFor={`delivery-method-${method.value}`}
            >
              <input
                type="radio"
                id={`delivery-method-${method.value}`}
                name="deliveryMethod"
                value={method.value}
                checked={active}
                onChange={() => onChange(method.value)}
                className="hidden"
                aria-labelledby={`delivery-method-label-${method.value}`}
              />
              {method.icon}
              <span
                id={`delivery-method-label-${method.value}`}
                className={`text-sm tracking-wide ${
                  active ? "text-[#ff914d]" : "text-[#f0ebe3]"
                }`}
              >
                {loc.label}
              </span>
              <span className="mt-1 text-xs text-[#8a7e72] font-light">
                {loc.description}
              </span>
            </motion.label>
          );
        })}
      </div>
    </motion.div>
  );
}
