"use client";

import ContactForm from "@/app/components/ContactForm";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import DualLanguageText from "@/app/components/DualLanguageText";

export default function ContactClient() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Contact Us",
      bookTable: "Book a Table",
      hostEvent: "Host Your Event",
      description:
        "Have any question? comments? requests? or just want to share a joke. Please send us a message",
    },
    is: {
      title: "Hafðu samband",
      bookTable: "Bókaðu borð",
      hostEvent: "Hýstu viðburð þinn",
      description:
        "Ertu með spurningar? athugasemdir? beiðnir? eða viltu bara deila brandara. Vinsamlegast sendu okkur skilaboð",
    },
  };

  const t = translations[language];

  return (
    <div>
      <DualLanguageText
        en={t.title}
        is={t.title}
        element="h1"
        className="text-4xl font-bold text-center mt-36 mb-8"
      />
      <div className="text-center mt-6 mb-8">
        <Link
          href="https://www.dineout.is/mamareykjavik?g=2&dt=2025-02-03T13:30&area=anywhere&cats=&type=bookings&isolation=true"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-3 border border-orange-600 text-orange-600 rounded-full font-light tracking-wide hover:tracking-wider hover:bg-orange-600 hover:text-white transition-all duration-300 ease-in-out"
        >
          {t.bookTable}
        </Link>
        <Link
          href="/whitelotus/rent"
          className="inline-block px-8 py-3 ml-4 border border-orange-600 text-orange-600 rounded-full font-light tracking-wide hover:tracking-wider hover:bg-orange-600 hover:text-white transition-all duration-300 ease-in-out"
        >
          {t.hostEvent}
        </Link>
      </div>

      <h2 className="mx-auto font-sans max-w-s md:max-w-screen-sm lg:max-w-screen-md text-base text-center  px-10">
        {t.description}
      </h2>

      <ContactForm />
    </div>
  );
}

