"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/util/supabase/client";
import { PropagateLoader } from "react-spinners";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/20/solid";

export default function Attendance() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState("");
  const [eventDetails, setEventDetails] = useState(null);
  const params = useParams();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // First get the event id and details for the given slug
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("id, name, date")
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
            created_at
          `
          )
          .eq("event_id", eventData.id)
          .in("status", ["paid", "door"])
          .order("created_at", { ascending: false });

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
  }, [params.slug]);

  const handleToggleUsed = async (ticketId, currentUsed) => {
    if (!ticketId) return;

    try {
      const { error } = await supabase
        .from("tickets")
        .update({ used: !currentUsed })
        .eq("id", ticketId)
        .select();

      if (error) throw error;

      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, used: !ticket.used } : ticket
        )
      );
    } catch (err) {
      console.error("Error updating ticket status:", err);
      setError("Failed to update ticket status. Please try again.");
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

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">
            Ticket Sales
          </h1>
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
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={ticket.used || false}
                          onChange={() =>
                            handleToggleUsed(ticket.id, ticket.used)
                          }
                          className={`h-5 w-5 sm:h-6 sm:w-6 rounded-full cursor-pointer transition-all duration-300
                            ${
                              ticket.used
                                ? "bg-[#ff914d] border-transparent ring-[#ff914d]"
                                : "bg-white border-gray-300 hover:border-[#ff914d] ring-[#ff914d]"
                            } 
                            border-2 ring-2 ring-offset-2 appearance-none checked:bg-[#ff914d] 
                            relative after:content-[''] after:absolute after:left-1/2 after:top-1/2 
                            after:-translate-x-1/2 after:-translate-y-1/2 after:w-2 after:h-2 
                            after:border-white after:border-b-2 after:border-r-2 after:rotate-45
                            checked:after:block after:hidden`}
                          aria-label={`Mark ticket for ${
                            ticket.buyer_name
                          } as ${ticket.used ? "unused" : "used"}`}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {ticket.buyer_name}
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
                        {ticket.status === "paid" ? (
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

          {tickets.length === 0 && (
            <div className="text-center py-12 px-4" role="status">
              <div className="text-gray-500 text-lg">
                No tickets have been sold yet.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
