import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  QueueListIcon,
  BeakerIcon,
  XMarkIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";

const preOrderOptions = [
  {
    id: "beerKeg",
    label: "Bjórkútur",
    description: "Um 75 Bjórar",
    unit: "keg",
    price: 70000,
  },
  {
    id: "cocktails",
    label: "Kokteill á kút",
    description: "Um 100 glös",
    unit: "kút",
    price: 70000,
  },
  {
    id: "whiteWine",
    label: "Hvítvín",
    description: "Flaska af hvítvíni",
    unit: "flaska",
    price: 7000,
  },
  {
    id: "redWine",
    label: "Rauðvín",
    description: "Flaska af rauðvíni",
    unit: "flaska",
    price: 7000,
  },
  {
    id: "sparklingWine",
    label: "Freyðivín",
    description: "Flaska af freyðivíni",
    unit: "flaska",
    price: 7000,
  },
];

export default function DrinksQuestion({ formData, updateFormData, t }) {
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
      case "cocktails":
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
        Drykkir
      </h2>

      {/* Available at Bar Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl mx-auto mb-8"
      >
        <div className="bg-[#a77d3b]/10 border border-[#a77d3b]/30 rounded-xl p-6">
          <h3 className="text-sm font-light text-[#a77d3b] mb-3 text-center">
            Fáanlegt hjá okkur á barnum
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-[#fefff5]/70 font-light text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-[#a77d3b]">•</span>
              <span>Bjór</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#a77d3b]">•</span>
              <span>Cider</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#a77d3b]">•</span>
              <span>Vín</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#a77d3b]">•</span>
              <span>Vodka</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#a77d3b]">•</span>
              <span>G & T</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#a77d3b]">•</span>
              <span>Tequila</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#a77d3b]">•</span>
              <span>Rum</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#a77d3b]">•</span>
              <span>Aperol Spritz</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#a77d3b]">•</span>
              <span>Redbull</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#a77d3b]">•</span>
              <span>Coke</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#a77d3b]">•</span>
              <span>Coke lite</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#a77d3b]">•</span>
              <span>Kristall</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#a77d3b]">•</span>
              <span>Tonic</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#a77d3b]">•</span>
              <span>Ginger Beer</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#a77d3b]">•</span>
              <span>Sparkling wine</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#a77d3b]">•</span>
              <span>Sparkling wine 0%</span>
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
                  Opinn Bar
                </div>
                <div className="text-sm text-[#fefff5]/70 font-light">
                  Við skráum allt sem selst og þú færð rkn eftir veisluna
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
                  Fyrirframkeypt
                </div>
                <div className="text-sm text-[#fefff5]/70 font-light">
                  Veldu hvað þú villt bjóða upp á og þegar það er búið er fólk
                  frjálst að kaupa sér meir á barnum
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
              Fólk kaupir sér sjálft drykki á barnum
            </div>
          </div>
        </motion.button>
      </div>

      {/* Pre-order Section - Only shown when "prePurchased" is selected */}
      {barType === "prePurchased" && (
        <div className="max-w-2xl mx-auto mb-8">
          <h3 className="text-lg font-light text-[#fefff5] mb-6 text-center">
            Forpantaðu drykki
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
                        {option.price.toLocaleString("is-IS")} kr per{" "}
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
            Einhverjar séróskir?
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
