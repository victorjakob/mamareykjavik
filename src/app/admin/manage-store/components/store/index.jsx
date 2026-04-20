"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/util/supabase/client";
import { Loader2 } from "lucide-react";

function StatPill({ label, value }) {
  return (
    <div className="rounded-xl overflow-hidden"
      style={{
        background: "#ffffff",
        border: "1.5px solid #f0e6d8",
        boxShadow: "0 2px 14px rgba(60,30,10,0.07)",
      }}>
      <div className="h-[1.5px]" style={{ background: "linear-gradient(to right, rgba(255,145,77,0.4), transparent 60%)" }} />
      <div className="p-5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#9a7a62]">{label}</p>
        <p className="font-cormorant italic text-[#2c1810] text-4xl font-light mt-1">{value}</p>
      </div>
    </div>
  );
}

function HomePageStore() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const { count: productsCount } = await supabase
          .from("products").select("*", { count: "exact" });
        const { data: orders } = await supabase
          .from("orders").select("total_amount");
        const { count: categoriesCount } = await supabase
          .from("categories").select("*", { count: "exact" });
        const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
        setStats({
          totalProducts: productsCount || 0,
          totalOrders: orders?.length || 0,
          totalRevenue,
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
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#ff914d] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#ff914d]/80 mb-1">Admin · Store</p>
        <h1 className="font-cormorant italic text-[#2c1810] text-4xl font-light">Store Dashboard</h1>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatPill label="Products" value={stats?.totalProducts} />
        <StatPill label="Orders" value={stats?.totalOrders} />
        <StatPill label="Revenue" value={`${stats?.totalRevenue?.toFixed(0)} kr`} />
        <StatPill label="Categories" value={stats?.totalCategories} />
      </div>
    </div>
  );
}

export default HomePageStore;
