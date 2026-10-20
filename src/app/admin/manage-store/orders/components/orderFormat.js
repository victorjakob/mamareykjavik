// Shared display helpers for the admin orders page. Iceland is UTC all year.

export function formatOrderDate(dateString) {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export const isk = (v) =>
  v == null ? "—" : `${Math.round(Number(v) || 0).toLocaleString("is-IS")} kr`;

export function orderContact(order) {
  const s = order?.shipping_info || {};
  return {
    name: s.contactName || s.name || null,
    email: order?.user_email ?? s.contactEmail ?? s.email ?? s.contact_email ?? s.email_address ?? null,
    phone: s.phone || null,
  };
}

// Shop checkout options: "location" = Dropp pickup point, "home" = to the door.
export function shippingLabel(order) {
  if (!order?.delivery) return { short: "Pickup at Mama", long: "Customer picks it up at Mama" };
  const opt = order.shipping_info?.shippingOption;
  if (opt === "location") return { short: "Dropp pickup point", long: "Dropp pickup point near the customer" };
  if (opt === "home") return { short: "Home delivery", long: "Delivered to the customer’s door" };
  return { short: "Delivery", long: "Delivery" };
}
