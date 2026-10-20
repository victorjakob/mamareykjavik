"use client";
import { useCallback, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { ChevronDown } from "lucide-react";
import { AdminShell, AdminHero } from "@/app/admin/components/AdminShell";
import OrdersTable from "./OrdersTable";

const ensureDeliveryField = (list) =>
  (Array.isArray(list) ? list : []).map((order) => ({
    ...order,
    delivery_notification_sent_at: order.delivery_notification_sent_at ?? null,
  }));

export default function OrdersPageClient({ initialOrders }) {
  const [orders, setOrders] = useState(() => ensureDeliveryField(initialOrders ?? []));
  const [busyId, setBusyId] = useState(null);
  const [showUnpaid, setShowUnpaid] = useState(false);

  const safeOrders = Array.isArray(orders) ? orders : [];
  // Only paid orders need handling. Unpaid ones are checkouts that were
  // started but never paid (or never confirmed) — kept out of the way below.
  const paid = safeOrders.filter((o) => o.payment_status === "paid");
  const activeOrders = paid.filter((o) => o.status !== "complete");
  const completedOrders = paid.filter((o) => o.status === "complete");
  const unpaidOrders = safeOrders.filter((o) => o.payment_status !== "paid");

  const handleDeliveryConfirmationSent = (orderId, sentAt) => {
    setOrders((prev) =>
      (Array.isArray(prev) ? prev : []).map((order) =>
        order.id === orderId ? { ...order, delivery_notification_sent_at: sentAt } : order
      )
    );
  };

  const fetchOrders = useCallback(async () => {
    try {
      const { orders: data } = await apiFetch("/api/admin/orders");
      setOrders(ensureDeliveryField(data));
    } catch (error) {
      console.error("[Admin Orders] Failed to fetch orders:", error);
    }
  }, []);

  const markAsComplete = async (orderId) => {
    setBusyId(orderId);
    try {
      await apiFetch("/api/admin/orders", {
        method: "PATCH",
        body: { id: orderId, status: "complete" },
      });
      await fetchOrders();
    } catch (error) {
      alert("Failed to mark as complete: " + error.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminShell>
      <AdminHero
        eyebrow="Admin · Store"
        title="Orders"
        subtitle="Shop orders to pack, ship and close"
        size="compact"
      />
      <div className="space-y-8">
        <OrdersTable
          title="To handle"
          emptyText="Nothing waiting. All orders are handled."
          orders={activeOrders}
          onMarkAsComplete={markAsComplete}
          busyId={busyId}
          showMarkAsComplete
          onDeliveryConfirmationSent={handleDeliveryConfirmationSent}
        />
        <OrdersTable
          title="Completed"
          emptyText="No completed orders yet."
          orders={completedOrders}
          busyId={busyId}
          onDeliveryConfirmationSent={handleDeliveryConfirmationSent}
        />

        {unpaidOrders.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowUnpaid((v) => !v)}
              className="inline-flex items-center gap-1.5 text-sm text-[#9a7a62] hover:text-[#2c1810] transition-colors"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${showUnpaid ? "rotate-180" : ""}`} />
              Unpaid checkouts ({unpaidOrders.length})
            </button>
            {showUnpaid && (
              <div className="mt-3">
                <p className="mb-3 text-xs text-[#9a7a62]">
                  Checkouts that were started but never confirmed as paid. Usually the customer left before paying. If someone says they paid, check the Teya reference.
                </p>
                <OrdersTable
                  title="Unpaid checkouts"
                  emptyText=""
                  orders={unpaidOrders}
                  busyId={busyId}
                  muted
                  onDeliveryConfirmationSent={handleDeliveryConfirmationSent}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
