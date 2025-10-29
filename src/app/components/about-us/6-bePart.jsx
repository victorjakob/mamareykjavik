"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import ContactForm from "../ContactForm";
import { useLanguage } from "@/hooks/useLanguage";

export default function BePart() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Be a part of \n the journey",
      paragraph1:
        "Mama is a living, breathing entity, shaped by the love and energy of everyone who walks through our doors. Whether you come for a meal, an event, or simply to share in the warmth of our space, you are part of something greater—a movement towards wholeness, connection, and sustainability.",
      paragraph2:
        "We invite you to join us, to experience the magic, and to co-create a future where food, community, and the planet thrive together.",
      signature: "With love & gratitude,\nThe Mama Reykjavik Family",
    },
    is: {
      title: "Vertu hluti af \n ferðinni",
      paragraph1:
        "Mamma er lifandi, andandi vera, mótuð af kærleika og orku allra sem ganga inn um dyrnar okkar. Hvort sem þú kemur í mat, á viðburð eða einfaldlega til að njóta hlýjuna, þá ert þú hluti af einhverju stærra - hreyfingu í átt að heild, tengingar og sjálfbærni.",
      paragraph2:
        "Við bjóðum þér að vera með okkur, upplifa töfrana og skapa saman framtíð þar sem matur, samfélag og jörðin þrífast saman.",
      signature: "Með ást og þakklæti,\nMama Reykjavík fjölskyldan",
    },
  };

  const t = translations[language];

  return (
    <section className="flex items-center justify-center px-4 py-8 sm:py-16 bg-[#fdfbf7] overflow-hidden">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="space-y-4 sm:space-y-6 px-2 sm:px-4"
        >
          <h2 className="pt-1 pb-3 sm:pb-5 text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#455318] to-[#698d42] bg-clip-text text-transparent">
            {t.title.split("\n").map((line, index) => (
              <span key={index}>
                {line}
                {index === 0 && <br />}
              </span>
            ))}
          </h2>

          <div className="space-y-3 sm:space-y-4 text-gray-700 text-base sm:text-lg leading-relaxed">
            <p>{t.paragraph1}</p>
            <p>{t.paragraph2}</p>
            <p className="italic mt-6 sm:mt-8">
              {t.signature.split("\n").map((line, index) => (
                <span key={index}>
                  {line}
                  {index === 0 && <br />}
                </span>
              ))}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="w-full mt-4 sm:mt-0"
        >
          <ContactForm />
        </motion.div>
      </div>
    </section>
  );
}
