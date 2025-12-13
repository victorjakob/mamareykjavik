"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import {
  UserGroupIcon,
  MapPinIcon,
  SpeakerWaveIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function VenueDetails() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Venue Details",
      capacity: "Capacity",
      capacityDetails: "Standing: 150\nSeated: 80",
      location: "Location",
      locationDetails: "Bankastræti 2\nSecond Floor\nNext to Mama Reykjavík",
      technology: "Technology",
      technologyDetails:
        "Top Quality Sound system\nProjector\nMicrophones\nMixer\nStage & Disco lights",
      hours: "Hours",
      hoursDetails: "Weekdays until 1am\nWeekends until 3am",
    },
    is: {
      title: "Upplýsingar um salinn",
      capacity: "Rými",
      capacityDetails: "Standandi: 150\nSitjandi: 80",
      location: "Staðsetning",
      locationDetails: "Bankastræti 2\n2. hæð\nVið hliðina á Mama Reykjavík",
      technology: "Tækni",
      technologyDetails:
        "Hágæða hljóðkerfi\nSkjávarpi\nHljóðnemar\nHljóðblandari\nSvið og diskóljós",
      hours: "Opnunartímar",
      hoursDetails: "Virka daga til kl. 01:00\nUm helgar til kl. 03:00",
    },
  };

  const t = translations[language];

  const details = [
    {
      icon: UserGroupIcon,
      title: t.capacity,
      details: t.capacityDetails,
    },
    {
      icon: MapPinIcon,
      title: t.location,
      details: t.locationDetails,
    },
    {
      icon: SpeakerWaveIcon,
      title: t.technology,
      details: t.technologyDetails,
    },
    {
      icon: ClockIcon,
      title: t.hours,
      details: t.hoursDetails,
    },
  ];

  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t.title}
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {details.map((detail, index) => {
            const Icon = detail.icon;
            return (
              <motion.div
                key={index}
                className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-50 flex items-center justify-center">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    {detail.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                    {detail.details}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

