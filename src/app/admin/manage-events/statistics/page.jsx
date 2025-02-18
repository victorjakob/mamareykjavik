"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { PropagateLoader } from "react-spinners";
import { format } from "date-fns";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ChartBarIcon,
  CalendarIcon,
  TicketIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

export default function Statistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFrame, setTimeFrame] = useState("all");
  const [customDateRange, setCustomDateRange] = useState({
    start: null,
    end: null,
  });

  const filterEventsByDate = useCallback(
    (events) => {
      if (timeFrame === "all") return events;

      const now = new Date();
      // Set time to end of day for consistent comparison
      now.setHours(23, 59, 59, 999);

      let startDate = new Date(now);
      let endDate = new Date(now);

      switch (timeFrame) {
        case "week":
          startDate.setDate(now.getDate() - 7);
          // Set start time to beginning of day
          startDate.setHours(0, 0, 0, 0);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "three_months":
          startDate.setMonth(now.getMonth() - 3);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "custom":
          if (!customDateRange.start || !customDateRange.end) return events;
          startDate = new Date(customDateRange.start);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(customDateRange.end);
          endDate.setHours(23, 59, 59, 999);
          break;
        default:
          return events;
      }

      // Use consistent filtering logic for all cases
      return events.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= startDate && eventDate <= endDate;
      });
    },
    [timeFrame, customDateRange]
  );

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data: events, error: eventsError } = await supabase
          .from("events")
          .select("*");

        if (eventsError) throw eventsError;

        // Filter events based on timeFrame
        const filteredEvents = filterEventsByDate(events);
        const filteredEventIds = filteredEvents.map((event) => event.id);

        // Get paid tickets for filtered events
        const { data: paidTickets, error: paidTicketsError } = await supabase
          .from("tickets")
          .select("*")
          .eq("status", "paid")
          .in("event_id", filteredEventIds);

        if (paidTicketsError) throw paidTicketsError;

        // Get door tickets for filtered events
        const { data: doorTickets, error: doorTicketsError } = await supabase
          .from("tickets")
          .select("*")
          .eq("status", "door")
          .in("event_id", filteredEventIds);

        if (doorTicketsError) throw doorTicketsError;

        // Get venue payments for filtered events
        const { data: venuePayments, error: venuePaymentsError } =
          await supabase
            .from("event-payments")
            .select("*")
            .in("event_id", filteredEventIds);

        if (venuePaymentsError) throw venuePaymentsError;

        // Calculate statistics with filtered data
        const totalEvents = filteredEvents.length;
        const totalPaidTickets = paidTickets.length;
        const totalDoorTickets = doorTickets.length;

        const paidRevenue = paidTickets.reduce((sum, ticket) => {
          const event = filteredEvents.find((e) => e.id === ticket.event_id);
          return sum + (event?.price || 0);
        }, 0);

        const doorRevenue = doorTickets.reduce((sum, ticket) => {
          const event = filteredEvents.find((e) => e.id === ticket.event_id);
          return sum + (event?.price || 0);
        }, 0);

        const totalVenuePayments = venuePayments.reduce((sum, payment) => {
          return sum + (payment.amount || 0);
        }, 0);

        const upcomingEvents = filteredEvents.filter(
          (event) => new Date(event.date) > new Date()
        ).length;

        const pastEvents = totalEvents - upcomingEvents;

        setStats({
          totalEvents,
          upcomingEvents,
          pastEvents,
          paidTickets: {
            total: totalPaidTickets,
            revenue: paidRevenue,
            averagePerEvent: totalEvents
              ? (totalPaidTickets / totalEvents).toFixed(1)
              : 0,
            averageRevenuePerEvent: totalEvents
              ? (paidRevenue / totalEvents).toFixed(0)
              : 0,
          },
          doorTickets: {
            total: totalDoorTickets,
            revenue: doorRevenue,
            averagePerEvent: totalEvents
              ? (totalDoorTickets / totalEvents).toFixed(1)
              : 0,
            averageRevenuePerEvent: totalEvents
              ? (doorRevenue / totalEvents).toFixed(0)
              : 0,
          },
          venuePayments: {
            total: totalVenuePayments,
            averagePerEvent: totalEvents
              ? (totalVenuePayments / totalEvents).toFixed(0)
              : 0,
            eventsWithPayments: venuePayments.length,
          },
        });
      } catch (err) {
        setError(err.message);
        console.error("Error fetching statistics:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [timeFrame, customDateRange, filterEventsByDate]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <PropagateLoader color="#4F46E5" size={12} speedMultiplier={0.8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-center">
        <div className="text-red-600 font-medium flex flex-col items-center gap-2">
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 sm:mt-14 md:mt-36 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Event Statistics
            </h1>
            <div className="space-y-2">
              <p className="text-lg text-gray-600">
                Overview of your events and ticket sales
              </p>
              <Link
                href="/admin/manage-events/statistics/tickets"
                className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1"
              >
                <TicketIcon className="h-4 w-4" />
                Ticket Sales Overview
              </Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl shadow-sm">
            <select
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-700 font-medium"
            >
              <option value="all">All Time</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="three_months">Past 3 Months</option>
              <option value="custom">Custom Range</option>
            </select>

            {timeFrame === "custom" && (
              <div className="flex gap-3">
                <input
                  type="date"
                  value={customDateRange.start || ""}
                  onChange={(e) =>
                    setCustomDateRange((prev) => ({
                      ...prev,
                      start: e.target.value,
                    }))
                  }
                  className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <input
                  type="date"
                  value={customDateRange.end || ""}
                  onChange={(e) =>
                    setCustomDateRange((prev) => ({
                      ...prev,
                      end: e.target.value,
                    }))
                  }
                  className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-lg p-8 border border-indigo-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <CalendarIcon className="h-8 w-8 text-indigo-600" />
            <h3 className="text-xl font-semibold text-gray-900">Events</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
              <span className="text-gray-600">Total Events</span>
              <span className="text-xl font-semibold text-indigo-600">
                {stats.totalEvents}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
              <span className="text-gray-600">Upcoming Events</span>
              <span className="text-xl font-semibold text-emerald-600">
                {stats.upcomingEvents}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
              <span className="text-gray-600">Past Events</span>
              <span className="text-xl font-semibold text-blue-600">
                {stats.pastEvents}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl shadow-lg p-8 border border-emerald-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <TicketIcon className="h-8 w-8 text-emerald-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              Online Tickets
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
              <span className="text-gray-600">Total Tickets</span>
              <span className="text-xl font-semibold text-emerald-600">
                {stats.paidTickets.total}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
              <span className="text-gray-600">Avg. Tickets/Event</span>
              <span className="text-xl font-semibold text-emerald-600">
                {stats.paidTickets.averagePerEvent}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
              <span className="text-gray-600">Total Revenue</span>
              <span className="text-xl font-semibold text-emerald-600">
                {stats.paidTickets.revenue} kr
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
              <span className="text-gray-600">Avg. Revenue/Event</span>
              <span className="text-xl font-semibold text-emerald-600">
                {stats.paidTickets.averageRevenuePerEvent} kr
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg p-8 border border-blue-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <BanknotesIcon className="h-8 w-8 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">Door Sales</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
              <span className="text-gray-600">Total Tickets</span>
              <span className="text-xl font-semibold text-blue-600">
                {stats.doorTickets.total}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
              <span className="text-gray-600">Avg. Tickets/Event</span>
              <span className="text-xl font-semibold text-blue-600">
                {stats.doorTickets.averagePerEvent}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
              <span className="text-gray-600">Total Revenue</span>
              <span className="text-xl font-semibold text-blue-600">
                {stats.doorTickets.revenue} kr
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
              <span className="text-gray-600">Avg. Revenue/Event</span>
              <span className="text-xl font-semibold text-blue-600">
                {stats.doorTickets.averageRevenuePerEvent} kr
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg p-8 border border-purple-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <BuildingOfficeIcon className="h-8 w-8 text-purple-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              Venue Payments
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
              <span className="text-gray-600">Total Payments</span>
              <span className="text-xl font-semibold text-purple-600">
                {stats.venuePayments.total} kr
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
              <span className="text-gray-600">Events with Payments</span>
              <span className="text-xl font-semibold text-purple-600">
                {stats.venuePayments.eventsWithPayments}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
              <span className="text-gray-600">Avg. Payment/Event</span>
              <span className="text-xl font-semibold text-purple-600">
                {stats.venuePayments.averagePerEvent} kr
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
