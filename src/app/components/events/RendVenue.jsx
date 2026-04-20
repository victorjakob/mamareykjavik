"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

const RentVenue = () => {
  const { language } = useLanguage();

  const translations = {
    en: {
      eyebrow: "Host your own gathering",
      title: "Interested in Hosting Your Own Event at White Lotus?",
      description:
        "Our unique venue offers the perfect space for conscious gatherings, workshops, ceremonies, and more.",
      exploreButton: "Explore White Lotus",
      contactButton: "Book the Venue",
    },
    is: {
      eyebrow: "Haltu þinn eigin samkomu",
      title: "Hefurðu áhuga á að halda þinn eigin viðburð á White Lotus?",
      description:
        "Einstaki staðurinn okkar býður upp á hið fullkomna rými fyrir meðvitaðar samkomur, vinnustofur, athafnir og margt fleira.",
      exploreButton: "Lesa um White Lotus",
      contactButton: "Bókaðu rýmið",
    },
  };

  const t = translations[language];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="w-full px-6 pb-24 pt-4"
    >
      <div className="max-w-2xl mx-auto">
        {/* Top rule */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#1a1410]/[0.1] to-transparent mb-16" />

        {/* Fade-line ornament */}
        <div className="flex flex-col items-center gap-0 mb-10">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-[#1a1410]/15" />
          <div className="w-px h-5 bg-gradient-to-b from-[#1a1410]/15 via-[#1a1410]/25 to-[#ff914d]/55" />
          <div className="w-1 h-1 rounded-full bg-[#ff914d]/70 mt-0.5" />
        </div>

        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
          <span className="text-xs font-medium uppercase tracking-[0.4em] text-[#ff914d]">{t.eyebrow}</span>
          <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/50" />
        </div>

        {/* Title */}
        <p
          className="font-cormorant font-light italic text-[#1a1410] text-center mb-6 leading-tight"
          style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)" }}
        >
          {t.title}
        </p>

        {/* Description */}
        <p className="text-[#5a4a3a] text-sm text-center leading-relaxed tracking-wide mb-10">
          {t.description}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href="/whitelotus"
              className="inline-flex items-center gap-2 px-7 py-3 bg-[#ff914d] text-black text-sm font-medium tracking-[0.12em] uppercase rounded-full hover:bg-[#ff7a2e] transition-colors duration-200"
            >
              {t.exploreButton}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href="/whitelotus/rent"
              className="inline-flex items-center gap-2 px-7 py-3 border border-[#1a1410]/20 text-[#1a1410] text-sm tracking-[0.12em] uppercase rounded-full hover:bg-[#1a1410]/[0.04] hover:border-[#1a1410]/35 transition-all duration-200"
            >
              {t.contactButton}
            </Link>
          </motion.div>
        </div>

        <p className="text-center text-[#7a6a5a] text-xs tracking-[0.2em] uppercase mt-10">
          Looking forward to seeing you at White Lotus
        </p>
      </div>
    </motion.div>
  );
};

export default RentVenue;
