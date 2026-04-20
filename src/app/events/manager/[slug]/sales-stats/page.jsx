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
  const [percentage, setPercentage] = useState(5); // Default percentage
  const [salesData, setSalesData] = useState({
    totalRevenue: 0,
    onlineRevenue: 0,
    cashRevenue: 0,
    cardRevenue: 0,
    transferRevenue: 0,
    totalTickets: 0,
    paidTickets: 0,
    cashTickets: 0,
    cardTickets: 0,
    transferTickets: 0,
    dailySales: [],
    paymentMethods: { paid: 0, cash: 0, card: 0, transfer: 0 },
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
            // Count all paid ticket types
            const validStatuses = ["paid", "cash", "card", "transfer"];

            if (validStatuses.includes(ticket.status)) {
              acc.totalTickets += ticket.quantity;
              acc.totalRevenue += ticket.total_price;

              // Track by payment method
              if (ticket.status === "paid") {
                acc.paidTickets += ticket.quantity;
                acc.paymentMethods.paid += ticket.quantity;
                acc.onlineRevenue += ticket.total_price;
              } else if (ticket.status === "cash") {
                acc.cashTickets += ticket.quantity;
                acc.paymentMethods.cash += ticket.quantity;
                acc.cashRevenue += ticket.total_price;
              } else if (ticket.status === "card") {
                acc.cardTickets += ticket.quantity;
                acc.paymentMethods.card += ticket.quantity;
                acc.cardRevenue += ticket.total_price;
              } else if (ticket.status === "transfer") {
                acc.transferTickets += ticket.quantity;
                acc.paymentMethods.transfer += ticket.quantity;
                acc.transferRevenue += ticket.total_price;
              }

              // Add to daily sales
              const date = format(new Date(ticket.created_at), "yyyy-MM-dd");
              if (!acc.dailySales[date]) {
                acc.dailySales[date] = 0;
              }
              acc.dailySales[date] += ticket.total_price;
            }

            return acc;
          },
          {
            totalRevenue: 0,
            onlineRevenue: 0,
            cashRevenue: 0,
            cardRevenue: 0,
            transferRevenue: 0,
            totalTickets: 0,
            paidTickets: 0,
            cashTickets: 0,
            cardTickets: 0,
            transferTickets: 0,
            dailySales: {},
            paymentMethods: { paid: 0, cash: 0, card: 0, transfer: 0 },
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
    labels: ["Online", "Cash", "Card", "Transfer"],
    datasets: [
      {
        data: [
          salesData.paymentMethods.paid,
          salesData.paymentMethods.cash,
          salesData.paymentMethods.card,
          salesData.paymentMethods.transfer,
        ],
        backgroundColor: ["#ff914d", "#10b981", "#3b82f6", "#8b5cf6"],
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
    <div className="max-w-5xl mx-auto px-5 sm:px-6 pt-8 pb-20">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.4em] mb-1" style={{ color: "#ff914d" }}>
          Sales Statistics
        </p>
        <h1
          className="font-cormorant font-light italic"
          style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)", color: "#2c1810" }}
        >
          {eventData.name}
        </h1>
        <p className="text-sm mt-1" style={{ color: "#9a7a62" }}>
          {format(new Date(eventData.date), "PPP")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden rounded-lg" style={{ border: "1.5px solid #f0e6d8", boxShadow: "0 2px 14px rgba(60,30,10,0.07)" }}>
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6" style={{ color: "#9a7a62" }} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium truncate" style={{ color: "#9a7a62" }}>
                    Total Revenue
                  </dt>
                  <dd className="text-lg font-medium" style={{ color: "#2c1810" }}>
                    {salesData.totalRevenue.toLocaleString()} ISK
                  </dd>
                  <dt className="text-xs mt-1" style={{ color: "#9a7a62" }}>
                    Online: {salesData.onlineRevenue.toLocaleString()} ISK
                  </dt>
                  <dt className="text-xs" style={{ color: "#9a7a62" }}>
                    Cash: {salesData.cashRevenue.toLocaleString()} ISK
                  </dt>
                  <dt className="text-xs" style={{ color: "#9a7a62" }}>
                    Card: {salesData.cardRevenue.toLocaleString()} ISK
                  </dt>
                  <dt className="text-xs" style={{ color: "#9a7a62" }}>
                    Transfer: {salesData.transferRevenue.toLocaleString()} ISK
                  </dt>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden rounded-lg" style={{ border: "1.5px solid #f0e6d8", boxShadow: "0 2px 14px rgba(60,30,10,0.07)" }}>
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TicketIcon className="h-6 w-6" style={{ color: "#9a7a62" }} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium truncate" style={{ color: "#9a7a62" }}>
                    Total Tickets
                  </dt>
                  <dd className="text-lg font-medium" style={{ color: "#2c1810" }}>
                    {salesData.totalTickets}
                  </dd>
                  <dt className="text-xs mt-1" style={{ color: "#9a7a62" }}>
                    Online: {salesData.paidTickets}
                  </dt>
                  <dt className="text-xs" style={{ color: "#9a7a62" }}>
                    Cash: {salesData.cashTickets}
                  </dt>
                  <dt className="text-xs" style={{ color: "#9a7a62" }}>
                    Card: {salesData.cardTickets}
                  </dt>
                  <dt className="text-xs" style={{ color: "#9a7a62" }}>
                    Transfer: {salesData.transferTickets}
                  </dt>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden rounded-lg" style={{ border: "1.5px solid #f0e6d8", boxShadow: "0 2px 14px rgba(60,30,10,0.07)" }}>
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6" style={{ color: "#9a7a62" }} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium truncate" style={{ color: "#9a7a62" }}>
                    Online Tickets
                  </dt>
                  <dd className="text-lg font-medium" style={{ color: "#2c1810" }}>
                    {salesData.paidTickets}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden rounded-lg" style={{ border: "1.5px solid #f0e6d8", boxShadow: "0 2px 14px rgba(60,30,10,0.07)" }}>
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6" style={{ color: "#9a7a62" }} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium truncate" style={{ color: "#9a7a62" }}>
                    Cash Tickets
                  </dt>
                  <dd className="text-lg font-medium" style={{ color: "#2c1810" }}>
                    {salesData.cashTickets}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg" style={{ border: "1.5px solid #f0e6d8", boxShadow: "0 2px 14px rgba(60,30,10,0.07)" }}>
          <h3 className="text-lg font-medium mb-4" style={{ color: "#2c1810" }}>
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

        <div className="bg-white p-6 rounded-lg" style={{ border: "1.5px solid #f0e6d8", boxShadow: "0 2px 14px rgba(60,30,10,0.07)" }}>
          <h3 className="text-lg font-medium mb-4" style={{ color: "#2c1810" }}>
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
      <div className="bg-white p-6 rounded-lg" style={{ border: "1.5px solid #f0e6d8", boxShadow: "0 2px 14px rgba(60,30,10,0.07)" }}>
        <div className="flex items-center gap-2 mb-4">
          <CalculatorIcon className="h-6 w-6" style={{ color: "#9a7a62" }} />
          <h3 className="text-lg font-medium" style={{ color: "#2c1810" }}>
            Revenue Calculator
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#2c1810" }}>
              Total Revenue
            </label>
            <div className="text-2xl font-bold" style={{ color: "#2c1810" }}>
              {salesData.totalRevenue.toLocaleString()} ISK
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#2c1810" }}>
              Deduction Percentage
            </label>
            <input
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(parseFloat(e.target.value) || 0)}
              className="block w-full px-3 py-2 rounded-md shadow-sm focus:ring-[#ff914d] focus:border-[#ff914d]"
              style={{ border: "1px solid #e8ddd3", backgroundColor: "#faf6f2", color: "#2c1810" }}
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#2c1810" }}>
              Deducted Amount ({percentage}%)
            </label>
            <div className="text-2xl font-bold text-red-500">
              {amounts.deducted.toLocaleString()} ISK
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#2c1810" }}>
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
