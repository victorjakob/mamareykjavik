"use client";
import React from "react";
import { motion } from "framer-motion";

const PurchaseTerms = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
    >
      <div className="flex items-center mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Purchase Terms</h2>
      </div>

      <div className="space-y-6">
        <div className="prose prose-lg max-w-none">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            1. Ticket Purchase
          </h3>
          <div className="text-gray-600 space-y-3">
            <p>
              <strong>Review Before Purchase:</strong> Please ensure you select
              the correct date, event, and time before purchasing. Alterations
              to your order after purchase are not guaranteed.
            </p>
            <p>
              <strong>Availability & Pricing:</strong> Tickets are subject to
              availability and are sold at the prices listed on our website, in
              Icelandic Krona (ISK). Prices shown in other currencies are
              approximate.
            </p>
            <p>
              <strong>Order Confirmation:</strong> A confirmation email with
              your ticket(s) will be sent once your payment has been processed.
              If you do not receive confirmation within 24 hours, please contact
              us.
            </p>
            <p>
              <strong>Age Requirements:</strong> Some events may have age
              restrictions. In accordance with Icelandic juvenile law,
              individuals under 18 are prohibited from attending events where
              alcohol is served after 8 PM unless accompanied by a parent or
              legal guardian.
            </p>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            2. Payment & Processing
          </h3>
          <div className="text-gray-600 space-y-3">
            <p>
              <strong>Accepted Payment Methods:</strong> We accept major debit
              and credit cards (Visa, Mastercard, Maestro) through secure online
              payment systems (Teya and Borgun).
            </p>
            <p>
              <strong>Taxes & Fees:</strong> Ticket prices include applicable
              taxes unless stated otherwise. Any additional fees will be clearly
              shown at checkout.
            </p>
            <p>
              <strong>Currency:</strong> All transactions are charged in
              Icelandic Krona (ISK). Prices displayed in other currencies are
              estimates only.
            </p>
            <p>
              <strong>Payment Confirmation:</strong> Your ticket(s) will only be
              issued once full payment is received.
            </p>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            3. Ticket Delivery
          </h3>
          <div className="text-gray-600 space-y-3">
            <p>
              <strong>Digital Tickets:</strong> All tickets are delivered
              electronically via email. Please ensure your email address is
              correct.
            </p>
            <p>
              <strong>Ticket Validation:</strong> Your digital ticket or
              confirmation email must be presented upon entry.
            </p>
            <p>
              <strong>Transferable Tickets:</strong> Tickets may be transferred
              or resold at face value (no markup). For security and
              verification, we reserve the right to request proof of the
              original purchase (e.g., confirmation email or order number) from
              the new ticket holder. Tickets obtained through unauthorized or
              fraudulent channels may be invalidated without refund.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium">Important Note:</p>
            <p>
              By purchasing a ticket, you acknowledge that you have read,
              understood, and agree to these terms and conditions.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default PurchaseTerms;
