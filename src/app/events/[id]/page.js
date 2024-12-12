"use client";

import Image from "next/image";
import { format } from "date-fns";
import { events } from "../page";
import { useRouter } from "next/navigation"; // Import useRouter
import Button from "@/app/components/Button";

export default function EventPage({ params }) {
  const router = useRouter(); // Initialize useRouter
  const event = events.find((e) => e.id === parseInt(params.id));

  if (!event) {
    return <div className="text-center py-12">Event not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-4">
        <Button
          className="flex items-center gap-2"
          onClick={() => router.back()} // Call Router.back() on click
        >
          Go Back
        </Button>
      </div>

      {/* Event Image */}
      <div className="mb-8">
        <Image
          src={event.imageUrl}
          alt={event.name}
          width={1920}
          height={1005}
          className="rounded-lg object-cover w-full"
        />
      </div>

      {/* Event Details */}
      <h1 className="text-3xl font-bold mb-4">{event.name}</h1>
      <div className="mb-6 flex flex-wrap gap-4 text-sm text-gray-600">
        <p>{format(new Date(event.startTime), "MMMM d, yyyy h:mm a")}</p>
        <p>Duration: {event.duration}</p>
        <p>Location: {event.location}</p>
      </div>
      <p className="text-lg mb-6">{event.longDescription}</p>

      {/* Additional Details */}
      <div className="bg-gray-100 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Event Details</h2>
        <ul className="space-y-2">
          <li>
            <strong>Price:</strong> ${event.price}
          </li>
          <li>
            <strong>Available Tickets:</strong> {event.availableTickets}
          </li>
        </ul>
      </div>

      {/* Purchase Button */}
      <Button className="w-full sm:w-auto">Purchase Ticket</Button>
    </div>
  );
}
