import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  QueueListIcon,
  BeakerIcon,
  XMarkIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";

const mainServiceOptions = [
  {
    id: "food",
    label: "Matur",
    description: "Veitingaþjónusta og matargerð",
  },
  {
    id: "drinks",
    label: "Drykkir",
    description: "Drykkjarveitingar og barþjónusta",
  },
];

export default function ServicesQuestion({
  formData,
  updateFormData,
  t,
  onContinue,
}) {
  const [selectedServices, setSelectedServices] = useState([]);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    setSelectedServices(formData.services || []);
    setComment(formData.servicesComment || "");
    if (formData.servicesComment) {
      setShowComment(true);
    }
  }, [formData.services, formData.servicesComment]);

  const handleServiceToggle = (serviceId) => {
    let newServices;

    // If "neither" is currently selected, remove it when selecting food/drinks
    if (selectedServices.includes("neither")) {
      newServices = [serviceId];
    } else if (selectedServices.includes(serviceId)) {
      // Toggle off
      newServices = selectedServices.filter((id) => id !== serviceId);
    } else {
      // Add to selection
      newServices = [...selectedServices, serviceId];
    }

    setSelectedServices(newServices);
    updateFormData({ services: newServices, servicesComment: comment });
  };

  const handleNeitherClick = () => {
    // Deselect any previously selected services and select only "neither"
    const neitherServices = ["neither"];
    setSelectedServices(neitherServices);
    updateFormData({
      services: neitherServices,
      servicesComment: comment,
      // Clear food and drinks data when neither is selected
      food: null,
      foodDetails: null,
      foodComment: null,
      drinks: null,
      drinksComment: null,
    });

    // Auto-advance to next step after a brief delay
    setTimeout(() => {
      if (onContinue) {
        onContinue();
      }
    }, 300);
  };

  const handleCommentChange = (e) => {
    const newComment = e.target.value;
    setComment(newComment);
    updateFormData({ services: selectedServices, servicesComment: newComment });
  };

  const renderIcon = (serviceId) => {
    switch (serviceId) {
      case "food":
        return <QueueListIcon className="w-6 h-6 text-[#a77d3b]" />;
      case "drinks":
        return <BeakerIcon className="w-6 h-6 text-[#a77d3b]" />;
      case "neither":
        return <XMarkIcon className="w-6 h-6 text-[#a77d3b]" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-20"
    >
      <h2 className="text-2xl font-extralight text-[#fefff5] mb-8 text-center">
        Hvaða þjónustu þarftu?
      </h2>

      {/* Main Services - Side by Side */}
      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {mainServiceOptions.map((service, index) => (
            <motion.button
              key={service.id}
              onClick={() => handleServiceToggle(service.id)}
              className={`
                p-6 border transition-all duration-200 rounded-lg
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
              <div className="flex flex-col items-center space-y-3">
                {renderIcon(service.id)}
                <div className="text-center">
                  <div className="font-light text-lg text-[#fefff5] mb-1">
                    {service.label}
                  </div>
                  <div className="text-sm text-[#fefff5]/70 font-light">
                    {service.description}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Neither Option - Secondary Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center"
        >
          <motion.button
            onClick={handleNeitherClick}
            className="px-6 py-3 text-[#fefff5]/60 hover:text-[#fefff5] font-light text-sm transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center space-x-2">
              <XMarkIcon className="w-4 h-4" />
              <span>Hvorugt - Ég þarf einungis salinn</span>
            </div>
          </motion.button>
        </motion.div>
      </div>

      {/* Optional Comment Section */}
      <div className="max-w-2xl mx-auto mt-8">
        {!showComment ? (
          <motion.button
            onClick={() => setShowComment(true)}
            className="flex items-center space-x-2 text-[#fefff5]/70 hover:text-[#a77d3b] transition-colors duration-200 mx-auto"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ChatBubbleLeftIcon className="w-5 h-5" />
            <span className="font-light text-sm">Bæta við athugasemd</span>
          </motion.button>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <label className="flex items-center space-x-2 text-[#fefff5]/70 text-sm font-light">
                <ChatBubbleLeftIcon className="w-4 h-4" />
                <span>Athugasemd (valfrjálst)</span>
              </label>
              <textarea
                value={comment}
                onChange={handleCommentChange}
                placeholder="Skrifaðu hér ef þú vilt bæta við athugasemd..."
                rows={3}
                className="w-full p-3 bg-slate-900/30 border border-slate-600/30 rounded-lg text-[#fefff5] font-light placeholder:text-[#fefff5]/30 focus:outline-none focus:border-[#a77d3b]/50 transition-colors resize-none"
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
