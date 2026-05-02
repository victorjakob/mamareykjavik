"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Home, MessageCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import PageBackground from "@/app/components/ui/PageBackground";

const ACCENT = "#ff914d";

export default function GiftCardError() {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  return (
    <div
      className="relative min-h-screen overflow-hidden pb-24 pt-28"
      data-navbar-theme="dark"
    >
      <PageBackground />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[380px] bg-[#1a1410]"
      />

      <section className="relative z-10 mx-auto max-w-xl px-5 text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: "rgba(255,99,71,0.18)", color: "#ff6f5e" }}
        >
          <AlertTriangle className="h-8 w-8" strokeWidth={2.2} />
        </motion.div>

        <div className="mb-4 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-[#ff914d]/50" />
          <span
            className="text-[10px] uppercase tracking-[0.45em]"
            style={{ color: ACCENT }}
          >
            {t.eyebrow}
          </span>
          <span className="h-px w-8 bg-[#ff914d]/50" />
        </div>

        <h1
          className="font-cormorant italic font-light leading-[0.96] text-[#f0ebe3]"
          style={{ fontSize: "clamp(2.2rem, 5.5vw, 3.6rem)" }}
        >
          {t.title}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-[#c4b8aa]">
          {t.message}
        </p>
      </section>

      <section className="relative z-10 mx-auto mt-10 max-w-xl px-5">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-[2rem] bg-[#fffaf5] p-6 ring-1 ring-[#eadfd2] shadow-[0_24px_80px_-30px_rgba(20,12,6,0.45)] sm:p-7"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/giftcard"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ff914d] px-6 py-3 text-sm font-semibold text-[#1a1410] transition-colors hover:bg-[#ff914d]/90"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.backToGiftCard}
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#eadfd2] bg-white px-6 py-3 text-sm font-semibold text-[#2c1810] transition-colors hover:border-[#ff914d]/60"
            >
              <Home className="h-4 w-4" />
              {t.backHome}
            </Link>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#eadfd2] bg-white/70 p-4">
            <div
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ background: `${ACCENT}14`, color: ACCENT }}
            >
              <MessageCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#2c1810]">
                {t.helpTitle}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-[#6f5a49]">
                {t.helpBody}{" "}
                <a
                  href="mailto:team@mama.is"
                  className="font-semibold text-[#ff914d] underline-offset-2 hover:underline"
                >
                  team@mama.is
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

const translations = {
  en: {
    eyebrow: "Something went wrong",
    title: "We couldn't complete your payment.",
    message:
      "Please try again. If the problem persists, we'd love to help you finish the order personally.",
    backToGiftCard: "Try again",
    backHome: "Back to home",
    helpTitle: "Need a hand?",
    helpBody: "Send us a quick note and we'll sort it out together —",
  },
  is: {
    eyebrow: "Eitthvað fór úrskeiðis",
    title: "Við gátum ekki klárað greiðsluna.",
    message:
      "Vinsamlegast reyndu aftur. Ef vandinn heldur áfram hjálpum við þér með ánægju.",
    backToGiftCard: "Reyna aftur",
    backHome: "Heim",
    helpTitle: "Þarftu aðstoð?",
    helpBody: "Sendu okkur línu og við leysum þetta saman —",
  },
};
