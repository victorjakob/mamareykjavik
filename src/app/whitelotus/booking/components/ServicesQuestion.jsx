import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const serviceOptions = [
  {
    id: "food",
    label: "Matur",
    icon: "🍽️",
    description: "Veitingaþjónusta og matargerð",
  },
  {
    id: "drinks",
    label: "Drykkir",
    icon: "🥂",
    description: "Drykkjarveitingar og barþjónusta",
  },
  {
    id: "eventManager",
    label: "Atriði/Veislustjóri",
    icon: "🎭",
    description: "Faglegur viðburðarstjóri fyrir þinn viðburð",
  },
];

export default function ServicesQuestion({ formData, updateFormData, t }) {
  const [selectedServices, setSelectedServices] = useState([]);

  useEffect(() => {
    setSelectedServices(formData.services || []);
  }, [formData.services]);

  const handleServiceToggle = (serviceId) => {
    const newServices = selectedServices.includes(serviceId)
      ? selectedServices.filter((id) => id !== serviceId)
      : [...selectedServices, serviceId];

    setSelectedServices(newServices);
    updateFormData({ services: newServices });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-extralight text-[#fefff5] mb-8 text-center">
        Hvaða þjónustu þarftu?
      </h2>

      <div className="space-y-4 max-w-2xl mx-auto">
        {serviceOptions.map((service, index) => (
          <motion.button
            key={service.id}
            onClick={() => handleServiceToggle(service.id)}
            className={`
              w-full p-4 border transition-all duration-200 text-left rounded-lg
              ${
                selectedServices.includes(service.id)
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
                  selectedServices.includes(service.id)
                    ? "border-[#a77d3b] bg-[#a77d3b]"
                    : "border-slate-500/50"
                }
              `}
              >
                {selectedServices.includes(service.id) && (
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
                  <span className="text-2xl">{service.icon}</span>
                  <div className="font-light text-lg text-[#fefff5]">
                    {service.label}
                  </div>
                </div>
                <div className="text-sm text-[#fefff5] font-light">
                  {service.description}
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
