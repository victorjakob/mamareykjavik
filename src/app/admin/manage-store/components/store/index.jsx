"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/util/supabase/client";
import { PropagateLoader } from "react-spinners";

function HomePageStore() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Fetch products count
        const { count: productsCount } = await supabase
          .from("products")
          .select("*", { count: "exact" });

        // Fetch orders count and total revenue
        const { data: orders } = await supabase
          .from("orders")
          .select("total_amount");

        // Fetch categories count
        const { count: categoriesCount } = await supabase
          .from("categories")
          .select("*", { count: "exact" });

        const totalRevenue =
          orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

        setStats({
          totalProducts: productsCount || 0,
          totalOrders: orders?.length || 0,
          totalRevenue: totalRevenue,
          totalCategories: categoriesCount || 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PropagateLoader color="#4F46E5" size={12} />
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-4xl mx-auto ">
      <div className="px-4 py-8 transition-all duration-300 ease-in-out">
        <h1 className="text-2xl font-bold mb-6">Store Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h2 className="text-gray-500 text-sm font-medium">
              Total Products
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
              {stats?.totalProducts}
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h2 className="text-gray-500 text-sm font-medium">Total Orders</h2>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
              {stats?.totalOrders}
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h2 className="text-gray-500 text-sm font-medium">Total Revenue</h2>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
              ${stats?.totalRevenue.toFixed(2)}
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h2 className="text-gray-500 text-sm font-medium">
              Total Categories
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
              {stats?.totalCategories}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePageStore;
