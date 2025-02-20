"use client";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import useSWR from "swr";

// ✅ Fetch menu data in parallel
const fetchMenuData = async () => {
  const [categoriesRes, menuRes] = await Promise.all([
    supabase.from("menu_categories").select("id, name, order").order("order"),
    supabase
      .from("menu_items")
      .select("id, name, description, price, category_id")
      .order("order"),
  ]);

  if (categoriesRes.error) throw categoriesRes.error;
  if (menuRes.error) throw menuRes.error;

  return {
    categories: categoriesRes.data,
    menuItems: menuRes.data,
  };
};

export default function FoodMenu() {
  // ✅ SWR for caching & revalidation
  const { data, error, isLoading } = useSWR("food-menu", fetchMenuData, {
    revalidateOnFocus: false, // Avoids unnecessary refetching
    refreshInterval: 1000 * 60 * 5, // Refresh every 5 min
  });

  // ✅ If loading, show skeleton UI
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-gray-500">Loading menu...</p>
      </div>
    );
  }

  // ✅ Error Handling
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Error fetching menu. Please try again.</p>
      </div>
    );
  }

  const { categories, menuItems } = data;

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 py-12">
      {/* Menu List */}
      <div className="space-y-12">
        {categories.map((category) => (
          <div key={category.id} className="space-y-8">
            <h2 className="text-2xl font-bold text-orange-600 text-center mb-6">
              {category.name}
            </h2>
            {menuItems
              .filter((item) => item.category_id === category.id)
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
