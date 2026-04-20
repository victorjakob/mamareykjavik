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
      style={{
        background: "#241809",
        border: "1px solid #3a2812",
        borderRadius: "1rem",
        padding: "1.5rem",
        boxShadow: "0 2px 20px rgba(0,0,0,0.28)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div
          style={{
            background: "rgba(255,145,77,0.14)",
            color: "#ff914d",
            borderRadius: "0.75rem",
            padding: "0.75rem",
          }}
        >
          <Icon style={{ width: "1.5rem", height: "1.5rem" }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#9a8e82" }}>
            {title}
          </p>
          <p
            style={{
              marginTop: "0.25rem",
              fontSize: "1.5rem",
              fontWeight: 600,
              letterSpacing: "-0.025em",
              color: "#f0ebe3",
            }}
          >
            {value}
          </p>
        </div>
      </div>
      {helper ? (
        <p style={{ marginTop: "1rem", fontSize: "0.75rem", color: "#9a8e82" }}>
          {helper}
        </p>
      ) : null}
    </div>
  );
}

function PaymentHistoryItem({ payment }) {
  return (
    <li
      style={{
        borderRadius: "0.75rem",
        border: "1px solid #3a2812",
        background: "#241809",
        padding: "0.75rem",
        boxShadow: "0 2px 20px rgba(0,0,0,0.28)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
        <div>
          <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#f0ebe3" }}>
            {formatISK(payment.amount)}
          </p>
          <p style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "#9a8e82" }}>
            {payment.created_at
              ? format(new Date(payment.created_at), "PPP p")
              : "No date"}
          </p>
        </div>
        <span
          style={{
            borderRadius: "9999px",
            background: "rgba(255,145,77,0.15)",
            paddingLeft: "0.625rem",
            paddingRight: "0.625rem",
            paddingTop: "0.25rem",
            paddingBottom: "0.25rem",
            fontSize: "0.6875rem",
            fontWeight: 500,
            color: "#ff914d",
          }}
        >
          Paid to Mama
        </span>
      </div>
      {payment.details ? (
        <p
          style={{
            marginTop: "0.5rem",
            whiteSpace: "pre-wrap",
            fontSize: "0.875rem",
            color: "#c0b4a8",
          }}
        >
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
    <div style={{ minHeight: "100vh", paddingTop: "6rem", paddingBottom: "5rem", paddingLeft: "1.25rem", paddingRight: "1.25rem", background: "#1c1208" }}>
      <div style={{ maxWidth: "80rem", marginLeft: "auto", marginRight: "auto" }}>
        <div
          style={{
            marginBottom: "2.5rem",
            borderRadius: "1.5rem",
            border: "1px solid #3a2812",
            background: "linear-gradient(to bottom right, #241809, #221508)",
            padding: "2rem",
            boxShadow: "0 2px 20px rgba(0,0,0,0.28)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "flex-start" }}>
            <div style={{ maxWidth: "48rem" }}>
              <div
                style={{
                  marginBottom: "0.75rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  borderRadius: "9999px",
                  background: "rgba(255,145,77,0.15)",
                  paddingLeft: "0.75rem",
                  paddingRight: "0.75rem",
                  paddingTop: "0.25rem",
                  paddingBottom: "0.25rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#ff914d",
                }}
              >
                <BuildingOfficeIcon style={{ width: "1rem", height: "1rem" }} />
                Host Finance Overview
              </div>
              <h1
                style={{
                  fontSize: "2.25rem",
                  fontWeight: 600,
                  letterSpacing: "-0.025em",
                  color: "#f0ebe3",
                }}
              >
                Track what hosts have paid to Mama
              </h1>
              <p
                style={{
                  marginTop: "0.75rem",
                  fontSize: "1rem",
                  lineHeight: 1.5,
                  color: "#c0b4a8",
                }}
              >
                Review host-led events, recorded payments to Mama, unpaid balances,
                and co-hosted events without duplicating your top-line totals.
              </p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              <Link
                href="/admin/manage-events/statistics/tickets"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  borderRadius: "0.75rem",
                  border: "1px solid #3a2812",
                  background: "#241809",
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                  paddingTop: "0.625rem",
                  paddingBottom: "0.625rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#c0b4a8",
                  boxShadow: "0 2px 20px rgba(0,0,0,0.28)",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#2a1c0e";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#241809";
                }}
              >
                <TicketIcon style={{ width: "1rem", height: "1rem" }} />
                Ticket Sales Overview
              </Link>
              <Link
                href="/admin/manage-events"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  borderRadius: "0.75rem",
                  background: "#ff914d",
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                  paddingTop: "0.625rem",
                  paddingBottom: "0.625rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#000",
                  boxShadow: "0 2px 20px rgba(0,0,0,0.28)",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                <ChartBarIcon style={{ width: "1rem", height: "1rem" }} />
                Back to Manage Events
              </Link>
            </div>
          </div>
        </div>

        <div
          style={{
            position: "sticky",
            top: "5rem",
            zIndex: 10,
            marginBottom: "2rem",
            borderRadius: "1rem",
            border: "1px solid #3a2812",
            background: "rgba(28, 18, 8, 0.85)",
            padding: "1rem",
            boxShadow: "0 2px 20px rgba(0,0,0,0.28)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            <div>
              <label
                style={{
                  marginBottom: "0.25rem",
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#9a8e82",
                }}
              >
                Timeframe
              </label>
              <select
                value={timeFrame}
                onChange={(e) => setTimeFrame(e.target.value)}
                style={{
                  width: "100%",
                  borderRadius: "0.75rem",
                  border: "1px solid #3a2812",
                  background: "#17100a",
                  paddingLeft: "0.75rem",
                  paddingRight: "0.75rem",
                  paddingTop: "0.625rem",
                  paddingBottom: "0.625rem",
                  fontSize: "0.875rem",
                  color: "#f0ebe3",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#ff914d";
                  e.currentTarget.style.boxShadow = "inset 0 0 0 1px rgba(255, 145, 77, 0.3)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#3a2812";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <option value="all">All time</option>
                <option value="week">Past week</option>
                <option value="month">Past month</option>
                <option value="three_months">Past 3 months</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
            <div>
              <label
                style={{
                  marginBottom: "0.25rem",
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#9a8e82",
                }}
              >
                Event scope
              </label>
              <select
                value={eventScope}
                onChange={(e) => setEventScope(e.target.value)}
                style={{
                  width: "100%",
                  borderRadius: "0.75rem",
                  border: "1px solid #3a2812",
                  background: "#17100a",
                  paddingLeft: "0.75rem",
                  paddingRight: "0.75rem",
                  paddingTop: "0.625rem",
                  paddingBottom: "0.625rem",
                  fontSize: "0.875rem",
                  color: "#f0ebe3",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#ff914d";
                  e.currentTarget.style.boxShadow = "inset 0 0 0 1px rgba(255, 145, 77, 0.3)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#3a2812";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <option value="all">All events</option>
                <option value="upcoming">Upcoming only</option>
                <option value="past">Past only</option>
              </select>
            </div>
            <div>
              <label
                style={{
                  marginBottom: "0.25rem",
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#9a8e82",
                }}
              >
                Host
              </label>
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setHostPickerOpen((prev) => !prev)}
                  style={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: "0.75rem",
                    border: "1px solid #3a2812",
                    background: "#17100a",
                    paddingLeft: "0.75rem",
                    paddingRight: "0.75rem",
                    paddingTop: "0.625rem",
                    paddingBottom: "0.625rem",
                    textAlign: "left",
                    fontSize: "0.875rem",
                    color: "#f0ebe3",
                    outline: "none",
                    transition: "all 0.2s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#ff914d";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#3a2812";
                  }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {selectedHostLabel}
                  </span>
                  <span style={{ marginLeft: "0.75rem", flexShrink: 0, color: "#7a6a5a" }}>
                    {hostPickerOpen ? "▲" : "▼"}
                  </span>
                </button>

                {hostPickerOpen ? (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: "calc(100% + 8px)",
                      zIndex: 20,
                      overflow: "hidden",
                      borderRadius: "1rem",
                      border: "1px solid #3a2812",
                      background: "#241809",
                      boxShadow: "0 4px 30px rgba(0,0,0,0.4)",
                    }}
                  >
                    <div style={{ borderBottom: "1px solid #2a1c0e", padding: "0.75rem" }}>
                      <input
                        type="text"
                        value={hostPickerSearch}
                        onChange={(e) => setHostPickerSearch(e.target.value)}
                        placeholder="Search host name or email"
                        style={{
                          width: "100%",
                          borderRadius: "0.75rem",
                          border: "1px solid #3a2812",
                          background: "#17100a",
                          paddingLeft: "0.75rem",
                          paddingRight: "0.75rem",
                          paddingTop: "0.625rem",
                          paddingBottom: "0.625rem",
                          fontSize: "0.875rem",
                          color: "#f0ebe3",
                          outline: "none",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#ff914d";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#3a2812";
                        }}
                      />
                    </div>
                    <div style={{ maxHeight: "18rem", overflowY: "auto", padding: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={() => setHostFilter("all")}
                        style={{
                          display: "flex",
                          width: "100%",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderRadius: "0.75rem",
                          paddingLeft: "0.75rem",
                          paddingRight: "0.75rem",
                          paddingTop: "0.625rem",
                          paddingBottom: "0.625rem",
                          textAlign: "left",
                          fontSize: "0.875rem",
                          background: hostFilter === "all" ? "rgba(255,145,77,0.15)" : "transparent",
                          color: hostFilter === "all" ? "#ff914d" : "#c0b4a8",
                          transition: "all 0.2s",
                          cursor: "pointer",
                          border: "none",
                        }}
                        onMouseEnter={(e) => {
                          if (hostFilter !== "all") e.currentTarget.style.background = "#2a1c0e";
                        }}
                        onMouseLeave={(e) => {
                          if (hostFilter !== "all") e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <span>All hosts</span>
                        {hostFilter === "all" ? (
                          <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>Selected</span>
                        ) : null}
                      </button>

                      {filteredHostOptionItems.length === 0 ? (
                        <p style={{ paddingLeft: "0.75rem", paddingRight: "0.75rem", paddingTop: "0.75rem", paddingBottom: "0.75rem", fontSize: "0.875rem", color: "#9a8e82" }}>
                          No hosts match that search.
                        </p>
                      ) : (
                        filteredHostOptionItems.map((option) => (
                          <button
                            key={option.email}
                            type="button"
                            onClick={() => setHostFilter(option.email)}
                            style={{
                              marginTop: "0.25rem",
                              display: "flex",
                              width: "100%",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              gap: "0.75rem",
                              borderRadius: "0.75rem",
                              paddingLeft: "0.75rem",
                              paddingRight: "0.75rem",
                              paddingTop: "0.625rem",
                              paddingBottom: "0.625rem",
                              textAlign: "left",
                              fontSize: "0.875rem",
                              background: hostFilter === option.email ? "rgba(255,145,77,0.15)" : "transparent",
                              color: hostFilter === option.email ? "#ff914d" : "#c0b4a8",
                              transition: "all 0.2s",
                              cursor: "pointer",
                              border: "none",
                            }}
                            onMouseEnter={(e) => {
                              if (hostFilter !== option.email) e.currentTarget.style.background = "#2a1c0e";
                            }}
                            onMouseLeave={(e) => {
                              if (hostFilter !== option.email) e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <span style={{ minWidth: 0 }}>
                              {option.name ? (
                                <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>
                                  {option.name}
                                </span>
                              ) : null}
                              <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.75rem", color: "#9a8e82" }}>
                                {option.email}
                              </span>
                            </span>
                            {hostFilter === option.email ? (
                              <span style={{ flexShrink: 0, fontSize: "0.75rem", fontWeight: 600 }}>
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
              <label
                style={{
                  marginBottom: "0.25rem",
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#9a8e82",
                }}
              >
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search host or event"
                style={{
                  width: "100%",
                  borderRadius: "0.75rem",
                  border: "1px solid #3a2812",
                  background: "#17100a",
                  paddingLeft: "0.75rem",
                  paddingRight: "0.75rem",
                  paddingTop: "0.625rem",
                  paddingBottom: "0.625rem",
                  fontSize: "0.875rem",
                  color: "#f0ebe3",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#ff914d";
                  e.currentTarget.style.boxShadow = "inset 0 0 0 1px rgba(255, 145, 77, 0.3)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#3a2812";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label
                  style={{
                    marginBottom: "0.25rem",
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#9a8e82",
                  }}
                >
                  Start
                </label>
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) =>
                    setCustomDateRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                  disabled={timeFrame !== "custom"}
                  style={{
                    width: "100%",
                    borderRadius: "0.75rem",
                    border: "1px solid #3a2812",
                    background: timeFrame === "custom" ? "#17100a" : "#1c1208",
                    paddingLeft: "0.75rem",
                    paddingRight: "0.75rem",
                    paddingTop: "0.625rem",
                    paddingBottom: "0.625rem",
                    fontSize: "0.875rem",
                    color: timeFrame === "custom" ? "#f0ebe3" : "#7a6a5a",
                    outline: "none",
                    opacity: timeFrame === "custom" ? 1 : 0.5,
                  }}
                  onFocus={(e) => {
                    if (timeFrame === "custom") {
                      e.currentTarget.style.borderColor = "#ff914d";
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#3a2812";
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    marginBottom: "0.25rem",
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#9a8e82",
                  }}
                >
                  End
                </label>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) =>
                    setCustomDateRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                  disabled={timeFrame !== "custom"}
                  style={{
                    width: "100%",
                    borderRadius: "0.75rem",
                    border: "1px solid #3a2812",
                    background: timeFrame === "custom" ? "#17100a" : "#1c1208",
                    paddingLeft: "0.75rem",
                    paddingRight: "0.75rem",
                    paddingTop: "0.625rem",
                    paddingBottom: "0.625rem",
                    fontSize: "0.875rem",
                    color: timeFrame === "custom" ? "#f0ebe3" : "#7a6a5a",
                    outline: "none",
                    opacity: timeFrame === "custom" ? 1 : 0.5,
                  }}
                  onFocus={(e) => {
                    if (timeFrame === "custom") {
                      e.currentTarget.style.borderColor = "#ff914d";
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#3a2812";
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          <StatCard
            icon={CalendarIcon}
            title="Unique Events"
            value={summary.uniqueEvents}
            helper="Top-line summary cards use unique events only."
            accent="orange"
          />
          <StatCard
            icon={UserGroupIcon}
            title="Active Hosts"
            value={summary.activeHosts}
            helper="Hosts are grouped by email from primary and secondary host fields."
            accent="orange"
          />
          <StatCard
            icon={BanknotesIcon}
            title="Paid to Mama"
            value={formatISK(summary.paymentsRecorded)}
            helper="These are payment entries explicitly recorded to Mama."
            accent="orange"
          />
          <StatCard
            icon={BuildingOfficeIcon}
            title="Total Revenue"
            value={formatISK(summary.grossRevenue)}
            helper="Gross ticket revenue across the events in this filtered view."
            accent="orange"
          />
          <StatCard
            icon={ChartBarIcon}
            title="Payment Entries"
            value={summary.paymentEntries}
            helper="How many payment records to Mama exist in the current result set."
            accent="orange"
          />
          <StatCard
            icon={TicketIcon}
            title="Co-hosted Events"
            value={summary.coHostedEvents}
            helper="Co-hosted events appear under both hosts in the host table below."
            accent="orange"
          />
        </div>

        <div
          style={{
            marginTop: "2.5rem",
            borderRadius: "1.5rem",
            border: "1px solid #3a2812",
            background: "#241809",
            boxShadow: "0 2px 20px rgba(0,0,0,0.28)",
          }}
        >
          <div style={{ borderBottom: "1px solid #3a2812", paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "1.25rem", paddingBottom: "1.25rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#f0ebe3" }}>
                  Host ledger
                </h2>
                <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "#9a8e82" }}>
                  Co-hosted events are shown under both hosts. Use revenue and paid
                  amounts for tracking, since Mama deals can vary per event.
                </p>
              </div>
              <p style={{ fontSize: "0.875rem", color: "#9a8e82" }}>
                {filteredHostRows.length} host
                {filteredHostRows.length === 1 ? "" : "s"} shown
              </p>
            </div>
          </div>

          {filteredHostRows.length === 0 ? (
            <div style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "4rem", paddingBottom: "4rem", textAlign: "center" }}>
              <p style={{ fontSize: "1.125rem", fontWeight: 500, color: "#f0ebe3" }}>
                No host finance rows match these filters
              </p>
              <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#9a8e82" }}>
                Try broadening the date range or clearing the search.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "#1c1208" }}>
                  <tr style={{ textAlign: "left", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a8e82" }}>
                    <th style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "1rem", paddingBottom: "1rem" }}>Host</th>
                    <th style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "1rem", paddingBottom: "1rem" }}>Events</th>
                    <th style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "1rem", paddingBottom: "1rem" }}>Co-hosted</th>
                    <th style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "1rem", paddingBottom: "1rem" }}>Total Revenue</th>
                    <th style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "1rem", paddingBottom: "1rem" }}>Paid to Mama</th>
                    <th style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "1rem", paddingBottom: "1rem" }}>Payment Entries</th>
                    <th style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "1rem", paddingBottom: "1rem" }}>Last Event</th>
                    <th style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "1rem", paddingBottom: "1rem", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleHostRows.map((row, idx) => (
                    <tr
                      key={row.hostEmail}
                      style={{
                        borderBottom: "1px solid #2a1c0e",
                        background: "#241809",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#2a1c0e";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#241809";
                      }}
                    >
                      <td style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "1rem", paddingBottom: "1rem" }}>
                        <div>
                          <p style={{ fontWeight: 500, color: "#f0ebe3" }}>{row.hostEmail}</p>
                          {hostNameByEmail.get(row.hostEmail) ? (
                            <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "#c0b4a8" }}>
                              {hostNameByEmail.get(row.hostEmail)}
                            </p>
                          ) : null}
                          <p style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "#9a8e82" }}>
                            {row.ticketCount} tickets across visible events
                          </p>
                        </div>
                      </td>
                      <td style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "1rem", paddingBottom: "1rem", fontSize: "0.875rem", fontWeight: 500, color: "#f0ebe3" }}>
                        {row.eventCount}
                      </td>
                      <td style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "1rem", paddingBottom: "1rem", fontSize: "0.875rem", color: "#c0b4a8" }}>
                        {row.coHostedCount}
                      </td>
                      <td style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "1rem", paddingBottom: "1rem", fontSize: "0.875rem", fontWeight: 500, color: "#f0ebe3" }}>
                        {formatISK(row.grossRevenue)}
                      </td>
                      <td style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "1rem", paddingBottom: "1rem", fontSize: "0.875rem", fontWeight: 500, color: "#ff914d" }}>
                        {formatISK(row.paidToMama)}
                      </td>
                      <td style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "1rem", paddingBottom: "1rem", fontSize: "0.875rem", fontWeight: 500, color: "#c0b4a8" }}>
                        {row.paymentCount}
                      </td>
                      <td style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "1rem", paddingBottom: "1rem", fontSize: "0.875rem", color: "#c0b4a8" }}>
                        {row.lastEventDate
                          ? format(new Date(row.lastEventDate), "PPP")
                          : "—"}
                      </td>
                      <td style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "1rem", paddingBottom: "1rem", textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedHostEmail(row.hostEmail);
                            setExpandedEventId(row.events[0]?.id || null);
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            borderRadius: "0.75rem",
                            background: "#ff914d",
                            paddingLeft: "0.75rem",
                            paddingRight: "0.75rem",
                            paddingTop: "0.5rem",
                            paddingBottom: "0.5rem",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "#000",
                            border: "none",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = "0.9";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = "1";
                          }}
                        >
                          View details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredHostRows.length > visibleHostCount ? (
                <div style={{ borderTop: "1px solid #3a2812", paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "1rem", paddingBottom: "1rem" }}>
                  <button
                    type="button"
                    onClick={() => setVisibleHostCount((prev) => prev + 8)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      borderRadius: "0.75rem",
                      border: "1px solid #3a2812",
                      background: "#241809",
                      paddingLeft: "1rem",
                      paddingRight: "1rem",
                      paddingTop: "0.5rem",
                      paddingBottom: "0.5rem",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#c0b4a8",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#2a1c0e";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#241809";
                    }}
                  >
                    See more hosts
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: "2.5rem",
            borderRadius: "1.5rem",
            border: "1px solid #3a2812",
            background: "#241809",
            boxShadow: "0 2px 20px rgba(0,0,0,0.28)",
          }}
        >
          <div style={{ borderBottom: "1px solid #3a2812", paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "1.25rem", paddingBottom: "1.25rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#f0ebe3" }}>
                  Most recent past events
                </h2>
                <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "#9a8e82" }}>
                  Keep the latest completed events visible so you can quickly open one
                  and register a payment to Mama.
                </p>
              </div>
              <p style={{ fontSize: "0.875rem", color: "#9a8e82" }}>
                {recentPastEvents.length} of {allRecentPastEvents.length} event
                {allRecentPastEvents.length === 1 ? "" : "s"} shown
              </p>
            </div>
          </div>

          {recentPastEvents.length === 0 ? (
            <div style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "4rem", paddingBottom: "4rem", textAlign: "center" }}>
              <p style={{ fontSize: "1.125rem", fontWeight: 500, color: "#f0ebe3" }}>
                No past events match these filters
              </p>
              <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#9a8e82" }}>
                Try switching the event scope to `All events` or widening the date range.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1rem", padding: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
              {recentPastEvents.map((event) => (
                <div
                  key={`recent-${event.id}`}
                  style={{
                    borderRadius: "1rem",
                    border: "1px solid #3a2812",
                    background: "#1c1208",
                    paddingLeft: "1.25rem",
                    paddingRight: "1.25rem",
                    paddingTop: "1.25rem",
                    paddingBottom: "1.25rem",
                    boxShadow: "0 2px 20px rgba(0,0,0,0.28)",
                  }}
                >
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
                        <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#f0ebe3" }}>
                          {event.name}
                        </h3>
                        {event.coHosted ? (
                          <span
                            style={{
                              borderRadius: "9999px",
                              background: "rgba(255,145,77,0.15)",
                              paddingLeft: "0.625rem",
                              paddingRight: "0.625rem",
                              paddingTop: "0.25rem",
                              paddingBottom: "0.25rem",
                              fontSize: "0.75rem",
                              fontWeight: 500,
                              color: "#ff914d",
                            }}
                          >
                            Co-hosted
                          </span>
                        ) : null}
                      </div>
                      <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "#9a8e82" }}>
                        {event.date ? format(new Date(event.date), "PPP p") : "No date"}
                      </p>
                      <div style={{ marginTop: "0.75rem", display: "grid", gap: "0.25rem", fontSize: "0.875rem", color: "#c0b4a8" }}>
                        <p>
                          <span style={{ fontWeight: 500, color: "#f0ebe3" }}>Primary host:</span>{" "}
                          {hostNameByEmail.get(String(event.host || "").toLowerCase()) ||
                            event.host ||
                            "—"}
                        </p>
                        {event.host_secondary ? (
                          <p>
                            <span style={{ fontWeight: 500, color: "#f0ebe3" }}>Co-host:</span>{" "}
                            {hostNameByEmail.get(
                              String(event.host_secondary || "").toLowerCase()
                            ) || event.host_secondary}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", textAlign: "right" }}>
                      <div>
                        <p style={{ fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7a6a5a" }}>
                          Paid
                        </p>
                        <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", fontWeight: 600, color: "#ff914d" }}>
                          {formatISK(event.paidToMama)}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7a6a5a" }}>
                          Revenue
                        </p>
                        <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", fontWeight: 600, color: "#f0ebe3" }}>
                          {formatISK(event.grossRevenue)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={() => openEventInDrawer(event)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        borderRadius: "0.75rem",
                        background: "#ff914d",
                        paddingLeft: "1rem",
                        paddingRight: "1rem",
                        paddingTop: "0.5rem",
                        paddingBottom: "0.5rem",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "#000",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "0.9";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "1";
                      }}
                    >
                      Open event here
                    </button>
                    <Link
                      href={`/admin/manage-events/${event.id}/payments`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        borderRadius: "0.75rem",
                        border: "1px solid #3a2812",
                        background: "#241809",
                        paddingLeft: "1rem",
                        paddingRight: "1rem",
                        paddingTop: "0.5rem",
                        paddingBottom: "0.5rem",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "#c0b4a8",
                        textDecoration: "none",
                        transition: "all 0.2s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#2a1c0e";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#241809";
                      }}
                    >
                      Payment page
                    </Link>
                  </div>
                </div>
              ))}
              {allRecentPastEvents.length > visibleRecentEventCount ? (
                <div style={{ gridColumn: "1 / -1" }}>
                  <button
                    type="button"
                    onClick={() => setVisibleRecentEventCount((prev) => prev + 8)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      borderRadius: "0.75rem",
                      border: "1px solid #3a2812",
                      background: "#241809",
                      paddingLeft: "1rem",
                      paddingRight: "1rem",
                      paddingTop: "0.5rem",
                      paddingBottom: "0.5rem",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#c0b4a8",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#2a1c0e";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#241809";
                    }}
                  >
                    See more recent events
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {selectedHost ? (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              display: "flex",
              justifyContent: "flex-end",
              background: "rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                height: "100%",
                width: "100%",
                maxWidth: "48rem",
                overflowY: "auto",
                background: "#241809",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.9)",
              }}
            >
              <div
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  borderBottom: "1px solid #3a2812",
                  background: "#241809",
                  paddingLeft: "1.5rem",
                  paddingRight: "1.5rem",
                  paddingTop: "1.25rem",
                  paddingBottom: "1.25rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                  <div>
                    <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ff914d" }}>
                      Host detail
                    </p>
                    <h3 style={{ marginTop: "0.25rem", fontSize: "1.5rem", fontWeight: 600, color: "#f0ebe3" }}>
                      {hostNameByEmail.get(selectedHost.hostEmail) ||
                        selectedHost.hostEmail}
                    </h3>
                    {hostNameByEmail.get(selectedHost.hostEmail) ? (
                      <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "#9a8e82" }}>
                        {selectedHost.hostEmail}
                      </p>
                    ) : null}
                    <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#9a8e82" }}>
                      Full co-hosted event values are shown here for operational
                      tracking. This view focuses on revenue, recorded payments to
                      Mama, and payment history.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedHostEmail(null)}
                    style={{
                      borderRadius: "0.75rem",
                      border: "1px solid #3a2812",
                      background: "transparent",
                      padding: "0.5rem",
                      color: "#9a8e82",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#2a1c0e";
                      e.currentTarget.style.color = "#f0ebe3";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#9a8e82";
                    }}
                  >
                    <XMarkIcon style={{ width: "1.25rem", height: "1.25rem" }} />
                  </button>
                </div>
              </div>

              <div style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "1.5rem", paddingBottom: "1.5rem" }}>
                <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                  <div style={{ borderRadius: "1rem", background: "#1c1208", padding: "1rem" }}>
                    <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a8e82" }}>
                      Events
                    </p>
                    <p style={{ marginTop: "0.5rem", fontSize: "1.5rem", fontWeight: 600, color: "#f0ebe3" }}>
                      {selectedHost.eventCount}
                    </p>
                  </div>
                  <div style={{ borderRadius: "1rem", background: "rgba(255,145,77,0.15)", padding: "1rem" }}>
                    <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ff914d" }}>
                      Paid to Mama
                    </p>
                    <p style={{ marginTop: "0.5rem", fontSize: "1.5rem", fontWeight: 600, color: "#ff914d" }}>
                      {formatISK(selectedHost.paidToMama)}
                    </p>
                  </div>
                  <div style={{ borderRadius: "1rem", background: "#1c1208", padding: "1rem" }}>
                    <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a8e82" }}>
                      Total Revenue
                    </p>
                    <p style={{ marginTop: "0.5rem", fontSize: "1.5rem", fontWeight: 600, color: "#f0ebe3" }}>
                      {formatISK(selectedHost.grossRevenue)}
                    </p>
                  </div>
                  <div style={{ borderRadius: "1rem", background: "#1c1208", padding: "1rem" }}>
                    <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a8e82" }}>
                      Co-hosted events
                    </p>
                    <p style={{ marginTop: "0.5rem", fontSize: "1.5rem", fontWeight: 600, color: "#f0ebe3" }}>
                      {selectedHost.coHostedCount}
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: "2rem", display: "grid", gap: "1rem" }}>
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
                        style={{
                          overflow: "hidden",
                          borderRadius: "1rem",
                          border: "1px solid #3a2812",
                          background: "#1c1208",
                          boxShadow: "0 2px 20px rgba(0,0,0,0.28)",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedEventId((prev) =>
                              prev === event.id ? null : event.id
                            )
                          }
                          style={{
                            width: "100%",
                            paddingLeft: "1.25rem",
                            paddingRight: "1.25rem",
                            paddingTop: "1rem",
                            paddingBottom: "1rem",
                            textAlign: "left",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#2a1c0e";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
                                <h4 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#f0ebe3" }}>
                                  {event.name}
                                </h4>
                                <span
                                  style={{
                                    borderRadius: "9999px",
                                    background: "#2a1c0e",
                                    paddingLeft: "0.625rem",
                                    paddingRight: "0.625rem",
                                    paddingTop: "0.25rem",
                                    paddingBottom: "0.25rem",
                                    fontSize: "0.75rem",
                                    fontWeight: 500,
                                    color: "#c0b4a8",
                                  }}
                                >
                                  {event.hostRole === "secondary"
                                    ? "Co-hosted"
                                    : "Primary host"}
                                </span>
                                {event.coHosted ? (
                                  <span
                                    style={{
                                      borderRadius: "9999px",
                                      background: "rgba(255,145,77,0.15)",
                                      paddingLeft: "0.625rem",
                                      paddingRight: "0.625rem",
                                      paddingTop: "0.25rem",
                                      paddingBottom: "0.25rem",
                                      fontSize: "0.75rem",
                                      fontWeight: 500,
                                      color: "#ff914d",
                                    }}
                                  >
                                    Shared event
                                  </span>
                                ) : null}
                              </div>
                              <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "#9a8e82" }}>
                                {event.date
                                  ? format(new Date(event.date), "PPP p")
                                  : "No date"}
                              </p>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "0.75rem" }}>
                              <div>
                                <p style={{ fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7a6a5a" }}>
                                  Revenue
                                </p>
                                <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", fontWeight: 600, color: "#f0ebe3" }}>
                                  {formatISK(event.grossRevenue)}
                                </p>
                              </div>
                              <div>
                                <p style={{ fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7a6a5a" }}>
                                  Paid
                                </p>
                                <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", fontWeight: 600, color: "#ff914d" }}>
                                  {formatISK(event.paidToMama)}
                                </p>
                              </div>
                              <div>
                                <p style={{ fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7a6a5a" }}>
                                  Payment entries
                                </p>
                                <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", fontWeight: 600, color: "#f0ebe3" }}>
                                  {event.paymentCount}
                                </p>
                              </div>
                              <div>
                                <p style={{ fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7a6a5a" }}>
                                  Tickets
                                </p>
                                <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", fontWeight: 600, color: "#f0ebe3" }}>
                                  {event.ticketCount}
                                </p>
                              </div>
                            </div>
                          </div>
                        </button>

                        {isExpanded ? (
                          <div style={{ borderTop: "1px solid #3a2812", background: "#1c1208", paddingLeft: "1.25rem", paddingRight: "1.25rem", paddingTop: "1.25rem", paddingBottom: "1.25rem" }}>
                            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                              <div style={{ borderRadius: "1rem", background: "#241809", padding: "1rem", border: "1px solid #3a2812", boxShadow: "0 2px 20px rgba(0,0,0,0.28)" }}>
                                <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a8e82" }}>
                                  Gross event revenue
                                </p>
                                <p style={{ marginTop: "0.5rem", fontSize: "1.25rem", fontWeight: 600, color: "#f0ebe3" }}>
                                  {formatISK(event.grossRevenue)}
                                </p>
                              </div>
                              <div style={{ borderRadius: "1rem", background: "#241809", padding: "1rem", border: "1px solid #3a2812", boxShadow: "0 2px 20px rgba(0,0,0,0.28)" }}>
                                <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a8e82" }}>
                                  Paid to Mama
                                </p>
                                <p style={{ marginTop: "0.5rem", fontSize: "1.25rem", fontWeight: 600, color: "#ff914d" }}>
                                  {formatISK(event.paidToMama)}
                                </p>
                              </div>
                              <div style={{ borderRadius: "1rem", background: "#241809", padding: "1rem", border: "1px solid #3a2812", boxShadow: "0 2px 20px rgba(0,0,0,0.28)" }}>
                                <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a8e82" }}>
                                  Tickets
                                </p>
                                <p style={{ marginTop: "0.5rem", fontSize: "1.25rem", fontWeight: 600, color: "#f0ebe3" }}>
                                  {event.ticketCount}
                                </p>
                              </div>
                              <div style={{ borderRadius: "1rem", background: "#241809", padding: "1rem", border: "1px solid #3a2812", boxShadow: "0 2px 20px rgba(0,0,0,0.28)" }}>
                                <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a8e82" }}>
                                  Payment entries
                                </p>
                                <p style={{ marginTop: "0.5rem", fontSize: "1.25rem", fontWeight: 600, color: "#f0ebe3" }}>
                                  {event.paymentCount}
                                </p>
                              </div>
                            </div>

                            <div style={{ marginTop: "1.25rem", display: "grid", gap: "1.25rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                              <div style={{ borderRadius: "1rem", background: "#241809", padding: "1.25rem", border: "1px solid #3a2812", boxShadow: "0 2px 20px rgba(0,0,0,0.28)" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                                  <div>
                                    <h5 style={{ fontSize: "1rem", fontWeight: 600, color: "#f0ebe3" }}>
                                      Payment history
                                    </h5>
                                    <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "#9a8e82" }}>
                                      Each entry is an amount that the host has paid
                                      to Mama for this event.
                                    </p>
                                  </div>
                                  <Link
                                    href={`/admin/manage-events/${event.id}/payments`}
                                    style={{
                                      borderRadius: "0.75rem",
                                      border: "1px solid #3a2812",
                                      paddingLeft: "0.75rem",
                                      paddingRight: "0.75rem",
                                      paddingTop: "0.5rem",
                                      paddingBottom: "0.5rem",
                                      fontSize: "0.875rem",
                                      fontWeight: 600,
                                      color: "#c0b4a8",
                                      textDecoration: "none",
                                      transition: "all 0.2s",
                                      cursor: "pointer",
                                      display: "inline-block",
                                      background: "transparent",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = "#2a1c0e";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = "transparent";
                                    }}
                                  >
                                    Open payment page
                                  </Link>
                                </div>

                                {event.payments.length === 0 ? (
                                  <div style={{ marginTop: "1rem", borderRadius: "1rem", border: "1px dashed #3a2812", background: "#1c1208", padding: "1.25rem", fontSize: "0.875rem", color: "#9a8e82" }}>
                                    No payments recorded yet for this event.
                                  </div>
                                ) : (
                                  <ul style={{ marginTop: "1rem", display: "grid", gap: "0.75rem" }}>
                                    {event.payments.map((payment) => (
                                      <PaymentHistoryItem
                                        key={payment.id}
                                        payment={payment}
                                      />
                                    ))}
                                  </ul>
                                )}
                              </div>

                              <div style={{ display: "grid", gap: "1.25rem" }}>
                                <div style={{ borderRadius: "1rem", background: "#241809", padding: "1.25rem", border: "1px solid #3a2812", boxShadow: "0 2px 20px rgba(0,0,0,0.28)" }}>
                                  <h5 style={{ fontSize: "1rem", fontWeight: 600, color: "#f0ebe3" }}>
                                    Sales snapshot
                                  </h5>
                                  <div style={{ marginTop: "1rem", display: "grid", gap: "0.75rem" }}>
                                    {Object.keys(event.statusBreakdown).length === 0 ? (
                                      <p style={{ fontSize: "0.875rem", color: "#9a8e82" }}>
                                        No ticket revenue found for this event.
                                      </p>
                                    ) : (
                                      Object.entries(event.statusBreakdown).map(
                                        ([status, values]) => (
                                          <div
                                            key={status}
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "space-between",
                                              borderRadius: "0.75rem",
                                              background: "#1c1208",
                                              paddingLeft: "0.75rem",
                                              paddingRight: "0.75rem",
                                              paddingTop: "0.5rem",
                                              paddingBottom: "0.5rem",
                                            }}
                                          >
                                            <div>
                                              <p style={{ fontSize: "0.875rem", fontWeight: 500, textTransform: "capitalize", color: "#f0ebe3" }}>
                                                {status}
                                              </p>
                                              <p style={{ fontSize: "0.75rem", color: "#9a8e82" }}>
                                                {values.tickets} tickets
                                              </p>
                                            </div>
                                            <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#f0ebe3" }}>
                                              {formatISK(values.revenue)}
                                            </p>
                                          </div>
                                        )
                                      )
                                    )}
                                  </div>
                                </div>

                                <div style={{ borderRadius: "1rem", background: "#241809", padding: "1.25rem", border: "1px solid #3a2812", boxShadow: "0 2px 20px rgba(0,0,0,0.28)" }}>
                                  <h5 style={{ fontSize: "1rem", fontWeight: 600, color: "#f0ebe3" }}>
                                    Record a new payment
                                  </h5>
                                  <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "#9a8e82" }}>
                                    Add the amount the host paid to Mama so the
                                    ledger stays up to date.
                                  </p>

                                  <div style={{ marginTop: "1rem", display: "grid", gap: "0.75rem" }}>
                                    <div>
                                      <label style={{ marginBottom: "0.25rem", display: "block", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a8e82" }}>
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
                                        style={{
                                          width: "100%",
                                          borderRadius: "0.75rem",
                                          border: "1px solid #3a2812",
                                          background: "#17100a",
                                          paddingLeft: "0.75rem",
                                          paddingRight: "0.75rem",
                                          paddingTop: "0.625rem",
                                          paddingBottom: "0.625rem",
                                          fontSize: "0.875rem",
                                          color: "#f0ebe3",
                                          outline: "none",
                                        }}
                                        placeholder="e.g. 25000"
                                        onFocus={(e) => {
                                          e.currentTarget.style.borderColor = "#ff914d";
                                        }}
                                        onBlur={(e) => {
                                          e.currentTarget.style.borderColor = "#3a2812";
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <label style={{ marginBottom: "0.25rem", display: "block", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a8e82" }}>
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
                                        style={{
                                          width: "100%",
                                          borderRadius: "0.75rem",
                                          border: "1px solid #3a2812",
                                          background: "#17100a",
                                          paddingLeft: "0.75rem",
                                          paddingRight: "0.75rem",
                                          paddingTop: "0.625rem",
                                          paddingBottom: "0.625rem",
                                          fontSize: "0.875rem",
                                          color: "#f0ebe3",
                                          outline: "none",
                                          fontFamily: "inherit",
                                          resize: "vertical",
                                        }}
                                        placeholder="Optional note, transfer reference, or context"
                                        onFocus={(e) => {
                                          e.currentTarget.style.borderColor = "#ff914d";
                                        }}
                                        onBlur={(e) => {
                                          e.currentTarget.style.borderColor = "#3a2812";
                                        }}
                                      />
                                    </div>
                                    {draft.error ? (
                                      <p style={{ fontSize: "0.875rem", color: "rgba(255, 107, 107, 1)" }}>
                                        {draft.error}
                                      </p>
                                    ) : null}
                                    <button
                                      type="button"
                                      onClick={() => handleAddPayment(event.id)}
                                      disabled={draft.saving}
                                      style={{
                                        width: "100%",
                                        borderRadius: "0.75rem",
                                        background: "#ff914d",
                                        paddingLeft: "1rem",
                                        paddingRight: "1rem",
                                        paddingTop: "0.625rem",
                                        paddingBottom: "0.625rem",
                                        fontSize: "0.875rem",
                                        fontWeight: 600,
                                        color: "#000",
                                        border: "none",
                                        cursor: draft.saving ? "not-allowed" : "pointer",
                                        opacity: draft.saving ? 0.6 : 1,
                                        transition: "all 0.2s",
                                      }}
                                      onMouseEnter={(e) => {
                                        if (!draft.saving) e.currentTarget.style.opacity = "0.9";
                                      }}
                                      onMouseLeave={(e) => {
                                        if (!draft.saving) e.currentTarget.style.opacity = "1";
                                      }}
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
    </div>
  );
}
