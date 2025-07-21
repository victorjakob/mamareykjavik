"use client";
import React from "react";
import { motion } from "framer-motion";

const EventTerms = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
    >
      <div className="flex items-center mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mr-4">
          <svg
            className="w-6 h-6 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Event Participation Terms
        </h2>
      </div>

      <div className="space-y-6">
        <div className="prose prose-lg max-w-none">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            5.1. Event Entry & Conduct
          </h3>
          <div className="text-gray-600 space-y-3">
            <p>
              <strong>Required:</strong> Valid ticket, early arrival (at least
              15 minutes before the start), and respectful behavior towards
              staff and other guests.
            </p>
            <p>
              <strong>Prohibited:</strong> Disruptive behavior, unauthorized
              photography or recording, bringing outside food or drinks, or
              arriving late after the event has started.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">Required</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Valid ticket or confirmation</li>
                  <li>• Arrival 15 minutes before start</li>
                  <li>• Respectful behavior</li>
                  <li>• Following venue guidelines</li>
                </ul>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">Prohibited</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Disruptive behavior</li>
                  <li>• Photography without permission</li>
                  <li>• Bringing outside food/drinks</li>
                  <li>• Late arrivals after start</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            5.2. Health & Safety
          </h3>
          <div className="text-gray-600 space-y-3">
            <p>
              Please inform us of any medical conditions, allergies, or
              accessibility needs in advance.
            </p>

            <p>
              Our team is trained to follow standard safety procedures, and
              emergency guidelines will be communicated by staff when necessary.
            </p>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            5.3. Photography & Recording
          </h3>
          <div className="text-gray-600 space-y-3">
            <p>
              Guests are welcome to take personal photos and short videos,
              provided they do not disturb the event or other participants.
            </p>
            <p>
              Publishing photos or videos publicly (e.g., on social media or
              online platforms) requires prior permission from the event host.
            </p>
            <p>
              Please be mindful of other guests’ privacy and always ask before
              photographing or filming them.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-gray-800 mb-2">
                Policy Guidelines:
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    Personal photos and short videos are allowed at appropriate
                    times.
                  </span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 text-red-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    Flash photography and disruptive filming are not permitted
                    during ceremonies or performances.
                  </span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 text-red-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    Always respect other guests’ privacy before photographing or
                    recording them.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-purple-800">
            <p className="font-medium">Event Participation:</p>
            <p>
              By attending our events, you agree to follow all venue rules and
              respect the experience of other participants.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default EventTerms;
