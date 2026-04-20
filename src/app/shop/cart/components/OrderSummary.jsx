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
      className="rounded-xl border border-white/5 bg-[#0e0b08]/60 p-5 mb-8"
      aria-label={t.orderSummary}
      role="region"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="h-px w-6 bg-[#ff914d]/60" />
        <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#ff914d]">
          {t.orderSummary}
        </h3>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-[#c4b8aa] font-light">
          <span>{t.subtotal}</span>
          <span className="text-[#f0ebe3]">{cartTotal} kr</span>
        </div>
        {couponDiscount > 0 && (
          <div className="flex justify-between text-[#ff914d] font-light">
            <span>{t.discountApplied}</span>
            <span>-{couponDiscount} kr</span>
          </div>
        )}
        {shippingCost > 0 && (
          <div className="flex justify-between text-[#c4b8aa] font-light">
            <span>{t.shipping}</span>
            <span className="text-[#f0ebe3]">{shippingCost} kr</span>
          </div>
        )}
        <div className="flex justify-between items-baseline pt-4 mt-4 border-t border-white/10">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#a09488]">
            {t.total}
          </span>
          <span className="font-serif italic text-[#ff914d] text-xl">
            {finalTotal} kr
          </span>
        </div>
      </div>
    </aside>
  );
}
