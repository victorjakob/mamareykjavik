import { useState } from "react";
import { Loader2, Check, Mail } from "lucide-react";
import OrderDetailsModal from "./OrderDetailsModal";
import { formatOrderDate, isk, shippingLabel, orderContact } from "./orderFormat";

export default function OrderRow({ order, onMarkAsComplete, busy, showMarkAsComplete, muted, onDeliveryConfirmationSent }) {
  const [showModal, setShowModal] = useState(false);
  const { name, email } = orderContact(order);
  const ship = shippingLabel(order);
  const notified = Boolean(order.delivery_notification_sent_at);

  return (
    <>
      <tr
        className={`cursor-pointer transition-colors hover:bg-[#fbf6ef] ${muted ? "opacity-70" : ""}`}
        style={{ borderBottom: "1px solid #f5ede3" }}
        onClick={() => setShowModal(true)}
      >
        <td className="px-5 py-3.5 whitespace-nowrap text-sm text-[#6b5444]">{formatOrderDate(order.created_at)}</td>
        <td className="px-5 py-3.5">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[#2c1810]">{name || "Guest checkout"}</span>
            {email && <span className="text-xs text-[#9a7a62]">{email}</span>}
          </div>
        </td>
        <td className="px-5 py-3.5 whitespace-nowrap text-sm font-semibold text-[#2c1810]">{isk(order.price)}</td>
        <td className="px-5 py-3.5">
          <div className="flex flex-col gap-1">
            <span
              className="w-fit rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={
                order.delivery
                  ? { background: "#fff3ea", color: "#b4571c", border: "1px solid #fbd9c0" }
                  : { background: "#f4f1ec", color: "#6b5444", border: "1px solid #e6ddd2" }
              }
            >
              {ship.short}
            </span>
            {order.delivery && notified && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#0f9d6b]">
                <Mail className="h-3 w-3" /> Customer notified
              </span>
            )}
          </div>
        </td>
        <td className="px-5 py-3.5 whitespace-nowrap font-mono text-xs text-[#9a7a62]">
          {order.saltpay_order_id || `#${order.id}`}
        </td>
        <td className="px-5 py-3.5 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-end gap-2">
            <button
              className="rounded-full px-3 py-1.5 text-xs font-medium text-[#2c1810] transition-colors hover:bg-[#faf6f2]"
              style={{ border: "1px solid #e8ddd3" }}
              onClick={() => setShowModal(true)}
            >
              Details
            </button>
            {showMarkAsComplete && (
              <button
                className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#e57f3d] disabled:opacity-60"
                style={{ background: "#ff914d" }}
                onClick={() => onMarkAsComplete(order.id)}
                disabled={busy}
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Complete
              </button>
            )}
          </div>
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
