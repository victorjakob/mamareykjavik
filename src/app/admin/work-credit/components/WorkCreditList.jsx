"use client";
import { useState } from "react";

export default function WorkCreditList({ workCredits, onDelete }) {
  const [show, setShow] = useState(false);

  return (
    <div className="max-w-6xl mx-auto mt-12 w-full">
      <div className="flex justify-center">
        <button
          onClick={() => setShow((h) => !h)}
          className="mb-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 flex items-center gap-2 shadow-sm w-full max-w-xs justify-center"
        >
          {show ? (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Hide Work Credits List
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Show Work Credits List
            </>
          )}
        </button>
      </div>
      {show && (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 animate-fade-in w-full">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-100 to-indigo-200">
                  <th className="px-2 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-2 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Credits
                  </th>
                  <th className="px-2 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workCredits.map((credit, index) => (
                  <tr
                    key={index}
                    className="hover:bg-indigo-50 transition-colors duration-200"
                  >
                    <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-indigo-200 rounded-full flex items-center justify-center shadow">
                          <span className="text-sm font-bold text-indigo-700">
                            {credit.email[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="ml-2 sm:ml-4 text-sm text-gray-900 font-medium break-all">
                          {credit.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="px-2 sm:px-3 py-1 text-sm font-semibold text-indigo-800 bg-indigo-100 rounded-full shadow-sm">
                        {credit.amount}
                      </span>
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <button
                        onClick={() => onDelete(credit.email)}
                        className="inline-flex items-center px-2 sm:px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 shadow-sm"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {workCredits.length === 0 && (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-2 sm:px-6 py-8 text-center text-gray-500"
                    >
                      No work credits found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
