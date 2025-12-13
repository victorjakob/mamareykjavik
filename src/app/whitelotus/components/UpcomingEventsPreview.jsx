"use client";

import { motion } from "framer-motion";
import { Button } from "@/app/components/Button";
import { useLanguage } from "@/hooks/useLanguage";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarIcon, MapPinIcon } from "@heroicons/react/24/outline";

export default function UpcomingEventsPreview({ events = [] }) {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Upcoming Events",
      noEventsTitle: "Stay Tuned",
      noEventsDescription:
        "We're always planning new events. Check back soon or host your own!",
      seeAllEvents: "See All Events",
      soldOut: "Sold Out",
    },
    is: {
      title: "Væntanlegir Viðburðir",
      noEventsTitle: "Fylgstu Með",
      noEventsDescription:
        "Við erum alltaf að skipuleggja nýja viðburði. Komdu aftur fljótlega eða hýstu þinn eigin!",
      seeAllEvents: "Sjá alla viðburði",
      soldOut: "Uppselt",
    },
  };

  const t = translations[language];

  // Show up to 3 events
  const displayEvents = events.slice(0, 3);

  if (displayEvents.length === 0) {
    return (
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {t.title}
            </h2>
            <div className="space-y-4 py-8">
              <h3 className="text-xl font-semibold text-gray-700">
                {t.noEventsTitle}
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {t.noEventsDescription}
              </p>
            </div>
            <Button href={"/events"} label={"See All Events"}>
              {t.seeAllEvents}
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            {t.title}
          </h2>
          <Button href={"/events"} label={"See All Events"}>
            {t.seeAllEvents}
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <Link href={`/events/${event.slug}`}>
                <div className="relative h-48 w-full">
                  <Image
                    src={event.image || "/placeholder-event.jpg"}
                    alt={event.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {event.sold_out && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {t.soldOut}
                    </div>
                  )}
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                    {event.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarIcon className="w-4 h-4" />
                    <span>
                      {format(new Date(event.date), "MMM d, yyyy • h:mm a")}
                    </span>
                  </div>
                  {event.shortdescription && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {event.shortdescription}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

