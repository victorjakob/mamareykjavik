"use client";
import { useState } from "react";
import {
  EyeIcon,
  EyeSlashIcon,
  ClockIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

export default function WorkCreditHistory({ history }) {
  const [show, setShow] = useState(true);

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "add":
        return "bg-green-100 text-green-800";
      case "subtract":
        return "bg-red-100 text-red-800";
      case "auto":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <ClockIcon className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {history.length} Transaction{history.length !== 1 ? "s" : ""}
          </span>
        </div>
        <button
          onClick={() => setShow(!show)}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {show ? (
            <>
              <EyeSlashIcon className="h-4 w-4" />
              <span>Hide</span>
            </>
          ) : (
            <>
              <EyeIcon className="h-4 w-4" />
              <span>Show</span>
            </>
          )}
        </button>
      </div>

      {show && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No transaction history
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Transaction history will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Note
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {history.map((entry) => (
                      <tr
                        key={entry.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(entry.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {entry.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              parseFloat(entry.amount) >= 0
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {parseFloat(entry.amount) >= 0 ? "+" : ""}
                            {parseFloat(entry.amount).toLocaleString()} kr
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(entry.type)}`}
                          >
                            {entry.type || "Manual"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {entry.note || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="border-b border-gray-200 p-4 last:border-b-0"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {entry.email}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {new Date(entry.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                        {entry.note && (
                          <div className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                            {entry.note}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            parseFloat(entry.amount) >= 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {parseFloat(entry.amount) >= 0 ? "+" : ""}
                          {parseFloat(entry.amount).toLocaleString()} kr
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(entry.type)}`}
                        >
                          {entry.type || "Manual"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
