import React from "react";
import Link from "next/link";

export default function ShopSuccessPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center pt-24 py-16 px-4">
      <div className="bg-emerald-100 rounded-full p-6 mb-6">
        <svg
          className="w-16 h-16 text-emerald-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-emerald-700 mb-2 text-center">
        Thank you for your order!
      </h1>
      <p className="text-lg text-gray-700 mb-6 text-center max-w-md">
        Your payment was successful and your order is being processed. You will
        receive a confirmation email soon. If you have any questions, feel free
        to contact us.
      </p>
      <Link
        href="/shop"
        className="inline-block px-6 py-3 bg-emerald-500 text-white rounded-lg font-semibold shadow hover:bg-emerald-600 transition"
      >
        Back to Shop
      </Link>
    </div>
  );
}
