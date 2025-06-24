import { useState } from "react";
import OrderDetailsModal from "./OrderDetailsModal";

function formatOrderDate(dateString) {
  const date = new Date(dateString);
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  const year = date.getUTCFullYear().toString().slice(-2);
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  return `${day} ${month} ${year} - ${hours}:${minutes}`;
}

export default function OrderRow({
  order,
  onMarkAsComplete,
  isLoading,
  showMarkAsComplete,
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <tr>
        <td className="px-4 py-2 font-mono text-xs">
          {order.saltpay_order_id || order.id}
        </td>
        <td className="px-4 py-2">{formatOrderDate(order.created_at)}</td>
        <td className="px-4 py-2">{order.user_email}</td>
        <td className="px-4 py-2">{order.price} kr</td>
        <td className="px-4 py-2">
          <span
            className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
              order.payment_status === "paid"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {order.payment_status}
          </span>
        </td>
        <td className="px-4 py-2">
          {order.delivery ? (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
              Delivery
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
              Pickup
            </span>
          )}
        </td>
        <td className="px-4 py-2 flex gap-2">
          <button
            className="text-emerald-600 hover:underline text-sm"
            onClick={() => setShowModal(true)}
          >
            View
          </button>
          {showMarkAsComplete && (
            <button
              className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded"
              onClick={() => onMarkAsComplete(order.id)}
              disabled={isLoading}
            >
              Mark as Complete
            </button>
          )}
        </td>
      </tr>
      <OrderDetailsModal
        open={showModal}
        onClose={() => setShowModal(false)}
        order={order}
      />
    </>
  );
}
