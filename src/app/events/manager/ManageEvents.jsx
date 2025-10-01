"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChevronRightIcon,
  TicketIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import FacebookLinkModal from "@/app/components/admin/FacebookLinkModal";

export default function ManageEvents({ initialData }) {
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [navigatingTo, setNavigatingTo] = useState(null);
  const [facebookModal, setFacebookModal] = useState({
    isOpen: false,
    eventId: null,
    eventName: "",
    currentLink: "",
  });
  const { events, user } = initialData;

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date();
    return {
      upcomingEvents: events.filter((event) => new Date(event.date) >= now),
      pastEvents: events.filter((event) => new Date(event.date) < now),
    };
  }, [events]);

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

      // Force a re-render by updating the parent component's data
      // This is a simple approach - in a real app you might use a state management solution
      window.location.reload();
    } catch (error) {
      throw error;
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900">
            Authentication Required
          </h2>
          <p className="text-gray-600">
            Please log in or register to manage your events.
          </p>
          <Link
            href="/auth"
            className="inline-block px-6 py-3 rounded-xl font-medium bg-[#ff914d] text-black hover:scale-105 transition-all duration-200"
          >
            Go to Login Page
          </Link>
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
        <div className="block sm:absolute sm:top-0 sm:right-0 w-full sm:w-auto relative">
          <Link
            href="/admin/create-event"
            onClick={() => setNavigatingTo("/admin/create-event")}
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-black bg-[#ff914d] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff914d] transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Create New Event
            <ChevronRightIcon className="ml-2 h-5 w-5" />
          </Link>

          {/* Loading Overlay */}
          {navigatingTo === "/admin/create-event" && (
            <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <motion.button
          onClick={() => setShowUpcoming(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
            showUpcoming
              ? "bg-[#ff914d] text-black shadow-md ring-2 ring-[#ff914d] ring-offset-2"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Upcoming ({upcomingEvents.length})
        </motion.button>
        <motion.button
          onClick={() => setShowUpcoming(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
            !showUpcoming
              ? "bg-[#ff914d] text-black shadow-md ring-2 ring-[#ff914d] ring-offset-2"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Past ({pastEvents.length})
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {(showUpcoming ? upcomingEvents : pastEvents).map((event) => (
            <motion.div
              key={event.id}
              layout
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100"
              whileHover={{ scale: 1.01 }}
            >
              <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8">
                <div className="w-full sm:w-1/3">
                  <div className="aspect-[3/2] relative rounded-xl overflow-hidden shadow-sm">
                    <Image
                      src={event.image || "https://placehold.co/600x400"}
                      alt={event.name}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 33vw"
                      priority={true}
                    />
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                        {event.name}
                      </h3>
                      <button
                        onClick={() => openFacebookModal(event)}
                        className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
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
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-gray-600 text-lg leading-relaxed line-clamp-2">
                      {event.shortdescription}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center text-gray-700">
                        <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
                        {format(new Date(event.date), "MMMM d, yyyy")}
                      </div>
                      <div className="flex items-center text-gray-700">
                        <ClockIcon className="h-5 w-5 mr-2 text-gray-400" />
                        {format(new Date(event.date), "h:mm a")}
                      </div>
                      {event.duration && (
                        <div className="flex items-center text-gray-700">
                          <svg
                            className="h-5 w-5 mr-2 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {Number(event.duration) % 1 === 0
                            ? event.duration
                            : parseFloat(event.duration).toFixed(1)}{" "}
                          Hours
                        </div>
                      )}
                      <div className="flex items-center text-gray-700">
                        <CurrencyDollarIcon className="h-5 w-5 mr-2 text-gray-400" />
                        {event.price} ISK
                      </div>
                      <div className="flex items-center text-gray-700 col-span-2">
                        <TicketIcon className="h-5 w-5 mr-2 text-gray-400" />
                        {event.ticketCount} Tickets Sold
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-6">
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      className="relative"
                    >
                      <Link
                        href={`/events/manager/${event.slug}/attendance`}
                        onClick={() =>
                          setNavigatingTo(
                            `/events/manager/${event.slug}/attendance`
                          )
                        }
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-2.5 text-black font-medium rounded-lg bg-[#ff914d] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff914d] transition-colors duration-200"
                      >
                        <TicketIcon className="mr-2 h-4 w-4" />
                        Ticket Sales
                      </Link>

                      {/* Loading Overlay */}
                      {navigatingTo ===
                        `/events/manager/${event.slug}/attendance` && (
                        <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                          <Loader2 className="h-5 w-5 text-white animate-spin" />
                        </div>
                      )}
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      className="relative"
                    >
                      <Link
                        href={`/events/manager/${event.slug}/sales-stats`}
                        onClick={() =>
                          setNavigatingTo(
                            `/events/manager/${event.slug}/sales-stats`
                          )
                        }
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                      >
                        Sales Stats
                      </Link>

                      {/* Loading Overlay */}
                      {navigatingTo ===
                        `/events/manager/${event.slug}/sales-stats` && (
                        <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                          <Loader2 className="h-5 w-5 text-white animate-spin" />
                        </div>
                      )}
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      className="relative"
                    >
                      <Link
                        href={`/events/manager/${event.slug}/edit`}
                        onClick={() =>
                          setNavigatingTo(`/events/manager/${event.slug}/edit`)
                        }
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium rounded-lg text-[#ff914d] bg-[#fff5ef] hover:bg-[#fff0e6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff914d] transition-colors duration-200"
                      >
                        Edit Event
                      </Link>

                      {/* Loading Overlay */}
                      {navigatingTo ===
                        `/events/manager/${event.slug}/edit` && (
                        <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                          <Loader2 className="h-5 w-5 text-orange-600 animate-spin" />
                        </div>
                      )}
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      className="relative"
                    >
                      <Link
                        href={`/events/${event.slug}`}
                        onClick={() => setNavigatingTo(`/events/${event.slug}`)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                      >
                        View Event
                      </Link>

                      {/* Loading Overlay */}
                      {navigatingTo === `/events/${event.slug}` && (
                        <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                          <Loader2 className="h-5 w-5 text-gray-700 animate-spin" />
                        </div>
                      )}
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      className="relative"
                    >
                      <Link
                        href={`/admin/create-event?duplicate=${event.id}`}
                        onClick={() =>
                          setNavigatingTo(
                            `/admin/create-event?duplicate=${event.id}`
                          )
                        }
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium rounded-lg text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200"
                      >
                        Duplicate Event
                      </Link>

                      {/* Loading Overlay */}
                      {navigatingTo ===
                        `/admin/create-event?duplicate=${event.id}` && (
                        <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                          <Loader2 className="h-5 w-5 text-white animate-spin" />
                        </div>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {(showUpcoming ? upcomingEvents : pastEvents).length === 0 && (
            <motion.div
              className="text-center py-16 bg-gray-50 rounded-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-4 text-gray-500 text-lg">
                No {showUpcoming ? "upcoming" : "past"} events found.
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

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
