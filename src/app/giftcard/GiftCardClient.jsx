"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Calendar,
  Gift,
  Heart,
  Mail,
  MapPin,
  Send,
  Sparkles,
  Store,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { formatPrice } from "@/util/IskFormat";
import PageBackground from "@/app/components/ui/PageBackground";

const ACCENT = "#ff914d";
const MIN_AMOUNT = 1000;
const MAX_AMOUNT = 50000;
const STEP = 1000;
const SHIPPING_COST = 690;

export default function GiftCardClient() {
  const { language } = useLanguage();
  const [amount, setAmount] = useState(5000);
  const [deliveryMethod, setDeliveryMethod] = useState("email");

  const t = translations[language] || translations.en;

  const shippingCost = deliveryMethod === "mail" ? SHIPPING_COST : 0;
  const total = amount + shippingCost;

  const handleAmountChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= MIN_AMOUNT && value <= MAX_AMOUNT) {
      setAmount(value);
    }
  };

  const handleAmountInput = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      if (value < MIN_AMOUNT) setAmount(MIN_AMOUNT);
      else if (value > MAX_AMOUNT) setAmount(MAX_AMOUNT);
      else setAmount(Math.round(value / STEP) * STEP);
    }
  };

  const handleDecrement = () =>
    setAmount(Math.max(MIN_AMOUNT, amount - STEP));
  const handleIncrement = () =>
    setAmount(Math.min(MAX_AMOUNT, amount + STEP));

  const presets = [3000, 5000, 10000, 20000];

  const deliveryOptions = [
    {
      key: "email",
      icon: Mail,
      label: t.emailDelivery,
      desc: t.emailDeliveryDesc,
      price: t.emailDeliveryPrice,
      isFree: true,
    },
    {
      key: "pickup",
      icon: Store,
      label: t.pickupDelivery,
      desc: t.pickupDeliveryDesc,
      price: t.pickupDeliveryPrice,
      isFree: true,
    },
    {
      key: "mail",
      icon: Send,
      label: t.mailDelivery,
      desc: t.mailDeliveryDesc,
      price: t.mailDeliveryPrice,
      isFree: false,
    },
  ];

  const features = [
    { icon: Sparkles, header: t.features[0].header, body: t.features[0].text },
    { icon: Calendar, header: t.features[1].header, body: t.features[1].text },
    { icon: MapPin, header: t.features[2].header, body: t.features[2].text },
    { icon: Heart, header: t.features[3].header, body: t.features[3].text },
  ];

  return (
    <div
      className="relative min-h-screen overflow-hidden pb-24"
      data-navbar-theme="dark"
    >
      <PageBackground />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[560px] bg-[#1a1410]"
      />

      {/* HERO */}
      <section className="relative z-10 mx-auto max-w-5xl px-5 pt-28 md:pt-32 text-center">
        <div className="mb-5 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-[#ff914d]/50" />
          <span
            className="text-[10px] uppercase tracking-[0.5em]"
            style={{ color: ACCENT }}
          >
            {t.eyebrow}
          </span>
          <span className="h-px w-10 bg-[#ff914d]/50" />
        </div>

        <h1
          className="font-cormorant italic font-light leading-[0.96] text-[#f0ebe3]"
          style={{ fontSize: "clamp(2.6rem, 7vw, 5.2rem)" }}
        >
          {t.title}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-sm md:text-base leading-relaxed text-[#c4b8aa]">
          {t.description}
        </p>
      </section>

      {/* PRIMARY CARD */}
      <section className="relative z-10 mx-auto mt-12 max-w-3xl px-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[2rem] bg-[#fffaf5] p-6 ring-1 ring-[#eadfd2] shadow-[0_24px_80px_-30px_rgba(20,12,6,0.45)] sm:p-9"
        >
          {/* Amount */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#9a7a62]">
                {t.chooseAmount}
              </span>
              <span className="text-[11px] uppercase tracking-[0.22em] text-[#9a7a62]">
                {formatPrice(MIN_AMOUNT)} – {formatPrice(MAX_AMOUNT)}
              </span>
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
              {presets.map((preset) => {
                const isActive = amount === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-200 ${
                      isActive
                        ? "bg-[#1a1410] text-[#fffaf5]"
                        : "bg-white text-[#2c1810] ring-1 ring-[#eadfd2] hover:ring-[#ff914d]/60"
                    }`}
                  >
                    {formatPrice(preset)}
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-[#eadfd2] bg-white/60 p-5">
              <input
                type="range"
                min={MIN_AMOUNT}
                max={MAX_AMOUNT}
                step={STEP}
                value={amount}
                onChange={handleAmountChange}
                className="w-full cursor-pointer accent-[#ff914d]"
              />
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={amount <= MIN_AMOUNT}
                  aria-label="Decrease"
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-semibold transition-all ${
                    amount <= MIN_AMOUNT
                      ? "cursor-not-allowed bg-[#f3e8da] text-[#c8b8a4]"
                      : "bg-[#fff4e8] text-[#1a1410] ring-1 ring-[#eadfd2] hover:bg-[#ffe5cc]"
                  }`}
                >
                  −
                </button>
                <div className="flex items-center gap-2 rounded-2xl border border-[#eadfd2] bg-white px-4 py-2.5">
                  <input
                    type="number"
                    min={MIN_AMOUNT}
                    max={MAX_AMOUNT}
                    step={STEP}
                    value={amount}
                    onChange={handleAmountInput}
                    className="w-28 bg-transparent text-center text-2xl font-cormorant italic text-[#2c1810] outline-none"
                  />
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9a7a62]">
                    kr
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={amount >= MAX_AMOUNT}
                  aria-label="Increase"
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-semibold transition-all ${
                    amount >= MAX_AMOUNT
                      ? "cursor-not-allowed bg-[#f3e8da] text-[#c8b8a4]"
                      : "bg-[#fff4e8] text-[#1a1410] ring-1 ring-[#eadfd2] hover:bg-[#ffe5cc]"
                  }`}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Delivery */}
          <div className="mt-9">
            <div className="mb-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#9a7a62]">
                {t.chooseDelivery}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {deliveryOptions.map(({ key, icon: Icon, label, desc, price, isFree }) => {
                const isActive = deliveryMethod === key;
                return (
                  <motion.button
                    key={key}
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => setDeliveryMethod(key)}
                    className={`text-left rounded-2xl p-4 transition-all duration-200 ${
                      isActive
                        ? "bg-[#1a1410] text-[#fffaf5] ring-1 ring-[#1a1410]"
                        : "bg-white text-[#2c1810] ring-1 ring-[#eadfd2] hover:ring-[#ff914d]/60"
                    }`}
                  >
                    <div
                      className="mb-3 flex h-9 w-9 items-center justify-center rounded-full"
                      style={{
                        background: isActive ? "rgba(255,145,77,0.18)" : `${ACCENT}14`,
                        color: ACCENT,
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-sm font-semibold leading-tight">
                      {label}
                    </div>
                    <p
                      className={`mt-1.5 text-[11.5px] leading-relaxed ${
                        isActive ? "text-[#c4b8aa]" : "text-[#6f5a49]"
                      }`}
                    >
                      {desc}
                    </p>
                    <div
                      className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                        isFree
                          ? isActive
                            ? "bg-[#ff914d]/20 text-[#ff914d]"
                            : "bg-[#e8f3ea] text-[#2f7a48]"
                          : isActive
                            ? "bg-white/10 text-[#fffaf5]"
                            : "bg-[#fdf3e7] text-[#9a6e3a]"
                      }`}
                    >
                      {price}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Total + CTA */}
          <div className="mt-9 flex flex-col gap-4 rounded-2xl bg-[#1a1410] p-5 text-[#fffaf5] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.32em] text-[#c4b8aa]">
                {t.total}
              </div>
              <div className="font-cormorant italic text-4xl leading-none">
                {formatPrice(total)}
              </div>
              {shippingCost > 0 && (
                <div className="mt-1 text-[11px] text-[#c4b8aa]">
                  {t.includesShipping} {formatPrice(SHIPPING_COST)}
                </div>
              )}
            </div>
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="shrink-0"
            >
              <Link
                href={`/giftcard/buy?amount=${amount}&delivery=${deliveryMethod}`}
                className="inline-flex items-center gap-2 rounded-full bg-[#ff914d] px-7 py-3.5 text-sm font-semibold text-[#1a1410] transition-colors duration-200 hover:bg-[#ff914d]/90"
              >
                <Gift className="h-4 w-4" />
                {t.buttonText}
              </Link>
            </motion.div>
          </div>

          <p className="mt-4 text-center text-[11px] italic text-[#9a7a62]">
            {t.buttonNote}
          </p>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 mx-auto mt-20 max-w-5xl px-5">
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-[#ff914d]/40" />
          <span
            className="text-[11px] uppercase tracking-[0.32em]"
            style={{ color: ACCENT }}
          >
            {t.featuresEyebrow}
          </span>
          <span className="h-px w-10 bg-[#ff914d]/40" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, header, body }) => (
            <div
              key={header}
              className="rounded-3xl border border-[#eadfd2] bg-white/85 p-5 backdrop-blur-sm"
            >
              <div
                className="mb-3 flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: `${ACCENT}14`, color: ACCENT }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="font-cormorant italic text-2xl leading-tight text-[#2c1810]">
                {header}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-[#6f5a49]">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CLOSING */}
      <section className="relative z-10 mx-auto mt-16 max-w-2xl px-5 text-center">
        <p className="font-cormorant italic text-2xl leading-relaxed text-[#2c1810] sm:text-3xl">
          “{t.tagline}”
        </p>
        <p className="mt-4 text-xs uppercase tracking-[0.3em] text-[#9a7a62]">
          {t.madeWith}
        </p>
      </section>
    </div>
  );
}

const translations = {
  en: {
    eyebrow: "A small envelope of Mama",
    title: "Gift Card",
    description:
      "Stews, cacao, ceremonies, candle-lit dinners. Choose any amount and how it arrives — instantly by email, picked up at the restaurant, or sent in the post.",
    chooseAmount: "Choose amount",
    chooseDelivery: "How should it arrive?",
    emailDelivery: "Email",
    emailDeliveryDesc: "Sent right away to their inbox.",
    emailDeliveryPrice: "Free",
    pickupDelivery: "Pickup",
    pickupDeliveryDesc: "Pick it up at Mama Reykjavík.",
    pickupDeliveryPrice: "Free",
    mailDelivery: "Mail (Iceland)",
    mailDeliveryDesc: "Printed card sent in the post.",
    mailDeliveryPrice: "+690 kr",
    total: "Total",
    includesShipping: "Includes shipping",
    buttonText: "Buy gift card",
    buttonNote: "A simple gift, made with care.",
    featuresEyebrow: "Why a Mama gift card",
    features: [
      { header: "Flexible", text: "Any amount from 1,000 to 50,000 kr." },
      { header: "Never expires", text: "Use it whenever the moment is right." },
      { header: "Easy to use", text: "Hand it in at Mama, online or in store." },
      { header: "Always welcome", text: "Birthdays, thank yous, just because." },
    ],
    tagline: "Give the gift of good food and good company.",
    madeWith: "Made with love · Mama Reykjavík",
  },
  is: {
    eyebrow: "Lítill umslag af Mama",
    title: "Gjafakort",
    description:
      "Súpur, kakó, athafnir, kertakvöld. Veldu upphæð og hvernig það berst — strax í tölvupósti, sótt í Mama eða sent með pósti.",
    chooseAmount: "Veldu upphæð",
    chooseDelivery: "Hvernig á það að berast?",
    emailDelivery: "Tölvupóstur",
    emailDeliveryDesc: "Sent strax í pósthólfið.",
    emailDeliveryPrice: "Ókeypis",
    pickupDelivery: "Sótt",
    pickupDeliveryDesc: "Sótt í Mama Reykjavík.",
    pickupDeliveryPrice: "Ókeypis",
    mailDelivery: "Póstur (Ísland)",
    mailDeliveryDesc: "Prentað kort sent með pósti.",
    mailDeliveryPrice: "+690 kr",
    total: "Samtals",
    includesShipping: "Innifalið sendingargjald",
    buttonText: "Kaupa gjafakort",
    buttonNote: "Einföld gjöf, gerð af alúð.",
    featuresEyebrow: "Af hverju Mama gjafakort",
    features: [
      { header: "Sveigjanlegt", text: "Hvaða upphæð sem er, 1.000–50.000 kr." },
      { header: "Rennur ekki út", text: "Notaðu þegar augnablikið passar." },
      { header: "Auðvelt", text: "Notaðu hjá okkur, á netinu eða í verslun." },
      { header: "Alltaf velkomið", text: "Afmæli, þakkir, bara af því bara." },
    ],
    tagline: "Gefðu gjöf af góðum mat og góðri stund.",
    madeWith: "Gert með ást · Mama Reykjavík",
  },
};
