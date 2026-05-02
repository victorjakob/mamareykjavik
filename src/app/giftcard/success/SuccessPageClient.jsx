"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, Home, Mail, MapPin, Package, Sparkles } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import PageBackground from "@/app/components/ui/PageBackground";

const ACCENT = "#ff914d";

export default function GiftCardSuccess() {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const t = translations[language] || translations.en;

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center" data-navbar-theme="light">
        <PageBackground />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-10 w-10 rounded-full border-2 border-[#ff914d] border-t-transparent"
        />
      </div>
    );
  }

  const steps = [
    { icon: Mail, title: t.steps[0].title, body: t.steps[0].body },
    { icon: Sparkles, title: t.steps[1].title, body: t.steps[1].body },
    { icon: MapPin, title: t.steps[2].title, body: t.steps[2].body },
    { icon: Package, title: t.steps[3].title, body: t.steps[3].body },
  ];

  return (
    <div
      className="relative min-h-screen overflow-hidden pb-24 pt-28"
      data-navbar-theme="dark"
    >
      <PageBackground />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[420px] bg-[#1a1410]"
      />

      <section className="relative z-10 mx-auto max-w-2xl px-5 text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: "rgba(255,145,77,0.18)", color: ACCENT }}
        >
          <CheckCircle2 className="h-8 w-8" strokeWidth={2.2} />
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
        <p className="mx-auto mt-2 max-w-md text-xs italic text-[#c4b8aa]/80">
          {t.emailSent}
        </p>
      </section>

      <section className="relative z-10 mx-auto mt-12 max-w-2xl px-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[2rem] bg-[#fffaf5] p-6 ring-1 ring-[#eadfd2] shadow-[0_24px_80px_-30px_rgba(20,12,6,0.45)] sm:p-8"
        >
          <div className="mb-5 flex items-center gap-3">
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.32em]"
              style={{ color: ACCENT }}
            >
              {t.howToUse}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {steps.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-[#eadfd2] bg-white/80 p-4"
              >
                <div
                  className="mb-3 flex h-9 w-9 items-center justify-center rounded-full"
                  style={{ background: `${ACCENT}14`, color: ACCENT }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold text-[#2c1810]">{title}</p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#6f5a49]">
                  {body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ff914d] px-7 py-3.5 text-sm font-semibold text-[#1a1410] transition-colors hover:bg-[#ff914d]/90"
            >
              <Home className="h-4 w-4" />
              {t.backHome}
            </Link>
            <Link
              href="/profile"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#eadfd2] bg-white px-7 py-3.5 text-sm font-semibold text-[#2c1810] transition-colors hover:border-[#ff914d]/60"
            >
              {t.viewGiftCard}
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

const translations = {
  en: {
    eyebrow: "All done",
    title: "Payment received.",
    message: "Your gift card order is in. Thank you for choosing Mama.",
    emailSent: "A confirmation email is on its way to you.",
    howToUse: "What happens next",
    backHome: "Back to home",
    viewGiftCard: "View my profile",
    steps: [
      {
        title: "Check your email",
        body: "Your receipt and gift card details land in your inbox.",
      },
      {
        title: "Activation",
        body: "Email gift cards activate within 48 hours and arrive officially from us.",
      },
      {
        title: "Pickup",
        body: "Coming to the restaurant? Show the email at the counter as proof of purchase.",
      },
      {
        title: "Mail",
        body: "Physical cards are sent to the address you provided.",
      },
    ],
  },
  is: {
    eyebrow: "Búið",
    title: "Greiðsla móttekin.",
    message: "Pöntun þín er móttekin. Takk fyrir að velja Mama.",
    emailSent: "Staðfestingarpóstur er á leiðinni til þín.",
    howToUse: "Hvað gerist næst",
    backHome: "Heim",
    viewGiftCard: "Mín síða",
    steps: [
      {
        title: "Athugaðu tölvupóst",
        body: "Kvittun og upplýsingar berast í pósthólfið þitt.",
      },
      {
        title: "Virkjun",
        body: "Tölvupóstgjafakort virkjast innan 48 klukkustunda og berast frá okkur.",
      },
      {
        title: "Sótt",
        body: "Sýndu tölvupóstinn við kassann sem sönnun á kaupum.",
      },
      {
        title: "Sent með pósti",
        body: "Prentuð kort eru send á heimilisfangið sem þú gafst upp.",
      },
    ],
  },
};
