"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/util/supabase/client";

export default function OrderDetailsModal({ open, onClose, order }) {
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  if (!open || !order) return null;

  return (
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
          <div>
            <b>User Email:</b> {order.user_email}
          </div>
          {order.buyer_name && (
            <div>
              <b>Name:</b> {order.buyer_name}
            </div>
          )}
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
      </div>
    </div>
  );
}
