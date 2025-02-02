"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function FoodMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      // First fetch categories to maintain order
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("menu_categories")
        .select("*")
        .order("order");

      if (categoriesError) throw categoriesError;

      // Then fetch menu items with category information
      const { data: menuData, error: menuError } = await supabase
        .from("menu_items")
        .select(
          `
          *,
          menu_categories (
            name,
            order
          )
        `
        )
        .order("order");

      if (menuError) throw menuError;

      // Sort menu items based on category display order and item display order
      const sortedMenuItems = menuData.sort((a, b) => {
        if (a.menu_categories.order !== b.menu_categories.order) {
          return a.menu_categories.order - b.menu_categories.order;
        }
        return a.order - b.order;
      });

      setMenuItems(sortedMenuItems);
    } catch (err) {
      setError("Failed to load menu items");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    ...new Set(menuItems.map((item) => item.menu_categories?.name)),
  ].filter(Boolean);

  if (loading) {
    return (
      <div className="mt-20 mb-28 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Menu List */}
      <div className="space-y-12">
        {categories.map((category) => (
          <div key={category} className="space-y-8">
            <h2 className="text-2xl font-bold text-orange-600 text-center mb-6">
              {category}
            </h2>
            {menuItems
              .filter((item) => item.menu_categories?.name === category)
              .map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="text-center"
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
          </div>
        ))}
      </div>
    </div>
  );
}
