import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { validateField } from "../utils/validation";

const entertainmentOptions = [
  {
    id: "live_music",
    label: "Já live tónlist",
    icon: "🎵",
    description: "Lifandi tónlist og hljómsveit",
  },
  {
    id: "event_manager",
    label: "Já veislustjóri",
    icon: "🎭",
    description: "Faglegur viðburðarstjóri",
  },
  {
    id: "dj",
    label: "Já DJ",
    icon: "🎧",
    description: "DJ og tónlist",
  },
  {
    id: "playlist",
    label: "Bara playlisti úr síma",
    icon: "📱",
    description: "Playlist úr síma",
  },
];

export default function EventManagerQuestion({ formData, updateFormData, t }) {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setSelectedOptions(formData.entertainment || []);
  }, [formData.entertainment]);

  const handleOptionToggle = (optionId) => {
    const newOptions = selectedOptions.includes(optionId)
      ? selectedOptions.filter((id) => id !== optionId)
      : [...selectedOptions, optionId];

    setSelectedOptions(newOptions);
    updateFormData({ entertainment: newOptions });
  };

  const handleContactChange = (field, value) => {
    const newSoundContact = {
      ...formData.soundContact,
      [field]: value,
    };
    updateFormData({ soundContact: newSoundContact });

    // Validate field
    const error = validateField(field, value);
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const needsSoundContact =
    selectedOptions.includes("live_music") || selectedOptions.includes("dj");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-extralight text-[#fefff5] mb-8 text-center">
        Verða atriði / veislustjóri?
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-8">
        {entertainmentOptions.map((option, index) => (
          <motion.button
            key={option.id}
            onClick={() => handleOptionToggle(option.id)}
            className={`
              p-4 border transition-colors duration-150 ease-out text-left rounded-lg
              ${
                selectedOptions.includes(option.id)
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
                  selectedOptions.includes(option.id)
                    ? "border-[#a77d3b] bg-[#a77d3b]"
                    : "border-slate-500/50"
                }
              `}
              >
                {selectedOptions.includes(option.id) && (
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

      {needsSoundContact && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto mt-8"
        >
          <h3 className="text-lg font-light text-[#fefff5] mb-6 text-center">
            Tengiliðaupplýsingar hljóðkerfis
          </h3>

          <div className="space-y-6">
            <div>
              <motion.input
                type="text"
                value={formData.soundContact?.name || ""}
                onChange={(e) => handleContactChange("name", e.target.value)}
                placeholder="Fullt nafn"
                className={`
                  w-full p-4 bg-slate-900/50 border rounded-xl text-[#fefff5] placeholder-slate-400 
                  focus:ring-2 focus:ring-[#a77d3b]/50 focus:border-transparent transition-all
                  ${errors.name ? "border-red-400/50 bg-red-900/10" : "border-slate-600/30"}
                `}
                whileFocus={{ scale: 1.01 }}
              />
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400/80 text-sm mt-1 font-light"
                >
                  {errors.name}
                </motion.p>
              )}
            </div>

            <div>
              <motion.input
                type="tel"
                value={formData.soundContact?.phone || ""}
                onChange={(e) => handleContactChange("phone", e.target.value)}
                placeholder="Símanúmer"
                className={`
                  w-full p-4 bg-slate-900/50 border rounded-xl text-[#fefff5] placeholder-slate-400
                  focus:ring-2 focus:ring-[#a77d3b]/50 focus:border-transparent transition-all
                  ${errors.phone ? "border-red-400/50 bg-red-900/10" : "border-slate-600/30"}
                `}
                whileFocus={{ scale: 1.01 }}
              />
              {errors.phone && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400/80 text-sm mt-1 font-light"
                >
                  {errors.phone}
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
