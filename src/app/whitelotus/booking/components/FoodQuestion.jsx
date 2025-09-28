import { motion } from "framer-motion";
import { useState } from "react";

const mainFoodOptions = [
  {
    id: "buffet",
    label: "Hlaðborð",
    icon: "🍽️",
    description: "Fjölbreytt úrval á hlaðborði",
  },
  {
    id: "plated",
    label: "Borðhald",
    icon: "🍛",
    description: "Þjónað á disk fyrir hvern gest",
  },
];

const detailOptions = [
  {
    id: "appetizers",
    label: "Forréttir",
    icon: "🥗",
    description: "Léttir forréttir og smáréttir",
  },
  {
    id: "mainCourse",
    label: "Aðalréttir",
    icon: "🍖",
    description: "Aðalréttir og kjöt",
  },
  {
    id: "dessert",
    label: "Eftirréttir",
    icon: "🍰",
    description: "Sætur eftirréttir og kökur",
  },
  {
    id: "fingerFood",
    label: "Pinnamatur",
    icon: "🍤",
    description: "Léttur pinnamatur",
  },
];

export default function FoodQuestion({ formData, updateFormData, t }) {
  const [selectedDetails, setSelectedDetails] = useState([]);

  const handleMainSelection = (foodType) => {
    updateFormData({ food: foodType });
  };

  const handleDetailToggle = (detailId) => {
    const newDetails = selectedDetails.includes(detailId)
      ? selectedDetails.filter((id) => id !== detailId)
      : [...selectedDetails, detailId];

    setSelectedDetails(newDetails);
    updateFormData({ foodDetails: newDetails });
  };

  const selectedMainOption = mainFoodOptions.find(
    (option) => option.id === formData.food
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-extralight text-[#fefff5] mb-8 text-center">
        Hvers konar mat viltu?
      </h2>

      {/* Main Food Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {mainFoodOptions.map((option, index) => (
          <motion.button
            key={option.id}
            onClick={() => handleMainSelection(option.id)}
            className={`
              p-4 border transition-colors duration-200 text-left rounded-lg
              ${
                formData.food === option.id
                  ? "border-[#a77d3b] bg-[#a77d3b]/10"
                  : "border-slate-600/30 hover:border-[#a77d3b]/50"
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex items-start space-x-4">
              <div
                className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1
                ${
                  formData.food === option.id
                    ? "border-[#a77d3b] bg-[#a77d3b]"
                    : "border-slate-500/50"
                }
              `}
              >
                {formData.food === option.id && (
                  <div className="w-3 h-3 bg-[#fefff5] rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{option.icon}</span>
                  <div className="font-light text-lg text-[#fefff5]">
                    {option.label}
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

      {/* Detail Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="mt-8"
      >
        <h3 className="text-lg font-light text-[#fefff5] mb-6 text-center">
          Hvaða matarþætti viltu?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
          {detailOptions.map((option, index) => (
            <motion.button
              key={option.id}
              onClick={() => handleDetailToggle(option.id)}
              className={`
                p-3 border transition-colors duration-200 text-left rounded-lg
                ${
                  selectedDetails.includes(option.id)
                    ? "border-[#a77d3b] bg-[#a77d3b]/10"
                    : "border-slate-600/30 hover:border-[#a77d3b]/50"
                }
              `}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center
                  ${
                    selectedDetails.includes(option.id)
                      ? "border-[#a77d3b] bg-[#a77d3b]"
                      : "border-slate-500/50"
                  }
                `}
                >
                  {selectedDetails.includes(option.id) && (
                    <svg
                      className="w-3 h-3 text-[#fefff5]"
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
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{option.icon}</span>
                  <div className="font-light text-[#fefff5]">
                    {option.label}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
