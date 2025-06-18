import { motion, AnimatePresence } from "framer-motion";

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

const options = [
  {
    value: "location",
    label: "Dropp location close to your home",
    getPrice: (zip) => (isCapitalArea(zip) ? 790 : 990),
    getArea: (zip) =>
      isCapitalArea(zip) ? "Capital area" : "Outside capital area",
  },
  {
    value: "home",
    label: "Delivered straight to your door",
    getPrice: (zip) => (isCapitalArea(zip) ? 1350 : 1450),
    getArea: (zip) =>
      isCapitalArea(zip) ? "Capital area" : "Outside capital area",
  },
];

export default function ShippingOptions({
  zip,
  shippingOption,
  onChange,
  show,
}) {
  if (!show) return null;
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="shipping-options"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4 }}
          className="pt-6 mt-6 border-t border-gray-200"
        >
          <div className="mb-2 font-semibold text-gray-800">
            Choose shipping option:
          </div>
          <div className="grid grid-cols-1 gap-3">
            {options.map((opt) => (
              <motion.label
                key={opt.value}
                whileTap={{ scale: 0.97 }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-4 select-none focus-within:ring-2 focus-within:ring-emerald-400 ${
                  shippingOption === opt.value
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-gray-200 hover:border-emerald-200"
                }`}
                tabIndex={0}
                aria-checked={shippingOption === opt.value}
                role="radio"
                htmlFor={`shipping-option-${opt.value}`}
              >
                <input
                  type="radio"
                  id={`shipping-option-${opt.value}`}
                  name="shippingOption"
                  value={opt.value}
                  checked={shippingOption === opt.value}
                  onChange={() => onChange(opt.value)}
                  className="hidden"
                  aria-labelledby={`shipping-option-label-${opt.value}`}
                />
                <div>
                  <div
                    id={`shipping-option-label-${opt.value}`}
                    className="font-medium text-gray-800"
                  >
                    {opt.label}
                  </div>
                  <div className="text-sm text-gray-500">
                    {opt.getArea(zip)} &ndash; {opt.getPrice(zip)} kr
                  </div>
                </div>
              </motion.label>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
