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
    <div className="overflow-x-auto bg-white rounded-lg shadow mb-10">
      <h2 className="text-lg font-semibold px-4 pt-4">{title}</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Order ID
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Date
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Customer
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Total
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Delivery
            </th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
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
              <td colSpan={7} className="text-center py-8 text-gray-400">
                No {title.toLowerCase()} found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
