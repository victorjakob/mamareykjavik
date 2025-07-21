"use client";
import React from "react";
import { motion } from "framer-motion";

const DataPrivacy = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
    >
      <div className="flex items-center mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mr-4">
          <svg
            className="w-6 h-6 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Personal Data & Communication
        </h2>
      </div>

      <div className="space-y-6">
        <div className="prose prose-lg max-w-none">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            7. Personal Data & Communication
          </h3>
          <div className="text-gray-600 space-y-3">
            <p>
              By purchasing a ticket, you agree to receive event-related emails
              (e.g., confirmations, updates).
            </p>
            <p>
              We handle personal data in accordance with our Privacy Policy and
              GDPR standards.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-center mb-3">
              <svg
                className="w-5 h-5 text-indigo-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <h4 className="font-semibold text-indigo-800">
                Event Communications
              </h4>
            </div>
            <ul className="text-sm text-indigo-700 space-y-1">
              <li>• Booking confirmations</li>
              <li>• Event updates and changes</li>
              <li>• Important event information</li>
              <li>• Post-event communications</li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center mb-3">
              <svg
                className="w-5 h-5 text-green-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <h4 className="font-semibold text-green-800">Data Protection</h4>
            </div>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• GDPR compliant</li>
              <li>• Secure data handling</li>
              <li>• Privacy Policy adherence</li>
              <li>• Your rights protected</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-indigo-600 mt-0.5 mr-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-indigo-800">
            <p className="font-medium">Data Privacy Notice:</p>
            <p>
              Your personal information is handled with care and in compliance
              with data protection regulations. You can manage your
              communication preferences at any time.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default DataPrivacy;
