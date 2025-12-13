"use client";

import { motion } from "framer-motion";
import { ButtonDark } from "@/app/components/Button";
import { useLanguage } from "@/hooks/useLanguage";
import {
  EnvelopeIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function HostYourEvent() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Host Your Event",
      description:
        "Ready to create something special? Our team is here to help you bring your vision to life. From intimate gatherings to large celebrations, we'll work with you every step of the way.",
      buttonText: "Host Your Event",
      howItWorks: "How It Works",
      step1Title: "Send Inquiry",
      step1Description: "Tell us about your event and vision",
      step2Title: "We Respond",
      step2Description: "We'll get back to you soon with details",
      step3Title: "Confirm & Create",
      step3Description: "Finalize details and create magic together",
    },
    is: {
      title: "Halda viðburð",
      description:
        "Tilbúin(n) að skapa eitthvað einstakt? Teymið okkar aðstoðar þig við að gera hugmyndina að veruleika. Hvort sem um er að ræða náinn viðburð eða stóra hátíð, vinnum við með þér í gegnum allt ferlið.",
      buttonText: "Halda viðburð",
      howItWorks: "Hvernig fer ferlið fram",
      step1Title: "Senda fyrirspurn",
      step1Description: "Segðu okkur frá viðburðinum og hugmyndinni þinni",
      step2Title: "Við svörum",
      step2Description: "Við höfum samband fljótlega með frekari upplýsingar",
      step3Title: "Staðfesta & skapa",
      step3Description: "Lokum smáatriðum og sköpum töfra saman",
    },
  };

  const t = translations[language];

  const steps = [
    {
      icon: EnvelopeIcon,
      title: t.step1Title,
      description: t.step1Description,
    },
    {
      icon: ClockIcon,
      title: t.step2Title,
      description: t.step2Description,
    },
    {
      icon: CheckCircleIcon,
      title: t.step3Title,
      description: t.step3Description,
    },
  ];

  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {t.title}
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            {t.description}
          </p>
          <div className="pt-6">
            <ButtonDark href={"whitelotus/rent"} label={"Host Your Event"}>
              {t.buttonText}
            </ButtonDark>
          </div>
        </motion.div>

        <motion.h3
          className="text-xl sm:text-2xl font-semibold text-gray-900 text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {t.howItWorks}
        </motion.h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                className="text-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-semibold text-orange-600">
                      {index + 1}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

