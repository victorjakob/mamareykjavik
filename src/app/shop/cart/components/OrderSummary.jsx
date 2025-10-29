"use client";

import { useLanguage } from "@/hooks/useLanguage";

export default function OrderSummary({
  cartTotal,
  couponDiscount,
  shippingCost,
  finalTotal,
}) {
  const { language } = useLanguage();

  const translations = {
    en: {
      orderSummary: "Order Summary",
      subtotal: "Subtotal",
      discountApplied: "Discount Applied",
      shipping: "Shipping",
      total: "Total",
    },
    is: {
      orderSummary: "Pöntunaryfirlit",
      subtotal: "Undirheild",
      discountApplied: "Afsláttur beittur",
      shipping: "Sending",
      total: "Samtals",
    },
  };

  const t = translations[language];

  return (
    <aside
      className="bg-gray-50 rounded-xl p-6 mb-8 shadow-sm border-t border-gray-200 md:sticky md:top-20 md:mb-0 md:self-start"
      aria-label={t.orderSummary}
      role="region"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {t.orderSummary}
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between text-gray-600">
          <span>{t.subtotal}</span>
          <span className="font-medium">{cartTotal} kr</span>
        </div>
        {couponDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>{t.discountApplied}</span>
            <span className="font-medium">-{couponDiscount} kr</span>
          </div>
        )}
        {shippingCost > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>{t.shipping}</span>
            <span className="font-medium">{shippingCost} kr</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-semibold text-gray-800 pt-4 border-t">
          <span>{t.total}</span>
          <span>{finalTotal} kr</span>
        </div>
      </div>
    </aside>
  );
}
