import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";

export default function EventsList({ events }) {
  const groupedEvents = events.reduce((acc, event) => {
    const date = format(new Date(event.startTime), "yyyy-MM-dd");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(groupedEvents).map(([date, dateEvents]) => (
        <div key={date}>
          <h2 className="text-xl font-semibold text-center mb-4">
            {format(new Date(date), "MMMM d, yyyy")}
          </h2>
          <ul role="list" className="divide-y divide-gray-200">
            {dateEvents.map((event) => (
              <li key={event.id} className="py-8">
                <Link href={`/events/${event.id}`} className="block">
                  <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 hover:bg-gray-50 transition duration-150 ease-in-out rounded-lg p-4">
                    <div className="w-full sm:w-1/3 aspect-[16/9] relative overflow-hidden rounded-lg">
                      <Image
                        src={event.imageUrl}
                        alt={event.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="w-full sm:w-2/3 text-center sm:text-left">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {event.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {event.description}
                      </p>
                      <div className="mt-2 flex flex-col sm:flex-row sm:justify-between">
                        <p className="text-sm text-gray-700">
                          {format(new Date(event.startTime), "h:mm a")} |
                          Duration: {event.duration}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          Price: ${event.price}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
