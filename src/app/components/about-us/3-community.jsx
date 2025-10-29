"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

export default function Community() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "The Power of Community",
      paragraph1:
        "At Mama, we believe that a true sense of belonging and transformation comes from community. We are a collective of yogis, artists, travelers, musicians, healers, and nature lovers, all working together to create a space where everyone is welcomed and valued.",
      paragraph2:
        "Our goal is to uplift, educate, and inspire—whether through a shared meal, a heartfelt conversation, or an unforgettable experience.",
    },
    is: {
      title: "Kraftur samfélagsins",
      paragraph1:
        "Hjá Mama trúum við því að sönn tilfinning um tilheyrslu og umbreyting komi frá samfélaginu. Við erum hópur jóga, listamanna, ferðalanga, tónlistarmanna, heilara og náttúruunnenda, við vinnum saman að því að skapa rými þar sem allir eru velkomnir og séðir.",
      paragraph2:
        "Markmið okkar er að lyfta, mennta og innblása, hvort sem það er í gegnum sameiginlega máltíð, innlægt samtal eða ógleymanlega reynslu.",
    },
  };

  const t = translations[language];

  return (
    <section className="my-10 flex items-center justify-center px-4 py-16 bg-[#fdfbf7] overflow-hidden">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="space-y-4 sm:space-y-6 px-2 sm:px-4 md:order-2"
        >
          <h2 className="pt-1 pb-3 sm:pb-5 text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#455318] to-[#698d42] bg-clip-text text-transparent">
            {t.title}
          </h2>

          <div className="space-y-3 sm:space-y-4 text-gray-700 text-base sm:text-lg leading-relaxed">
            <p>{t.paragraph1}</p>
            <p>{t.paragraph2}</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl md:order-1"
        >
          <Image
            src="https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/Mama-Page%2Fwhitelotuscommunity.png?alt=media&token=5f9026e7-7a3e-4102-972c-2f23ee6771e0"
            alt="Mama Community Gathering"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
