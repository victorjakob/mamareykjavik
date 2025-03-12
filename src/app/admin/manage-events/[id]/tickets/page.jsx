"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/util/supabase/client";
import { PropagateLoader } from "react-spinners";

export default function ViewTickets() {
  const params = useParams();
  const { id } = params;
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data, error } = await supabase
          .from("tickets")
          .select("*")
          .eq("event_id", id)
          .eq("status", "paid"); // Only fetch paid tickets

        if (error) throw error;
        setTickets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PropagateLoader color="#4F46E5" size={12} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-700">Error loading tickets: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Paid Tickets for Event</h1>

        {tickets.length === 0 ? (
          <p className="text-gray-500">No paid tickets found for this event</p>
        ) : (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="border rounded-lg p-4">
                <p className="font-semibold">Ticket ID: {ticket.id}</p>
                <p>Buyer Email: {ticket.buyer_email}</p>
                <p>Order ID: {ticket.order_id}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
