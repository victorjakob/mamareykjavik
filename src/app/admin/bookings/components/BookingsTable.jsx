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

const inputCls = `w-full pl-10 pr-4 py-3 rounded-xl text-sm text-[#2c1810] placeholder-[#9a7a62]
  bg-[#faf6f2] border border-[#e8ddd3]
  focus:outline-none focus:border-[#ff914d]/60 focus:ring-1 focus:ring-[#ff914d]/30
  transition-all duration-200`;

export default function BookingsTable({ bookings, onBookingsUpdated }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "Not selected";
    const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!dateMatch) return "Not selected";
    const [, year, month, day] = dateMatch;
    const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
    const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${dayNames[date.getUTCDay()]} · ${parseInt(day)} ${monthNames[parseInt(month) - 1]} · ${year}`;
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString;
  };

  const getCompanyName = (booking) => {
    if (booking.booking_data?.contact?.company) return booking.booking_data.contact.company;
    return booking.contact_company || null;
  };

  const getEventName = (booking) => {
    return booking.booking_data?.adminOps?.eventNameOrCompany?.trim() || booking.contact_name || "—";
  };

  const getEventType = (booking) => {
    return booking.booking_data?.adminOps?.eventType?.trim() || "—";
  };

  const getServices = (booking) => {
    const services = booking.booking_data?.services || booking.services || [];
    if (!Array.isArray(services) || services.length === 0) return null;
    const language = booking.language || "is";
    const serviceLabels = {
      is: { food: "Matur", drinks: "Drykkir", neither: "Ekkert" },
      en: { food: "Food", drinks: "Drinks", neither: "Neither" },
    };
    const labels = serviceLabels[language] || serviceLabels.is;
    return services.map((service) => labels[service] || service).join(", ");
  };

  const getGuestCount = (booking) => {
    return booking.guest_count || booking.booking_data?.guestCount || null;
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
    if (onBookingsUpdated) onBookingsUpdated();
  };

  // Status badge style
  const getStatusStyle = (status) => {
    const s = (status || "pending").toLowerCase();
    if (s === "confirmed") return { background: "rgba(255,145,77,0.15)", color: "#ff914d", border: "1px solid rgba(255,145,77,0.3)" };
    if (s === "cancelled") return { background: "#f3f0ec", color: "#9a7a62", border: "1px solid #e8ddd3" };
    return { background: "rgba(255,200,77,0.12)", color: "#ffcc4d", border: "1px solid rgba(255,200,77,0.25)" };
  };

  const getStatusLabel = (status) => {
    const s = (status || "pending").toLowerCase();
    if (s === "confirmed") return "Confirmed";
    if (s === "cancelled") return "Cancelled";
    return "Pending";
  };

  // Filter and sort
  const filteredBookings = bookings
    .filter((booking) => {
      const searchLower = searchTerm.toLowerCase();
      const name = booking.contact_name?.toLowerCase() || "";
      const email = booking.contact_email?.toLowerCase() || "";
      const reference = booking.reference_id?.toLowerCase() || "";
      const company = getCompanyName(booking)?.toLowerCase() || "";
      const matchesSearch = name.includes(searchLower) || email.includes(searchLower) ||
        reference.includes(searchLower) || company.includes(searchLower);
      if (!matchesSearch) return false;

      const bookingStatus = (booking.status || "pending").toLowerCase();
      if (statusFilter === "all") {
        if (bookingStatus === "cancelled") return false;
      } else {
        if (statusFilter === "confirmed" && bookingStatus !== "confirmed") return false;
        if (statusFilter === "pending" && bookingStatus !== "pending") return false;
        if (statusFilter === "cancelled" && bookingStatus !== "cancelled") return false;
      }

      const isPast = isDateInPast(booking.preferred_datetime);
      return showPastEvents ? isPast : !isPast;
    })
    .sort((a, b) => {
      const dateA = a.preferred_datetime ? new Date(a.preferred_datetime).getTime() : 0;
      const dateB = b.preferred_datetime ? new Date(b.preferred_datetime).getTime() : 0;
      return dateB - dateA;
    });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a4a40]" />
        <input
          type="text"
          placeholder="Search by name, email or company…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={inputCls}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "confirmed", "cancelled"].map((status) => {
            const active = statusFilter === status;
            const style = active ? getStatusStyle(status === "all" ? "all" : status) : {};
            return (
              <button key={status} onClick={() => setStatusFilter(status)}
                className="px-4 py-2 rounded-xl text-xs font-medium transition-all"
                style={active
                  ? { ...style }
                  : { background: "#faf6f2", border: "1px solid #e8ddd3", color: "#9a7a62" }
                }>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            );
          })}
        </div>
        <button onClick={() => setShowPastEvents(!showPastEvents)}
          className="px-4 py-2 rounded-xl text-xs font-medium transition-all"
          style={showPastEvents
            ? { background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", color: "#ff8080" }
            : { background: "#faf6f2", border: "1px solid #e8ddd3", color: "#9a7a62" }
          }>
          {showPastEvents ? "Show Upcoming" : "Show Past"}
        </button>
      </div>

      {/* Results count */}
      {(searchTerm || showPastEvents) && (
        <p className="text-xs text-[#9a7a62]">
          {filteredBookings.length}{" "}
          {showPastEvents
            ? filteredBookings.length === 1 ? "past booking" : "past bookings"
            : filteredBookings.length === 1 ? "upcoming booking" : "upcoming bookings"}
        </p>
      )}

      {/* Mobile card view */}
      <div className="block md:hidden space-y-3">
        {filteredBookings.length === 0 ? (
          <div className="rounded-xl p-8 text-center" style={{ background: "#ffffff", border: "1.5px solid #f0e6d8" }}>
            <p className="text-[#9a7a62] text-sm">No bookings found</p>
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const companyName = getCompanyName(booking);
            const services = getServices(booking);
            const date = formatDate(booking.preferred_datetime);
            const startTime = formatTime(booking.start_time);
            const endTime = formatTime(booking.end_time);
            const timeRange = startTime && endTime ? `${startTime} – ${endTime}` : startTime || endTime || null;

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleBookingClick(booking)}
                className="rounded-xl p-4 cursor-pointer transition-all active:scale-[0.98]"
                style={{ background: "#ffffff", border: "1.5px solid #f0e6d8" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[#2c1810] truncate">{getEventName(booking)}</h3>
                    {getEventType(booking) !== "—" && (
                      <p className="text-xs text-[#9a7a62] truncate mt-0.5">{getEventType(booking)}</p>
                    )}
                    <p className="text-xs text-[#9a7a62] truncate mt-1">{booking.contact_name}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                      style={getStatusStyle(booking.status)}>
                      {getStatusLabel(booking.status)}
                    </span>
                    <ChevronRightIcon className="w-4 h-4 text-#e8ddd3] shrink-0" />
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-[#9a7a62]">
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{booking.contact_email}</span>
                  </div>
                  {date && (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{date}</span>
                      {timeRange && <span className="text-[#9a7a62]">· {timeRange}</span>}
                    </div>
                  )}
                  {getGuestCount(booking) && (
                    <div className="flex items-center gap-2">
                      <UserGroupIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{getGuestCount(booking)}</span>
                    </div>
                  )}
                  {companyName && (
                    <div className="flex items-center gap-2">
                      <BuildingOfficeIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{companyName}</span>
                    </div>
                  )}
                  {services && (
                    <div className="text-[#9a7a62]">
                      <span className="text-[#9a7a62]">{booking.language === "en" ? "Services:" : "Þjónusta:"}</span>{" "}
                      {services}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block rounded-xl overflow-hidden"
        style={{ background: "#ffffff", border: "1.5px solid #f0e6d8" }}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid #e8ddd3" }}>
                {["Event name", "Type", "Contact", "Email", "Date", "Guests", "Services", "Company"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9a7a62]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-[#5a4a40] text-sm">
                    No bookings found
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking, i) => {
                  const companyName = getCompanyName(booking);
                  const services = getServices(booking);
                  const date = formatDate(booking.preferred_datetime);
                  const startTime = formatTime(booking.start_time);
                  const endTime = formatTime(booking.end_time);
                  const timeRange = startTime && endTime ? `${startTime} – ${endTime}` : startTime || endTime || null;

                  return (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: i * 0.02 }}
                      onClick={() => handleBookingClick(booking)}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: "1px solid #e8ddd3" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#faf6f2"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#2c1810]">{getEventName(booking)}</span>
                          <span className="rounded-full px-2 py-0.5 text-[10px]" style={getStatusStyle(booking.status)}>
                            {getStatusLabel(booking.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-[#9a7a62]">{getEventType(booking)}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-sm text-[#2c1810]">{booking.contact_name}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-[#9a7a62]">
                          <EnvelopeIcon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate max-w-[160px]">{booking.contact_email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="text-sm text-[#2c1810]">{date}</div>
                        {timeRange && <div className="text-xs text-[#9a7a62] mt-0.5">{timeRange}</div>}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {getGuestCount(booking) ? (
                          <div className="flex items-center gap-1 text-sm text-[#9a7a62]">
                            <UserGroupIcon className="w-3.5 h-3.5" />
                            {getGuestCount(booking)}
                          </div>
                        ) : <span className="text-[#e8ddd3]">—</span>}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#9a7a62]">
                        {services || <span className="text-[#e8ddd3]">—</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        {companyName ? (
                          <div className="flex items-center gap-1.5 text-xs text-[#9a7a62]">
                            <BuildingOfficeIcon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[120px]">{companyName}</span>
                          </div>
                        ) : <span className="text-[#e8ddd3]">—</span>}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onBookingUpdated={handleBookingUpdated}
      />
    </div>
  );
}
