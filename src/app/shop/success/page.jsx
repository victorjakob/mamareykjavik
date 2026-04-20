"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

const EASE = [0.22, 1, 0.36, 1];

export default function ShopSuccessPage() {
  const { language } = useLanguage();

  const t =
    language === "is"
      ? {
          eyebrow: "Takk fyrir",
          title: "Takk fyrir pöntunina þína!",
          lede:
            "Greiðslan þín gekk í gegn. Fylgstu með pósthólfinu þínu — við sendum þér staðfestingu með hjarta. Hikaðu ekki við að hafa samband ef eitthvað vantar.",
          backToShop: "Aftur í verslun",
          exploreEvents: "Skoða viðburði",
          craving: "Langar í meira?",
          cravingBody:
            "Kannaðu árstíðabundna matseðilinn og dagsins rétti sem kokkurinn okkar eldar af ástríðu.",
          cravingLink: "Sjá matseðilinn",
          wlVibes: "White Lotus stemning",
          wlBody:
            "Athafnir, tónleikar og samkomur sem tengja fólk saman í hjartanu af Reykjavík.",
          wlLink: "Sjá rýmið",
          help: "Þarftu aðstoð?",
          helpBody:
            "Við erum alltaf til taks ef spurningar vakna um pöntunina þína eða upplifunina.",
          helpLink: "Senda póst",
        }
      : {
          eyebrow: "Gratitude",
          title: "Thank you for your order!",
          lede:
            "Your payment went through smoothly. Keep an eye on your inbox for a warm confirmation from us, and feel free to reach out if you need anything.",
          backToShop: "Back to Shop",
          exploreEvents: "Explore Events",
          craving: "Craving more?",
          cravingBody:
            "Discover our seasonal menu and daily chef specials crafted with love.",
          cravingLink: "See the menu",
          wlVibes: "White Lotus vibes",
          wlBody:
            "Dive into ceremonies, concerts, and gatherings that bring people together.",
          wlLink: "Discover the venue",
          help: "Need a hand?",
          helpBody:
            "We are always here to help with questions about your order or experience.",
          helpLink: "Email the team",
        };

  return (
    <section
      className="relative min-h-[90vh] overflow-hidden bg-[#0e0b08] text-[#f0ebe3] pt-28"
      data-navbar-theme="dark"
    >
      {/* Ambient warm glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-24 h-[520px] w-[520px] rounded-full bg-[#ff914d] opacity-[0.06] blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/4 h-[460px] w-[460px] rounded-full bg-[#c9b89e] opacity-[0.04] blur-[140px]"
      />
      {/* Noise */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col items-center justify-center px-6 py-16 md:py-20 text-center">
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative mb-10 flex flex-col items-center"
        >
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="h-px w-10 bg-[#ff914d]/60" />
            <span className="text-[10px] md:text-xs uppercase tracking-[0.35em] text-[#ff914d]">
              {t.eyebrow}
            </span>
            <span className="h-px w-10 bg-[#ff914d]/60" />
          </div>

          {/* Check mark */}
          <div className="mb-8 inline-flex items-center justify-center rounded-full border border-[#ff914d]/30 bg-[#ff914d]/[0.08] p-5">
            <motion.svg
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.6, ease: EASE }}
              className="h-12 w-12 text-[#ff914d]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </motion.svg>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease: EASE }}
            className="font-serif italic text-[#f0ebe3] leading-[1.05]"
            style={{ fontSize: "clamp(2.2rem, 5.2vw, 3.6rem)" }}
          >
            {t.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease: EASE }}
            className="mt-6 max-w-xl text-base md:text-lg text-[#c4b8aa] font-light leading-relaxed"
          >
            {t.lede}
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7, ease: EASE }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-full bg-[#ff914d] px-8 py-3 text-sm uppercase tracking-[0.18em] font-light text-[#1a1510] hover:bg-[#ff7a28] transition-colors duration-300"
          >
            {t.backToShop}
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-8 py-3 text-sm uppercase tracking-[0.18em] font-light text-[#f0ebe3] hover:border-[#ff914d] hover:text-[#ff914d] transition-all duration-300"
          >
            {t.exploreEvents}
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.8, ease: EASE }}
          className="mt-16 w-full rounded-2xl border border-white/5 bg-[#110f0d] p-6 md:p-8"
        >
          <div className="grid gap-5 text-left sm:grid-cols-3">
            <div className="rounded-xl bg-[#0e0b08]/60 border border-white/5 p-5 transition-colors duration-300 hover:border-[#ff914d]/25">
              <p className="font-serif italic text-[#f0ebe3] text-lg mb-2">
                {t.craving}
              </p>
              <p className="text-sm text-[#a09488] font-light leading-relaxed mb-4">
                {t.cravingBody}
              </p>
              <Link
                href="/restaurant/menu"
                className="inline-flex text-[10px] uppercase tracking-[0.3em] text-[#ff914d] hover:text-[#ff7a28] transition-colors duration-300"
              >
                {t.cravingLink} →
              </Link>
            </div>
            <div className="rounded-xl bg-[#0e0b08]/60 border border-white/5 p-5 transition-colors duration-300 hover:border-[#ff914d]/25">
              <p className="font-serif italic text-[#f0ebe3] text-lg mb-2">
                {t.wlVibes}
              </p>
              <p className="text-sm text-[#a09488] font-light leading-relaxed mb-4">
                {t.wlBody}
              </p>
              <Link
                href="/whitelotus"
                className="inline-flex text-[10px] uppercase tracking-[0.3em] text-[#ff914d] hover:text-[#ff7a28] transition-colors duration-300"
              >
                {t.wlLink} →
              </Link>
            </div>
            <div className="rounded-xl bg-[#0e0b08]/60 border border-white/5 p-5 transition-colors duration-300 hover:border-[#ff914d]/25">
              <p className="font-serif italic text-[#f0ebe3] text-lg mb-2">
                {t.help}
              </p>
              <p className="text-sm text-[#a09488] font-light leading-relaxed mb-4">
                {t.helpBody}
              </p>
              <Link
                href="/contact"
                className="inline-flex text-[10px] uppercase tracking-[0.3em] text-[#ff914d] hover:text-[#ff7a28] transition-colors duration-300"
              >
                {t.helpLink} →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
