"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarIcon,
  UserGroupIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import BookingDetailsModal from "./BookingDetailsModal";

export default function BookingsTable({ bookings, onBookingsUpdated }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all"); // all, pending, confirmed, cancelled
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "Not selected";
    // Parse date string directly to avoid timezone conversion
    // Extract date part from ISO string (YYYY-MM-DD)
    const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!dateMatch) {
      return "Not selected";
    }
    
    const [, year, month, day] = dateMatch;
    // Create date in UTC to avoid timezone issues
    const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
    
    const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const dayAbbr = dayNames[date.getUTCDay()];
    const dayNum = parseInt(day);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = monthNames[parseInt(month) - 1];
    const yearShort = year.slice(-2);
    return `${dayAbbr} - ${dayNum} ${monthName} - ${yearShort}`;
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    if (timeString.includes(":") && timeString.length <= 5) return timeString;
    return timeString;
  };

  const getCompanyName = (booking) => {
    if (booking.booking_data?.contact?.company) {
      return booking.booking_data.contact.company;
    }
    return booking.contact_company || null;
  };

  const getServices = (booking) => {
    const services = booking.booking_data?.services || booking.services || [];
    if (!Array.isArray(services) || services.length === 0) return null;
    
    // Get language from booking (default to Icelandic for backward compatibility)
    const language = booking.language || "is";
    
    const serviceLabels = {
      is: {
        food: "Matur",
        drinks: "Drykkir",
        neither: "Ekkert",
      },
      en: {
        food: "Food",
        drinks: "Drinks",
        neither: "Neither",
      },
    };
    
    const labels = serviceLabels[language] || serviceLabels.is;
    
    return services
      .map((service) => labels[service] || service)
      .join(", ");
  };

  const isDateInPast = (dateString) => {
    if (!dateString) return false;
    const bookingDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate < today;
  };

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const handleBookingUpdated = () => {
    if (onBookingsUpdated) {
      onBookingsUpdated();
    }
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusLower = (status || "pending").toLowerCase();
    if (statusLower === "confirmed") {
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        border: "border-emerald-200",
        label: "Confirmed",
      };
    } else if (statusLower === "cancelled") {
      return {
        bg: "bg-gray-100",
        text: "text-gray-700",
        border: "border-gray-200",
        label: "Cancelled",
      };
    } else {
      // pending
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        border: "border-yellow-200",
        label: "Pending",
      };
    }
  };

  // Filter and sort bookings
  const filteredBookings = bookings
    .filter((booking) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const name = booking.contact_name?.toLowerCase() || "";
      const email = booking.contact_email?.toLowerCase() || "";
      const reference = booking.reference_id?.toLowerCase() || "";
      const company = getCompanyName(booking)?.toLowerCase() || "";

    const matchesSearch =
        name.includes(searchLower) ||
        email.includes(searchLower) ||
        reference.includes(searchLower) ||
        company.includes(searchLower);

      if (!matchesSearch) return false;

      // Status filter
      const bookingStatus = (booking.status || "pending").toLowerCase();
      if (statusFilter === "all") {
        // Hide cancelled bookings by default in "all" view
        if (bookingStatus === "cancelled") return false;
      } else {
        // When filtering by specific status, only show matching status
        if (statusFilter === "confirmed" && bookingStatus !== "confirmed") return false;
        if (statusFilter === "pending" && bookingStatus !== "pending") return false;
        if (statusFilter === "cancelled" && bookingStatus !== "cancelled") return false;
      }

      // Past/upcoming filter
      const isPast = isDateInPast(booking.preferred_datetime);
      return showPastEvents ? isPast : !isPast;
    })
    .sort((a, b) => {
      // Sort by date (preferred_datetime) - descending (most recent first)
      const dateA = a.preferred_datetime
        ? new Date(a.preferred_datetime).getTime()
        : 0;
      const dateB = b.preferred_datetime
        ? new Date(b.preferred_datetime).getTime()
        : 0;
      return dateB - dateA;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a77d3b] focus:border-[#a77d3b] bg-white text-sm sm:text-base"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {["all", "pending", "confirmed", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium whitespace-nowrap ${
                  statusFilter === status
                    ? status === "all"
                      ? "bg-gray-900 border-gray-900 text-white"
                      : status === "pending"
                      ? "bg-yellow-100 border-yellow-300 text-yellow-700"
                      : status === "confirmed"
                      ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                      : "bg-gray-100 border-gray-300 text-gray-700"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Toggle for Past Events */}
          <button
            onClick={() => setShowPastEvents(!showPastEvents)}
            className={`px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium whitespace-nowrap ${
              showPastEvents
                ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {showPastEvents ? "Show Upcoming" : "Show Past"}
          </button>
        </div>
      </div>

      {/* Results Count */}
      {(searchTerm || showPastEvents) && (
        <div className="text-sm text-gray-600">
          {filteredBookings.length}{" "}
          {showPastEvents
            ? filteredBookings.length === 1
              ? "past booking"
              : "past bookings"
            : filteredBookings.length === 1
              ? "upcoming booking"
              : "upcoming bookings"}
        </div>
      )}

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">No bookings found</p>
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const companyName = getCompanyName(booking);
            const services = getServices(booking);
            const date = formatDate(booking.preferred_datetime);
            const startTime = formatTime(booking.start_time);
            const endTime = formatTime(booking.end_time);
            const timeRange =
              startTime && endTime
                ? `${startTime} – ${endTime}`
                : startTime || endTime || null;
            const isPast = isDateInPast(booking.preferred_datetime);
            const statusBadge = getStatusBadge(booking.status);

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleBookingClick(booking)}
                className={`rounded-lg shadow-sm border p-4 cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98] ${
                  booking.status === "confirmed"
                    ? "bg-emerald-50/60 border-emerald-100/50 hover:bg-emerald-50/80"
                    : booking.status === "cancelled"
                    ? "bg-gray-50/60 border-gray-100/50 hover:bg-gray-50/80"
                    : booking.status === "pending"
                    ? "bg-yellow-50/60 border-yellow-100/50 hover:bg-yellow-50/80"
                    : isPast
                      ? "bg-red-50/50 border-red-100/50 hover:bg-red-50/70"
                      : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {booking.contact_name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {booking.reference_id}
                    </p>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <EnvelopeIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{booking.contact_email}</span>
                  </div>

                  {date && (
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{date}</span>
                      {timeRange && <span className="ml-2">• {timeRange}</span>}
                    </div>
                  )}

                  {booking.guest_count && (
                    <div className="flex items-center text-sm text-gray-600">
                      <UserGroupIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{booking.guest_count}</span>
                    </div>
                  )}

                  {services && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">
                        {(() => {
                          const lang = booking.language || "is";
                          return lang === "en" ? "Selected Services:" : "Valin þjónusta:";
                        })()}
                      </span> {services}
                    </div>
                  )}

                  {companyName && (
                    <div className="flex items-center text-sm text-gray-600">
                      <BuildingOfficeIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{companyName}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Guests
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Selected Services
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    No bookings found
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => {
                  const companyName = getCompanyName(booking);
                  const services = getServices(booking);
                  const date = formatDate(booking.preferred_datetime);
                  const startTime = formatTime(booking.start_time);
                  const endTime = formatTime(booking.end_time);
                  const timeRange =
                    startTime && endTime
                      ? `${startTime} – ${endTime}`
                      : startTime || endTime || null;
                  const isPast = isDateInPast(booking.preferred_datetime);
                  const statusBadge = getStatusBadge(booking.status);

                  return (
                    <motion.tr
                    key={booking.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => handleBookingClick(booking)}
                      className={`cursor-pointer transition-colors duration-150 ${
                        booking.status === "confirmed"
                          ? "bg-emerald-50/60 hover:bg-emerald-50/80"
                          : booking.status === "cancelled"
                          ? "bg-gray-50/60 hover:bg-gray-50/80"
                          : booking.status === "pending"
                          ? "bg-yellow-50/60 hover:bg-yellow-50/80"
                          : isPast
                            ? "bg-red-50/50 hover:bg-red-50/70"
                            : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.contact_name}
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                            {statusBadge.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <EnvelopeIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate max-w-xs">
                          {booking.contact_email}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {date}
                          {timeRange && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {timeRange}
                            </div>
                          )}
                      </div>
                    </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {booking.guest_count ? (
                          <div className="flex items-center text-sm text-gray-600">
                            <UserGroupIcon className="w-4 h-4 mr-1.5" />
                            {booking.guest_count}
                      </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {services ? (
                          <span className="text-sm text-gray-600">{services}</span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                    </td>
                      <td className="px-4 py-4">
                        {companyName ? (
                          <div className="flex items-center text-sm text-gray-600">
                            <BuildingOfficeIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
                            <span className="truncate max-w-xs">
                              {companyName}
                            </span>
                      </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                    </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-mono text-gray-500">
                            {booking.reference_id}
                      </span>
                          <ChevronRightIcon className="w-4 h-4 text-gray-400 ml-2" />
                        </div>
                    </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onBookingUpdated={handleBookingUpdated}
      />
    </div>
  );
}
