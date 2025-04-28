import Image from "next/image";
import Link from "next/link";
import { Clock, Users, MoreHorizontal } from "lucide-react";
import { formatPrice } from "@/util/IskFormat";

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${day} ${month} at ${time}`;
}

export default function TourCards({ tours }) {
  return (
    <div className="max-w-6xl mx-auto p-8 grid md:grid-cols-2 gap-8">
      {tours.map((tour) => {
        // Get next 2 sessions and check if there are more
        const futureSessions =
          tour.tour_sessions
            ?.filter((session) => new Date(session.start_time) > new Date())
            ?.sort((a, b) => new Date(a.start_time) - new Date(b.start_time)) ||
          [];

        const nextTwoSessions = futureSessions.slice(0, 2);
        const hasMoreSessions = futureSessions.length > 2;

        return (
          <div
            key={tour.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300"
          >
            <div className="relative h-64">
              <Image
                src={
                  tour.image_url ||
                  "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1745168491/relic2_c15dsg.jpg"
                }
                alt={tour.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-2xl font-bold text-gray-800">
                  {tour.name}
                </h3>
                <span className=" text-slate-700 px-3 py-1 rounded-full text-sm">
                  {formatPrice(tour.price)}
                </span>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-3">
                {tour.description}
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    Duration: {tour.duration_minutes} minutes
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    Max: {tour.max_capacity} people
                  </div>
                </div>

                {nextTwoSessions.length > 0 && (
                  <div className="text-sm text-gray-600 border-t border-gray-200 pt-2">
                    <span className="font-medium">Upcoming Walks:</span>
                    <div className="mt-1 space-y-1">
                      {nextTwoSessions.map((session, index) => (
                        <div
                          key={session.start_time}
                          className={`flex items-center justify-between ${
                            index !== 0 ? "text-gray-500" : ""
                          }`}
                        >
                          <span>{formatDate(session.start_time)}</span>
                          <span
                            className={
                              session.availableSpots === 0
                                ? "text-red-500 font-medium"
                                : "text-green-600"
                            }
                          >
                            {session.availableSpots === 0
                              ? "Full"
                              : `${session.availableSpots} spots open`}
                          </span>
                        </div>
                      ))}
                      {hasMoreSessions && (
                        <div className="flex items-center justify-center text-gray-400 mt-1">
                          <MoreHorizontal className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Link
                    href={`/tours/${tour.slug}`}
                    className="block w-full bg-[#ff914d] text-white px-6 py-2 rounded-full text-center hover:bg-[#e67f3d] transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
