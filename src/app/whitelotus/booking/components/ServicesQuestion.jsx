import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";

// mainServiceOptions will be created inside component to use translations

export default function ServicesQuestion({
  formData,
  updateFormData,
  t,
  onContinue,
}) {
  const mainServiceOptions = [
    {
      id: "food",
      label: t("food"),
      description: t("foodDescription"),
    },
    {
      id: "drinks",
      label: t("drinks"),
      description: t("drinksDescription"),
    },
  ];

  const [selectedServices, setSelectedServices] = useState([]);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [staffCostAcknowledged, setStaffCostAcknowledged] = useState(
    formData.staffCostAcknowledged || false
  );
  const [noOwnAlcoholConfirmed, setNoOwnAlcoholConfirmed] = useState(
    formData.noOwnAlcoholConfirmed || false
  );
  const [showAgreementError, setShowAgreementError] = useState(false);

  useEffect(() => {
    setSelectedServices(formData.services || []);
    setComment(formData.servicesComment || "");
    setStaffCostAcknowledged(formData.staffCostAcknowledged || false);
    setNoOwnAlcoholConfirmed(formData.noOwnAlcoholConfirmed || false);
    if (formData.servicesComment) {
      setShowComment(true);
    }
    // Clear error when agreements are checked
    if (staffCostAcknowledged && noOwnAlcoholConfirmed) {
      setShowAgreementError(false);
    }
  }, [
    formData.services,
    formData.servicesComment,
    formData.staffCostAcknowledged,
    formData.noOwnAlcoholConfirmed,
    staffCostAcknowledged,
    noOwnAlcoholConfirmed,
  ]);

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
    updateFormData({
      services: newServices,
      servicesComment: comment,
      staffCostAcknowledged,
      noOwnAlcoholConfirmed,
    });
  };

  const handleNeitherClick = () => {
    // Deselect any previously selected services and select only "neither"
    const neitherServices = ["neither"];
    setSelectedServices(neitherServices);
    updateFormData({
      services: neitherServices,
      servicesComment: comment,
      staffCostAcknowledged,
      noOwnAlcoholConfirmed,
      // Clear food and drinks data when neither is selected
      food: null,
      foodDetails: null,
      foodComment: null,
      drinks: null,
      drinksComment: null,
    });
    // Don't auto-advance - user must accept agreements first
  };

  const handleCommentChange = (e) => {
    const newComment = e.target.value;
    setComment(newComment);
    updateFormData({
      services: selectedServices,
      servicesComment: newComment,
      staffCostAcknowledged,
      noOwnAlcoholConfirmed,
    });
  };

  const handleStaffCostToggle = (checked) => {
    setStaffCostAcknowledged(checked);
    setShowAgreementError(false); // Clear error when user checks
    updateFormData({
      services: selectedServices,
      servicesComment: comment,
      staffCostAcknowledged: checked,
      noOwnAlcoholConfirmed,
    });
  };

  const handleNoOwnAlcoholToggle = (checked) => {
    setNoOwnAlcoholConfirmed(checked);
    setShowAgreementError(false); // Clear error when user checks
    updateFormData({
      services: selectedServices,
      servicesComment: comment,
      staffCostAcknowledged,
      noOwnAlcoholConfirmed: checked,
    });
  };

  // Listen for attempts to continue when agreements are missing
  useEffect(() => {
    const handleShowError = () => {
      // Agreements are always required regardless of service selection
      const agreementsMissing =
        !staffCostAcknowledged || !noOwnAlcoholConfirmed;
      if (agreementsMissing) {
        setShowAgreementError(true);
        // Auto-clear after animation
        setTimeout(() => setShowAgreementError(false), 2000);
      }
    };

    window.addEventListener("showAgreementError", handleShowError);
    return () =>
      window.removeEventListener("showAgreementError", handleShowError);
  }, [staffCostAcknowledged, noOwnAlcoholConfirmed]);

  const renderIcon = (serviceId) => {
    const iconSize = 48; // 48px = w-12 h-12 equivalent
    switch (serviceId) {
      case "food":
        return (
          <Image
            src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1768119994/food_ddtwr4.png"
            alt="Food"
            width={iconSize}
            height={iconSize}
            className="object-contain"
          />
        );
      case "drinks":
        return (
          <Image
            src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1768119993/drink_winjyw.png"
            alt="Drinks"
            width={iconSize}
            height={iconSize}
            className="object-contain"
          />
        );
      case "neither":
        return (
          <Image
            src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1768119993/space_cuy0ko.png"
            alt="Space only"
            width={iconSize}
            height={iconSize}
            className="object-contain"
          />
        );
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
        {t("servicesTitle")}
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
                  <div className="font-light text-base sm:text-lg text-[#fefff5] mb-1">
                    {service.label}
                  </div>
                  <div className="text-xs sm:text-sm text-[#fefff5]/70 font-light">
                    {service.description}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Neither Option - Styled as Service Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center"
        >
          <motion.button
            onClick={handleNeitherClick}
            className={`
              p-6 border transition-all duration-200 rounded-lg
              ${
                selectedServices.includes("neither")
                  ? "border-[#a77d3b] bg-[#a77d3b]/10"
                  : "border-slate-600/30 hover:border-[#a77d3b]/50"
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex flex-col items-center space-y-3">
              {renderIcon("neither")}
              <div className="text-center">
                <div className="font-light text-base sm:text-lg text-[#fefff5] mb-1">
                  {t("neither")}
                </div>
                <div className="text-xs sm:text-sm text-[#fefff5]/70 font-light">
                  {t("neitherDescription")}
                </div>
              </div>
            </div>
          </motion.button>
        </motion.div>
      </div>

      {/* Checkboxes - Styled as cards */}
      <div className="max-w-2xl mx-auto mt-8 space-y-3">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: 1,
            y: 0,
            x:
              showAgreementError && !staffCostAcknowledged
                ? [0, -10, 10, -10, 10, 0]
                : 0,
            borderColor:
              showAgreementError && !staffCostAcknowledged
                ? "#ef4444"
                : undefined,
            boxShadow:
              showAgreementError && !staffCostAcknowledged
                ? "0 0 20px rgba(239, 68, 68, 0.5)"
                : undefined,
          }}
          transition={{
            delay: 0.3,
            x: {
              duration: 0.5,
              times: [0, 0.2, 0.4, 0.6, 0.8, 1],
            },
            borderColor: { duration: 0.3 },
            boxShadow: { duration: 0.3 },
          }}
          onClick={() => handleStaffCostToggle(!staffCostAcknowledged)}
          className={`
            w-full p-4 border transition-all duration-200 rounded-xl text-left
            ${
              staffCostAcknowledged
                ? "border-[#a77d3b] bg-[#a77d3b]/10"
                : showAgreementError &&
                    (!staffCostAcknowledged || !noOwnAlcoholConfirmed)
                  ? "border-red-500/70 bg-red-900/20"
                  : "border-slate-600/30 hover:border-[#a77d3b]/50 bg-slate-900/30"
            }
          `}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`
                flex-shrink-0 w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center
                ${
                  staffCostAcknowledged
                    ? "border-[#a77d3b] bg-[#a77d3b]"
                    : "border-slate-600/50 bg-transparent"
                }
              `}
            >
              {staffCostAcknowledged && (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-3 h-3 text-[#fefff5]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </motion.svg>
              )}
            </div>
            <span className="text-sm font-light text-[#fefff5] leading-relaxed">
              {t("staffCostNotIncluded")}
            </span>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: 1,
            y: 0,
            x:
              showAgreementError && !noOwnAlcoholConfirmed
                ? [0, -10, 10, -10, 10, 0]
                : 0,
            borderColor:
              showAgreementError && !noOwnAlcoholConfirmed
                ? "#ef4444"
                : undefined,
            boxShadow:
              showAgreementError && !noOwnAlcoholConfirmed
                ? "0 0 20px rgba(239, 68, 68, 0.5)"
                : undefined,
          }}
          transition={{
            delay: 0.4,
            x: {
              duration: 0.5,
              times: [0, 0.2, 0.4, 0.6, 0.8, 1],
            },
            borderColor: { duration: 0.3 },
            boxShadow: { duration: 0.3 },
          }}
          onClick={() => handleNoOwnAlcoholToggle(!noOwnAlcoholConfirmed)}
          className={`
            w-full p-4 border transition-all duration-200 rounded-xl text-left
            ${
              noOwnAlcoholConfirmed
                ? "border-[#a77d3b] bg-[#a77d3b]/10"
                : showAgreementError &&
                    (!staffCostAcknowledged || !noOwnAlcoholConfirmed)
                  ? "border-red-500/70 bg-red-900/20"
                  : "border-slate-600/30 hover:border-[#a77d3b]/50 bg-slate-900/30"
            }
          `}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`
                flex-shrink-0 w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center
                ${
                  noOwnAlcoholConfirmed
                    ? "border-[#a77d3b] bg-[#a77d3b]"
                    : "border-slate-600/50 bg-transparent"
                }
              `}
            >
              {noOwnAlcoholConfirmed && (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-3 h-3 text-[#fefff5]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </motion.svg>
              )}
            </div>
            <span className="text-sm font-light text-[#fefff5] leading-relaxed">
              {t("noOwnAlcoholConfirmed")}
            </span>
          </div>
        </motion.button>
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
            <span className="font-light text-sm">{t("addComment")}</span>
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
                <span>{t("comment")}</span>
              </label>
              <textarea
                value={comment}
                onChange={handleCommentChange}
                placeholder={t("commentPlaceholder")}
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
