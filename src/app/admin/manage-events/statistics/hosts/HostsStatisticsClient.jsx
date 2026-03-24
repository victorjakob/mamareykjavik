"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { supabase } from "@/util/supabase/client";
import {
  BanknotesIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ChartBarIcon,
  TicketIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  buildEventFinance,
  buildHostFinanceRows,
  buildUniqueSummary,
  filterEventsByRange,
  formatISK,
} from "./lib";

function StatCard({ icon: Icon, title, value, helper, accent }) {
  return (
    <div
      className={`rounded-2xl border bg-white p-6 shadow-sm ${
        accent === "emerald"
          ? "border-emerald-100"
          : accent === "indigo"
            ? "border-indigo-100"
            : accent === "amber"
              ? "border-amber-100"
              : accent === "rose"
                ? "border-rose-100"
                : accent === "sky"
                  ? "border-sky-100"
                  : "border-gray-100"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`rounded-xl p-3 ${
            accent === "emerald"
              ? "bg-emerald-50 text-emerald-600"
              : accent === "indigo"
                ? "bg-indigo-50 text-indigo-600"
                : accent === "amber"
                  ? "bg-amber-50 text-amber-600"
                  : accent === "rose"
                    ? "bg-rose-50 text-rose-600"
                    : accent === "sky"
                      ? "bg-sky-50 text-sky-600"
                      : "bg-gray-50 text-gray-600"
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
            {value}
          </p>
        </div>
      </div>
      {helper ? <p className="mt-4 text-xs text-gray-500">{helper}</p> : null}
    </div>
  );
}

function PaymentHistoryItem({ payment }) {
  return (
    <li className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {formatISK(payment.amount)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {payment.created_at
              ? format(new Date(payment.created_at), "PPP p")
              : "No date"}
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
          Paid to Mama
        </span>
      </div>
      {payment.details ? (
        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
          {payment.details}
        </p>
      ) : null}
    </li>
  );
}

export default function HostsStatisticsClient({
  initialEvents = [],
  initialTickets = [],
  initialPayments = [],
  initialHostUsers = [],
}) {
  const [events] = useState(initialEvents);
  const [tickets] = useState(initialTickets);
  const [payments, setPayments] = useState(initialPayments);
  const [hostUsers] = useState(initialHostUsers);
  const [timeFrame, setTimeFrame] = useState("all");
  const [eventScope, setEventScope] = useState("all");
  const [customDateRange, setCustomDateRange] = useState({
    start: "",
    end: "",
  });
  const [hostFilter, setHostFilter] = useState("all");
  const [hostPickerOpen, setHostPickerOpen] = useState(false);
  const [hostPickerSearch, setHostPickerSearch] = useState("");
  const [search, setSearch] = useState("");
  const [selectedHostEmail, setSelectedHostEmail] = useState(null);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [paymentDrafts, setPaymentDrafts] = useState({});
  const [visibleHostCount, setVisibleHostCount] = useState(8);
  const [visibleRecentEventCount, setVisibleRecentEventCount] = useState(8);

  const filtersKey = `${timeFrame}|${eventScope}|${customDateRange.start}|${customDateRange.end}|${hostFilter}|${search}`;

  const hostNameByEmail = useMemo(() => {
    const map = new Map();
    for (const user of hostUsers) {
      const email = String(user.email || "").trim().toLowerCase();
      if (!email) continue;
      map.set(email, String(user.name || "").trim());
    }
    return map;
  }, [hostUsers]);

  const hostOptions = useMemo(() => {
    const emails = new Set();
    for (const event of events) {
      if (event.host) emails.add(String(event.host).trim().toLowerCase());
      if (event.host_secondary) {
        emails.add(String(event.host_secondary).trim().toLowerCase());
      }
    }
    return Array.from(emails).sort((a, b) => a.localeCompare(b));
  }, [events]);

  const hostOptionItems = useMemo(
    () =>
      hostOptions.map((email) => ({
        email,
        name: hostNameByEmail.get(email) || "",
      })),
    [hostOptions, hostNameByEmail]
  );

  const filteredHostOptionItems = useMemo(() => {
    const q = hostPickerSearch.trim().toLowerCase();
    if (!q) return hostOptionItems;
    return hostOptionItems.filter((option) => {
      const name = option.name.toLowerCase();
      return name.includes(q) || option.email.includes(q);
    });
  }, [hostOptionItems, hostPickerSearch]);

  const filteredEvents = useMemo(
    () =>
      filterEventsByRange(events, {
        timeFrame,
        customDateRange,
        eventScope,
      }),
    [events, timeFrame, customDateRange, eventScope]
  );

  const eventFinanceRows = useMemo(() => {
    return filteredEvents.map((event) => {
      const eventTickets = tickets.filter((ticket) => ticket.event_id === event.id);
      const eventPayments = payments.filter(
        (payment) => payment.event_id === event.id
      );
      return buildEventFinance(event, eventTickets, eventPayments);
    });
  }, [filteredEvents, tickets, payments]);

  const hostRows = useMemo(
    () => buildHostFinanceRows(eventFinanceRows),
    [eventFinanceRows]
  );

  const summary = useMemo(
    () => buildUniqueSummary(eventFinanceRows, hostRows),
    [eventFinanceRows, hostRows]
  );

  const filteredHostRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return hostRows.filter((row) => {
      if (hostFilter !== "all" && row.hostEmail !== hostFilter) return false;
      if (!q) return true;
      const hostName = (hostNameByEmail.get(row.hostEmail) || "").toLowerCase();
      return (
        hostName.includes(q) ||
        row.hostEmail.includes(q) ||
        row.events.some((event) => event.name?.toLowerCase().includes(q))
      );
    });
  }, [hostRows, hostFilter, search, hostNameByEmail]);

  const selectedHost = useMemo(
    () => hostRows.find((row) => row.hostEmail === selectedHostEmail) || null,
    [hostRows, selectedHostEmail]
  );

  const visibleHostRows = useMemo(
    () => filteredHostRows.slice(0, visibleHostCount),
    [filteredHostRows, visibleHostCount]
  );

  useEffect(() => {
    setVisibleHostCount(8);
  }, [filtersKey]);

  const allRecentPastEvents = useMemo(() => {
    const now = new Date();
    return [...eventFinanceRows]
      .filter((event) => {
        const eventDate = new Date(event.date);
        return !Number.isNaN(eventDate.getTime()) && eventDate < now;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [eventFinanceRows]);

  const recentPastEvents = useMemo(
    () => allRecentPastEvents.slice(0, visibleRecentEventCount),
    [allRecentPastEvents, visibleRecentEventCount]
  );

  useEffect(() => {
    setVisibleRecentEventCount(8);
  }, [filtersKey]);

  useEffect(() => {
    setHostPickerOpen(false);
    setHostPickerSearch("");
  }, [hostFilter]);

  const openEventInDrawer = (event) => {
    const hostEmail = String(event.host || event.host_secondary || "").trim().toLowerCase();
    if (!hostEmail) return;
    setSelectedHostEmail(hostEmail);
    setExpandedEventId(event.id);
  };

  const selectedHostLabel =
    hostFilter === "all"
      ? "All hosts"
      : hostNameByEmail.get(hostFilter)
        ? `${hostNameByEmail.get(hostFilter)} (${hostFilter})`
        : hostFilter;

  const handlePaymentDraftChange = (eventId, field, value) => {
    setPaymentDrafts((prev) => ({
      ...prev,
      [eventId]: {
        amount: prev[eventId]?.amount || "",
        details: prev[eventId]?.details || "",
        saving: false,
        error: "",
        [field]: value,
      },
    }));
  };

  const handleAddPayment = async (eventId) => {
    const draft = paymentDrafts[eventId] || {};
    const amount = Number(draft.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setPaymentDrafts((prev) => ({
        ...prev,
        [eventId]: {
          ...prev[eventId],
          error: "Enter a valid amount greater than 0.",
        },
      }));
      return;
    }

    setPaymentDrafts((prev) => ({
      ...prev,
      [eventId]: {
        amount: prev[eventId]?.amount || "",
        details: prev[eventId]?.details || "",
        saving: true,
        error: "",
      },
    }));

    try {
      const { data, error: insertError } = await supabase
        .from("event-payments")
        .insert([
          {
            event_id: eventId,
            amount,
            details:
              (draft.details || "").trim() || "Recorded from host finance overview",
          },
        ])
        .select("id,event_id,amount,details,created_at")
        .single();

      if (insertError) throw insertError;

      setPayments((prev) => [data, ...prev]);
      setPaymentDrafts((prev) => ({
        ...prev,
        [eventId]: { amount: "", details: "", saving: false, error: "" },
      }));
    } catch (err) {
      console.error("Error adding event payment:", err);
      setPaymentDrafts((prev) => ({
        ...prev,
        [eventId]: {
          amount: prev[eventId]?.amount || "",
          details: prev[eventId]?.details || "",
          saving: false,
          error: err.message || "Failed to save payment.",
        },
      }));
    }
  };

  return (
    <div className="mt-8 sm:mt-14 md:mt-36 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-10 rounded-3xl border border-gray-100 bg-gradient-to-br from-white via-white to-indigo-50/40 p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
              <BuildingOfficeIcon className="h-4 w-4" />
              Host Finance Overview
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Track what hosts have paid to Mama
            </h1>
            <p className="mt-3 text-base leading-relaxed text-gray-600">
              Review host-led events, recorded payments to Mama, unpaid balances,
              and co-hosted events without duplicating your top-line totals.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/manage-events/statistics/tickets"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <TicketIcon className="h-4 w-4" />
              Ticket Sales Overview
            </Link>
            <Link
              href="/admin/manage-events"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <ChartBarIcon className="h-4 w-4" />
              Back to Manage Events
            </Link>
          </div>
        </div>
      </div>

      <div className="sticky top-20 z-10 mb-8 rounded-2xl border border-gray-100 bg-white/90 p-4 shadow-sm backdrop-blur">
        <div className="grid gap-4 lg:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Timeframe
            </label>
            <select
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400"
            >
              <option value="all">All time</option>
              <option value="week">Past week</option>
              <option value="month">Past month</option>
              <option value="three_months">Past 3 months</option>
              <option value="custom">Custom range</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Event scope
            </label>
            <select
              value={eventScope}
              onChange={(e) => setEventScope(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400"
            >
              <option value="all">All events</option>
              <option value="upcoming">Upcoming only</option>
              <option value="past">Past only</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Host
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setHostPickerOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-sm text-gray-700 outline-none transition hover:border-indigo-300"
              >
                <span className="truncate">{selectedHostLabel}</span>
                <span className="ml-3 shrink-0 text-gray-400">
                  {hostPickerOpen ? "▲" : "▼"}
                </span>
              </button>

              {hostPickerOpen ? (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                  <div className="border-b border-gray-100 p-3">
                    <input
                      type="text"
                      value={hostPickerSearch}
                      onChange={(e) => setHostPickerSearch(e.target.value)}
                      placeholder="Search host name or email"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div className="max-h-72 overflow-y-auto p-2">
                    <button
                      type="button"
                      onClick={() => setHostFilter("all")}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                        hostFilter === "all"
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>All hosts</span>
                      {hostFilter === "all" ? (
                        <span className="text-xs font-semibold">Selected</span>
                      ) : null}
                    </button>

                    {filteredHostOptionItems.length === 0 ? (
                      <p className="px-3 py-3 text-sm text-gray-500">
                        No hosts match that search.
                      </p>
                    ) : (
                      filteredHostOptionItems.map((option) => (
                        <button
                          key={option.email}
                          type="button"
                          onClick={() => setHostFilter(option.email)}
                          className={`mt-1 flex w-full items-start justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                            hostFilter === option.email
                              ? "bg-indigo-50 text-indigo-700"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <span className="min-w-0">
                            {option.name ? (
                              <span className="block truncate font-medium">
                                {option.name}
                              </span>
                            ) : null}
                            <span className="block truncate text-xs text-gray-500">
                              {option.email}
                            </span>
                          </span>
                          {hostFilter === option.email ? (
                            <span className="shrink-0 text-xs font-semibold">
                              Selected
                            </span>
                          ) : null}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search host or event"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Start
              </label>
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) =>
                  setCustomDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
                disabled={timeFrame !== "custom"}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                End
              </label>
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) =>
                  setCustomDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
                disabled={timeFrame !== "custom"}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={CalendarIcon}
          title="Unique Events"
          value={summary.uniqueEvents}
          helper="Top-line summary cards use unique events only."
          accent="indigo"
        />
        <StatCard
          icon={UserGroupIcon}
          title="Active Hosts"
          value={summary.activeHosts}
          helper="Hosts are grouped by email from primary and secondary host fields."
          accent="sky"
        />
        <StatCard
          icon={BanknotesIcon}
          title="Paid to Mama"
          value={formatISK(summary.paymentsRecorded)}
          helper="These are payment entries explicitly recorded to Mama."
          accent="emerald"
        />
        <StatCard
          icon={BuildingOfficeIcon}
          title="Total Revenue"
          value={formatISK(summary.grossRevenue)}
          helper="Gross ticket revenue across the events in this filtered view."
          accent="amber"
        />
        <StatCard
          icon={ChartBarIcon}
          title="Payment Entries"
          value={summary.paymentEntries}
          helper="How many payment records to Mama exist in the current result set."
          accent="rose"
        />
        <StatCard
          icon={TicketIcon}
          title="Co-hosted Events"
          value={summary.coHostedEvents}
          helper="Co-hosted events appear under both hosts in the host table below."
          accent="sky"
        />
      </div>

      <div className="mt-10 rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Host ledger</h2>
              <p className="mt-1 text-sm text-gray-500">
                Co-hosted events are shown under both hosts. Use revenue and paid
                amounts for tracking, since Mama deals can vary per event.
              </p>
            </div>
            <p className="text-sm text-gray-500">
              {filteredHostRows.length} host
              {filteredHostRows.length === 1 ? "" : "s"} shown
            </p>
          </div>
        </div>

        {filteredHostRows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-lg font-medium text-gray-900">
              No host finance rows match these filters
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Try broadening the date range or clearing the search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/80">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-6 py-4">Host</th>
                  <th className="px-6 py-4">Events</th>
                  <th className="px-6 py-4">Co-hosted</th>
                  <th className="px-6 py-4">Total Revenue</th>
                  <th className="px-6 py-4">Paid to Mama</th>
                  <th className="px-6 py-4">Payment Entries</th>
                  <th className="px-6 py-4">Last Event</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleHostRows.map((row) => (
                  <tr key={row.hostEmail} className="hover:bg-gray-50/70">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{row.hostEmail}</p>
                        {hostNameByEmail.get(row.hostEmail) ? (
                          <p className="mt-1 text-sm text-gray-700">
                            {hostNameByEmail.get(row.hostEmail)}
                          </p>
                        ) : null}
                        <p className="mt-1 text-xs text-gray-500">
                          {row.ticketCount} tickets across visible events
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {row.eventCount}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {row.coHostedCount}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatISK(row.grossRevenue)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-emerald-700">
                      {formatISK(row.paidToMama)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      {row.paymentCount}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {row.lastEventDate
                        ? format(new Date(row.lastEventDate), "PPP")
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedHostEmail(row.hostEmail);
                          setExpandedEventId(row.events[0]?.id || null);
                        }}
                        className="inline-flex items-center rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredHostRows.length > visibleHostCount ? (
              <div className="border-t border-gray-100 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setVisibleHostCount((prev) => prev + 8)}
                  className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  See more hosts
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="mt-10 rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Most recent past events
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Keep the latest completed events visible so you can quickly open one
                and register a payment to Mama.
              </p>
            </div>
            <p className="text-sm text-gray-500">
              {recentPastEvents.length} of {allRecentPastEvents.length} event
              {allRecentPastEvents.length === 1 ? "" : "s"} shown
            </p>
          </div>
        </div>

        {recentPastEvents.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-lg font-medium text-gray-900">
              No past events match these filters
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Try switching the event scope to `All events` or widening the date range.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 p-6 lg:grid-cols-2">
            {recentPastEvents.map((event) => (
              <div
                key={`recent-${event.id}`}
                className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {event.name}
                      </h3>
                      {event.coHosted ? (
                        <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
                          Co-hosted
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {event.date ? format(new Date(event.date), "PPP p") : "No date"}
                    </p>
                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium text-gray-900">Primary host:</span>{" "}
                        {hostNameByEmail.get(String(event.host || "").toLowerCase()) ||
                          event.host ||
                          "—"}
                      </p>
                      {event.host_secondary ? (
                        <p>
                          <span className="font-medium text-gray-900">Co-host:</span>{" "}
                          {hostNameByEmail.get(
                            String(event.host_secondary || "").toLowerCase()
                          ) || event.host_secondary}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-right">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        Paid
                      </p>
                      <p className="mt-1 text-sm font-semibold text-emerald-700">
                        {formatISK(event.paidToMama)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        Revenue
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {formatISK(event.grossRevenue)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openEventInDrawer(event)}
                    className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Open event here
                  </button>
                  <Link
                    href={`/admin/manage-events/${event.id}/payments`}
                    className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Payment page
                  </Link>
                </div>
              </div>
            ))}
            {allRecentPastEvents.length > visibleRecentEventCount ? (
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => setVisibleRecentEventCount((prev) => prev + 8)}
                  className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  See more recent events
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {selectedHost ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="h-full w-full max-w-3xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                    Host detail
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold text-gray-900">
                    {hostNameByEmail.get(selectedHost.hostEmail) ||
                      selectedHost.hostEmail}
                  </h3>
                  {hostNameByEmail.get(selectedHost.hostEmail) ? (
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedHost.hostEmail}
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm text-gray-500">
                    Full co-hosted event values are shown here for operational
                    tracking. This view focuses on revenue, recorded payments to
                    Mama, and payment history.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedHostEmail(null)}
                  className="rounded-xl border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Events
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">
                    {selectedHost.eventCount}
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Paid to Mama
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-800">
                    {formatISK(selectedHost.paidToMama)}
                  </p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                    Total Revenue
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-amber-800">
                    {formatISK(selectedHost.grossRevenue)}
                  </p>
                </div>
                <div className="rounded-2xl bg-sky-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                    Co-hosted events
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-sky-800">
                    {selectedHost.coHostedCount}
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {selectedHost.events.map((event) => {
                  const draft = paymentDrafts[event.id] || {
                    amount: "",
                    details: "",
                    saving: false,
                    error: "",
                  };
                  const isExpanded = expandedEventId === event.id;

                  return (
                    <div
                      key={`${selectedHost.hostEmail}-${event.id}-${event.hostRole}`}
                      className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedEventId((prev) =>
                            prev === event.id ? null : event.id
                          )
                        }
                        className="w-full px-5 py-4 text-left transition hover:bg-gray-50"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {event.name}
                              </h4>
                              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                                {event.hostRole === "secondary"
                                  ? "Co-hosted"
                                  : "Primary host"}
                              </span>
                              {event.coHosted ? (
                                <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
                                  Shared event
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              {event.date
                                ? format(new Date(event.date), "PPP p")
                                : "No date"}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-gray-400">
                                Revenue
                              </p>
                              <p className="mt-1 text-sm font-semibold text-gray-900">
                                {formatISK(event.grossRevenue)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-gray-400">
                                Paid
                              </p>
                              <p className="mt-1 text-sm font-semibold text-emerald-700">
                                {formatISK(event.paidToMama)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-gray-400">
                                Payment entries
                              </p>
                              <p className="mt-1 text-sm font-semibold text-gray-900">
                                {event.paymentCount}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-gray-400">
                                Tickets
                              </p>
                              <p className="mt-1 text-sm font-semibold text-gray-900">
                                {event.ticketCount}
                              </p>
                            </div>
                          </div>
                        </div>
                      </button>

                      {isExpanded ? (
                        <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-5">
                          <div className="grid gap-4 lg:grid-cols-4">
                            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Gross event revenue
                              </p>
                              <p className="mt-2 text-xl font-semibold text-gray-900">
                                {formatISK(event.grossRevenue)}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Paid to Mama
                              </p>
                              <p className="mt-2 text-xl font-semibold text-emerald-700">
                                {formatISK(event.paidToMama)}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Tickets
                              </p>
                              <p className="mt-2 text-xl font-semibold text-gray-900">
                                {event.ticketCount}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Payment entries
                              </p>
                              <p className="mt-2 text-xl font-semibold text-gray-900">
                                {event.paymentCount}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <h5 className="text-base font-semibold text-gray-900">
                                    Payment history
                                  </h5>
                                  <p className="mt-1 text-sm text-gray-500">
                                    Each entry is an amount that the host has paid
                                    to Mama for this event.
                                  </p>
                                </div>
                                <Link
                                  href={`/admin/manage-events/${event.id}/payments`}
                                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                >
                                  Open payment page
                                </Link>
                              </div>

                              {event.payments.length === 0 ? (
                                <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-500">
                                  No payments recorded yet for this event.
                                </div>
                              ) : (
                                <ul className="mt-4 space-y-3">
                                  {event.payments.map((payment) => (
                                    <PaymentHistoryItem
                                      key={payment.id}
                                      payment={payment}
                                    />
                                  ))}
                                </ul>
                              )}
                            </div>

                            <div className="space-y-5">
                              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                                <h5 className="text-base font-semibold text-gray-900">
                                  Sales snapshot
                                </h5>
                                <div className="mt-4 space-y-3">
                                  {Object.keys(event.statusBreakdown).length === 0 ? (
                                    <p className="text-sm text-gray-500">
                                      No ticket revenue found for this event.
                                    </p>
                                  ) : (
                                    Object.entries(event.statusBreakdown).map(
                                      ([status, values]) => (
                                        <div
                                          key={status}
                                          className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2"
                                        >
                                          <div>
                                            <p className="text-sm font-medium capitalize text-gray-900">
                                              {status}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                              {values.tickets} tickets
                                            </p>
                                          </div>
                                          <p className="text-sm font-semibold text-gray-900">
                                            {formatISK(values.revenue)}
                                          </p>
                                        </div>
                                      )
                                    )
                                  )}
                                </div>
                              </div>

                              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                                <h5 className="text-base font-semibold text-gray-900">
                                  Record a new payment
                                </h5>
                                <p className="mt-1 text-sm text-gray-500">
                                  Add the amount the host paid to Mama so the
                                  ledger stays up to date.
                                </p>

                                <div className="mt-4 space-y-3">
                                  <div>
                                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                      Amount (kr)
                                    </label>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={draft.amount}
                                      onChange={(e) =>
                                        handlePaymentDraftChange(
                                          event.id,
                                          "amount",
                                          e.target.value
                                        )
                                      }
                                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
                                      placeholder="e.g. 25000"
                                    />
                                  </div>
                                  <div>
                                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                      Note
                                    </label>
                                    <textarea
                                      rows={3}
                                      value={draft.details}
                                      onChange={(e) =>
                                        handlePaymentDraftChange(
                                          event.id,
                                          "details",
                                          e.target.value
                                        )
                                      }
                                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
                                      placeholder="Optional note, transfer reference, or context"
                                    />
                                  </div>
                                  {draft.error ? (
                                    <p className="text-sm text-rose-600">{draft.error}</p>
                                  ) : null}
                                  <button
                                    type="button"
                                    onClick={() => handleAddPayment(event.id)}
                                    disabled={draft.saving}
                                    className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                                  >
                                    {draft.saving ? "Saving..." : "Record payment"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
