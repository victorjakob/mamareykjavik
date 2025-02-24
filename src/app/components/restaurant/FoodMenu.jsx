"use client";
import { motion } from "framer-motion";

export default function FoodMenu({ menuData }) {
  const { categories, menuItems } = menuData;

  // Container variants for staggered children animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Delay between each child animation
      },
    },
  };

  // Individual menu item variants
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
      rotate: -2,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 py-12">
      {/* Menu List */}
      <div className="space-y-12">
        {categories.map((category) => (
          <div key={category.id} className="space-y-8">
            <h2 className="text-2xl font-bold text-orange-600 text-center mb-6">
              {category.name}
            </h2>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {menuItems
                .filter((item) => item.category_id === category.id)
                .map((item) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    className="text-center transform-gpu" // Added transform-gpu for better performance
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2 max-w-xl mx-auto whitespace-pre-wrap">
                      {item.description}
                    </p>
                    <span className="text-lg font-light text-gray-800">
                      {item.price} ISK
                    </span>
                  </motion.div>
                ))}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
