"use client";
import React from "react";
import { motion } from "framer-motion";

const RefundPolicy = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
    >
      <div className="flex items-center mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mr-4">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Refund Policy</h2>
      </div>

      <div className="space-y-6">
        <div className="prose prose-lg max-w-none">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            4.1. Customer Cancellations
          </h3>
          <div className="text-gray-600 space-y-3">
            <p>
              <strong>No Refund:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Less than 24 hours before the event.</li>
              <li>No-shows on event day.</li>
              <li>Late arrivals after the event start.</li>
            </ul>
            <p>
              <strong>Partial Refund:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                24–48 hours before the event: 50% refund (processing fee
                applies).
              </li>
            </ul>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">No Refund</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Less than 24 hours before event</li>
                  <li>• No-show on event day</li>
                  <li>• Late arrival after event start</li>
                </ul>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">
                  Partial Refund
                </h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• 24-48 hours before event</li>
                  <li>• 50% refund available</li>
                  <li>• Processing fee applies</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            4.2. Cancellations by Mama Reykjavik
          </h3>
          <div className="text-gray-600 space-y-3">
            <p>
              If an event is canceled, you will receive a full refund or be
              offered an alternative date.
            </p>
            <p>
              If an event is postponed, your ticket remains valid for the new
              date. Refunds or exchanges may be available, and we will contact
              you via email with further instructions.
            </p>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            4.3. Refund Process
          </h3>
          <div className="text-gray-600 space-y-3">
            <p>
              <strong>Request:</strong> Refund requests must be submitted via
              email to team@mama.is with your booking number and reason for
              cancellation.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-gray-800 mb-3">Timeline:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span>
                    <strong>Request review:</strong> 1–2 business days.
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span>
                    <strong>Approval and processing:</strong> 2–3 business days.
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span>
                    <strong>Refund issued:</strong> 5–10 business days via the
                    original payment method.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-amber-800">
            <p className="font-medium">Refund Requests:</p>
            <p>
              All refund requests must be submitted in writing via email to
              team@mama.is with your ticket details and reason for cancellation.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default RefundPolicy;
