import { motion } from "framer-motion";

const guestCountOptions = [
  {
    id: "1-10",
    label: "1-10",
    icon: "👥",
    description: "Lítill hópur - notalegur og persónulegur",
  },
  {
    id: "11-25",
    label: "11-25",
    icon: "👫",
    description: "Meðalstór hópur - fullkominn fyrir fjölskyldu/vini",
  },
  {
    id: "26-50",
    label: "26-50",
    icon: "👨‍👩‍👧‍👦",
    description: "Stór hópur - frábært fyrir viðburði",
  },
  {
    id: "51-100",
    label: "51-100",
    icon: "🎭",
    description: "Mjög stór hópur - þarfnast sérstakrar skipulagningar",
  },
  {
    id: ">100",
    label: ">100",
    icon: "🏛️",
    description: "Stórviðburður - hafðu samband fyrir sérlausnir",
  },
  {
    id: "unknown",
    label: "unknown",
    icon: "❓",
    description: "Enn óviss um fjölda",
  },
];

export default function GuestCountQuestion({ formData, updateFormData, t }) {
  const handleSelection = (guestCount) => {
    updateFormData({ guestCount });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-extralight text-[#fefff5] mb-8 text-center">
        {t("guestCountTitle")}
      </h2>

      <div className="text-center mb-6">
        <p className="text-[#fefff5] font-light">
          Fjöldi gesta hjálpar okkur að skipuleggja rýmið og þjónustuna
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {guestCountOptions.map((option, index) => (
          <motion.button
            key={option.id}
            onClick={() => handleSelection(option.id)}
            className={`
              p-4 border transition-colors duration-150 ease-out text-left rounded-lg
              ${
                formData.guestCount === option.id
                  ? "border-[#a77d3b] bg-[#a77d3b]/10"
                  : "border-slate-600/30 hover:border-[#a77d3b]/50"
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start space-x-4">
              <div
                className={`
                w-6 h-6 rounded border-2 flex items-center justify-center mt-1
                ${
                  formData.guestCount === option.id
                    ? "border-[#a77d3b] bg-[#a77d3b]"
                    : "border-slate-500/50"
                }
              `}
              >
                {formData.guestCount === option.id && (
                  <svg
                    className="w-4 h-4 text-[#fefff5]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{option.icon}</span>
                  <div className="font-light text-lg text-[#fefff5]">
                    {option.label} {t("guests")}
                  </div>
                </div>
                <div className="text-sm text-[#fefff5] font-light">
                  {option.description}
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
