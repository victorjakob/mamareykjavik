"use client";

import Link from "next/link";

export default function PaymentCancelled() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Cancelled
        </h2>
        <p className="text-gray-600 mb-8">
          Your payment has been cancelled. No charges have been made to your
          account.
        </p>
        <Link
          href="/events"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Back to Events
        </Link>
      </div>
    </div>
  );
}
