"use client";
import { useState, useCallback } from "react";
import { supabase } from "@/util/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { PropagateLoader } from "react-spinners";
import { motion } from "framer-motion";
import {
  ChevronRightIcon,
  ChartBarIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import FacebookLinkModal from "@/app/components/admin/FacebookLinkModal";

export default function ManageEvents({ initialEvents }) {
  const [events, setEvents] = useState(initialEvents);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [page, setPage] = useState(1);
  const [facebookModal, setFacebookModal] = useState({
    isOpen: false,
    eventId: null,
    eventName: "",
    currentLink: "",
  });
  const ITEMS_PER_PAGE = 10;

  // Filter events based on showPastEvents and sort past events by date
  const filteredEvents = events
    .filter((event) => (showPastEvents ? event.isPast : !event.isPast))
    .sort((a, b) => {
      if (showPastEvents) {
        return new Date(b.date) - new Date(a.date);
      }
      return new Date(a.date) - new Date(b.date);
    });

  // Paginate past events only
  const paginatedEvents = showPastEvents
    ? filteredEvents.slice(0, page * ITEMS_PER_PAGE)
    : filteredEvents;

  const hasMore =
    showPastEvents && filteredEvents.length > page * ITEMS_PER_PAGE;

  const openFacebookModal = (event) => {
    setFacebookModal({
      isOpen: true,
      eventId: event.id,
      eventName: event.name,
      currentLink: event.facebook_link || "",
    });
  };

  const closeFacebookModal = () => {
    setFacebookModal({
      isOpen: false,
      eventId: null,
      eventName: "",
      currentLink: "",
    });
  };

  const handleSaveFacebookLink = async (facebookLink) => {
    try {
      const response = await fetch("/api/events/update-facebook-link", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: facebookModal.eventId,
          facebookLink,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update Facebook link");
      }

      // Update the local events data
      const updatedEvents = events.map((event) =>
        event.id === facebookModal.eventId
          ? { ...event, facebook_link: facebookLink }
          : event
      );

      setEvents(updatedEvents);
    } catch (error) {
      setError(error.message || "Failed to update Facebook link");
    }
  };

  const handleDelete = useCallback(async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this event? Have you sent email to every attendee?"
      )
    ) {
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

        // Update local state
        setEvents((prevEvents) =>
          prevEvents.filter((event) => event.id !== id)
        );
      } catch (err) {
        setError(err.message);
        console.error("Error deleting event:", err);
      } finally {
        setLoading(false);
      }
    }
  }, []);

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
    <div>
      <div className="relative mb-10">
        <h1 className="leading-relaxed text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight text-center mb-6 sm:mb-0">
          Manage Your Events
        </h1>
        <div className="block sm:absolute sm:top-0 sm:right-0">
          <Link
            href="/admin/create-event"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-emerald-500 hover:bg-emerald-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Create New Event
            <ChevronRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => setShowPastEvents(!showPastEvents)}
          className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
            !showPastEvents
              ? "bg-indigo-500 text-white shadow-md hover:bg-indigo-600 hover:scale-105 ring-2 ring-indigo-500 ring-offset-2"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {showPastEvents ? "Show Upcoming Events" : "Show Past Events"}
        </button>
        <Link
          href="/admin/manage-events/statistics"
          className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-500 hover:bg-indigo-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          View Statistics
          <ChartBarIcon className="ml-2 h-5 w-5" />
        </Link>
      </div>

      <div className="grid gap-6">
        {paginatedEvents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No {showPastEvents ? "past" : "upcoming"} events found
          </p>
        ) : (
          <>
            {paginatedEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-xl p-6 flex flex-col md:flex-row gap-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="relative w-full md:w-48 h-32">
                  <Image
                    src={event.image || "https://placehold.co/600x400"}
                    alt={event.name}
                    fill
                    className="rounded-xl object-cover"
                    sizes="(max-width: 768px) 100vw, 192px"
                  />
                </div>
                <div className="flex-grow">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <span className="flex items-center gap-2">
                      {event.name}
                      <button
                        onClick={() => openFacebookModal(event)}
                        className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                          event.facebook_link
                            ? "text-blue-600 hover:bg-blue-50"
                            : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                        }`}
                        title={
                          event.facebook_link
                            ? "Edit Facebook link"
                            : "Add Facebook link"
                        }
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </button>
                    </span>
                    <a
                      href={`/events/${event.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center p-1 rounded-full hover:bg-gray-100 transition-colors duration-150"
                      aria-label="View Event"
                      title="View Event"
                    >
                      <EyeIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                    </a>
                    <a
                      href={`/events/manager/${event.slug}/edit`}
                      className="inline-flex items-center justify-center p-1 rounded-full hover:bg-gray-100 transition-colors duration-150"
                      aria-label="Edit Event"
                      title="Edit Event"
                    >
                      <PencilSquareIcon className="h-5 w-5 text-blue-500 hover:text-blue-700" />
                    </a>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="inline-flex items-center justify-center p-1 rounded-full hover:bg-gray-100 transition-colors duration-150"
                      aria-label="Delete Event"
                      title="Delete Event"
                      type="button"
                    >
                      <TrashIcon className="h-5 w-5 text-rose-500 hover:text-rose-700" />
                    </button>
                  </h2>
                  <p className="text-gray-600 mt-2">
                    {format(new Date(event.date), "MMMM d, yyyy - h:mm a")}
                  </p>
                  <p className="text-gray-600 mt-1">
                    Duration: {event.duration} hours
                  </p>
                  <p className="text-gray-600 mt-1">Price: {event.price} kr</p>
                  <p className="text-gray-600 mt-1">
                    Tickets Sold: {event.ticketCount}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <Link
                      href={`/events/manager/${event.slug}/attendance`}
                      className="px-4 py-2 bg-violet-500 text-white rounded-xl hover:bg-violet-600 hover:scale-105 transition-all duration-200"
                    >
                      Tickets Sales
                    </Link>
                    <Link
                      href={`/events/manager/${event.slug}/sales-stats`}
                      className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 hover:scale-105 transition-all duration-200"
                    >
                      Sales Stats
                    </Link>
                    <Link
                      href={`/admin/create-event?duplicate=${event.id}`}
                      className="px-4 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 hover:scale-105 transition-all duration-200"
                    >
                      Duplicate Event
                    </Link>
                    <Link
                      href={`/admin/manage-events/${event.id}/payments`}
                      className="px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 hover:scale-105 transition-all duration-200"
                    >
                      Payments
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}

            {showPastEvents && hasMore && (
              <button
                onClick={() => setPage((p) => p + 1)}
                className="mt-4 w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
              >
                Load More Past Events
              </button>
            )}
          </>
        )}
      </div>

      {/* Facebook Link Modal */}
      <FacebookLinkModal
        isOpen={facebookModal.isOpen}
        onClose={closeFacebookModal}
        eventName={facebookModal.eventName}
        currentFacebookLink={facebookModal.currentLink}
        onSave={handleSaveFacebookLink}
      />
    </div>
  );
}
