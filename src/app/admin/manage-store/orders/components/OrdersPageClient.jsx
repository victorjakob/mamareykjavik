"use client";
import { useCallback, useState } from "react";
import { supabase } from "@/util/supabase/client";
import { Loader2 } from "lucide-react";
import OrdersTable from "./OrdersTable";

const ensureDeliveryField = (list) =>
  (Array.isArray(list) ? list : []).map((order) => ({
    ...order,
    delivery_notification_sent_at: order.delivery_notification_sent_at ?? null,
  }));

export default function OrdersPageClient({ initialOrders }) {
  const [orders, setOrders] = useState(() => ensureDeliveryField(initialOrders ?? []));
  const [isLoading, setIsLoading] = useState(false);

  const safeOrders = Array.isArray(orders) ? orders : [];
  const activeOrders = safeOrders.filter((order) => order.status !== "complete");
  const completedOrders = safeOrders.filter((order) => order.status === "complete");

  const handleDeliveryConfirmationSent = (orderId, sentAt) => {
    setOrders((prev) => {
      if (!Array.isArray(prev)) return [];
      return prev.map((order) =>
        order.id === orderId ? { ...order, delivery_notification_sent_at: sentAt } : order
      );
    });
  };

  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("id, created_at, user_email, price, payment_status, delivery, shipping_info, saltpay_order_id, status, delivery_notification_sent_at")
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === "42703") {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("orders")
          .select("id, created_at, user_email, price, payment_status, delivery, shipping_info, saltpay_order_id, status")
          .order("created_at", { ascending: false });
        if (!fallbackError) setOrders(ensureDeliveryField(fallbackData));
        return;
      }
      console.error("[Admin Orders] Failed to fetch orders:", error);
      return;
    }
    setOrders(ensureDeliveryField(data));
  }, []);

  const markAsComplete = async (orderId) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("orders").update({ status: "complete" }).eq("id", orderId);
      if (error) alert("Failed to mark as complete: " + error.message);
      else await fetchOrders();
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#ff914d] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#ff914d]/80 mb-1">Admin · Store</p>
        <h1 className="font-cormorant italic text-[#f0ebe3] text-4xl font-light">Orders</h1>
      </div>
      <div className="space-y-8">
        <OrdersTable
          title="Active Orders"
          orders={activeOrders}
          onMarkAsComplete={markAsComplete}
          isLoading={isLoading}
          showMarkAsComplete
          onDeliveryConfirmationSent={handleDeliveryConfirmationSent}
        />
        <OrdersTable
          title="Completed Orders"
          orders={completedOrders}
          isLoading={isLoading}
          onDeliveryConfirmationSent={handleDeliveryConfirmationSent}
        />
      </div>
    </div>
  );
}
