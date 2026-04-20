"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Loader2, Check, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

// Client body for /tribe-card/request — extracted so page.jsx can stay a
// server component and export proper metadata. See ../page.jsx.
//
// Locale comes from `useLanguage()` (hydrated from the `x-locale`
// header via the root LanguageProvider). Same file serves both EN and IS.

const COPY = {
  en: {
    back: "Back",
    eyebrow: "Mama · Tribe",
    heading: "Request your Tribe Card",
    heroLead:
      "Fill this in and we'll personally review your request. Once approved, your card will be in your inbox and waiting in your Mama profile.",
    fields: {
      name: "Your name",
      namePlaceholder: "Full name",
      email: "Email",
      emailPlaceholder: "you@example.com",
      phone: "Phone (optional)",
      phonePlaceholder: "+354 ...",
      message: "Anything we should know? (optional)",
      messagePlaceholder: "e.g. when / how you received your original card",
    },
    submit: "Send request",
    submitting: "Sending...",
    fineprint:
      "By sending, you agree that we may contact you at the email you provide about your Tribe Card.",
    toastErrFallback: "Something went wrong. Please try again.",
    toastNetwork: "Could not reach the server. Please try again.",
    doneAlreadyHeading: "You're already in ✨",
    doneThanksHeading: "Thank you",
    doneAlreadyBody:
      "It looks like you already have an active Tribe Card with us.",
    doneThanksBody:
      "We've received your request. We'll review it personally and email you once your card is ready.",
    doneAlreadyDetail: (profileLink) => (
      <>
        Check your inbox for your welcome email, or visit your {profileLink} to see your card.
      </>
    ),
    profile: "profile",
    backToMama: "Back to Mama",
    homeHref: "/",
    backHref: "/tribe-card",
    profileHref: "/profile/my-tribe-card",
  },
  is: {
    back: "Til baka",
    eyebrow: "Mama · Ættbálkur",
    heading: "Sæktu um Ættbálkurkortið þitt",
    heroLead:
      "Fylltu þetta út og við förum yfir beiðnina persónulega. Þegar hún hefur verið samþykkt kemur kortið í pósthólfið þitt og bíður í Mama prófílnum.",
    fields: {
      name: "Nafn",
      namePlaceholder: "Fullt nafn",
      email: "Netfang",
      emailPlaceholder: "þú@dæmi.is",
      phone: "Sími (valfrjálst)",
      phonePlaceholder: "+354 ...",
      message: "Er eitthvað sem við ættum að vita? (valfrjálst)",
      messagePlaceholder: "t.d. hvenær / hvernig þú fékkst upprunalega kortið",
    },
    submit: "Senda beiðni",
    submitting: "Sendi...",
    fineprint:
      "Með því að senda samþykkir þú að við megum hafa samband við þig á uppgefið netfang um Ættbálkurkortið þitt.",
    toastErrFallback: "Eitthvað fór úrskeiðis. Reyndu aftur.",
    toastNetwork: "Náðist ekki í netþjón. Reyndu aftur.",
    doneAlreadyHeading: "Þú ert nú þegar með ✨",
    doneThanksHeading: "Takk fyrir",
    doneAlreadyBody:
      "Það lítur út fyrir að þú sért þegar með virkt Ættbálkurkort hjá okkur.",
    doneThanksBody:
      "Við höfum móttekið beiðnina. Við förum yfir hana persónulega og sendum tölvupóst þegar kortið er tilbúið.",
    doneAlreadyDetail: (profileLink) => (
      <>
        Athugaðu póstinn þinn fyrir móttökubréfinu, eða heimsæktu {profileLink} til að sjá kortið.
      </>
    ),
    profile: "prófílinn þinn",
    backToMama: "Til baka á Mama",
    homeHref: "/is",
    backHref: "/is/tribe-card",
    profileHref: "/profile/my-tribe-card",
  },
};

export default function TribeCardRequestClient() {
  const { language } = useLanguage();
  const t = COPY[language === "is" ? "is" : "en"];

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyHasCard, setAlreadyHasCard] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/tribe-cards/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || t.toastErrFallback);
        setSubmitting(false);
        return;
      }
      if (data.alreadyHasCard) setAlreadyHasCard(true);
      setSubmitted(true);
    } catch (err) {
      toast.error(t.toastNetwork);
    } finally {
      setSubmitting(false);
    }
  };

  const profileLink = (
    <Link href={t.profileHref} className="text-[#c76a2b] underline">
      {t.profile}
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff6ea] via-white to-[#f5efe6]">
      {/* Dark warm hero — navbar sits on a dark bg here. */}
      <section
        data-navbar-theme="dark"
        className="relative overflow-hidden bg-gradient-to-br from-[#1a0f08] via-[#2c1810] to-[#5c2e12] pt-28 sm:pt-32 pb-12 px-5"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            background:
              "radial-gradient(circle at 22% 18%, rgba(255,145,77,0.3) 0%, transparent 55%), radial-gradient(circle at 80% 80%, rgba(31,92,75,0.25) 0%, transparent 55%)",
          }}
        />
        <div className="relative max-w-xl mx-auto">
          <Link
            href={t.backHref}
            className="inline-flex items-center gap-1.5 text-[13px] text-white/70 hover:text-[#ff914d] mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {t.back}
          </Link>
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#f1c9a0] mb-2">
            {t.eyebrow}
          </p>
          <h1
            className="font-cormorant italic text-white text-4xl sm:text-[44px] font-light leading-tight"
            style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
          >
            {t.heading}
          </h1>
          <p className="text-white/85 text-[15px] sm:text-base leading-relaxed mt-4">
            {t.heroLead}
          </p>
        </div>
      </section>

      <div className="pb-20 px-5">
        <div className="max-w-xl mx-auto pt-10">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              <form onSubmit={onSubmit} className="space-y-4">
                <Field label={t.fields.name} required>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    required
                    autoComplete="name"
                    className="tc-input"
                    placeholder={t.fields.namePlaceholder}
                  />
                </Field>

                <Field label={t.fields.email} required>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    required
                    autoComplete="email"
                    className="tc-input"
                    placeholder={t.fields.emailPlaceholder}
                  />
                </Field>

                <Field label={t.fields.phone}>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    autoComplete="tel"
                    className="tc-input"
                    placeholder={t.fields.phonePlaceholder}
                  />
                </Field>

                <Field label={t.fields.message}>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={onChange}
                    rows={3}
                    className="tc-input resize-none"
                    placeholder={t.fields.messagePlaceholder}
                  />
                </Field>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#c76a2b] hover:bg-[#a5551f] disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-white font-semibold rounded-full text-[15px] shadow-md"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {submitting ? t.submitting : t.submit}
                </button>

                <p className="text-[12px] text-[#8a7261] text-center">
                  {t.fineprint}
                </p>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl bg-white/90 border border-[#eadfd2] p-8 text-center"
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-[#1f5c4b]/10 flex items-center justify-center mb-5">
                <Check className="w-6 h-6 text-[#1f5c4b]" strokeWidth={2} />
              </div>
              <h2
                className="font-cormorant italic text-[#2c1810] text-3xl mb-3"
                style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
              >
                {alreadyHasCard ? t.doneAlreadyHeading : t.doneThanksHeading}
              </h2>
              <p className="text-[#6a5040] text-[15px] leading-relaxed mb-1">
                {alreadyHasCard ? t.doneAlreadyBody : t.doneThanksBody}
              </p>
              {alreadyHasCard ? (
                <p className="text-[#6a5040] text-[14px] leading-relaxed mt-3">
                  {t.doneAlreadyDetail(profileLink)}
                </p>
              ) : null}
              <Link
                href={t.homeHref}
                className="inline-block mt-7 text-[13px] text-[#8a7261] hover:text-[#c76a2b]"
              >
                {t.backToMama}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>

      <style jsx>{`
        :global(.tc-input) {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid #eadfd2;
          border-radius: 12px;
          background: #ffffff;
          color: #2c1810;
          font-size: 15px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        :global(.tc-input:focus) {
          outline: none;
          border-color: #c76a2b;
          box-shadow: 0 0 0 3px rgba(199, 106, 43, 0.12);
        }
        :global(.tc-input::placeholder) {
          color: #b8a796;
        }
      `}</style>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="text-[12px] tracking-[0.14em] uppercase text-[#8a7261] font-semibold block mb-1.5">
        {label} {required ? <span className="text-[#c76a2b]">*</span> : null}
      </span>
      {children}
    </label>
  );
}
