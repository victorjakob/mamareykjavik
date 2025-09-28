import React from "react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  QueueListIcon,
  BeakerIcon,
  XMarkIcon,
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
  {
    id: "cocktails",
    label: "Kokteill",
    description: "Skrifaðu okkur fyrir sérstakar beiðnir",
    unit: "eining",
    isSpecial: true,
  },
];

export default function DrinksQuestion({ formData, updateFormData, t }) {
  const [preOrderQuantities, setPreOrderQuantities] = useState({});
  const [openBar, setOpenBar] = useState(false);
  const [nonAlcoholicCocktails, setNonAlcoholicCocktails] = useState(false);

  useEffect(() => {
    setPreOrderQuantities(formData.drinks?.preOrder || {});
    setOpenBar(formData.drinks?.openBar || false);
    setNonAlcoholicCocktails(formData.drinks?.nonAlcoholicCocktails || false);
  }, [formData.drinks]);

  const handleQuantityChange = (drinkId, quantity) => {
    const newQuantities = {
      ...preOrderQuantities,
      [drinkId]: Math.max(0, quantity),
    };
    setPreOrderQuantities(newQuantities);
    updateFormData({
      drinks: {
        ...formData.drinks,
        preOrder: newQuantities,
        openBar,
        nonAlcoholicCocktails,
      },
    });
  };

  const handleOpenBarChange = (value) => {
    setOpenBar(value);
    updateFormData({
      drinks: {
        ...formData.drinks,
        preOrder: preOrderQuantities,
        openBar: value,
        nonAlcoholicCocktails,
      },
    });
  };

  const handleNonAlcoholicCocktailsChange = (value) => {
    setNonAlcoholicCocktails(value);
    updateFormData({
      drinks: {
        ...formData.drinks,
        preOrder: preOrderQuantities,
        openBar,
        nonAlcoholicCocktails: value,
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
    >
      <h2 className="text-2xl font-extralight text-[#fefff5] mb-8 text-center">
        Drykkir
      </h2>

      {/* Pre-order Section */}
      <div className="max-w-2xl mx-auto mb-8">
        <h3 className="text-lg font-light text-[#fefff5] mb-6 text-center">
          Forpantaðu drykki
        </h3>

        <div className="space-y-4">
          {preOrderOptions.map((option, index) => (
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

      {/* Open Bar Question */}
      <div className="max-w-2xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="p-4 bg-slate-900/30 border border-slate-600/30 rounded-lg"
        >
          <div className="flex items-center space-x-3 mb-3">
            <BeakerIcon className="w-5 h-5 text-[#a77d3b]" />
            <h3 className="font-light text-lg text-[#fefff5]">Opinn bar</h3>
          </div>
          <p className="text-sm text-[#fefff5]/70 font-light mb-4">
            Inniheldur almennar skurtar og 3 grunnkokteila auk bjórs, víns og
            grunngosdrykka
          </p>
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => handleOpenBarChange(true)}
              className={`
                px-4 py-2 rounded-lg border transition-colors duration-200
                ${
                  openBar
                    ? "border-[#a77d3b] bg-[#a77d3b]/10 text-[#fefff5]"
                    : "border-slate-600/30 text-[#fefff5]/50 hover:border-[#a77d3b]/50"
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Já
            </motion.button>
            <motion.button
              onClick={() => handleOpenBarChange(false)}
              className={`
                px-4 py-2 rounded-lg border transition-colors duration-200
                ${
                  !openBar
                    ? "border-[#a77d3b] bg-[#a77d3b]/10 text-[#fefff5]"
                    : "border-slate-600/30 text-[#fefff5]/50 hover:border-[#a77d3b]/50"
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Nei
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Non-Alcoholic Cocktails Question */}
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="p-4 bg-slate-900/30 border border-slate-600/30 rounded-lg"
        >
          <div className="flex items-center space-x-3 mb-3">
            <BeakerIcon className="w-5 h-5 text-[#a77d3b]" />
            <h3 className="font-light text-lg text-[#fefff5]">
              Áfengislausir kokteila
            </h3>
          </div>
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => handleNonAlcoholicCocktailsChange(true)}
              className={`
                px-4 py-2 rounded-lg border transition-colors duration-200
                ${
                  nonAlcoholicCocktails
                    ? "border-[#a77d3b] bg-[#a77d3b]/10 text-[#fefff5]"
                    : "border-slate-600/30 text-[#fefff5]/50 hover:border-[#a77d3b]/50"
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Já
            </motion.button>
            <motion.button
              onClick={() => handleNonAlcoholicCocktailsChange(false)}
              className={`
                px-4 py-2 rounded-lg border transition-colors duration-200
                ${
                  !nonAlcoholicCocktails
                    ? "border-[#a77d3b] bg-[#a77d3b]/10 text-[#fefff5]"
                    : "border-slate-600/30 text-[#fefff5]/50 hover:border-[#a77d3b]/50"
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Nei
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
