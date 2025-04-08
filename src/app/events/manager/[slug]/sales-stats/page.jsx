"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/util/supabase/client";
import { PropagateLoader } from "react-spinners";
import { format } from "date-fns";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import {
  CurrencyDollarIcon,
  TicketIcon,
  UserGroupIcon,
  CalendarIcon,
  CalculatorIcon,
} from "@heroicons/react/24/outline";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function SalesStats({ params }) {
  const slug = use(params).slug;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [percentage, setPercentage] = useState(24.5); // Default percentage
  const [salesData, setSalesData] = useState({
    totalRevenue: 0,
    onlineRevenue: 0,
    doorRevenue: 0,
    totalTickets: 0,
    paidTickets: 0,
    doorTickets: 0,
    dailySales: [],
    paymentMethods: { paid: 0, door: 0 },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch event details
        const { data: event, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("slug", slug)
          .single();

        if (eventError) throw eventError;
        setEventData(event);

        // Fetch tickets for this event
        const { data: tickets, error: ticketsError } = await supabase
          .from("tickets")
          .select("*")
          .eq("event_id", event.id);

        if (ticketsError) throw ticketsError;

        // Process sales data
        const salesStats = tickets.reduce(
          (acc, ticket) => {
            // Only count paid and door tickets
            if (ticket.status === "paid") {
              acc.paidTickets += ticket.quantity;
              acc.paymentMethods.paid += ticket.quantity;
              acc.onlineRevenue += ticket.total_price;
              acc.totalTickets += ticket.quantity; // Add to total only for paid tickets
            } else if (ticket.status === "door") {
              acc.doorTickets += ticket.quantity;
              acc.paymentMethods.door += ticket.quantity;
              acc.doorRevenue += ticket.total_price;
              acc.totalTickets += ticket.quantity; // Add to total only for door tickets
            }

            acc.totalRevenue = acc.onlineRevenue + acc.doorRevenue;

            const date = format(new Date(ticket.created_at), "yyyy-MM-dd");
            if (!acc.dailySales[date]) {
              acc.dailySales[date] = 0;
            }
            // Only add to daily sales if paid or door ticket
            if (ticket.status === "paid" || ticket.status === "door") {
              acc.dailySales[date] += ticket.total_price;
            }

            return acc;
          },
          {
            totalRevenue: 0,
            onlineRevenue: 0,
            doorRevenue: 0,
            totalTickets: 0, // This will now only include paid + door tickets
            paidTickets: 0,
            doorTickets: 0,
            dailySales: {},
            paymentMethods: { paid: 0, door: 0 },
          }
        );

        setSalesData(salesStats);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load sales statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PropagateLoader color="#ff914d" size={12} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const barChartData = {
    labels: Object.keys(salesData.dailySales),
    datasets: [
      {
        label: "Daily Sales (ISK)",
        data: Object.values(salesData.dailySales),
        backgroundColor: "rgba(255, 145, 77, 0.5)",
        borderColor: "rgb(255, 145, 77)",
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: ["Online Payments", "Door Payments"],
    datasets: [
      {
        data: [salesData.paymentMethods.paid, salesData.paymentMethods.door],
        backgroundColor: ["#ff914d", "#4f46e5"],
      },
    ],
  };

  const calculateAmounts = (percentage) => {
    const deductionAmount = (salesData.totalRevenue * percentage) / 100;
    const remainingAmount = salesData.totalRevenue - deductionAmount;
    return {
      deducted: deductionAmount,
      remaining: remainingAmount,
    };
  };

  const amounts = calculateAmounts(percentage);

  return (
    <div className="mt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Sales Statistics for {eventData.name}
        </h1>
        <p className="mt-2 text-gray-600">
          Event Date: {format(new Date(eventData.date), "PPP")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Revenue
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {salesData.totalRevenue.toLocaleString()} ISK
                  </dd>
                  <dt className="text-xs text-gray-500 mt-1">
                    Online: {salesData.onlineRevenue.toLocaleString()} ISK
                  </dt>
                  <dt className="text-xs text-gray-500">
                    Door: {salesData.doorRevenue.toLocaleString()} ISK
                  </dt>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TicketIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Tickets
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {salesData.totalTickets}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Online Tickets
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {salesData.paidTickets}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Door Tickets
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {salesData.doorTickets}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Daily Sales Trend
          </h3>
          <Bar
            data={barChartData}
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Payment Methods Distribution
          </h3>
          <div className="h-[300px] flex items-center justify-center">
            <Pie
              data={pieChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>
      </div>

      {/* Calculator Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-2 mb-4">
          <CalculatorIcon className="h-6 w-6 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">
            Revenue Calculator
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Revenue
            </label>
            <div className="text-2xl font-bold text-gray-900">
              {salesData.totalRevenue.toLocaleString()} ISK
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deduction Percentage
            </label>
            <input
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(parseFloat(e.target.value) || 0)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#ff914d] focus:border-[#ff914d]"
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deducted Amount ({percentage}%)
            </label>
            <div className="text-2xl font-bold text-red-500">
              {amounts.deducted.toLocaleString()} ISK
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remaining Amount
            </label>
            <div className="text-2xl font-bold text-[#ff914d]">
              {amounts.remaining.toLocaleString()} ISK
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
