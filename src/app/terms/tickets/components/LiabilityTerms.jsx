"use client";
import React from "react";
import { motion } from "framer-motion";

const LiabilityTerms = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
    >
      <div className="flex items-center mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mr-4">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Liability & Legal Terms
        </h2>
      </div>

      <div className="space-y-6">
        <div className="prose prose-lg max-w-none">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            6.1. Limitation of Liability
          </h3>
          <div className="text-gray-600 space-y-3">
            <p>
              Mama Reykjavik is not responsible for personal injury, loss, or
              damage to property, except where required by law. We are not
              liable for indirect or consequential losses such as missed travel
              or accommodation costs.
            </p>
            <div className="bg-red-50 rounded-lg p-4 mt-4 border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">
                Important Disclaimer:
              </h4>
              <p className="text-sm text-red-700">
                Mama Reykjavik shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages, including but not
                limited to loss of profits, data, use, goodwill, or other
                intangible losses.
              </p>
            </div>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            6.2. Personal Belongings
          </h3>
          <div className="text-gray-600 space-y-3">
            <p>
              Mama Reykjavik is not responsible for lost or stolen personal
              items during the event.
            </p>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            6.3. Assumption of Risk
          </h3>
          <div className="text-gray-600 space-y-3">
            <p>
              Participation in our events is at your own risk. By attending, you
              acknowledge and accept potential hazards associated with the
              activities.
            </p>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            6.4. Medical Disclaimer
          </h3>
          <div className="text-gray-600 space-y-3">
            <p>
              Our services are not intended to diagnose, treat, or cure any
              medical condition. Please consult a healthcare professional if you
              have health concerns.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  Not Medical Advice
                </h4>
                <p className="text-sm text-yellow-700">
                  Our services are not intended to diagnose, treat, cure, or
                  prevent any medical condition. Always consult with healthcare
                  professionals.
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Health Conditions
                </h4>
                <p className="text-sm text-blue-700">
                  Please inform us of any medical conditions, allergies, or
                  medications that may affect your participation.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            6.5. Force Majeure
          </h3>
          <div className="text-gray-600 space-y-3">
            <p>
              We are not liable for cancellations or changes caused by events
              beyond our control, including natural disasters, extreme weather,
              government restrictions, strikes, or other unforeseen
              circumstances.
            </p>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            6.6. Governing Law
          </h3>
          <div className="text-gray-600 space-y-3">
            <p>
              These terms are governed by Icelandic law. Any disputes will be
              subject to the exclusive jurisdiction of the Icelandic courts.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-gray-800 mb-2">
                Legal Jurisdiction:
              </h4>
              <p className="text-sm text-gray-700">
                These terms and conditions are governed by and construed in
                accordance with the laws of Iceland. Any disputes shall be
                subject to the exclusive jurisdiction of the courts of Iceland.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-red-800">
            <p className="font-medium">Legal Notice:</p>
            <p>
              These terms constitute a legally binding agreement. By purchasing
              tickets, you acknowledge that you have read, understood, and agree
              to be bound by these terms.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default LiabilityTerms;
