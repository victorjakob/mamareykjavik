"use client";
import { useState } from "react";
import { supabase } from "@/util/supabase/client";
import { PropagateLoader } from "react-spinners";
import OrdersTable from "./OrdersTable";

export default function OrdersPageClient({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [isLoading, setIsLoading] = useState(false);

  const activeOrders = orders.filter((order) => order.status !== "complete");
  const completedOrders = orders.filter((order) => order.status === "complete");

  const markAsComplete = async (orderId) => {
    setIsLoading(true);
    const { error } = await supabase
      .from("orders")
      .update({ status: "complete" })
      .eq("id", orderId);
    if (error) {
      alert("Failed to mark as complete: " + error.message);
    } else {
      // Refetch orders from Supabase (client-side)
      const { data } = await supabase
        .from("orders")
        .select(
          "id, created_at, user_email, price, payment_status, delivery, shipping_info, saltpay_order_id, status"
        )
        .order("created_at", { ascending: false });
      setOrders(data || []);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PropagateLoader color="#4F46E5" size={12} />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <OrdersTable
        title="Active Orders"
        orders={activeOrders}
        onMarkAsComplete={markAsComplete}
        isLoading={isLoading}
        showMarkAsComplete
      />
      <OrdersTable
        title="Completed Orders"
        orders={completedOrders}
        isLoading={isLoading}
      />
    </div>
  );
}
