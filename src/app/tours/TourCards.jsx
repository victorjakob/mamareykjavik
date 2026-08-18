import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/util/IskFormat";

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Atlantic/Reykjavik",
  });

  return `${day} ${month} · ${time}`;
}

export default function TourCards({ tours }) {
  if (!tours.length) {
    return (
      <p className="mt-16 text-center text-[#a09488]">
        New journeys are being prepared — check back soon.
      </p>
    );
  }

  return (
    <div
      className={`mt-16 grid gap-6 ${
        tours.length === 1
          ? "max-w-2xl mx-auto"
          : "grid-cols-1 md:grid-cols-2"
      }`}
    >
      {tours.map((tour) => {
        const futureSessions = tour.tour_sessions || [];
        const nextTwoSessions = futureSessions.slice(0, 2);
        const hasMoreSessions = futureSessions.length > 2;

        return (
          <Link
            key={tour.id}
            href={`/tours/${tour.slug}`}
            className="group relative block overflow-hidden rounded-2xl bg-[#1e1812] border border-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff914d]"
          >
            {/* Image */}
            <div className="relative h-72 sm:h-80 overflow-hidden">
              <Image
                src={
                  tour.image_url ||
                  "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1745168491/relic2_c15dsg.jpg"
                }
                alt={tour.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e1812] via-black/20 to-black/10" />
              <div className="absolute inset-0 bg-[#ff914d]/0 group-hover:bg-[#ff914d]/[0.06] transition-colors duration-500" />

              {/* Price chip */}
              <span className="absolute top-5 right-5 px-4 py-1.5 rounded-full bg-black/45 backdrop-blur-sm text-[#f0ebe3] text-sm border border-white/10">
                {formatPrice(tour.price)}
              </span>

              {/* Corner accent */}
              <span className="absolute top-5 left-5 text-[#ff914d]/50 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                ✦
              </span>
            </div>

            {/* Content */}
            <div className="p-7 text-left">
              {tour.subtitle && (
                <span className="block text-[10px] font-semibold uppercase tracking-[0.35em] text-[#ff914d] mb-2.5">
                  {tour.subtitle}
                </span>
              )}
              <h3
                className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-3"
                style={{ fontSize: "clamp(1.8rem, 2.5vw, 2.4rem)" }}
              >
                {tour.name}
              </h3>
              <p className="text-sm text-[#b0a498] leading-relaxed mb-5">
                {tour.short_description || tour.description}
              </p>

              {/* Facts row */}
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-[#a09488] tracking-wide mb-5">
                {tour.schedule_note && <span>{tour.schedule_note}</span>}
                <span>
                  {Math.round((tour.duration_minutes / 60) * 10) / 10} hours
                </span>
                <span>Max {tour.max_capacity} guests</span>
              </div>

              {/* Departures */}
              {nextTwoSessions.length > 0 && (
                <div className="border-t border-white/[0.06] pt-4 mb-6 space-y-1.5">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8a7e72] mb-2">
                    Upcoming departures
                  </span>
                  {nextTwoSessions.map((session) => (
                    <div
                      key={session.start_time}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-[#c4b8aa]">
                        {formatDate(session.start_time)}
                      </span>
                      <span
                        className={
                          session.availableSpots === 0
                            ? "text-red-400/90"
                            : "text-[#ff914d]"
                        }
                      >
                        {session.availableSpots === 0
                          ? "Fully booked"
                          : `${session.availableSpots} spots open`}
                      </span>
                    </div>
                  ))}
                  {hasMoreSessions && (
                    <span className="block text-center text-[#8a7e72]">···</span>
                  )}
                </div>
              )}

              <span className="inline-flex items-center gap-2 text-xs text-[#ff914d] uppercase tracking-[0.25em] group-hover:gap-3 transition-all duration-300">
                Discover the journey →
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
