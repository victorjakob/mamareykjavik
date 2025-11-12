"use client";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/util/supabase/client";
import { toast } from "react-hot-toast";

export default function OrderDetailsModal({
  open,
  onClose,
  order,
  onDeliveryConfirmationSent,
}) {
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [localDeliverySentAt, setLocalDeliverySentAt] = useState(
    order?.delivery_notification_sent_at || null
  );
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const contactEmail =
    order?.user_email ??
    order?.shipping_info?.contactEmail ??
    order?.shipping_info?.email ??
    order?.shipping_info?.contact_email ??
    order?.shipping_info?.email_address ??
    null;
  const contactName =
    order?.shipping_info?.contactName || order?.shipping_info?.name || null;

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (open && order?.id) {
      setLoading(true);
      setError(null);
      supabase
        .from("order_items")
        .select(
          "id, product_id, product_name, product_price, quantity, unit_price, total_price"
        )
        .eq("order_id", order.id)
        .then(({ data, error }) => {
          if (error) setError(error.message);
          setOrderItems(data || []);
          setLoading(false);
        });
    } else if (!open) {
      setOrderItems([]);
      setError(null);
    }
  }, [open, order?.id]);

  useEffect(() => {
    setLocalDeliverySentAt(order?.delivery_notification_sent_at || null);
  }, [order?.delivery_notification_sent_at]);

  const alreadySent = Boolean(localDeliverySentAt);

  const formattedDeliverySentAt = useMemo(() => {
    if (!localDeliverySentAt) return null;
    const date = new Date(localDeliverySentAt);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [localDeliverySentAt]);

  if (!open || !order || !isMounted) return null;

  const handleSendDeliveryEmail = async () => {
    if (!order?.id) return;
    setIsSendingEmail(true);
    try {
      const response = await fetch("/api/admin/orders/send-delivery-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: order.id }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to send email");
      }

      const payload = await response.json();
      const sentAt = payload?.sentAt;

      setLocalDeliverySentAt(sentAt);
      onDeliveryConfirmationSent?.(sentAt);
      toast.success("Delivery email sent ✨");
    } catch (err) {
      console.error("Failed to send delivery confirmation email:", err);
      toast.error(err.message || "Could not send the delivery email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">Order Details</h2>
        {/* User Info */}
        <div className="mb-4">
          {contactName && (
            <div className="mb-1">
              <b>Name:</b> {contactName}
            </div>
          )}
          <div>
            <b>Email:</b> {contactEmail || "Not provided"}
          </div>
        </div>
        {/* Shipping Info */}
        {order.delivery && order.shipping_info && (
          <div className="mb-4">
            <div className="font-semibold mb-1">Shipping Info:</div>
            <div className="text-sm bg-gray-50 rounded p-2">
              {Object.entries(order.shipping_info).map(([k, v]) => (
                <div key={k}>
                  <b>{k}:</b> {v?.toString()}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Products Table */}
        <div>
          <div className="font-semibold mb-1">Products:</div>
          {loading ? (
            <div className="text-gray-500 py-4">Loading products...</div>
          ) : error ? (
            <div className="text-red-500 py-4">{error}</div>
          ) : orderItems.length === 0 ? (
            <div className="text-gray-400 py-4">
              No products found for this order.
            </div>
          ) : (
            <table className="min-w-full text-sm border">
              <thead>
                <tr>
                  <th className="px-2 py-1 border-b text-left">Product</th>
                  <th className="px-2 py-1 border-b text-center">Qty</th>
                  <th className="px-2 py-1 border-b text-right">Unit Price</th>
                  <th className="px-2 py-1 border-b text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-2 py-1 border-b">
                      {item.product_name || "Product"}
                    </td>
                    <td className="px-2 py-1 border-b text-center">
                      {item.quantity}
                    </td>
                    <td className="px-2 py-1 border-b text-right">
                      {item.unit_price} kr
                    </td>
                    <td className="px-2 py-1 border-b text-right">
                      {item.total_price.toLocaleString()} kr
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {order.delivery && (
          <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-serif text-emerald-700 text-lg">
                  Delivery update
                </p>
                {alreadySent ? (
                  <p className="text-sm text-emerald-800/80">
                    Delivery confirmation email sent on{" "}
                    {formattedDeliverySentAt || "—"}.
                  </p>
                ) : (
                  <p className="text-sm text-emerald-800/80">
                    Let your guest know their order is on its way with a warm
                    little note.
                  </p>
                )}
              </div>
              {!alreadySent && (
                <button
                  type="button"
                  onClick={handleSendDeliveryEmail}
                  disabled={isSendingEmail}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow shadow-emerald-200/60 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  {isSendingEmail
                    ? "Sending..."
                    : "Send delivery confirmation email"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
