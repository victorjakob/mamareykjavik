import { motion } from "framer-motion";

const tableclothOptions = [
  {
    id: "white",
    label: "Hvítir dúkar",
    icon: "⚪",
    description: "Hvítir dúkar frá okkur",
  },
  {
    id: "black",
    label: "Svartir dúkar",
    icon: "⚫",
    description: "Svartir dúkar frá okkur",
  },
  {
    id: "own",
    label: "Eigin dúkar",
    icon: "🎨",
    description: "Ég kem með mína eigin",
  },
];

export default function TableclothQuestion({ formData, updateFormData, t }) {
  const handleSelection = (tablecloth) => {
    updateFormData({ tablecloth });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-extralight text-[#fefff5] mb-8 text-center">
        Dúkar
      </h2>

      <div className="text-center mb-6">
        <p className="text-[#fefff5] font-light">
          Hvers konar dúka viltu nota fyrir viðburðinn?
        </p>
      </div>

      <div className="space-y-4 max-w-lg mx-auto">
        {tableclothOptions.map((option, index) => (
          <motion.button
            key={option.id}
            onClick={() => handleSelection(option.id)}
            className={`
              w-full p-4 border transition-colors duration-150 ease-out text-left rounded-lg
              ${
                formData.tablecloth === option.id
                  ? "border-[#a77d3b] bg-[#a77d3b]/10"
                  : "border-slate-600/30 hover:border-[#a77d3b]/50"
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center space-x-4">
              <div
                className={`
                w-6 h-6 rounded border-2 flex items-center justify-center
                ${
                  formData.tablecloth === option.id
                    ? "border-[#a77d3b] bg-[#a77d3b]"
                    : "border-slate-500/50"
                }
              `}
              >
                {formData.tablecloth === option.id && (
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
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{option.icon}</span>
                <div>
                  <div className="font-light text-lg text-[#fefff5]">
                    {option.label}
                  </div>
                  <div className="text-sm text-[#fefff5] font-light">
                    {option.description}
                  </div>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
