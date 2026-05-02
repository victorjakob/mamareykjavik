"use client";

import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  CalendarDays,
  CheckCircle2,
  Coins,
  Flame,
  Heart,
  MapPin,
  Music,
  Sparkles,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import PageBackground from "@/app/components/ui/PageBackground";

const ACCENT = "#ff914d";

export default function PrivateBookingPage() {
  const { language } = useLanguage();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

  const t = translations[language];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      participants: "",
      intention: "",
    },
  });

  useEffect(() => {
    if (session?.user?.email) setValue("email", session.user.email);
    if (session?.user?.name) setValue("name", session.user.name);
  }, [session, setValue]);

  useEffect(() => {
    if (!submitStatus.type) return;
    const ms = submitStatus.type === "success" ? 6000 : 7000;
    const timer = setTimeout(
      () => setSubmitStatus({ type: "", message: "" }),
      ms,
    );
    return () => clearTimeout(timer);
  }, [submitStatus]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus({ type: "", message: "" });

    try {
      const response = await fetch("/api/sendgrid/private-cacao-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to send booking request");

      setSubmitStatus({ type: "success", message: t.successMessage });
      reset({
        name: session?.user?.name || "",
        email: session?.user?.email || "",
        participants: "",
        intention: "",
        location: "",
        preferredDate: "",
        additionalNotes: "",
      });
    } catch (error) {
      console.error("Error sending booking request:", error);
      setSubmitStatus({ type: "error", message: t.errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => setSubmitStatus({ type: "", message: "" });

  return (
    <div
      className="relative min-h-screen overflow-hidden pb-24 pt-28"
      data-navbar-theme="dark"
    >
      <PageBackground />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[640px] bg-[#110f0d]"
      />

      <section className="relative z-10 mx-auto max-w-5xl px-5">
        <div className="mb-5 flex items-center gap-3 lg:pl-28 xl:pl-36">
          <div
            className="h-px w-10 bg-gradient-to-r from-transparent"
            style={{ "--tw-gradient-to": `${ACCENT}99` }}
          />
          <span
            className="text-xs uppercase tracking-[0.35em]"
            style={{ color: ACCENT }}
          >
            {t.eyebrow}
          </span>
        </div>

        <h1
          className="font-cormorant italic font-light leading-[0.95] text-[#f0ebe3]"
          style={{ fontSize: "clamp(2.6rem, 7vw, 5.5rem)" }}
        >
          {t.title}
        </h1>
        <p className="mt-7 max-w-2xl text-base leading-relaxed text-[#b8aca0] sm:text-lg">
          {t.intro}
        </p>

        <div className="mt-9 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {[
            { icon: Users, label: t.badgeGuests },
            { icon: Coins, label: t.badgeInvestment },
            { icon: CalendarDays, label: t.badgeLeadTime },
            { icon: Flame, label: t.badgeDuration },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 rounded-2xl bg-white/[0.06] px-3.5 py-3 text-[#f0ebe3] ring-1 ring-white/10"
            >
              <Icon className="h-4 w-4 shrink-0" style={{ color: ACCENT }} />
              <span className="text-[12px] leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 mx-auto mt-24 max-w-5xl px-5">
        <div className="mb-8 flex items-center gap-3">
          <Sparkles className="h-4 w-4" style={{ color: ACCENT }} />
          <span
            className="text-xs uppercase tracking-[0.32em]"
            style={{ color: ACCENT }}
          >
            {t.howEyebrow}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {t.steps.map((step, i) => (
            <div
              key={step.title}
              className="rounded-3xl border border-[#eadfd2] bg-white/85 p-6 backdrop-blur-sm"
            >
              <div
                className="font-cormorant text-3xl italic leading-none"
                style={{ color: ACCENT }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-3 text-base font-semibold text-[#2c1810]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6f5a49]">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* What's included */}
      <section className="relative z-10 mx-auto mt-16 max-w-5xl px-5">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-start">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Heart className="h-4 w-4" style={{ color: ACCENT }} />
              <span
                className="text-xs uppercase tracking-[0.32em]"
                style={{ color: ACCENT }}
              >
                {t.includedEyebrow}
              </span>
            </div>
            <h2 className="font-cormorant text-4xl italic leading-tight text-[#2c1810] sm:text-5xl">
              {t.includedTitle}
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#6f5a49]">
              {t.includedIntro}
            </p>
          </div>

          <ul className="space-y-3">
            {t.included.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="flex items-start gap-3 rounded-2xl border border-[#eadfd2] bg-white/85 p-4"
              >
                <div
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ background: `${ACCENT}14`, color: ACCENT }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#2c1810]">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#6f5a49]">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Inquiry form */}
      <section className="relative z-10 mx-auto mt-20 grid max-w-5xl gap-8 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <div className="mb-4 flex items-center gap-3">
            <span
              className="text-xs uppercase tracking-[0.32em]"
              style={{ color: ACCENT }}
            >
              {t.formEyebrow}
            </span>
          </div>
          <h2 className="font-cormorant text-4xl italic leading-tight text-[#2c1810] sm:text-5xl">
            {t.formTitle}
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#6f5a49]">
            {t.formIntro}
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 rounded-[2rem] bg-white/85 p-5 ring-1 ring-[#eadfd2] backdrop-blur-sm sm:p-7"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.name} error={errors.name?.message}>
              <input
                {...register("name", {
                  required: t.nameRequired,
                  minLength: { value: 2, message: t.nameMinLength },
                })}
                type="text"
                className={fieldClass(errors.name)}
                placeholder={t.namePlaceholder}
              />
            </Field>

            <Field label={t.email} error={errors.email?.message}>
              <input
                {...register("email", {
                  required: t.emailRequired,
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t.emailInvalid,
                  },
                })}
                type="email"
                className={fieldClass(errors.email)}
                placeholder={t.emailPlaceholder}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t.participants}
              hint={t.participantsHint}
              error={errors.participants?.message}
            >
              <select
                {...register("participants", {
                  required: t.participantsRequired,
                })}
                className={fieldClass(errors.participants)}
                defaultValue=""
              >
                <option value="" disabled>
                  {t.participantsPlaceholder}
                </option>
                {t.participantsOptions.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label={t.intention}
              hint={t.intentionHint}
              error={errors.intention?.message}
            >
              <select
                {...register("intention", {
                  required: t.intentionRequired,
                })}
                className={fieldClass(errors.intention)}
                defaultValue=""
              >
                <option value="" disabled>
                  {t.intentionPlaceholder}
                </option>
                {t.intentionOptions.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field
            label={t.location}
            hint={t.locationHint}
            error={errors.location?.message}
          >
            <input
              {...register("location", { required: t.locationRequired })}
              type="text"
              className={fieldClass(errors.location)}
              placeholder={t.locationPlaceholder}
            />
          </Field>

          <Field label={t.preferredDate} hint={t.preferredDateHint}>
            <input
              {...register("preferredDate")}
              type="text"
              className={fieldClass()}
              placeholder={t.preferredDatePlaceholder}
            />
          </Field>

          <Field label={t.additionalNotes}>
            <textarea
              {...register("additionalNotes")}
              rows={4}
              className={`${fieldClass()} resize-none`}
              placeholder={t.additionalNotesPlaceholder}
            />
          </Field>

          <motion.button
            whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#ff914d] px-8 py-4 text-sm font-semibold tracking-wide text-[#1a1410] transition-colors duration-200 hover:bg-[#ff914d]/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? t.sending : t.submitBooking}
          </motion.button>

          <p className="text-center text-[11px] leading-relaxed text-[#9a7a62]">
            {t.formFooter}
          </p>
        </motion.form>
      </section>

      <AnimatePresence>
        {submitStatus.message && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[120] bg-black/55 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="fixed inset-0 z-[121] flex items-center justify-center p-4"
            >
              <div
                className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-[#fffaf5] p-7 ring-1 ring-[#eadfd2] shadow-[0_28px_90px_rgba(20,12,6,0.35)]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#9a7a62] transition-colors hover:bg-[#f0e6d8] hover:text-[#2c1810]"
                  aria-label={t.closeModal}
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex flex-col items-center text-center">
                  <div
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                    style={{
                      background:
                        submitStatus.type === "success"
                          ? `${ACCENT}1f`
                          : "#fdecea",
                      color:
                        submitStatus.type === "success" ? ACCENT : "#b23b2d",
                    }}
                  >
                    {submitStatus.type === "success" ? (
                      <CheckCircle2 className="h-7 w-7" strokeWidth={2.2} />
                    ) : (
                      <XCircle className="h-7 w-7" strokeWidth={2.2} />
                    )}
                  </div>

                  <h3 className="font-cormorant text-3xl italic leading-tight text-[#2c1810]">
                    {submitStatus.type === "success"
                      ? t.successTitle
                      : t.errorTitle}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#6f5a49]">
                    {submitStatus.message}
                  </p>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-5 rounded-full bg-[#ff914d] px-6 py-2.5 text-sm font-semibold text-[#1a1410] transition-colors hover:bg-[#ff914d]/90"
                  >
                    {t.closeModal}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, hint, error, children }) {
  return (
    <label className="block">
      <span className="mb-2 block pl-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9a7a62]">
        {label}
      </span>
      {children}
      {hint && !error ? (
        <span className="mt-1.5 block pl-1 text-[11px] text-[#9a7a62]">
          {hint}
        </span>
      ) : null}
      {error ? (
        <motion.span
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 block pl-1 text-[11px] text-red-500"
        >
          {error}
        </motion.span>
      ) : null}
    </label>
  );
}

function fieldClass(error) {
  return [
    "w-full rounded-2xl border px-4 py-3.5 text-sm text-[#2c1810] outline-none transition-all duration-200 placeholder:text-[#b8a998] focus:border-[#ff914d] focus:ring-4 focus:ring-[#ff914d]/15",
    error
      ? "border-red-400 bg-red-50/40"
      : "border-[#e8ddd3] bg-[#fffaf5]",
  ].join(" ");
}

const translations = {
  en: {
    eyebrow: "Private Ceremony",
    title: "A private cacao ceremony, held with care.",
    intro:
      "An intimate, fully held experience for groups, retreats, and gatherings — at White Lotus, your venue, or somewhere in nature.",

    badgeGuests: "From 10 guests",
    badgeInvestment: "From 50,000 ISK",
    badgeLeadTime: "Plan 3–4 weeks ahead",
    badgeDuration: "2 to 2.5 hour ceremony",

    howEyebrow: "How it works",
    steps: [
      {
        title: "Send your request",
        body: "Share a little about your group, intention, and the kind of moment you’re imagining.",
      },
      {
        title: "We reply personally",
        body: "We get back to you within a few days with a thoughtful proposal and questions.",
      },
      {
        title: "We co-create the ceremony",
        body: "Together we shape the day, the venue, and the elements so the ceremony fits your group.",
      },
    ],

    includedEyebrow: "Held with care",
    includedTitle: "What is included",
    includedIntro:
      "Each ceremony is shaped around your group, but every gathering carries the same essentials.",
    included: [
      {
        icon: Heart,
        title: "Facilitator & space holding",
        body: "An experienced facilitator guiding the arc of the ceremony from arrival to closing.",
      },
      {
        icon: Flame,
        title: "Ceremonial cacao",
        body: "High-quality ceremonial cacao prepared with intention for your group.",
      },
      {
        icon: Music,
        title: "Music & soundscape",
        body: "Live and curated music to support opening, journey, and integration.",
      },
      {
        icon: MapPin,
        title: "Venue options",
        body: "Held at White Lotus, your home, a retreat space, or somewhere quiet in nature.",
      },
    ],

    formEyebrow: "Inquire",
    formTitle: "Tell us about your gathering",
    formIntro:
      "This is the first step of a conversation, not a transaction. We read every inquiry personally.",

    name: "Name",
    namePlaceholder: "Your full name",
    nameRequired: "Name is required",
    nameMinLength: "Please share at least two letters",

    email: "Email",
    emailPlaceholder: "your@email.com",
    emailRequired: "Email is required",
    emailInvalid: "Please enter a valid email",

    participants: "Group size",
    participantsPlaceholder: "Select group size",
    participantsHint: "Designed for groups of 10 or more.",
    participantsRequired: "Please choose a group size",
    participantsOptions: [
      "10–15 guests",
      "16–25 guests",
      "26–40 guests",
      "40+ guests",
    ],

    intention: "Intention or occasion",
    intentionPlaceholder: "Choose what fits best",
    intentionHint: "Helps us hold the right tone for your group.",
    intentionRequired: "Please share an intention",
    intentionOptions: [
      "Birthday or celebration",
      "Team or company gathering",
      "Women’s circle",
      "Men’s circle",
      "Wellness retreat",
      "Integration or personal",
      "Something else",
    ],

    location: "Location",
    locationPlaceholder: "White Lotus, your home, a retreat venue…",
    locationHint: "If you’re not sure yet, just write “open to suggestions”.",
    locationRequired: "Please share a location idea",

    preferredDate: "Approximate window",
    preferredDatePlaceholder: "e.g. last weekend of June, evenings",
    preferredDateHint:
      "We curate the exact day with you after our reply.",

    additionalNotes: "Anything else to share",
    additionalNotesPlaceholder:
      "Special requests, sensitivities, or anything that would help us hold this well.",

    sending: "Sending…",
    submitBooking: "Send your request",
    formFooter:
      "By sending, you agree we may reply at the email you provide.",

    successTitle: "Your request is in.",
    successMessage:
      "Thank you. We read every inquiry personally and will reply within a few days.",
    errorTitle: "Something went wrong.",
    errorMessage:
      "Please try again, or reach out to team@mama.is and we’ll take it from there.",
    closeModal: "Close",
  },

  is: {
    eyebrow: "Einkaathöfn",
    title: "Einka kakó-athöfn, haldin af alúð.",
    intro:
      "Innileg og vel haldin upplifun fyrir hópa, ferðir og samkomur — í White Lotus, hjá þér, eða úti í náttúrunni.",

    badgeGuests: "Frá 10 gestum",
    badgeInvestment: "Frá 50.000 kr.",
    badgeLeadTime: "Skipuleggðu 3–4 vikum fyrirfram",
    badgeDuration: "2 til 2,5 klst. athöfn",

    howEyebrow: "Hvernig það virkar",
    steps: [
      {
        title: "Sendu beiðni",
        body: "Segðu okkur frá hópnum þínum, tilefni og hvers konar stund þú sérð fyrir þér.",
      },
      {
        title: "Við svörum persónulega",
        body: "Við sendum þér yfirvegað svar með tillögu og fáum spurningum á næstu dögum.",
      },
      {
        title: "Við sköpum athöfnina saman",
        body: "Saman mótum við daginn, staðinn og þættina svo athöfnin passi hópnum.",
      },
    ],

    includedEyebrow: "Haldin af alúð",
    includedTitle: "Hvað er innifalið",
    includedIntro:
      "Hver athöfn er sniðin að hópnum, en allar samkomur fá sömu grunnstoðirnar.",
    included: [
      {
        icon: Heart,
        title: "Leiðbeinandi og rýmishald",
        body: "Reyndur leiðbeinandi heldur boganum frá komu til lokunar.",
      },
      {
        icon: Flame,
        title: "Ceremonial kakó",
        body: "Hágæða ceremonial kakó undirbúið af einlægni fyrir hópinn þinn.",
      },
      {
        icon: Music,
        title: "Tónlist og hljóðheimur",
        body: "Lifandi og valin tónlist sem styður opnun, ferðalag og innleiðingu.",
      },
      {
        icon: MapPin,
        title: "Möguleikar á staðsetningu",
        body: "Haldin í White Lotus, heima hjá þér, í athvarfi eða úti í náttúrunni.",
      },
    ],

    formEyebrow: "Beiðni",
    formTitle: "Segðu okkur frá samkomunni",
    formIntro:
      "Þetta er upphaf samtals, ekki kaup. Við lesum hverja beiðni persónulega.",

    name: "Nafn",
    namePlaceholder: "Fullt nafn þitt",
    nameRequired: "Nafn er nauðsynlegt",
    nameMinLength: "Skrifaðu að minnsta kosti tvo stafi",

    email: "Netfang",
    emailPlaceholder: "þitt@netfang.is",
    emailRequired: "Netfang er nauðsynlegt",
    emailInvalid: "Vinsamlegast settu inn gilt netfang",

    participants: "Hópastærð",
    participantsPlaceholder: "Veldu hópastærð",
    participantsHint: "Hannað fyrir hópa af 10 eða fleiri.",
    participantsRequired: "Veldu hópastærð",
    participantsOptions: [
      "10–15 gestir",
      "16–25 gestir",
      "26–40 gestir",
      "40+ gestir",
    ],

    intention: "Tilefni eða ástæða",
    intentionPlaceholder: "Veldu það sem passar best",
    intentionHint: "Hjálpar okkur að finna réttan tón fyrir hópinn.",
    intentionRequired: "Veldu tilefni",
    intentionOptions: [
      "Afmæli eða fagnaður",
      "Vinnustaður eða teymi",
      "Kvennahringur",
      "Karlahringur",
      "Heilsuferð",
      "Innleiðing eða persónulegt",
      "Annað",
    ],

    location: "Staðsetning",
    locationPlaceholder: "White Lotus, heima hjá þér, athvarf…",
    locationHint: "Ef þú ert ekki viss, skrifaðu „opin fyrir tillögum“.",
    locationRequired: "Sendu okkur hugmynd að staðsetningu",

    preferredDate: "Tímabil",
    preferredDatePlaceholder: "t.d. seinustu helgi í júní, kvölds",
    preferredDateHint:
      "Við finnum saman nákvæman dag eftir svar.",

    additionalNotes: "Eitthvað fleira",
    additionalNotesPlaceholder:
      "Sérstakar óskir, viðkvæmni eða allt sem hjálpar okkur að halda athöfninni vel.",

    sending: "Sendi…",
    submitBooking: "Senda beiðni",
    formFooter:
      "Með sendingu samþykkir þú að við svörum á netfangið þitt.",

    successTitle: "Beiðnin þín er móttekin.",
    successMessage:
      "Takk fyrir. Við lesum hverja beiðni persónulega og svörum innan fárra daga.",
    errorTitle: "Eitthvað fór úrskeiðis.",
    errorMessage:
      "Vinsamlegast reyndu aftur, eða hafðu samband við team@mama.is.",
    closeModal: "Loka",
  },
};
