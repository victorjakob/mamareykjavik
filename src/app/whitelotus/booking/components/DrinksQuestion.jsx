import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  QueueListIcon,
  BeakerIcon,
  XMarkIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";

// preOrderOptions will be created inside component to use translations

export default function DrinksQuestion({ formData, updateFormData, t }) {
  const preOrderOptions = [
    {
      id: "beerKeg",
      label: t("beerKeg"),
      description: t("beerKegDescription"),
      unit: "keg",
      price: 80000,
    },
    {
      id: "whiteWine",
      label: t("whiteWine"),
      description: t("whiteWineDescription"),
      unit: "flaska",
      price: 7900,
    },
    {
      id: "redWine",
      label: t("redWine"),
      description: t("redWineDescription"),
      unit: "flaska",
      price: 7900,
    },
    {
      id: "sparklingWine",
      label: t("sparklingWine"),
      description: t("sparklingWineDescription"),
      unit: "flaska",
      price: 7900,
    },
  ];

  const [barType, setBarType] = useState("peoplePayThemselves");
  const [preOrderQuantities, setPreOrderQuantities] = useState({});
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  useEffect(() => {
    setBarType(formData.drinks?.barType || "peoplePayThemselves");
    setPreOrderQuantities(formData.drinks?.preOrder || {});
    setComment(formData.drinks?.comment || "");
    setSpecialRequests(formData.drinks?.specialRequests || "");
    if (formData.drinks?.comment) {
      setShowComment(true);
    }
  }, [formData.drinks]);

  const handleBarTypeChange = (type) => {
    setBarType(type);
    updateFormData({
      drinks: {
        ...formData.drinks,
        barType: type,
        preOrder: type === "prePurchased" ? preOrderQuantities : {},
        comment,
        specialRequests,
      },
    });
  };

  const handleQuantityChange = (drinkId, quantity) => {
    const newQuantities = {
      ...preOrderQuantities,
      [drinkId]: Math.max(0, quantity),
    };
    setPreOrderQuantities(newQuantities);
    updateFormData({
      drinks: {
        ...formData.drinks,
        barType,
        preOrder: newQuantities,
        comment,
        specialRequests,
      },
    });
  };

  const handleCommentChange = (e) => {
    const newComment = e.target.value;
    setComment(newComment);
    updateFormData({
      drinks: {
        ...formData.drinks,
        barType,
        preOrder: preOrderQuantities,
        comment: newComment,
        specialRequests,
      },
    });
  };

  const handleSpecialRequestsChange = (e) => {
    const value = e.target.value;
    setSpecialRequests(value);
    updateFormData({
      drinks: {
        ...formData.drinks,
        barType,
        preOrder: preOrderQuantities,
        comment,
        specialRequests: value,
      },
    });
  };

  const renderIcon = (drinkId) => {
    switch (drinkId) {
      case "beerKeg":
        return <BeakerIcon className="w-5 h-5 text-[#a77d3b]" />;
      case "whiteWine":
      case "redWine":
      case "sparklingWine":
        return <BeakerIcon className="w-5 h-5 text-[#a77d3b]" />;
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
        {t("drinksTitle")}
      </h2>

      {/* Available at Bar Info */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, ease: "easeOut" }}
        className="max-w-xl mx-auto mb-10"
      >
        <div className="bg-[#a77d3b]/5 border border-[#a77d3b]/25 rounded-2xl px-6 py-8 sm:px-10">
          <h3 className="text-[11px] uppercase tracking-[0.25em] text-[#fefff5]/60 text-center mb-8">
            {t("availableAtBar")}
          </h3>

          <div className="space-y-4">
            {/* Soft Drinks - standalone */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[#fefff5]/80 text-sm font-light">
              <span className="whitespace-nowrap">Coke</span>
              <span className="text-[#a77d3b]/40">·</span>
              <span className="whitespace-nowrap">Red Bull</span>
              <span className="text-[#a77d3b]/40">·</span>
              <span className="whitespace-nowrap">{t("drinkSoda")}</span>
              <span className="text-[#a77d3b]/40">·</span>
              <span className="whitespace-nowrap">
                {t("drinkSparklingWineZero")}
              </span>
            </div>

            {/* Separator */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#a77d3b]/30 to-transparent" />
            </div>

            {/* Wines group */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[#fefff5]/80 text-sm font-light">
              <span className="whitespace-nowrap">{t("drinkBeerAegir")}</span>
              <span className="text-[#a77d3b]/40">·</span>
              <span className="whitespace-nowrap">{t("whiteWine")}</span>
              <span className="text-[#a77d3b]/40">·</span>
              <span className="whitespace-nowrap">{t("redWine")}</span>
              <span className="text-[#a77d3b]/40">·</span>
              <span className="whitespace-nowrap">{t("sparklingWine")}</span>
            </div>

            {/* Spirits group */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#a77d3b]/30 to-transparent" />
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[#fefff5]/80 text-sm font-light">
              <span className="whitespace-nowrap">Vodka</span>
              <span className="text-[#a77d3b]/40">·</span>
              <span className="whitespace-nowrap">Gin</span>
              <span className="text-[#a77d3b]/40">·</span>
              <span className="whitespace-nowrap">Tequila</span>
              <span className="text-[#a77d3b]/40">·</span>
              <span className="whitespace-nowrap">Rum</span>
              <span className="text-[#a77d3b]/40">·</span>
              <span className="whitespace-nowrap">Aperol Spritz</span>
            </div>

            {/* Footer text */}
            <div className="pt-4 mt-4 border-t border-[#a77d3b]/20">
              <p className="text-[#fefff5]/60 text-xs font-light text-center italic">
                {t("drinksFooter")}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bar Type Selection */}
      <div className="max-w-2xl mx-auto mb-8">
        {/* First two options side by side on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <motion.button
            onClick={() => handleBarTypeChange("openBar")}
            className={`
              p-6 rounded-lg border transition-all duration-200
              ${
                barType === "openBar"
                  ? "border-[#a77d3b] bg-[#a77d3b]/10"
                  : "border-slate-600/30 hover:border-[#a77d3b]/50"
              }
            `}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <BeakerIcon className="w-6 h-6 text-[#a77d3b]" />
              <div>
                <div className="font-light text-[#fefff5] text-lg mb-1">
                  {t("openBar")}
                </div>
                <div className="text-sm text-[#fefff5]/70 font-light">
                  {t("openBarDescription")}
                </div>
              </div>
            </div>
          </motion.button>

          <motion.button
            onClick={() => handleBarTypeChange("prePurchased")}
            className={`
              p-6 rounded-lg border transition-all duration-200
              ${
                barType === "prePurchased"
                  ? "border-[#a77d3b] bg-[#a77d3b]/10"
                  : "border-slate-600/30 hover:border-[#a77d3b]/50"
              }
            `}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <QueueListIcon className="w-6 h-6 text-[#a77d3b]" />
              <div>
                <div className="font-light text-[#fefff5] text-lg mb-1">
                  {t("prePurchased")}
                </div>
                <div className="text-sm text-[#fefff5]/70 font-light">
                  {t("prePurchasedDescription")}
                </div>
              </div>
            </div>
          </motion.button>
        </div>

        {/* Third option below - full width */}
        <motion.button
          onClick={() => handleBarTypeChange("peoplePayThemselves")}
          className={`
            w-full p-4 rounded-lg border transition-all duration-200
            ${
              barType === "peoplePayThemselves"
                ? "border-[#a77d3b] bg-[#a77d3b]/10"
                : "border-slate-600/30 hover:border-[#a77d3b]/50"
            }
          `}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center justify-center space-x-3">
            <XMarkIcon className="w-6 h-6 text-[#a77d3b]" />
            <div className="font-light text-[#fefff5] text-lg">
              {t("peoplePayThemselves")}
            </div>
          </div>
        </motion.button>
      </div>

      {/* Pre-order Section - Only shown when "prePurchased" is selected */}
      {barType === "prePurchased" && (
        <div className="max-w-2xl mx-auto mb-8">
          <h3 className="text-lg font-light text-[#fefff5] mb-6 text-center">
            {t("preOrderDrinks")}
          </h3>

          <div className="space-y-4">
            {preOrderOptions.map((option) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className="flex items-center justify-between p-4 bg-slate-900/30 border border-slate-600/30 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {renderIcon(option.id)}
                  <div>
                    <div className="font-light text-[#fefff5]">
                      {option.label}
                    </div>
                    <div className="text-sm text-[#fefff5]/70 font-light">
                      {option.description}
                    </div>
                    {option.price && (
                      <div className="text-sm text-[#a77d3b] font-light">
                        {option.price.toLocaleString("is-IS")} kr {t("perUnit")}{" "}
                        {option.unit}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <motion.button
                    onClick={() =>
                      handleQuantityChange(
                        option.id,
                        (preOrderQuantities[option.id] || 0) - 1
                      )
                    }
                    className="w-8 h-8 rounded-full border border-slate-600/30 flex items-center justify-center text-[#fefff5] hover:border-[#a77d3b]/50 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    -
                  </motion.button>
                  <span className="w-8 text-center font-light text-[#fefff5]">
                    {preOrderQuantities[option.id] || 0}
                  </span>
                  <motion.button
                    onClick={() =>
                      handleQuantityChange(
                        option.id,
                        (preOrderQuantities[option.id] || 0) + 1
                      )
                    }
                    className="w-8 h-8 rounded-full border border-slate-600/30 flex items-center justify-center text-[#fefff5] hover:border-[#a77d3b]/50 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    +
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Special Requests Field */}
      <div className="max-w-2xl mx-auto mt-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <label className="block text-sm font-light text-[#fefff5] mb-2">
            {t("specialRequests")}
          </label>
          <motion.input
            type="text"
            value={specialRequests}
            onChange={handleSpecialRequestsChange}
            placeholder=""
            className="w-full p-4 bg-slate-900/50 border border-slate-600/30 rounded-xl text-[#fefff5] font-light placeholder-slate-400 focus:ring-2 focus:ring-[#a77d3b]/50 focus:border-transparent transition-all"
            whileFocus={{ scale: 1.01 }}
          />
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
