"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

// ── Localized copy ────────────────────────────────────────────────────────────
const COPY = {
  en: {
    eyebrow: "Corporate Lunch · Daily Delivery",
    heading: "Request a quote",
    lead:
      "Choose your dishes, set the portions, and tell us where to deliver. We'll come back with a tailored quote within 24 hours.",
    chips: ["Minimum 10 portions", "1 week notice", "Reykjavík delivery", "100% plant-based"],
    step1Title: "Choose your dishes",
    step1Lead:
      "Select one or more — you can order multiple dishes for variety",
    portions: "Portions",
    minPortions: (min) => `Minimum ${min} · adjust in steps of 5`,
    dishWord: (n) => (n === 1 ? "dish" : "dishes"),
    totalPill: (dishCount, portions) =>
      `${dishCount} dish${dishCount === 1 ? "" : "es"} · ${portions} portions total`,
    step2Title: "Your details",
    fields: {
      name: { label: "Full name", placeholder: "Your name" },
      email: { label: "Email", placeholder: "you@company.com", note: "We'll send your confirmation here" },
      phone: { label: "Phone", placeholder: "+354 000 0000" },
      date: { label: "Date needed", note: "At least 1 week ahead" },
      address: { label: "Delivery address", placeholder: "Street, city — where should we deliver?" },
      notes: {
        label: "Anything else we should know?",
        placeholder: "Allergies, recurring schedule, special requirements…",
        note: "Optional",
      },
    },
    selectFirst: "Select at least one dish above to continue",
    submitSending: "Sending request…",
    submitLabel: (portions) => `Request quote for ${portions} portions →`,
    submitIdle: "Select a dish to continue",
    errorLine:
      "Something went wrong — please try again or email us at team@mama.is",
    fineprint:
      "By submitting you agree to be contacted about your request. No payment is taken at this stage.",
    successEyebrow: "Request received",
    successHeading: (first) => `We'll be in touch, ${first}.`,
    successBody: (portions, email) => (
      <>
        Your quote request for <strong className="text-[#f0ebe3]">{portions} portions</strong> is with our team.
        Expect a personalised reply within 24–48 hours at <span className="text-[#ff914d]">{email}</span>.
      </>
    ),
    backToCatering: "← Back to catering",
    visitMama: "Visit Mama",
    backHref: "/catering",
    homeHref: "/",
    dishes: {
      "peanut-stew": { name: "West African Peanut Stew", desc: "Rich, creamy, warmly spiced. A Mama classic.", tags: ["GF", "crowd favourite"] },
      "dahl": { name: "Dahl à la Mama", desc: "Slow-cooked red lentils, cumin, coconut milk.", tags: ["GF", "high protein"] },
      "chili": { name: "Chili Sin Carne", desc: "Deep, smoky, fiercely hearty. Built to satisfy.", tags: ["GF", "hearty"] },
      "curry": { name: "Seasonal Curry", desc: "Changes with what's fresh and locally available.", tags: ["GF", "adaptable"] },
    },
  },
  is: {
    eyebrow: "Hádegismatur fyrir fyrirtæki · Daglegar sendingar",
    heading: "Biddu um tilboð",
    lead:
      "Veldu réttina, stilltu skammtana og segðu okkur hvert á að senda. Við sendum sérsniðið tilboð innan 24 klst.",
    chips: ["Lágmark 10 skammtar", "1 viku fyrirvari", "Heimsending í Reykjavík", "100% plöntubundið"],
    step1Title: "Veldu réttina þína",
    step1Lead:
      "Veldu einn eða fleiri — þú getur pantað marga rétti fyrir fjölbreytni",
    portions: "Skammtar",
    minPortions: (min) => `Lágmark ${min} · stilla í skrefum af 5`,
    dishWord: (n) => (n === 1 ? "réttur" : "réttir"),
    totalPill: (dishCount, portions) =>
      `${dishCount} ${dishCount === 1 ? "réttur" : "réttir"} · ${portions} skammtar alls`,
    step2Title: "Upplýsingar þínar",
    fields: {
      name: { label: "Fullt nafn", placeholder: "Nafnið þitt" },
      email: { label: "Netfang", placeholder: "þú@fyrirtaeki.is", note: "Við sendum staðfestingu hingað" },
      phone: { label: "Sími", placeholder: "+354 000 0000" },
      date: { label: "Dagsetning", note: "Að minnsta kosti 1 viku fyrirvari" },
      address: { label: "Sendingaradressa", placeholder: "Gata, borg — hvert eigum við að senda?" },
      notes: {
        label: "Eitthvað annað sem við ættum að vita?",
        placeholder: "Ofnæmi, endurtekið skipulag, sérstakar kröfur…",
        note: "Valfrjálst",
      },
    },
    selectFirst: "Veldu að minnsta kosti einn rétt að ofan til að halda áfram",
    submitSending: "Sendi beiðni…",
    submitLabel: (portions) => `Biðja um tilboð fyrir ${portions} skammta →`,
    submitIdle: "Veldu rétt til að halda áfram",
    errorLine:
      "Eitthvað fór úrskeiðis — reyndu aftur eða sendu okkur póst á team@mama.is",
    fineprint:
      "Með því að senda samþykkir þú að hafa megi samband við þig varðandi beiðnina. Engin greiðsla tekin á þessu stigi.",
    successEyebrow: "Beiðni móttekin",
    successHeading: (first) => `Við höfum samband, ${first}.`,
    successBody: (portions, email) => (
      <>
        Tilboðsbeiðnin þín fyrir <strong className="text-[#f0ebe3]">{portions} skammta</strong> er komin til teymisins.
        Búastu við persónulegu svari innan 24–48 klst. á <span className="text-[#ff914d]">{email}</span>.
      </>
    ),
    backToCatering: "← Til baka í veislumat",
    visitMama: "Heimsækja Mama",
    backHref: "/is/catering",
    homeHref: "/is",
    dishes: {
      "peanut-stew": { name: "Vestur-afrískur hnetu-pottréttur", desc: "Rjómamjúkur, hlýtt kryddaður. Mama klassík.", tags: ["GF", "vinsæll"] },
      "dahl": { name: "Dahl à la Mama", desc: "Rauðar linsur, kúmen, kókosmjólk.", tags: ["GF", "próteinríkur"] },
      "chili": { name: "Chili Sin Carne", desc: "Djúpur, reyktur, saðsamur. Byggður til að metta.", tags: ["GF", "saðsamur"] },
      "curry": { name: "Árstíða-karrý", desc: "Breytist eftir því sem er ferskt og staðbundið.", tags: ["GF", "sveigjanlegt"] },
    },
  },
};

// ── Dish catalogue (keys only; text comes from COPY) ──────────────────────────
const DISHES = [
  { id: "peanut-stew", emoji: "🥜", img: "/mamaimg/mamadahl.jpg" },
  { id: "dahl", emoji: "🫘", img: "/mamaimg/mamadahl.jpg" },
  { id: "chili", emoji: "🌶", img: "/mamaimg/mamavibe1.jpg" },
  { id: "curry", emoji: "🌿", img: "/mamaimg/mamavibe1.jpg" },
];

const MIN_QTY = 10;

// ── Helpers ───────────────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Tag({ label }) {
  return (
    <span className="rounded-full border border-white/[0.10] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-[#8a7e72]">
      {label}
    </span>
  );
}

// ── Dish card ─────────────────────────────────────────────────────────────────
function DishCard({ dish, localizedDish, qty, selected, onToggle, onQty, t }) {
  return (
    <motion.div
      layout
      onClick={() => onToggle(dish.id)}
      className="relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300"
      style={{
        border: selected ? "1.5px solid #ff914d" : "1.5px solid rgba(255,255,255,0.07)",
        background: selected ? "rgba(255,145,77,0.06)" : "rgba(255,255,255,0.025)",
        boxShadow: selected ? "0 0 24px rgba(255,145,77,0.12)" : "none",
      }}
    >
      {/* Image strip */}
      <div className="relative h-32 overflow-hidden">
        <Image
          src={dish.img}
          alt={localizedDish.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#110f0d] via-[#110f0d]/40 to-transparent" />
        {/* Selected checkmark */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "backOut" }}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#ff914d] flex items-center justify-center"
            >
              <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
        <span className="absolute bottom-3 left-4 text-xl">{dish.emoji}</span>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3
          className="font-cormorant font-light italic leading-snug mb-1"
          style={{ fontSize: "1.15rem", color: selected ? "#ff914d" : "#f0ebe3" }}
        >
          {localizedDish.name}
        </h3>
        <p className="text-xs leading-relaxed text-[#6a5e52] mb-3">{localizedDish.desc}</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {localizedDish.tags.map((tg) => <Tag key={tg} label={tg} />)}
        </div>

        {/* Qty stepper — only visible when selected */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between rounded-xl border border-white/[0.10] bg-white/[0.04] px-3 py-2">
                <span className="text-xs text-[#8a7e72]">{t.portions}</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onQty(dish.id, Math.max(MIN_QTY, qty - 5))}
                    className="w-7 h-7 rounded-full border border-white/[0.12] flex items-center justify-center text-[#a09488] hover:border-[#ff914d]/40 hover:text-[#ff914d] transition-colors"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-[#f0ebe3]">{qty}</span>
                  <button
                    type="button"
                    onClick={() => onQty(dish.id, qty + 5)}
                    className="w-7 h-7 rounded-full border border-white/[0.12] flex items-center justify-center text-[#a09488] hover:border-[#ff914d]/40 hover:text-[#ff914d] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-[#4a3f37]">{t.minPortions(MIN_QTY)}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Input component ───────────────────────────────────────────────────────────
function DarkInput({ label, name, type = "text", value, onChange, placeholder, required, note }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7e72]">
        {label}
        {required && <span className="text-[#ff914d] ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          background: "rgba(255,255,255,0.04)",
          border: focused ? "1.5px solid #ff914d" : "1.5px solid rgba(255,255,255,0.09)",
          boxShadow: focused ? "0 0 0 3px rgba(255,145,77,0.10)" : "none",
          color: "#f0ebe3",
          outline: "none",
          transition: "border 0.18s, box-shadow 0.18s",
        }}
        className="w-full rounded-xl px-4 py-3 text-sm placeholder:text-[#4a3f37]"
      />
      {note && <p className="text-[10px] text-[#4a3f37]">{note}</p>}
    </div>
  );
}

function DarkTextarea({ label, name, value, onChange, placeholder, note }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7e72]">
        {label}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          background: "rgba(255,255,255,0.04)",
          border: focused ? "1.5px solid #ff914d" : "1.5px solid rgba(255,255,255,0.09)",
          boxShadow: focused ? "0 0 0 3px rgba(255,145,77,0.10)" : "none",
          color: "#f0ebe3",
          outline: "none",
          resize: "vertical",
          transition: "border 0.18s, box-shadow 0.18s",
        }}
        className="w-full rounded-xl px-4 py-3 text-sm placeholder:text-[#4a3f37]"
      />
      {note && <p className="text-[10px] text-[#4a3f37]">{note}</p>}
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────
export default function CateringQuoteForm() {
  const { language } = useLanguage();
  const t = COPY[language === "is" ? "is" : "en"];

  const [selections, setSelections] = useState({}); // { dishId: qty }
  const [fields, setFields] = useState({ name: "", email: "", phone: "", address: "", date: "", notes: "" });
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error

  const toggleDish = (id) => {
    setSelections((prev) => {
      if (prev[id] !== undefined) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: MIN_QTY };
    });
  };

  const setQty = (id, qty) => setSelections((prev) => ({ ...prev, [id]: qty }));

  const handleField = (e) => setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const selectedCount = Object.keys(selections).length;
  const totalPortions = Object.values(selections).reduce((s, q) => s + q, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedCount === 0) return;
    setStatus("submitting");

    const items = Object.entries(selections).map(([id, qty]) => ({
      // Always send English dish names in the request payload so the
      // internal email / admin view stays in one language.
      dish: COPY.en.dishes[id]?.name ?? id,
      qty,
    }));

    try {
      const res = await fetch("/api/sendgrid/catering-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, items }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (status === "success") {
    const first = fields.name.split(" ")[0];
    return (
      <section
        data-navbar-theme="dark"
        className="min-h-screen bg-[#0e0b08] flex items-center justify-center px-6 py-24"
      >
        <FadeUp className="max-w-md w-full text-center">
          <div className="inline-flex w-16 h-16 rounded-full bg-[#ff914d]/10 border border-[#ff914d]/20 items-center justify-center mb-8 mx-auto">
            <svg className="w-8 h-8 text-[#ff914d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs uppercase tracking-[0.35em] text-[#ff914d] mb-3">{t.successEyebrow}</p>
          <h2
            className="font-cormorant font-light italic leading-tight mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)", color: "#f0ebe3" }}
          >
            {t.successHeading(first)}
          </h2>
          <p className="text-[#8a7e72] leading-relaxed mb-10">
            {t.successBody(totalPortions, fields.email)}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={t.backHref}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-sm text-[#f0ebe3] hover:bg-white/[0.06] transition"
            >
              {t.backToCatering}
            </Link>
            <Link
              href={t.homeHref}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ff914d] px-7 py-3.5 text-sm font-semibold text-black hover:bg-[#ff914d]/90 transition"
            >
              {t.visitMama}
            </Link>
          </div>
        </FadeUp>
      </section>
    );
  }

  // ── Main form ───────────────────────────────────────────────────────────────
  return (
    <main
      data-navbar-theme="dark"
      className="min-h-screen bg-[#0e0b08] text-[#f0ebe3] overflow-x-hidden"
    >
      {/* ── Hero header ──────────────────────────────────────────────────── */}
      <div className="relative pt-32 pb-16 px-6 text-center overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 rounded-full bg-[#ff914d]/[0.06] blur-3xl" />

        <FadeUp delay={0.05}>
          <p className="text-xs uppercase tracking-[0.4em] text-[#ff914d] mb-4">{t.eyebrow}</p>
        </FadeUp>
        <FadeUp delay={0.12}>
          <h1
            className="font-cormorant font-light italic leading-tight mb-5"
            style={{ fontSize: "clamp(2.6rem, 6vw, 4.5rem)", color: "#f0ebe3" }}
          >
            {t.heading}
          </h1>
        </FadeUp>
        <FadeUp delay={0.2}>
          <p className="max-w-lg mx-auto text-[#8a7e72] leading-relaxed">
            {t.lead}
          </p>
        </FadeUp>
        <FadeUp delay={0.28}>
          <div className="mt-6 flex flex-wrap justify-center gap-5 text-xs text-[#6a5e52]">
            {t.chips.map((chip) => (
              <span key={chip} className="flex items-center gap-1.5">
                <span className="text-[#ff914d]/50">✦</span> {chip}
              </span>
            ))}
          </div>
        </FadeUp>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-5xl px-6 pb-24 sm:px-10">

        {/* ── Step 1: Dishes ──────────────────────────────────────────────── */}
        <FadeUp delay={0.1}>
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex w-6 h-6 rounded-full bg-[#ff914d]/10 border border-[#ff914d]/20 items-center justify-center text-[10px] font-bold text-[#ff914d]">1</span>
              <h2 className="font-cormorant italic font-light text-2xl text-[#f0ebe3]">{t.step1Title}</h2>
            </div>
            <p className="text-xs text-[#6a5e52] ml-9 mb-6">{t.step1Lead}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {DISHES.map((dish, i) => (
                <FadeUp key={dish.id} delay={0.1 + i * 0.06}>
                  <DishCard
                    dish={dish}
                    localizedDish={t.dishes[dish.id]}
                    qty={selections[dish.id] ?? MIN_QTY}
                    selected={selections[dish.id] !== undefined}
                    onToggle={toggleDish}
                    onQty={setQty}
                    t={t}
                  />
                </FadeUp>
              ))}
            </div>

            {/* Selection summary pill */}
            <AnimatePresence>
              {selectedCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.3 }}
                  className="mt-5 flex items-center justify-center gap-3"
                >
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#ff914d]/25 bg-[#ff914d]/[0.07] px-5 py-2 text-sm text-[#ff914d]">
                    <span>✦</span>
                    <span>{t.totalPill(selectedCount, totalPortions)}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FadeUp>

        {/* ── Step 2: Details ─────────────────────────────────────────────── */}
        <FadeUp delay={0.25}>
          <div
            className="rounded-2xl p-6 sm:p-8 md:p-10"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center gap-3 mb-7">
              <span className="flex w-6 h-6 rounded-full bg-[#ff914d]/10 border border-[#ff914d]/20 items-center justify-center text-[10px] font-bold text-[#ff914d]">2</span>
              <h2 className="font-cormorant italic font-light text-2xl text-[#f0ebe3]">{t.step2Title}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <DarkInput
                label={t.fields.name.label}
                name="name"
                value={fields.name}
                onChange={handleField}
                placeholder={t.fields.name.placeholder}
                required
              />
              <DarkInput
                label={t.fields.email.label}
                name="email"
                type="email"
                value={fields.email}
                onChange={handleField}
                placeholder={t.fields.email.placeholder}
                required
                note={t.fields.email.note}
              />
              <DarkInput
                label={t.fields.phone.label}
                name="phone"
                type="tel"
                value={fields.phone}
                onChange={handleField}
                placeholder={t.fields.phone.placeholder}
                required
              />
              <DarkInput
                label={t.fields.date.label}
                name="date"
                type="date"
                value={fields.date}
                onChange={handleField}
                required
                note={t.fields.date.note}
              />
              <div className="sm:col-span-2">
                <DarkInput
                  label={t.fields.address.label}
                  name="address"
                  value={fields.address}
                  onChange={handleField}
                  placeholder={t.fields.address.placeholder}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <DarkTextarea
                  label={t.fields.notes.label}
                  name="notes"
                  value={fields.notes}
                  onChange={handleField}
                  placeholder={t.fields.notes.placeholder}
                  note={t.fields.notes.note}
                />
              </div>
            </div>
          </div>
        </FadeUp>

        {/* ── Submit ──────────────────────────────────────────────────────── */}
        <FadeUp delay={0.35}>
          <div className="mt-8 flex flex-col items-center gap-4">
            {selectedCount === 0 && (
              <p className="text-xs text-[#6a5e52]">{t.selectFirst}</p>
            )}

            <motion.button
              type="submit"
              disabled={status === "submitting" || selectedCount === 0}
              whileHover={selectedCount > 0 ? { scale: 1.02, y: -1 } : undefined}
              whileTap={selectedCount > 0 ? { scale: 0.98 } : undefined}
              className="relative w-full max-w-sm rounded-full px-10 py-4 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed overflow-hidden"
              style={{
                background: selectedCount === 0 ? "rgba(255,255,255,0.04)" : "#ff914d",
                color: selectedCount === 0 ? "#4a3f37" : "#000",
                boxShadow: selectedCount > 0 ? "0 4px 24px rgba(255,145,77,0.3)" : "none",
              }}
            >
              {status === "submitting"
                ? t.submitSending
                : selectedCount > 0
                ? t.submitLabel(totalPortions)
                : t.submitIdle}
            </motion.button>

            {status === "error" && (
              <p className="text-sm text-red-400">{t.errorLine}</p>
            )}

            <p className="text-xs text-[#4a3f37]">
              {t.fineprint}
            </p>
          </div>
        </FadeUp>

      </form>
    </main>
  );
}
