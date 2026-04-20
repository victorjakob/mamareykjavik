import OrderRow from "./OrderRow";

export default function OrdersTable({
  title,
  orders,
  onMarkAsComplete,
  isLoading,
  showMarkAsComplete,
  onDeliveryConfirmationSent,
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1.5px solid #f0e6d8" }}>
      <div className="px-5 py-3.5 flex items-center gap-2" style={{ borderBottom: "1px solid #e8ddd3", background: "#ffffff" }}>
        <h2 className="text-sm font-medium text-[#2c1810]">{title}</h2>
        <span className="rounded-full px-2 py-0.5 text-[10px] text-[#9a7a62]"
          style={{ background: "#faf6f2", border: "1px solid #e8ddd3" }}>
          {orders.length}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid #e8ddd3", background: "#ffffff" }}>
              {["Order ID", "Date", "Customer", "Total", "Status", "Delivery", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9a7a62]">
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
                isLoading={isLoading}
                showMarkAsComplete={showMarkAsComplete}
                onDeliveryConfirmationSent={onDeliveryConfirmationSent}
              />
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-sm text-[#9a7a62]">
                  No {title.toLowerCase()} found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
