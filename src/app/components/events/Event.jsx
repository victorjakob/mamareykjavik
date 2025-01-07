"use client";

import React from "react";
import Image from "next/image";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { Button, ActionButton } from "@/app/components/Button";
import { PropagateLoader } from "react-spinners";
import { FcPrevious } from "react-icons/fc";
import Link from "next/link";

const fetcher = (url) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch event data");
    return res.json();
  });

export default function Event() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const {
    data: event,
    error,
    isLoading,
  } = useSWR(id ? `/api/event?id=${id}` : null, fetcher);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PropagateLoader color="#4F46E5" size={12} />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center ">
        <div className="text-center">
          <h1 className="text-xl font-bold mt-44">Event Not Found</h1>
          <Link
            href="/events"
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 transition duration-200 ease-in-out mt-8"
            aria-label="Go Back"
          >
            <FcPrevious className="text-gray-700 w-6 h-6" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-20 max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}

      {/* Event Image */}
      <div className="mb-8">
        <div className="relative w-full aspect-[16/9]">
          <Image
            src={event.image.url}
            alt={event.name}
            fill
            className="rounded-lg object-cover"
          />
        </div>
      </div>

      {/* Event Title */}
      <h1 className="text-3xl font-bold mb-4">{event.name}</h1>

      {/* Event Info */}
      <div className="mb-6 flex flex-wrap gap-4 text-sm text-gray-600">
        <p>{format(new Date(event.time), "MMMM d h:mm a")}</p>
        <p>Duration: {event.duration} hours</p>
        <p>Location: Bankastræti 2, 101 Reykjavik</p>
      </div>

      {/* Event Description */}
      <p className="text-lg mb-6 whitespace-pre-wrap">
        {event.longDescription}
      </p>

      {/* Additional Event Details */}
      <div className="bg-gray-100 p-6 rounded-lg mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <h2 className="text-xl font-semibold mb-4 sm:mb-0">Event Details</h2>
          <Button href={"venue/bookings"}>Buy Ticket</Button>
        </div>
        <ul className="space-y-2 mt-4">
          <li>
            <p>
              <strong>Time: </strong>
              {format(new Date(event.time), "EEEE, MMMM d - h:mm a")}
            </p>
          </li>
          <li>
            <p>
              <strong>Duration: </strong> {event.duration} hours
            </p>
          </li>
          <li>
            <p>
              <strong>Location: </strong> Bankastræti 2, 101 Reykjavik
            </p>
          </li>
          <li>
            <strong>Price: </strong> {event.price} ISK
          </li>
        </ul>
      </div>

      {/* Purchase Button */}
    </div>
  );
}
