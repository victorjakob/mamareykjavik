"use client";

import { useState } from "react";
import { Plus, Calendar, Edit, Trash2, Users, Clock } from "lucide-react";
import TourForm from "./TourForm";
import SessionForm from "./SessionForm";
import { formatPrice } from "@/util/IskFormat";

export default function TourDashboard({ initialTours }) {
  const [tours, setTours] = useState(initialTours);
  const [showTourForm, setShowTourForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleCreateTour = async (tourData) => {
    try {
      const res = await fetch("/api/tours/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tourData),
      });

      if (!res.ok) throw new Error("Failed to create tour");

      const { tour } = await res.json();
      setTours([tour, ...tours]);
      setShowTourForm(false);
    } catch (error) {
      console.error("Error creating tour:", error);
      alert("Failed to create tour");
    }
  };

  const handleUpdateTour = async (tourData) => {
    try {
      const res = await fetch("/api/tours/manage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...tourData, id: selectedTour.id }),
      });

      if (!res.ok) throw new Error("Failed to update tour");

      const { tour } = await res.json();
      setTours(tours.map((t) => (t.id === tour.id ? tour : t)));
      setShowTourForm(false);
      setSelectedTour(null);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating tour:", error);
      alert("Failed to update tour");
    }
  };

  const handleDeleteTour = async (tourId) => {
    if (!confirm("Are you sure you want to delete this tour?")) return;

    try {
      const res = await fetch(`/api/tours/manage?id=${tourId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete tour");

      setTours(tours.filter((t) => t.id !== tourId));
    } catch (error) {
      console.error("Error deleting tour:", error);
      alert("Failed to delete tour");
    }
  };

  const handleCreateSession = async (sessionData) => {
    try {
      const res = await fetch("/api/tours/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sessionData, tour_id: selectedTour.id }),
      });

      if (!res.ok) throw new Error("Failed to create session");

      const { session } = await res.json();
      setTours(
        tours.map((t) => {
          if (t.id === selectedTour.id) {
            return {
              ...t,
              tour_sessions: [...(t.tour_sessions || []), session],
            };
          }
          return t;
        })
      );
      setShowSessionForm(false);
      setSelectedTour(null);
    } catch (error) {
      console.error("Error creating session:", error);
      alert("Failed to create session");
    }
  };

  const getSessionCapacityInfo = (session) => {
    const ticketsSold =
      session.tour_bookings?.reduce(
        (acc, booking) => acc + (booking.number_of_tickets || 0),
        0
      ) || 0;
    return {
      sold: ticketsSold,
      total: session.available_spots,
      remaining: session.available_spots - ticketsSold,
    };
  };

  return (
    <div className="space-y-8">
      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => {
            setIsEditing(false);
            setSelectedTour(null);
            setShowTourForm(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create New Tour
        </button>
      </div>

      {/* Tour Form Modal */}
      {showTourForm && (
        <TourForm
          onSubmit={isEditing ? handleUpdateTour : handleCreateTour}
          onClose={() => {
            setShowTourForm(false);
            setSelectedTour(null);
            setIsEditing(false);
          }}
          initialData={selectedTour}
        />
      )}

      {/* Session Form Modal */}
      {showSessionForm && (
        <SessionForm
          onSubmit={handleCreateSession}
          onClose={() => {
            setShowSessionForm(false);
            setSelectedTour(null);
          }}
          tourMaxCapacity={selectedTour?.max_capacity}
        />
      )}

      {/* Tours List */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tours.map((tour) => (
          <div
            key={tour.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold text-gray-900">
                  {tour.name}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedTour(tour);
                      setIsEditing(true);
                      setShowTourForm(true);
                    }}
                    className="p-1 text-gray-400 hover:text-indigo-600"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTour(tour.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <p className="mt-2 text-gray-600 line-clamp-2">
                {tour.description}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-gray-900">
                    {formatPrice(tour.price)}
                  </span>
                  <br />
                  per person
                </div>
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-gray-900">
                    {tour.duration_minutes}
                  </span>
                  <br />
                  minutes
                </div>
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-gray-900">
                    {tour.max_capacity}
                  </span>
                  <br />
                  max capacity
                </div>
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-gray-900">
                    {tour.upcomingSessions}
                  </span>
                  <br />
                  upcoming sessions
                </div>
              </div>

              {/* Sessions Summary */}
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-500">Total Sessions:</span>{" "}
                    <span className="font-medium">{tour.sessionCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Bookings:</span>{" "}
                    <span className="font-medium">{tour.totalBookings}</span>
                  </div>
                </div>
              </div>

              {/* Session List Preview */}
              {tour.tour_sessions && tour.tour_sessions.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    Upcoming Sessions
                  </h4>
                  <div className="space-y-1">
                    {tour.tour_sessions
                      .filter(
                        (session) => new Date(session.start_time) > new Date()
                      )
                      .slice(0, 3)
                      .map((session) => {
                        const capacity = getSessionCapacityInfo(session);
                        return (
                          <div
                            key={session.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              {new Date(
                                session.start_time
                              ).toLocaleDateString()}{" "}
                              at{" "}
                              {new Date(
                                session.start_time
                              ).toLocaleTimeString()}
                            </div>
                            <div className="flex items-center text-gray-500">
                              <Users className="h-4 w-4 mr-1" />
                              <span
                                className={
                                  capacity.remaining === 0
                                    ? "text-red-500 font-medium"
                                    : ""
                                }
                              >
                                {capacity.sold}/{capacity.total} spots
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <button
                  onClick={() => {
                    setSelectedTour(tour);
                    setShowSessionForm(true);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                  Add Session
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
