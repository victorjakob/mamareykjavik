"use client";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { apiFetch } from "@/lib/api/client";
import { toast } from "react-hot-toast";
import { X, Loader2, Mail, Check } from "lucide-react";
import { formatOrderDate, isk, shippingLabel, orderContact } from "./orderFormat";

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

  const { name: contactName, email: contactEmail, phone } = orderContact(order);
  const ship = shippingLabel(order);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (open && order?.id) {
      setLoading(true);
      setError(null);
      apiFetch(`/api/admin/orders/${encodeURIComponent(order.id)}/items`)
        .then(({ items }) => setOrderItems(items || []))
        .catch((err) => {
          setError(err.message);
          setOrderItems([]);
        })
        .finally(() => setLoading(false));
    } else if (!open) {
      setOrderItems([]);
      setError(null);
    }
  }, [open, order?.id]);

  useEffect(() => {
    setLocalDeliverySentAt(order?.delivery_notification_sent_at || null);
  }, [order?.delivery_notification_sent_at]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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

  const s = order.shipping_info || {};
  const addressLine = [s.address, [s.zip, s.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const itemsTotal = orderItems.reduce((sum, it) => sum + Number(it.total_price || 0), 0);
  const shippingCost = Number(s.shippingCost || 0);
  const paid = order.payment_status === "paid";

  const Label = ({ children }) => (
    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9a7a62]">{children}</p>
  );
  const Field = ({ label, children }) =>
    children ? (
      <div className="flex justify-between gap-4 py-1.5 text-sm">
        <span className="shrink-0 text-[#9a7a62]">{label}</span>
        <span className="min-w-0 text-right text-[#2c1810] [overflow-wrap:anywhere]">{children}</span>
      </div>
    ) : null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{ background: "rgba(44,24,16,0.4)" }}
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#ff914d]">Order #{order.id}</p>
            <h2 className="font-cormorant text-3xl italic text-[#2c1810]">{contactName || "Guest checkout"}</h2>
            <p className="text-xs text-[#9a7a62]">{formatOrderDate(order.created_at)}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={
                paid
                  ? { background: "#e7f7ee", color: "#0f7a54", border: "1px solid #bfe8d2" }
                  : { background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }
              }
            >
              {paid ? "Paid" : "Not paid"}
            </span>
            <button onClick={onClose} aria-label="Close" className="text-[#9a7a62] hover:text-[#2c1810]">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mb-5 rounded-xl p-4" style={{ background: "#faf6f2" }}>
          <Label>Customer</Label>
          <Field label="Email">
            {contactEmail ? (
              <a href={`mailto:${contactEmail}`} className="text-[#d9732f] hover:underline">{contactEmail}</a>
            ) : (
              "Not provided"
            )}
          </Field>
          <Field label="Phone">{phone ? <a href={`tel:${phone}`} className="hover:underline">{phone}</a> : null}</Field>
        </div>

        <div className="mb-5 rounded-xl p-4" style={{ background: "#faf6f2" }}>
          <Label>Shipping</Label>
          <Field label="Method">{ship.long}</Field>
          {order.delivery && <Field label="Address given">{addressLine || "—"}</Field>}
          {order.delivery && s.shippingOption === "location" && (
            <p className="mt-1 text-xs text-[#9a7a62]">
              Pick a Dropp point near this address. Dropp texts the customer when it’s ready.
            </p>
          )}
        </div>

        <div className="mb-5">
          <Label>Products</Label>
          {loading ? (
            <div className="flex items-center gap-2 py-4 text-sm text-[#9a7a62]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading products…
            </div>
          ) : error ? (
            <div className="py-4 text-sm text-[#b23b2d]">{error}</div>
          ) : orderItems.length === 0 ? (
            <div className="py-4 text-sm text-[#9a7a62]">No products recorded for this order.</div>
          ) : (
            <div className="rounded-xl" style={{ border: "1px solid #f0e6d8" }}>
              {orderItems.map((item, i) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                  style={i ? { borderTop: "1px solid #f5ede3" } : undefined}
                >
                  <span className="text-[#2c1810]">
                    <span className="font-semibold">{item.quantity} ×</span> {item.product_name || "Product"}
                    <span className="ml-1 text-xs text-[#9a7a62]">({isk(item.unit_price)} each)</span>
                  </span>
                  <span className="shrink-0 whitespace-nowrap font-medium text-[#2c1810]">{isk(item.total_price)}</span>
                </div>
              ))}
              {shippingCost > 0 && (
                <div className="flex justify-between px-4 py-2.5 text-sm" style={{ borderTop: "1px solid #f5ede3" }}>
                  <span className="text-[#9a7a62]">Shipping</span>
                  <span className="text-[#2c1810]">{isk(shippingCost)}</span>
                </div>
              )}
              <div
                className="flex justify-between rounded-b-xl px-4 py-3 text-sm font-semibold"
                style={{ borderTop: "1px solid #f0e6d8", background: "#fcf9f5" }}
              >
                <span className="text-[#2c1810]">Total {paid ? "paid" : ""}</span>
                <span className="text-[#2c1810]">{isk(order.price ?? itemsTotal + shippingCost)}</span>
              </div>
            </div>
          )}
          {order.saltpay_order_id && (
            <p className="mt-2 text-xs text-[#9a7a62]">
              Teya reference: <span className="font-mono">{order.saltpay_order_id}</span>
            </p>
          )}
        </div>

        {order.delivery && paid && (
          <div className="rounded-xl p-4" style={{ background: "#f1faf5", border: "1px solid #cfeede" }}>
            {alreadySent ? (
              <p className="flex items-center gap-2 text-sm text-[#0f7a54]">
                <Check className="h-4 w-4" /> Shipping email sent {formattedDeliverySentAt || ""}.
              </p>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#2c5a46]">Shipped it? Let the customer know it’s on its way.</p>
                <button
                  type="button"
                  onClick={handleSendDeliveryEmail}
                  disabled={isSendingEmail}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60"
                  style={{ background: "#0f9d6b" }}
                >
                  {isSendingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  {isSendingEmail ? "Sending…" : "Send shipping email"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
