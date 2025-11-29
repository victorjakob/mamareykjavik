"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/util/supabase/client";
import { PropagateLoader } from "react-spinners";
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/20/solid";
import { formatPrice } from "@/util/IskFormat";
import Link from "next/link";

export default function Attendance() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState("");
  const [eventDetails, setEventDetails] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isMarkingSoldOut, setIsMarkingSoldOut] = useState(false);
  const [showSoldOutConfirm, setShowSoldOutConfirm] = useState(false);
  const [sortBy, setSortBy] = useState("buyer_name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const params = useParams();

  // Filter tickets based on search query (case-insensitive)
  const filteredTickets = tickets.filter((ticket) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const name = (ticket.buyer_name || "").toLowerCase();
    const email = (ticket.buyer_email || "").toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  useEffect(() => {
    // sKeyboard shortcut for faster checking (Ctrl/Cmd + Enter to check first unchecked ticket)
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        // Compute filtered tickets inline for the keyboard shortcut
        const filtered = tickets.filter((ticket) => {
          if (!searchQuery.trim()) return true;
          const query = searchQuery.toLowerCase();
          const name = (ticket.buyer_name || "").toLowerCase();
          const email = (ticket.buyer_email || "").toLowerCase();
          return name.includes(query) || email.includes(query);
        });
        const firstUnchecked = filtered.find((ticket) => !ticket.used);
        if (firstUnchecked) {
          handleToggleUsed(firstUnchecked.id, firstUnchecked.used);
        }
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [tickets, searchQuery]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // First get the event id and details for the given slug
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("id, name, date, sold_out")
          .eq("slug", params.slug)
          .single();

        if (eventError) throw eventError;
        if (!eventData) throw new Error("Event not found");

        setEventDetails(eventData);

        // Then get tickets for that specific event
        const { data: ticketsData, error: ticketsError } = await supabase
          .from("tickets")
          .select(
            `
            id,
            buyer_email,
            buyer_name,
            quantity,
            status,
            used,
            created_at,
            variant_name,
            price,
            total_price
          `
          )
          .eq("event_id", eventData.id)
          .in("status", ["paid", "door", "cash", "card", "transfer"])
          .order(sortBy, { ascending: sortOrder === "asc" });

        if (ticketsError) throw ticketsError;
        setTickets(ticketsData || []);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching tickets:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [params.slug, sortBy, sortOrder]);

  const handleToggleUsed = async (ticketId, currentUsed) => {
    if (!ticketId) return;

    // Immediate visual feedback - optimistic update
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, used: !ticket.used } : ticket
      )
    );

    // Update database in background
    try {
      const { error } = await supabase
        .from("tickets")
        .update({ used: !currentUsed })
        .eq("id", ticketId);

      if (error) {
        // Revert on error
        setTickets((prevTickets) =>
          prevTickets.map((ticket) =>
            ticket.id === ticketId ? { ...ticket, used: currentUsed } : ticket
          )
        );
        console.error("Error updating ticket status:", error);
        // Don't show error to user in fast-paced environment
      }
    } catch (err) {
      // Revert on error
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, used: currentUsed } : ticket
        )
      );
      console.error("Error updating ticket status:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }

    try {
      setIsSending(true);
      const buyerEmails = tickets.map((ticket) => ticket.buyer_email);

      const response = await fetch("/api/sendgrid/message-attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buyerEmails: buyerEmails,
          message: message,
          eventName: eventDetails.name,
          eventDate: eventDetails.date,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      alert("Message sent successfully to all attendees!");
      setShowMessageModal(false);
      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleMarkSoldOut = async () => {
    if (!eventDetails) return;
    setIsMarkingSoldOut(true);
    try {
      const response = await fetch("/api/events/sold-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: eventDetails.id }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to mark as sold out");
      }
      const { event } = await response.json();
      setEventDetails((prev) => ({ ...prev, sold_out: event.sold_out }));
      alert("Event marked as sold out!");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsMarkingSoldOut(false);
      setShowSoldOutConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <PropagateLoader color="#ff914d" size={15} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-lg p-8 bg-white rounded-xl shadow-lg">
          <div className="text-center text-red-600 font-medium" role="alert">
            <XCircleIcon className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p>Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-8 px-4 mt-20 sm:px-6 md:mt-40 lg:px-8">
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-medium mb-4">
              Message to All Attendees
            </h3>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-40 p-2 border rounded-md mb-4 focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
              placeholder="Enter your message here..."
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setMessage("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={isSending}
                className={`px-4 py-2 rounded-md text-white font-medium transition-all duration-300
                  ${
                    isSending
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#ff914d] hover:bg-[#ff8033] active:bg-[#ff6f1a]"
                  }`}
              >
                {isSending ? "Sending..." : "Send Message"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Ticket Details</h3>
            <div className="mb-2">
              <strong>Name:</strong> {selectedTicket.buyer_name}
            </div>
            <div className="mb-2">
              <strong>Email:</strong> {selectedTicket.buyer_email}
            </div>
            <div className="mb-2">
              <strong>Quantity:</strong> {selectedTicket.quantity}
            </div>
            <div className="mb-2">
              <strong>Status:</strong> {selectedTicket.status}
            </div>
            <div className="mb-2">
              <strong>Variant:</strong> {selectedTicket.variant_name || "N/A"}
            </div>
            <div className="mb-2">
              <strong>Price:</strong>{" "}
              {selectedTicket.price !== null &&
              selectedTicket.price !== undefined
                ? formatPrice(selectedTicket.price)
                : "N/A"}
            </div>
            <div className="mb-2">
              <strong>Total Price:</strong>{" "}
              {selectedTicket.total_price !== null &&
              selectedTicket.total_price !== undefined
                ? formatPrice(selectedTicket.total_price)
                : "N/A"}
            </div>
            <div className="mb-2">
              <strong>Purchase Date:</strong>{" "}
              {selectedTicket.created_at
                ? new Date(selectedTicket.created_at).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )
                : "N/A"}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-md bg-[#ff914d] text-white font-medium hover:bg-[#ff8033]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showSoldOutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4 text-red-600">
              Are you sure?
            </h3>
            <p className="mb-6">
              Are you sure you want to stop ticket sales and mark the event as
              sold out? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowSoldOutConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkSoldOut}
                disabled={isMarkingSoldOut}
                className={`px-4 py-2 rounded-md text-white font-medium transition-all duration-300
                  ${
                    isMarkingSoldOut
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
              >
                {isMarkingSoldOut ? "Marking..." : "Yes, Mark as Sold Out"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">
            Ticket Sales
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowMessageModal(true)}
              disabled={tickets.length === 0}
              className={`px-4 py-2 rounded-md text-white font-medium transition-all duration-300
                ${
                  tickets.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#ff914d] hover:bg-[#ff8033] active:bg-[#ff6f1a]"
                }`}
            >
              Message All Attendees
            </button>
            <button
              onClick={() => setShowSoldOutConfirm(true)}
              disabled={
                isMarkingSoldOut || (eventDetails && eventDetails.sold_out)
              }
              className={`px-4 py-2 rounded-md text-white font-medium transition-all duration-300
                ${
                  eventDetails && eventDetails.sold_out
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 active:bg-red-800"
                }`}
            >
              {eventDetails && eventDetails.sold_out
                ? "Event is Sold Out"
                : isMarkingSoldOut
                  ? "Marking..."
                  : "Mark as Sold Out"}
            </button>
            <Link
              href={`/events/manager/${params.slug}/sales-stats`}
              className="ml-4 px-4 py-2 rounded-md text-white font-medium bg-[#4f46e5] hover:bg-[#3730a3] transition-all duration-300"
            >
              View Sales Stats
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Total Tickets Sold
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {tickets.reduce((sum, ticket) => sum + ticket.quantity, 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Tickets Checked In
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {tickets
                .filter((ticket) => ticket.used)
                .reduce((sum, ticket) => sum + ticket.quantity, 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Tickets Remaining
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {tickets
                .filter((ticket) => !ticket.used)
                .reduce((sum, ticket) => sum + ticket.quantity, 0)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Sorting Controls */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Attendees ({filteredTickets.length}
                  {searchQuery && ` of ${tickets.length}`})
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    💡 Ctrl+Enter to check next ticket
                  </div>
                  <div className="flex items-center space-x-2">
                    <label
                      htmlFor="sort-select"
                      className="text-sm font-medium text-gray-700"
                    >
                      Sort by:
                    </label>
                    <select
                      id="sort-select"
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [newSortBy, newSortOrder] =
                          e.target.value.split("-");
                        setSortBy(newSortBy);
                        setSortOrder(newSortOrder);
                      }}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                    >
                      <option value="buyer_name-asc">Name (A-Z)</option>
                      <option value="buyer_name-desc">Name (Z-A)</option>
                      <option value="created_at-desc">Date (Newest)</option>
                      <option value="created_at-asc">Date (Oldest)</option>
                      <option value="buyer_email-asc">Email (A-Z)</option>
                      <option value="buyer_email-desc">Email (Z-A)</option>
                      <option value="quantity-desc">
                        Quantity (High to Low)
                      </option>
                      <option value="quantity-asc">
                        Quantity (Low to High)
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              {/* Search Input */}
              <div className="flex items-center space-x-2">
                <label
                  htmlFor="search-input"
                  className="text-sm font-medium text-gray-700 whitespace-nowrap"
                >
                  Search:
                </label>
                <input
                  id="search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                    aria-label="Clear search"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#ff914d]">
                <tr>
                  <th scope="col" className="px-4 py-4 sm:px-6 sm:py-3">
                    <span className="text-xs font-semibold text-white uppercase tracking-wider">
                      Used
                    </span>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-4 sm:px-6 sm:py-3 text-left"
                  >
                    <span className="text-xs font-semibold text-white uppercase tracking-wider">
                      Name
                    </span>
                  </th>
                  <th
                    scope="col"
                    className="hidden sm:table-cell px-6 py-3 text-left"
                  >
                    <span className="text-xs font-semibold text-white uppercase tracking-wider">
                      Email
                    </span>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-4 sm:px-6 sm:py-3 text-left"
                  >
                    <span className="text-xs font-semibold text-white uppercase tracking-wider">
                      Qty
                    </span>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-4 sm:px-6 sm:py-3 text-left"
                  >
                    <span className="text-xs font-semibold text-white uppercase tracking-wider">
                      Status
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className={`transition-all duration-150 ${
                      ticket.used
                        ? "bg-green-50 hover:bg-green-100 border-l-4 border-green-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={ticket.used || false}
                          onChange={() =>
                            handleToggleUsed(ticket.id, ticket.used)
                          }
                          className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg cursor-pointer transition-all duration-150 transform hover:scale-110 active:scale-95
                            ${
                              ticket.used
                                ? "bg-green-500 border-green-500 shadow-lg shadow-green-200"
                                : "bg-white border-2 border-gray-300 hover:border-green-400 hover:bg-green-50"
                            } 
                            appearance-none relative after:content-[''] after:absolute after:left-1/2 after:top-1/2 
                            after:-translate-x-1/2 after:-translate-y-1/2 after:w-4 after:h-4 
                            after:border-white after:border-b-2 after:border-r-2 after:rotate-45
                            checked:after:block after:hidden`}
                          aria-label={`Mark ticket for ${
                            ticket.buyer_name
                          } as ${ticket.used ? "unused" : "used"}`}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        {ticket.buyer_name}
                        <button
                          type="button"
                          onClick={() => setSelectedTicket(ticket)}
                          className="text-gray-400 hover:text-[#ff914d] focus:outline-none"
                          aria-label="Show ticket info"
                        >
                          <InformationCircleIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {ticket.buyer_email}
                      </div>
                    </td>
                    <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {ticket.quantity}
                      </div>
                    </td>
                    <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                      <div className="flex items-center">
                        {["paid", "cash", "card", "transfer"].includes(
                          ticket.status
                        ) ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircleIcon
                              className="h-4 w-4 mr-1"
                              aria-label="Paid"
                            />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircleIcon
                              className="h-4 w-4 mr-1"
                              aria-label="Not paid"
                            />
                            Unpaid
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-12 px-4" role="status">
              <div className="text-gray-500 text-lg">
                {searchQuery
                  ? "No tickets match your search."
                  : "No tickets have been sold yet."}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
