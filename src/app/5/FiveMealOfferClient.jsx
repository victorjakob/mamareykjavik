"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/hooks/useLanguage";
import { formatPrice } from "@/util/IskFormat";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 0.8,
    },
  },
};

export default function FiveMealOfferClient({ initialLanguage }) {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "5 Meals for Winter",
      limitedAvailability: "Limited Availability",
      price: "14.900 kr",
      originalPrice: "21.150 kr",
      flashSale: "flash offer ends Sunday Nights",
      buttonText: "Buy Now",
      buttonNote:
        "(it will add the 5× card straight to your Mama account after payment is done)",
      youGet: "You get",
      features: [
        {
          header: "5",
          text: "soul-warming main meals",
        },
        {
          header: "Valid",
          text: "1 Dec 2025 – 31 May 2026",
        },
        {
          header: "Free Drink",
          text: "free Ceremonial Cacao, tea or coffee when you use the 5th punch!",
        },
        {
          header: "Access",
          text: "Your card on your",
          linkText: "Profile",
          linkHref: "/profile",
          textAfter: "page",
        },
      ],
      tagline:
        "True wealth is in your health — so grab 5 curries and treat yourself ;)",
      madeWith: "Made with big love 🌱 Mama",
    },
    is: {
      title: "5 Réttir fyrir Veturinn",
      limitedAvailability: "Takmarkað Framboð",
      price: "14.900 kr",
      originalPrice: "21.150 kr",
      flashSale: "72 klst blitz – endar föstudag 18:00",
      buttonText: "Kaupa Núna",
      buttonNote:
        "(það bætir 5× kortinu beint á Mama reikninginn þinn eftir greiðslu)",
      youGet: "Þú færð",
      features: [
        {
          header: "5",
          text: "sálvarmandi aðalréttir",
        },
        {
          header: "Gilt",
          text: "1. des 2025 – 31. maí 2026",
        },
        {
          header: "Ókeypis Drykk",
          text: "ókeypis Athafnacacao, te eða kaffi þegar þú notar 5. höggið!",
        },
        {
          header: "Aðgangur",
          text: "Kortið þitt á þinni",
          linkText: "Prófíl",
          linkHref: "/profile",
          textAfter: "síðu",
        },
      ],
      tagline: "Sönn ánægja og ríkisdæmi kemur með góðri heilsu",
      madeWith: "Gert með mikilli ást í Reykjavík 🌱 Mama",
    },
  };

  const t = translations[language];

  const offerPrice = 14900;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-emerald-50/40">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-32 pb-16 sm:pb-20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            {/* Limited Availability Badge */}
            <motion.div variants={itemVariants} className="mb-4">
              <span className="inline-block text-xs sm:text-sm text-orange-600 font-medium tracking-[0.15em] uppercase">
                {t.limitedAvailability}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-8 sm:mb-10 tracking-tighter"
              style={{ letterSpacing: "-0.02em" }}
            >
              {t.title}
            </motion.h1>

            {/* Image */}
            <motion.div
              variants={itemVariants}
              className="mb-8 sm:mb-10 max-w-2xl mx-auto"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1762326608/dahl_aumxpm.jpg"
                  alt="Steamy curry dish"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>

            {/* Price Section */}
            <motion.div variants={itemVariants} className="mb-4">
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span
                  className="text-4xl sm:text-5xl lg:text-6xl font-light text-gray-900 tracking-tighter"
                  style={{ letterSpacing: "-0.03em" }}
                >
                  {t.price}
                </span>
                <span className="text-2xl sm:text-3xl text-gray-400 line-through font-light tracking-tight">
                  {t.originalPrice}
                </span>
              </div>
            </motion.div>

            {/* Flash Sale Badge */}
            <motion.div variants={itemVariants} className="mb-8 sm:mb-10">
              <span className="inline-block bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm sm:text-base font-medium border border-orange-200">
                ⚡ {t.flashSale}
              </span>
            </motion.div>

            {/* Buy Button */}
            <motion.div variants={itemVariants} className="mb-4">
              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Link
                  href="/5/buy"
                  className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-10 py-4 sm:px-12 sm:py-4.5 rounded-xl text-lg sm:text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 inline-block"
                >
                  {t.buttonText}
                </Link>
              </motion.div>
            </motion.div>

            {/* Button Note */}
            <motion.p
              variants={itemVariants}
              className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto font-light italic"
            >
              {t.buttonNote}
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="pt-2 sm:pt-3 pb-12 sm:pb-14">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
          {/* Fancy Border */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="mb-8 sm:mb-10"
          >
            <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-300 to-orange-500"></div>
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-emerald-500"></div>
              <div className="flex-1 h-px bg-gradient-to-r from-emerald-500 via-emerald-300 to-transparent"></div>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100 }}
            className="text-2xl sm:text-3xl font-light text-gray-900 mb-8 sm:mb-10 text-center tracking-tighter"
            style={{ letterSpacing: "-0.02em" }}
          >
            {t.youGet}
          </motion.h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
          >
            {t.features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-gradient-to-br from-orange-50/50 to-emerald-50/50 p-5 sm:p-6 rounded-xl border border-orange-100/50 hover:border-orange-200/70 hover:shadow-md transition-all duration-300"
              >
                <h3
                  className="text-xl sm:text-2xl font-light text-gray-900 mb-2 text-center tracking-tighter"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {feature.header}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-light text-center">
                  {feature.text}
                  {feature.linkText && (
                    <>
                      {" "}
                      <Link
                        href={feature.linkHref}
                        className="text-orange-600 hover:text-orange-700 underline decoration-orange-300 hover:decoration-orange-500 transition-colors font-medium"
                      >
                        {feature.linkText}
                      </Link>
                      {feature.textAfter && ` ${feature.textAfter}`}
                    </>
                  )}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-gradient-to-br from-orange-50/50 to-emerald-50/50 py-12 sm:py-14">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
            }}
          >
            {/* Tagline */}
            <p className="text-lg sm:text-xl text-gray-700 mb-4 leading-relaxed font-light tracking-tight">
              {t.tagline}
            </p>

            {/* Made with */}
            <p className="text-sm sm:text-base text-gray-500 font-light tracking-tight">
              {t.madeWith}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
