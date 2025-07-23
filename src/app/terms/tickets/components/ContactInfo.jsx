"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const ContactInfo = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl shadow-lg p-8 border border-amber-300"
    >
      <div className="flex items-center mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-amber-600 rounded-lg mr-4">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Questions & Contact
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Need Help?
            </h3>
            <p className="text-gray-600 mb-4">
              If you have any questions about these terms and conditions, our
              refund policy, or need assistance with your ticket purchase,
              we&apos;re here to help.
            </p>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-amber-600 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Email Support
                  </p>
                  <p className="text-sm text-gray-600">team@mama.is</p>
                  <p className="text-xs text-gray-500">
                    Response within 24 hours
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-amber-600 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Phone Support
                  </p>
                  <p className="text-sm text-gray-600">+354 616-7722</p>
                  <p className="text-xs text-gray-500">
                    Mon-Fri 9:00-17:00 GMT
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-amber-600 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Visit Us</p>
                  <p className="text-sm text-gray-600">Bankastræti 2</p>
                  <p className="text-xs text-gray-500">
                    101 Reykjavik, Iceland
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Quick Links
            </h3>
            <div className="space-y-3">
              <Link
                href="/events"
                className="flex items-center p-3 bg-white rounded-lg border border-amber-200 hover:border-amber-300 transition-colors group"
              >
                <svg
                  className="w-5 h-5 text-amber-600 mr-3 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-gray-700 group-hover:text-gray-900">
                  Browse Events
                </span>
              </Link>

              <Link
                href="/contact"
                className="flex items-center p-3 bg-white rounded-lg border border-amber-200 hover:border-amber-300 transition-colors group"
              >
                <svg
                  className="w-5 h-5 text-amber-600 mr-3 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-gray-700 group-hover:text-gray-900">
                  Contact Form
                </span>
              </Link>

              <Link
                href="/"
                className="flex items-center p-3 bg-white rounded-lg border border-amber-200 hover:border-amber-300 transition-colors group"
              >
                <svg
                  className="w-5 h-5 text-amber-600 mr-3 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span className="text-gray-700 group-hover:text-gray-900">
                  Home
                </span>
              </Link>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border border-amber-200">
            <h4 className="font-semibold text-gray-800 mb-2">
              Emergency Contact
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              For urgent matters during events:
            </p>
            <p className="text-sm font-medium text-amber-600">+354 616-7855</p>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-white rounded-lg border border-amber-200">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-gray-700">
            <p className="font-medium">Need Immediate Assistance?</p>
            <p>
              If you need urgent help with your ticket or have questions about
              an upcoming event, please don&apos;t hesitate to reach out.
              We&apos;re committed to providing excellent customer service.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default ContactInfo;
