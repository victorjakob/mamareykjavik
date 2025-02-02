"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PropagateLoader } from "react-spinners";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/20/solid";

export default function Attendance() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useParams();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data, error } = await supabase
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
            event_id (
              slug
            )
          `
          )
          .eq("event_id.slug", params.slug)
          .in("status", ["paid", "door"])
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTickets(data || []);
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
    <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-4xl  font-bold text-gray-900 mb-8 text-right sm:text-center">
          Ticket Sales
        </h1>

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
