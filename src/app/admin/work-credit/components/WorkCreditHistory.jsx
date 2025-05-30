"use client";
import { useState } from "react";

export default function WorkCreditHistory({ history }) {
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
              Hide Work Credit History
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
              Show Work Credit History
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
                    Date
                  </th>
                  <th className="px-2 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-2 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-2 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-2 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap break-all">
                      {entry.email}
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      {entry.amount}
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      {entry.type}
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      {entry.note || ""}
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-2 sm:px-6 py-8 text-center text-gray-500"
                    >
                      No history found
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
