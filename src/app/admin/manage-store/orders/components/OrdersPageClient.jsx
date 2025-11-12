"use client";
import { useCallback, useState } from "react";
import { supabase } from "@/util/supabase/client";
import { PropagateLoader } from "react-spinners";
import OrdersTable from "./OrdersTable";

const ensureDeliveryField = (list) =>
  (Array.isArray(list) ? list : []).map((order) => ({
    ...order,
    delivery_notification_sent_at: order.delivery_notification_sent_at ?? null,
  }));

export default function OrdersPageClient({ initialOrders }) {
  const [orders, setOrders] = useState(() =>
    ensureDeliveryField(initialOrders ?? [])
  );
  const [isLoading, setIsLoading] = useState(false);

  const safeOrders = Array.isArray(orders) ? orders : [];
  const activeOrders = safeOrders.filter(
    (order) => order.status !== "complete"
  );
  const completedOrders = safeOrders.filter(
    (order) => order.status === "complete"
  );

  const handleDeliveryConfirmationSent = (orderId, sentAt) => {
    setOrders((prev) => {
      if (!Array.isArray(prev)) return [];
      return prev.map((order) =>
        order.id === orderId
          ? { ...order, delivery_notification_sent_at: sentAt }
          : order
      );
    });
  };

  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, created_at, user_email, price, payment_status, delivery, shipping_info, saltpay_order_id, status, delivery_notification_sent_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === "42703") {
        console.warn(
          "[Admin Orders] delivery_notification_sent_at column missing during client fetch. Run latest migrations to enable delivery email tracking."
        );
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("orders")
          .select(
            "id, created_at, user_email, price, payment_status, delivery, shipping_info, saltpay_order_id, status"
          )
          .order("created_at", { ascending: false });

        if (fallbackError) {
          console.error(
            "[Admin Orders] Failed to fetch orders fallback:",
            fallbackError
          );
          return;
        }

        setOrders(ensureDeliveryField(fallbackData));
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
      const { error } = await supabase
        .from("orders")
        .update({ status: "complete" })
        .eq("id", orderId);
      if (error) {
        alert("Failed to mark as complete: " + error.message);
      } else {
        await fetchOrders();
      }
    } finally {
      setIsLoading(false);
    }
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
        onDeliveryConfirmationSent={handleDeliveryConfirmationSent}
      />
      <OrdersTable
        title="Completed Orders"
        orders={completedOrders}
        isLoading={isLoading}
        onDeliveryConfirmationSent={handleDeliveryConfirmationSent}
      />
    </div>
  );
}
