"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { PropagateLoader } from "react-spinners";
import { motion } from "framer-motion";

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPastEvents, setShowPastEvents] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [showPastEvents]);

  const fetchEvents = async () => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("date", showPastEvents ? "1970-01-01" : now)
        .lt("date", showPastEvents ? now : "2100-01-01")
        .order("date", { ascending: showPastEvents ? false : true });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        setLoading(true);
        // Delete associated tickets first
        const { error: ticketsError } = await supabase
          .from("tickets")
          .delete()
          .eq("event_id", id);

        if (ticketsError) throw ticketsError;

        // Then delete the event
        const { error: eventError } = await supabase
          .from("events")
          .delete()
          .eq("id", id);

        if (eventError) throw eventError;

        await fetchEvents();
      } catch (err) {
        setError(err.message);
        console.error("Error deleting event:", err);
      } finally {
        setLoading(false);
      }
    }
  };

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
            <p className="text-red-700">Error loading events: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-48 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">Manage Events</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowPastEvents(!showPastEvents)}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition whitespace-nowrap"
            >
              {showPastEvents ? "Show Upcoming Events" : "Show Past Events"}
            </button>
            <Link
              href="/admin/create-event"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-center"
            >
              Create New Event
            </Link>
          </div>
        </div>

        <div className="grid gap-6">
          {events.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No {showPastEvents ? "past" : "upcoming"} events found
            </p>
          ) : (
            events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-6 flex flex-col md:flex-row gap-6 bg-white shadow-sm"
              >
                <div className="relative w-full md:w-48 h-32">
                  <Image
                    src={event.image || "https://placehold.co/600x400"}
                    alt={event.name}
                    fill
                    className="rounded-md object-cover"
                    sizes="(max-width: 768px) 100vw, 192px"
                  />
                </div>
                <div className="flex-grow">
                  <h2 className="text-xl font-semibold">{event.name}</h2>
                  <p className="text-gray-600 mt-2">
                    {format(new Date(event.date), "MMMM d, yyyy - h:mm a")}
                  </p>
                  <p className="text-gray-600 mt-1">
                    Duration: {event.duration} hours
                  </p>
                  <p className="text-gray-600 mt-1">Price: {event.price} kr</p>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <Link
                      href={`/admin/manage-events/${event.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/admin/manage-events/${event.id}/tickets`}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                    >
                      Manage Tickets
                    </Link>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
