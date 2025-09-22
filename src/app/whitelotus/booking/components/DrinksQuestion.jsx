import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const drinkOptions = [
  { id: "beer", label: "Bjór", icon: "🍺", description: "Bjór og ale" },
  {
    id: "wine_white",
    label: "Hvítvín",
    icon: "🥂",
    description: "Hvítvín og freyðivín",
  },
  { id: "wine_red", label: "Rauðvín", icon: "🍷", description: "Rautt vín" },
  {
    id: "cocktails",
    label: "Kokteila",
    icon: "🍸",
    description: "Blandaðir drykkir",
  },
  {
    id: "soft",
    label: "Áfengislaust",
    icon: "🥤",
    description: "Gos og áfengislaust",
  },
  {
    id: "custom",
    label: "Sérsniðið",
    icon: "✨",
    description: "Sérsniðinn drykkjarvalmynd",
  },
];

export default function DrinksQuestion({ formData, updateFormData, t }) {
  const [selectedDrinks, setSelectedDrinks] = useState([]);

  useEffect(() => {
    setSelectedDrinks(formData.drinks || []);
  }, [formData.drinks]);

  const handleDrinkToggle = (drinkId) => {
    const newDrinks = selectedDrinks.includes(drinkId)
      ? selectedDrinks.filter((id) => id !== drinkId)
      : [...selectedDrinks, drinkId];

    setSelectedDrinks(newDrinks);
    updateFormData({ drinks: newDrinks });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-extralight text-[#fefff5] mb-8 text-center">
        Hvaða drykki viltu bjóða?
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {drinkOptions.map((drink, index) => (
          <motion.button
            key={drink.id}
            onClick={() => handleDrinkToggle(drink.id)}
            className={`
              p-4 border text-center rounded-lg
              transition-colors duration-150 ease-out
              ${
                selectedDrinks.includes(drink.id)
                  ? "border-[#a77d3b] bg-[#a77d3b]/10"
                  : "border-slate-600/30 hover:border-[#a77d3b]/50"
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="text-3xl mb-3">{drink.icon}</div>
            <div className="font-light text-[#fefff5] mb-1">{drink.label}</div>
            <div className="text-xs text-[#fefff5] font-light">
              {drink.description}
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
