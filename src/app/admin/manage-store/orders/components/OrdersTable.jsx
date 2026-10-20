import OrderRow from "./OrderRow";

export default function OrdersTable({
  title,
  emptyText,
  orders,
  onMarkAsComplete,
  busyId,
  showMarkAsComplete,
  muted = false,
  onDeliveryConfirmationSent,
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden bg-white"
      style={{ border: "1px solid #f0e6d8", boxShadow: "0 1px 2px rgba(44,24,16,0.04)" }}
    >
      <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid #f0e6d8" }}>
        <h2 className="text-[15px] font-semibold text-[#2c1810]">{title}</h2>
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-medium text-[#8a6a52]"
          style={{ background: "#faf6f2", border: "1px solid #eadfd3" }}
        >
          {orders.length}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr style={{ background: "#fcf9f5", borderBottom: "1px solid #f0e6d8" }}>
              {["Date", "Customer", "Total", "Shipping", "Teya ref", ""].map((h, i) => (
                <th
                  key={h || i}
                  className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9a7a62]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                onMarkAsComplete={onMarkAsComplete}
                busy={busyId === order.id}
                showMarkAsComplete={showMarkAsComplete}
                muted={muted}
                onDeliveryConfirmationSent={onDeliveryConfirmationSent}
              />
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-sm text-[#9a7a62]">
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
