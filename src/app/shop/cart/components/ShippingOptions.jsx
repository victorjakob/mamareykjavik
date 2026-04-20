"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

const capitalAreaPostcodes = [
  "101",
  "102",
  "103",
  "104",
  "105",
  "107",
  "108",
  "109",
  "110",
  "111",
  "112",
  "113",
  "116",
  "121",
  "123",
  "124",
  "125",
  "126",
  "127",
  "128",
  "129",
  "130",
  "132",
  "150",
  "155",
  "170",
  "172",
  "200",
  "201",
  "202",
  "203",
  "210",
  "212",
  "220",
  "221",
  "222",
  "225",
  "270",
  "271",
  "276",
];
function isCapitalArea(zip) {
  return capitalAreaPostcodes.includes(zip);
}

const optionDefs = [
  {
    value: "location",
    en: "Dropp location close to your home",
    is: "Dropp afhendingarstaður nálægt þér",
    getPrice: (zip) => (isCapitalArea(zip) ? 790 : 990),
  },
  {
    value: "home",
    en: "Delivered straight to your door",
    is: "Heimsent að dyrum þínum",
    getPrice: (zip) => (isCapitalArea(zip) ? 1350 : 1450),
  },
];

export default function ShippingOptions({
  zip,
  shippingOption,
  onChange,
  show,
}) {
  const { language } = useLanguage();
  if (!show) return null;

  const heading =
    language === "is" ? "Veldu sendingarleið:" : "Choose shipping option:";
  const areaLabel = (zip) =>
    language === "is"
      ? isCapitalArea(zip)
        ? "Höfuðborgarsvæðið"
        : "Utan höfuðborgarsvæðis"
      : isCapitalArea(zip)
        ? "Capital area"
        : "Outside capital area";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="shipping-options"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.4 }}
          className="pt-6 mt-6 border-t border-white/10"
        >
          <div className="mb-3 text-[10px] uppercase tracking-[0.3em] text-[#a09488]">
            {heading}
          </div>
          <div className="grid grid-cols-1 gap-3">
            {optionDefs.map((opt) => {
              const active = shippingOption === opt.value;
              return (
                <motion.label
                  key={opt.value}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 flex items-center gap-4 select-none focus-within:ring-2 focus-within:ring-[#ff914d]/40 ${
                    active
                      ? "border-[#ff914d] bg-[#ff914d]/[0.06]"
                      : "border-white/10 bg-[#0e0b08] hover:border-[#ff914d]/40"
                  }`}
                  tabIndex={0}
                  aria-checked={active}
                  role="radio"
                  htmlFor={`shipping-option-${opt.value}`}
                >
                  <input
                    type="radio"
                    id={`shipping-option-${opt.value}`}
                    name="shippingOption"
                    value={opt.value}
                    checked={active}
                    onChange={() => onChange(opt.value)}
                    className="hidden"
                    aria-labelledby={`shipping-option-label-${opt.value}`}
                  />
                  <div className="flex-grow">
                    <div
                      id={`shipping-option-label-${opt.value}`}
                      className={`text-sm tracking-wide ${
                        active ? "text-[#ff914d]" : "text-[#f0ebe3]"
                      }`}
                    >
                      {opt[language] || opt.en}
                    </div>
                    <div className="mt-1 text-xs text-[#8a7e72] font-light">
                      {areaLabel(zip)} &ndash; {opt.getPrice(zip)} kr
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border transition-all duration-300 ${
                      active
                        ? "border-[#ff914d] bg-[#ff914d]"
                        : "border-white/20"
                    }`}
                  />
                </motion.label>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
