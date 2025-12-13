"use client";

import { Button, ButtonDark } from "@/app/components/Button";
import Image from "next/image";
import { useLanguage } from "@/hooks/useLanguage";
import DualLanguageText from "@/app/components/DualLanguageText";
import { motion } from "framer-motion";
import {
  UserGroupIcon,
  MapPinIcon,
  SpeakerWaveIcon,
} from "@heroicons/react/24/outline";

export default function HeroVenue() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "An intimate event venue in downtown Reykjavík",
      description: "A refined space for events, gatherings, and celebrations.",
      seeEventsButton: "See All Events",
      hostEventButton: "Host Your Event",
      trustCapacity: "Standing 150 / Seated 80",
      trustLocation: "Downtown Reykjavík",
      trustTech: "Pro sound + lights + projector",
    },
    is: {
      title: "Viðburðarými í hjarta Reykjavíkur",
      description: "Hágæða rými fyrir viðburði, samverur og hátíðleg tilefni.",
      seeEventsButton: "Sjá alla viðburði",
      hostEventButton: "Halda viðburð",
      trustCapacity: "Standandi: 150 / Sitjandi: 80",
      trustLocation: "Miðbæ Reykjavíkur",
      trustTech: "Hljóðkerfi + ljós + skjávarpi",
    },
  };

  const t = translations[language];

  const trustSignals = [
    {
      icon: UserGroupIcon,
      text: t.trustCapacity,
    },
    {
      icon: MapPinIcon,
      text: t.trustLocation,
    },
    {
      icon: SpeakerWaveIcon,
      text: t.trustTech,
    },
  ];

  return (
    <div className="container mx-auto px-4 space-y-8 text-center mt-24 sm:mt-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Image
          src="/whitelotus/whitelotuslogo.png"
          alt="White Lotus Logo"
          width={1161}
          height={1020}
          className="mx-auto w-48 sm:w-64 h-auto"
          priority
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="space-y-6"
      >
        <DualLanguageText
          en={t.title}
          is={t.title}
          element="h1"
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 max-w-4xl mx-auto leading-tight"
        />
        <p className="max-w-2xl mx-auto text-lg sm:text-xl md:text-2xl font-light text-gray-700 leading-relaxed">
          {t.description}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-row gap-3 sm:gap-4 justify-center items-center pt-4 w-full"
      >
        <Button href={"/events"} label={"See All Events"}>
          {t.seeEventsButton}
        </Button>
        <ButtonDark href={"whitelotus/rent"} label={"Host Your Event"}>
          {t.hostEventButton}
        </ButtonDark>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-wrap justify-center gap-6 sm:gap-8 pt-6"
      >
        {trustSignals.map((signal, index) => {
          const Icon = signal.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-2 text-sm sm:text-base text-gray-600"
            >
              <Icon className="w-5 h-5 text-gray-500" />
              <span className="font-medium">{signal.text}</span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
