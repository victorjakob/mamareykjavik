import OrdersPageClient from "./components/OrdersPageClient";
import { createServerSupabase } from "@/util/supabase/server";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const supabase = createServerSupabase();

  const { data: orders = [] } = await supabase
    .from("orders")
    .select(
      "id, created_at, user_email, price, payment_status, delivery, shipping_info, saltpay_order_id, status"
    )
    .order("created_at", { ascending: false });

  return <OrdersPageClient initialOrders={orders} />;
}
