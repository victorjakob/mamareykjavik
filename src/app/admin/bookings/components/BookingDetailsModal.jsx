"use client";

import {
  X,
  Calendar,
  Users,
  Mail,
  Phone,
  Clock,
  ClipboardList,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BookingDetailsModal({ booking, isOpen, onClose }) {
  if (!booking) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("is-IS", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50"
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Booking Details</h2>
                    <p className="text-sm text-indigo-100 mt-1">
                      {booking.reference_id}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-full transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {/* Status */}
                <div className="mb-6">
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status.toUpperCase()}
                  </span>
                </div>

                {/* Contact Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-indigo-600" />
                    Contact Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-24">
                        Name:
                      </span>
                      <span className="text-gray-900">
                        {booking.contact_name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-24">
                        Email:
                      </span>
                      <a
                        href={`mailto:${booking.contact_email}`}
                        className="text-indigo-600 hover:underline"
                      >
                        {booking.contact_email}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-24">
                        Phone:
                      </span>
                      <a
                        href={`tel:${booking.contact_phone}`}
                        className="text-indigo-600 hover:underline"
                      >
                        {booking.contact_phone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                {booking.preferred_datetime && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                      Date & Time
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-32">
                          Date:
                        </span>
                        <span className="text-gray-900">
                          {formatDate(booking.preferred_datetime)}
                        </span>
                      </div>
                      {booking.start_time && (
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 w-32">
                            Start Time:
                          </span>
                          <span className="text-gray-900">
                            {booking.start_time}
                          </span>
                        </div>
                      )}
                      {booking.end_time && (
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 w-32">
                            End Time:
                          </span>
                          <span className="text-gray-900">
                            {booking.end_time}
                          </span>
                        </div>
                      )}
                      {booking.datetime_comment && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-600 italic">
                            {booking.datetime_comment}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Guest Count */}
                {booking.guest_count && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-indigo-600" />
                      Guest Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900">
                        <span className="font-medium">Count:</span>{" "}
                        {booking.guest_count}
                      </p>
                      {booking.guest_count_comment && (
                        <p className="text-sm text-gray-600 italic mt-2">
                          {booking.guest_count_comment}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Room Setup */}
                {booking.room_setup && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <ClipboardList className="w-5 h-5 mr-2 text-indigo-600" />
                      Room Setup
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900">{booking.room_setup}</p>
                      {booking.room_setup_comment && (
                        <p className="text-sm text-gray-600 italic mt-2">
                          {booking.room_setup_comment}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Tablecloth */}
                {booking.tablecloth && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Tablecloth
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900">{booking.tablecloth}</p>
                      {booking.tablecloth_comment && (
                        <p className="text-sm text-gray-600 italic mt-2">
                          {booking.tablecloth_comment}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Services */}
                {booking.services && booking.services.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Services
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <ul className="list-disc list-inside space-y-1">
                        {booking.services.map((service, idx) => (
                          <li key={idx} className="text-gray-900">
                            {service}
                          </li>
                        ))}
                      </ul>
                      {booking.services_comment && (
                        <p className="text-sm text-gray-600 italic mt-3 pt-3 border-t border-gray-200">
                          {booking.services_comment}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Food */}
                {booking.food && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Food
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900">{booking.food}</p>
                      {booking.food_comment && (
                        <p className="text-sm text-gray-600 italic mt-2">
                          {booking.food_comment}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Drinks */}
                {booking.drinks && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Drinks
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                        {JSON.stringify(booking.drinks, null, 2)}
                      </pre>
                      {booking.drinks_comment && (
                        <p className="text-sm text-gray-600 italic mt-3 pt-3 border-t border-gray-200">
                          {booking.drinks_comment}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {booking.notes && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Additional Notes
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {booking.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        Created:
                      </span>
                      <p className="text-gray-600 mt-1">
                        {formatDate(booking.created_at)}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Last Updated:
                      </span>
                      <p className="text-gray-600 mt-1">
                        {formatDate(booking.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}




