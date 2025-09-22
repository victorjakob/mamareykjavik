import { motion } from "framer-motion";

const roomSetups = [
  {
    id: "seated",
    label: "Borð",
    icon: "🪑",
    description: "Allir í sætum með borðum",
  },
  {
    id: "standing",
    label: "Standandi",
    icon: "🚶",
    description: "Allir standandi",
  },
  {
    id: "mixed",
    label: "50/50",
    icon: "🔄",
    description: "Blanda af sætum og stöðu",
  },
];

export default function RoomSetupQuestion({ formData, updateFormData, t }) {
  const handleSelection = (setup) => {
    updateFormData({ roomSetup: setup });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-extralight text-[#fefff5] mb-8 text-center">
        Uppsetning
      </h2>

      <div className="text-center mb-6">
        <p className="text-[#fefff5] font-light">
          Hvernig viltu setja upp rýmið fyrir gestina?
        </p>
      </div>

      <div className="space-y-4 max-w-lg mx-auto">
        {roomSetups.map((setup, index) => (
          <motion.button
            key={setup.id}
            onClick={() => handleSelection(setup.id)}
            className={`
              w-full p-4 border transition-colors duration-150 ease-out text-left rounded-lg
              ${
                formData.roomSetup === setup.id
                  ? "border-[#a77d3b] bg-[#a77d3b]/10"
                  : "border-slate-600/30 hover:border-[#a77d3b]/50"
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center space-x-4">
              <div
                className={`
                w-6 h-6 rounded border-2 flex items-center justify-center
                ${
                  formData.roomSetup === setup.id
                    ? "border-[#a77d3b] bg-[#a77d3b]"
                    : "border-slate-500/50"
                }
              `}
              >
                {formData.roomSetup === setup.id && (
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
                <span className="text-2xl">{setup.icon}</span>
                <div>
                  <div className="font-light text-lg text-[#fefff5]">
                    {setup.label}
                  </div>
                  <div className="text-sm text-[#fefff5] font-light">
                    {setup.description}
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
