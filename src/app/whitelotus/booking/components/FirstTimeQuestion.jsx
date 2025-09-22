import { motion } from "framer-motion";

export default function FirstTimeQuestion({ formData, updateFormData, t }) {
  const handleSelection = (isFirstTime) => {
    updateFormData({ firstTime: isFirstTime });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-extralight text-[#fefff5] mb-8 text-center">
        {t("firstTimeTitle")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <motion.button
          onClick={() => handleSelection(true)}
          className={`
            p-4 border transition-colors duration-150 ease-out text-center rounded-lg
            ${
              formData.firstTime === true
                ? "border-[#a77d3b] bg-[#a77d3b]/10"
                : "border-slate-600/30 hover:border-[#a77d3b]/50"
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-center space-x-4">
            <div
              className={`
              w-6 h-6 rounded border-2 flex items-center justify-center
              ${
                formData.firstTime === true
                  ? "border-[#a77d3b] bg-[#a77d3b]"
                  : "border-slate-500/50"
              }
            `}
            >
              {formData.firstTime === true && (
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
            <div className="font-light text-lg text-[#fefff5]">{t("yes")}</div>
          </div>
        </motion.button>

        <motion.button
          onClick={() => handleSelection(false)}
          className={`
            p-4 border transition-colors duration-150 ease-out text-center rounded-lg
            ${
              formData.firstTime === false
                ? "border-[#a77d3b] bg-[#a77d3b]/10"
                : "border-slate-600/30 hover:border-[#a77d3b]/50"
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-center space-x-4">
            <div
              className={`
              w-6 h-6 rounded border-2 flex items-center justify-center
              ${
                formData.firstTime === false
                  ? "border-[#a77d3b] bg-[#a77d3b]"
                  : "border-slate-500/50"
              }
            `}
            >
              {formData.firstTime === false && (
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
            <div className="font-light text-lg text-[#fefff5]">{t("no")}</div>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
}
