"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";

const CacaoCTA = () => {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Want to go deeper?",
      joinCeremony: "Join a Mama Cacao Ceremony",
      privateCeremony: "Book a Private Cacao Ceremony",
      orderCacao: "Order Ceremonial Cacao",
      qaTitle: "Common Questions",
      qa: [
        {
          q: "What is ceremonial cacao?",
          a: "It's pure, minimally processed cacao — not cocoa powder or chocolate — traditionally used in sacred ceremonies to open the heart, increase focus, and connect spirit and body.",
        },
        {
          q: "Is it safe for everyone?",
          a: "Cacao is a gentle heart medicine, but those who are pregnant, on antidepressants (especially MAOIs or SSRIs), or with heart conditions should start with a small amount and consult their intuition or practitioner.",
        },
        {
          q: "How much should I drink?",
          a: "For a ceremony, 30–40g is common. For daily use, 10–20g is beautiful. Always listen to your body — less is often more.",
        },
        {
          q: "Can I buy cacao at the restaurant?",
          a: "Yes! We serve and sell ceremonial cacao at Mama. You can also order online or join a cacao ceremony to experience it in community.",
        },
        {
          q: "What makes Mama Cacao special?",
          a: "Our cacao is sourced from small farms in Central America with love and respect for the land, hand-prepared and blessed to carry the medicine of connection.",
        },
      ],
      closingQuote:
        "Every cup of cacao is a prayer in motion — a reminder that the simplest acts can be sacred.",
    },
    is: {
      title: "Viltu kafa dýpra?",
      joinCeremony: "Taktu þátt í Mama Cacao seramóníu",
      privateCeremony: "Bókaðu Einkakakóathöfn",
      orderCacao: "Pantaðu Seramóníal kakó",
      qaTitle: "Algengar spurningar",
      qa: [
        {
          q: "Hvað er athafnacacao?",
          a: "Það er hreint, lítillega unnið kakó — ekki kakóduft eða súkkulaði — hefðbundið notað í helgisiðir til að opna hjartað, auka einbeitingu og tengja andann og líkamann.",
        },
        {
          q: "Er það öruggt fyrir alla?",
          a: "Kakó er mýk hjartalyf, en þeir sem eru þungaðir, á hleðslueyðandi lyfjum (sérstaklega MAOIs eða SSRIs), eða með hjartasjúkdóma ættu að byrja með litlu magni og ráðfæra sig við innsæi sitt eða meðferðaraðila.",
        },
        {
          q: "Hversu mikið ætti ég að drekka?",
          a: "Fyrir athöfn er 30–40g algengt. Fyrir daglegan notkun er 10–20g fallegt. Hlustaðu alltaf á líkamann þinn — minna er oft meira.",
        },
        {
          q: "Get ég keypt kakó á veitingastaðnum?",
          a: "Já! Við þjónum og seljum athafnacacao á Mama. Þú getur einnig pantað á netinu eða tekið þátt í kakóathöfn til að upplifa það í samfélagi.",
        },
        {
          q: "Hvað gerir Mama Cacao sérstakt?",
          a: "Kakóið okkar er sótt frá litlum bændum í Mið-Ameríku með ást og virðingu fyrir landinu, handunnið og blessað til að bera lyfjatengsla.",
        },
      ],
      closingQuote:
        "Hver bolli af kakó er lifandi bæn — áminning um að einfaldustu athafnirnar geta verið helgir.",
    },
  };

  const t = translations[language];

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 md:px-8 max-w-2xl mx-auto text-center">
      <motion.h2
        className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-orange-900"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <span role="img" aria-label="cacao" className="mr-2">
          🍫
        </span>
        {t.title}{" "}
      </motion.h2>
      <motion.div
        className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center mt-8 sm:mt-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <Link
          href="/events"
          className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-orange-700 text-white font-semibold shadow-lg hover:bg-orange-800 transition-colors text-base sm:text-lg w-full sm:w-auto"
        >
          {t.joinCeremony}
        </Link>
        <Link
          href="/cacao-prep/private-booking"
          className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg border-2 border-orange-700 text-orange-800 font-semibold shadow-lg hover:bg-orange-50 transition-colors text-base sm:text-lg w-full sm:w-auto"
        >
          {t.privateCeremony}
        </Link>
        <Link
          href="/shop/cacao"
          className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-orange-100 text-orange-900 font-semibold shadow-lg border-2 border-orange-200 hover:bg-orange-200 transition-colors text-base sm:text-lg w-full sm:w-auto"
        >
          {t.orderCacao}
        </Link>
      </motion.div>
      <motion.div
        className="mt-10 sm:mt-12 max-w-3xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-6 sm:mb-8 text-orange-900 text-center">
          {t.qaTitle}
        </h3>
        <div className="space-y-6 sm:space-y-8 text-left">
          {t.qa.map((item, idx) => (
            <motion.div
              key={idx}
              className="border-b border-orange-200 pb-6 sm:pb-8 last:border-b-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.5 + idx * 0.1 }}
            >
              <h4 className="text-base sm:text-lg md:text-xl font-semibold text-orange-900 mb-2 sm:mb-3">
                Q: {item.q}
              </h4>
              <p className="text-sm sm:text-base md:text-lg text-gray-700 font-light leading-relaxed">
                A: {item.a}
              </p>
            </motion.div>
          ))}
        </div>
        <motion.p
          className="mt-10 sm:mt-12 text-base sm:text-lg md:text-xl text-orange-900 font-light italic text-center px-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.9 }}
        >
          {t.closingQuote}
        </motion.p>
      </motion.div>
    </section>
  );
};

export default CacaoCTA;
