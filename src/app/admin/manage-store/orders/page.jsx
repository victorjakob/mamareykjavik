import OrdersPageClient from "./components/OrdersPageClient";
import { createServerSupabase } from "@/util/supabase/server";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const supabase = createServerSupabase();

  let orders = [];

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, created_at, user_email, price, payment_status, delivery, shipping_info, saltpay_order_id, status, delivery_notification_sent_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42703") {
      console.warn(
        "[Admin Orders] delivery_notification_sent_at column missing, falling back without it. Run latest migrations to enable delivery email tracking."
      );
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("orders")
        .select(
          "id, created_at, user_email, price, payment_status, delivery, shipping_info, saltpay_order_id, status"
        )
        .order("created_at", { ascending: false });

      if (!fallbackError && Array.isArray(fallbackData)) {
        orders = fallbackData.map((order) => ({
          ...order,
          delivery_notification_sent_at: null,
        }));
      } else if (fallbackError) {
        console.error("[Admin Orders] Failed to fetch orders:", fallbackError);
      }
    } else {
      console.error("[Admin Orders] Failed to fetch orders:", error);
    }
  } else if (Array.isArray(data)) {
    orders = data;
  }

  return <OrdersPageClient initialOrders={orders} />;
}
