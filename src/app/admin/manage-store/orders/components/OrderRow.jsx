import { useState } from "react";
import OrderDetailsModal from "./OrderDetailsModal";

function formatOrderDate(dateString) {
  const date = new Date(dateString);
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const year = date.getUTCFullYear().toString().slice(-2);
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  return `${day} ${month} ${year} · ${hours}:${minutes}`;
}

export default function OrderRow({ order, onMarkAsComplete, isLoading, showMarkAsComplete, onDeliveryConfirmationSent }) {
  const [showModal, setShowModal] = useState(false);
  const contactEmail =
    order.user_email ??
    order.shipping_info?.contactEmail ??
    order.shipping_info?.email ??
    order.shipping_info?.contact_email ??
    order.shipping_info?.email_address ??
    null;
  const contactName = order.shipping_info?.contactName || order.shipping_info?.name || null;

  return (
    <>
      <tr style={{ borderBottom: "1px solid #2a1c0e" }}
        onMouseEnter={(e) => e.currentTarget.style.background = "#241809"}
        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
        <td className="px-4 py-3 font-mono text-xs text-[#7a6a5a]">
          {order.saltpay_order_id || order.id}
        </td>
        <td className="px-4 py-3 text-xs text-[#9a8e82]">{formatOrderDate(order.created_at)}</td>
        <td className="px-4 py-3">
          <div className="flex flex-col">
            <span className="text-sm text-[#c0b4a8]">{contactName || "Guest checkout"}</span>
            {contactEmail && <span className="text-xs text-[#5a4a40]">{contactEmail}</span>}
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-[#f0ebe3] font-medium">{order.price} kr</td>
        <td className="px-4 py-3">
          <span className="rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={order.payment_status === "paid"
              ? { background: "rgba(255,145,77,0.14)", color: "#ff914d", border: "1px solid rgba(255,145,77,0.25)" }
              : { background: "rgba(255,200,77,0.1)", color: "#ffcc4d", border: "1px solid rgba(255,200,77,0.2)" }
            }>
            {order.payment_status}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className="rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={order.delivery
              ? { background: "rgba(255,145,77,0.08)", color: "#c0b4a8", border: "1px solid rgba(255,145,77,0.12)" }
              : { background: "rgba(255,255,255,0.04)", color: "#5a4a40", border: "1px solid #2a1c0e" }
            }>
            {order.delivery ? "Delivery" : "Pickup"}
          </span>
        </td>
        <td className="px-4 py-3 flex gap-2 flex-wrap items-center">
          <button className="text-xs font-medium text-[#ff914d] hover:text-[#ffb06a] transition-colors"
            onClick={() => setShowModal(true)}>
            View
          </button>
          {showMarkAsComplete && (
            <button
              className="text-xs rounded-lg px-2.5 py-1 font-medium transition-all disabled:opacity-50"
              style={{ background: "#241809", border: "1px solid #3a2812", color: "#9a8e82" }}
              onClick={() => onMarkAsComplete(order.id)}
              disabled={isLoading}>
              Mark complete
            </button>
          )}
        </td>
      </tr>
      <OrderDetailsModal
        open={showModal}
        onClose={() => setShowModal(false)}
        order={order}
        onDeliveryConfirmationSent={(timestamp) => {
          onDeliveryConfirmationSent?.(order.id, timestamp);
        }}
      />
    </>
  );
}
