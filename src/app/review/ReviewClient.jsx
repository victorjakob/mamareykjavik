"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FaFacebookF, FaGoogle } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-hot-toast";

function clampText(s, max) {
  if (typeof s !== "string") return "";
  const trimmed = s.trim();
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

function OptionalBadge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-gray-200/70 bg-white/60 px-2.5 py-1 text-[11px] font-medium text-gray-600">
      {children}
    </span>
  );
}

function QuestionHeader({ label, helper, required, optional }) {
  return (
    <div className="text-center">
      <p className="text-[16px] md:text-[18px] font-medium text-gray-900">
        {label}
        {required ? (
          <>
            <span
              className="ml-0.5 align-super text-[12px] font-semibold text-gray-400"
              aria-hidden="true"
            >
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        ) : null}
        {optional ? (
          <span className="ml-2 text-[12px] font-medium text-gray-500">
            ({optional})
          </span>
        ) : null}
      </p>
      {helper ? (
        <p className="mt-1 text-[14px] md:text-[15px] text-gray-600 font-normal">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

function StarRating({ label, value, onChange, size = "md" }) {
  const [hoverValue, setHoverValue] = useState(0);
  const [burst, setBurst] = useState({ key: 0, at: 0 });
  const displayValue = hoverValue || value;
  const rowActive = value >= 1;
  const buttonSize =
    size === "sm"
      ? "h-11 w-11 md:h-10 md:w-10"
      : "h-12 w-12 md:h-11 md:w-11";

  const focusValue = value >= 1 ? value : 1;
  const sparkVectors = [
    { x: -14, y: -12, s: 0.95, r: -18 },
    { x: 16, y: -10, s: 0.85, r: 14 },
    { x: -18, y: 8, s: 0.75, r: -6 },
    { x: 18, y: 10, s: 0.9, r: 10 },
    { x: 0, y: -18, s: 0.7, r: 0 },
    { x: 0, y: 20, s: 0.65, r: 0 },
  ];

  const triggerBurst = (n) => {
    // increment key so AnimatePresence remounts the burst
    setBurst((prev) => ({ key: prev.key + 1, at: n }));
  };

  const onRadioKeyDown = (e, n) => {
    if (
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight" &&
      e.key !== "ArrowUp" &&
      e.key !== "ArrowDown" &&
      e.key !== "Home" &&
      e.key !== "End"
    ) {
      return;
    }
    e.preventDefault();

    let next = n;
    if (e.key === "Home") next = 1;
    else if (e.key === "End") next = 5;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = Math.max(1, n - 1);
    else if (e.key === "ArrowRight" || e.key === "ArrowDown")
      next = Math.min(5, n + 1);

    onChange(next);
  };
  return (
    <div className="w-full">
      <div
        className={[
          "mt-4 w-full max-w-[320px] mx-auto flex justify-between rounded-full border px-3 py-2 backdrop-blur-sm",
          (value >= 1 || hoverValue >= 1)
            ? "border-amber-200/70 bg-gradient-to-r from-amber-50/70 via-white/60 to-amber-50/70 shadow-[0_10px_30px_-22px_rgba(0,0,0,0.4)]"
            : "border-gray-200/70 bg-white/60",
        ].join(" ")}
        role="radiogroup"
        aria-label={label}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const active = displayValue >= n;
          const selected = value === n;
          const tabbable = (value >= 1 ? selected : n === 1) || n === focusValue;
          return (
            <motion.button
              key={n}
              type="button"
              role="radio"
              className={[
                buttonSize,
                "relative rounded-full",
                "flex items-center justify-center text-[24px] leading-none",
                "transition-all duration-200 ease-out will-change-transform",
                "active:scale-[0.98]",
                active
                  ? "text-amber-400 drop-shadow-[0_2px_10px_rgba(251,191,36,0.35)]"
                  : "text-gray-400 hover:text-amber-300",
              ].join(" ")}
              animate={{
                scale: selected ? 1.08 : 1,
                y: selected ? -1 : 0,
              }}
              transition={{ type: "spring", stiffness: 520, damping: 28 }}
              whileTap={{ scale: 0.92 }}
              aria-label={`${n} of 5`}
              aria-checked={selected}
              tabIndex={tabbable ? 0 : -1}
              onClick={() => {
                triggerBurst(n);
                onChange(n);
              }}
              onKeyDown={(e) => onRadioKeyDown(e, n)}
              onMouseEnter={() => setHoverValue(n)}
              onMouseLeave={() => setHoverValue(0)}
              onFocus={() => setHoverValue(n)}
              onBlur={() => setHoverValue(0)}
            >
              <AnimatePresence>
                {burst.at === n ? (
                  <motion.span
                    key={`${burst.key}-${n}`}
                    className="pointer-events-none absolute inset-0"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {sparkVectors.map((v, i) => (
                      <motion.span
                        key={i}
                        className="absolute left-1/2 top-1/2 text-[12px] text-amber-300/90 drop-shadow-[0_2px_10px_rgba(251,191,36,0.25)]"
                        initial={{
                          x: 0,
                          y: 0,
                          opacity: 0,
                          scale: 0.6,
                          rotate: 0,
                        }}
                        animate={{
                          x: v.x,
                          y: v.y,
                          opacity: [0, 0.95, 0],
                          scale: [0.6, v.s, 0.5],
                          rotate: v.r,
                        }}
                        transition={{
                          duration: 0.55,
                          ease: "easeOut",
                          delay: i * 0.01,
                        }}
                        style={{ transform: "translate(-50%, -50%)" }}
                        aria-hidden="true"
                      >
                        ✦
                      </motion.span>
                    ))}
                  </motion.span>
                ) : null}
              </AnimatePresence>
              ★
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function Score10({ label, value, onChange, endLeft, endRight }) {
  const focusValue = value ?? 0;

  const onRadioKeyDown = (e, i) => {
    if (
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight" &&
      e.key !== "ArrowUp" &&
      e.key !== "ArrowDown" &&
      e.key !== "Home" &&
      e.key !== "End"
    ) {
      return;
    }
    e.preventDefault();

    let next = i;
    if (e.key === "Home") next = 0;
    else if (e.key === "End") next = 10;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = Math.max(0, i - 1);
    else if (e.key === "ArrowRight" || e.key === "ArrowDown")
      next = Math.min(10, i + 1);

    onChange(next);
  };

  return (
    <div className="w-full">
      <div className="mt-4 w-full max-w-[520px] mx-auto overflow-hidden rounded-2xl border border-gray-200/70 bg-white/55 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
        <div
          className="grid grid-cols-[repeat(11,minmax(0,1fr))]"
          role="radiogroup"
          aria-label={label}
        >
          {Array.from({ length: 11 }).map((_, i) => {
            const selected = value === i;
            const tabbable = (value !== null && value !== undefined ? selected : i === 0) || i === focusValue;
            return (
              <button
                key={i}
                type="button"
                role="radio"
                className={[
                  "h-11 w-full bg-white/0 text-center",
                  "text-[12px] sm:text-[13px] font-medium tabular-nums tracking-tight",
                  "transition-colors duration-200 ease-out",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/40 focus-visible:ring-inset",
                  i === 0 ? "" : "border-l border-gray-200/70",
                  selected
                    ? "bg-gradient-to-b from-amber-100/95 via-amber-50/80 to-white/30 text-amber-900 ring-1 ring-amber-300/70 ring-inset font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                    : "text-gray-700 hover:bg-white/55 hover:text-gray-900",
                ].join(" ")}
                aria-label={`${i}`}
                aria-checked={selected}
                tabIndex={tabbable ? 0 : -1}
                onClick={() => onChange(i)}
                onKeyDown={(e) => onRadioKeyDown(e, i)}
              >
                {i}
              </button>
            );
          })}
        </div>
      </div>
      {endLeft && endRight ? (
        <div className="mt-2 w-full max-w-[520px] mx-auto flex justify-between text-xs text-gray-600">
          <span className="tabular-nums">
            0 <span className="text-gray-500">({endLeft})</span>
          </span>
          <span className="tabular-nums">
            10 <span className="text-gray-500">({endRight})</span>
          </span>
        </div>
      ) : null}
    </div>
  );
}

function MoreDetailsSection({ title, helper, children }) {
  return (
    <div className="rounded-3xl p-[1px] bg-gradient-to-br from-amber-200/20 via-white/10 to-emerald-200/15">
      <div className="rounded-3xl border border-gray-200/60 bg-white/55 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
        <div className="px-5 py-4 rounded-t-3xl bg-gradient-to-r from-amber-100/70 via-white/45 to-emerald-100/55">
          <p className="text-[clamp(14px,4.5vw,20px)] font-aegean font-semibold text-gray-700 tracking-tight text-center whitespace-nowrap">
            {title}
          </p>
          {helper ? (
            <p className="mt-1 text-sm md:text-[15px] text-gray-600 font-normal text-center">
              {helper}
            </p>
          ) : null}
        </div>
        <div className="px-5 pb-6 pt-1 border-t border-gray-100/70">
          {children}
        </div>
      </div>
    </div>
  );
}

function Card({ children }) {
  return (
    <div className="w-full max-w-[520px]">
      <div className="rounded-3xl p-[1px] bg-gradient-to-br from-amber-200/30 via-white/10 to-emerald-200/20 shadow-[0_16px_60px_-44px_rgba(0,0,0,0.55)]">
        <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/40 p-5 md:p-7">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ReviewClient({ locale = "en" }) {
  const googleReviewUrl =
    "https://www.google.com/search?sca_esv=6ea16e1948ed3e40&authuser=2&sxsrf=ANbL-n5hFxjUvDv8eUD9OEnSwWUme1ghLw:1770555349814&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOVWZkKoIgbfqP_Ks2MWNIyoBwP8VkhA9900FwhcnhRygAqc4135aO-goUMdKjrPa5_V-KlfIpZ0CZBA_TYf1rvraz612HBG20hebpGfLp0qtiwAXJg%3D%3D&q=White+Lotus+Venue+-+Reykjavik+Reviews&sa=X&ved=2ahUKEwiZ9bjV-MmSAxVNHjQIHUvpKXUQ0bkNegQIJRAH&biw=1440&bih=783&dpr=2#lrd=0x48d60b595956157f:0xb98e42c28cdbad83,3,,,,";
  const facebookUrl = "https://www.facebook.com/profile.php?id=61566431262645";

  const t = useMemo(() => {
    const en = {
      titleMain: "Quick feedback",
      titleSub: "Only takes 30 seconds",
      subtext:
        "Thanks for hosting with White Lotus. Your feedback helps us refine the space and service.",

      overallLabel: "Overall experience",
      tapToRate: "Tap a star to rate",

      recommendLabel:
        "How likely are you to recommend White Lotus to a friend/colleague?",
      recommendHelper: "0 = not likely, 10 = definitely",
      recommendLeft: "Not likely",
      recommendRight: "Definitely",

      bookingLabel: "Booking & communication",
      bookingHelper: "Before the event",
      staffLabel: "Staff service & hospitality",
      staffHelper: "During the event",
      spaceLabel: "Space readiness & cleanliness",
      optional: "Optional",

      improveLabel: "What’s one thing we could improve?",
      improvePlaceholder:
        "Example: clearer parking info, warmer lighting, smoother timing…",

      send: "Send feedback",
      underSend: "Private feedback — not public. We read every response.",

      requiredHint: "Please complete the required fields.",
      sending: "Sending…",
      sentTitle: "Thank you — we really appreciate it.",
      thanksHighTop: "Thank you so much.",
      thanksHighBottom: "We’re really glad you hosted with us.",
      middleNudge:
        "You’re all set. If you have a moment, the optional section below helps us fine‑tune the details.",

      segmentHigh: "High satisfaction",
      segmentMiddle: "Middle satisfaction",
      segmentLow: "Low satisfaction",

      yes: "Yes",
      no: "No",
      sharePubliclyTitle: "Share a review",
      googleBtn: "Leave a Google review",
      facebookBtn: "Leave a Facebook review",
      publicHelper: "",
      highFollowUpLine:
        "If you’d like, you can share a quick public review — it really helps.",

      lowHeadline: "Thank you — we’re taking this seriously.",
      lowSupport:
        "If you can, tell us what didn’t work. We’ll review it and improve our process.",
      lowRequiredLabel: "What went wrong?",
      lowRequiredPh:
        "Briefly describe what didn’t meet expectations (what, when, and why, if you can).",
      sendDetails: "Send details",
      detailsSent: "Details sent. Thank you.",

      followUpNameOpt: "Name (optional)",
      followUpContactReq: "Email (optional)",
      followUpContactPh: "name@email.com",
      followUpHelper:
        "Optional — we’ll only use this to reply about your feedback.",
      saveFollowUp: "",
      saved: "Saved.",

      addMoreLabel: "Add more details (optional, 20 seconds)",
      addMoreHelper: "",
      ambienceLabel: "Ambience / vibe (lighting, sound, warmth)",
      techLabel: "Tech & equipment",
      techNote: "Only if relevant",
      flowLabel: "Flow on the day (coordination / ease)",
      valueLabel: "Value for money",
      bestPartLabel: "What was the best part?",
      bestPartPh: "A moment, detail, or part of the experience you loved…",
      saveDetails: "Submit",
      detailsSavedTitle: "Thank you for your review",
      detailsSavedSub: "We really appreciate your input.",
      saveTestimonial: "",
    };

    const is = {
      titleMain: "Stutt endurgjöf",
      titleSub: "Tekur aðeins 30 sekúndur",
      subtext:
        "Takk fyrir að halda viðburð hjá White Lotus. Endurgjöfin hjálpar okkur að bæta rýmið og þjónustuna.",

      overallLabel: "Heildarupplifun",
      tapToRate: "Pikkaðu á stjörnu til að gefa einkunn",

      recommendLabel:
        "Hversu líklegt er að þú myndir mæla með White Lotus við vin/félaga?",
      recommendHelper: "0 = alls ekki, 10 = klárlega",
      recommendLeft: "alls ekki",
      recommendRight: "klárlega",

      bookingLabel: "Bókun & samskipti",
      bookingHelper: "Fyrir viðburð",
      staffLabel: "Þjónusta & gestrisni starfsfólks",
      staffHelper: "Á meðan á viðburðinum stóð",
      spaceLabel: "Viðbúnaður rýmis & hreinlæti",
      optional: "Valfrjálst",

      improveLabel: "Eitt sem við gætum bætt?",
      improvePlaceholder:
        "Dæmi: skýrari upplýsingar um bílastæði, hlýrri lýsing, betra flæði í tímasetningum…",

      send: "Senda endurgjöf",
      underSend: "Einkamál endurgjöf — ekki opinber. Við lesum hvert svar.",

      requiredHint: "Vinsamlegast fylltu út nauðsynlegu svæðin.",
      sending: "Sendi…",
      sentTitle: "Takk — við kunnum virkilega að meta þetta.",
      thanksHighTop: "Takk kærlega.",
      thanksHighBottom: "Okkur þykir vænt um að þú valdir White Lotus.",
      middleNudge:
        "Þetta er komið. Ef þú hefur augnablik, þá hjálpar valfrjálsi hlutinn hér fyrir neðan okkur að fínstilla smáatriðin.",

      segmentHigh: "Mjög ánægð/ur",
      segmentMiddle: "Á miðjunni",
      segmentLow: "Óánægð/ur",

      yes: "Já",
      no: "Nei",
      sharePubliclyTitle: "Deila umsögn",
      googleBtn: "Skilja eftir Google umsögn",
      facebookBtn: "Skilja eftir Facebook umsögn",
      publicHelper: "",
      highFollowUpLine:
        "Ef þú vilt, getur þú skilið eftir stutta opinbera umsögn — það hjálpar mikið.",

      lowHeadline: "Takk — við tökum þetta alvarlega.",
      lowSupport:
        "Ef þú getur, segðu okkur hvað virkaði ekki. Við förum yfir þetta og bætum ferlið okkar.",
      lowRequiredLabel: "Hvað fór úrskeiðis?",
      lowRequiredPh:
        "Lýstu stuttlega því sem stóðst ekki væntingar (hvað, hvenær og hvers vegna, ef þú getur).",
      sendDetails: "Senda nánar",
      detailsSent: "Móttökum þetta. Takk fyrir.",

      followUpNameOpt: "Nafn (valfrjálst)",
      followUpContactReq: "Netfang (valfrjálst)",
      followUpContactPh: "nafn@email.com",
      followUpHelper:
        "Valfrjálst — við notum þetta eingöngu til að svara endurgjöfinni.",
      saveFollowUp: "",
      saved: "Vistað.",

      addMoreLabel: "Bæta við nánari endurgjöf (valfrjálst, 20 sekúndur)",
      addMoreHelper: "",
      ambienceLabel: "Stemning / vibe (lýsing, hljóð, hlýja)",
      techLabel: "Tækni & búnaður",
      techNote: "Aðeins ef við á",
      flowLabel: "Flæði á deginum (samræming / einfaldleiki)",
      valueLabel: "Verðgildi",
      bestPartLabel: "Hvað var best?",
      bestPartPh: "Augnablik, smáatriði eða hluti sem þú elskaðir…",
      saveDetails: "Senda",
      detailsSavedTitle: "Takk fyrir umsögnina",
      detailsSavedSub: "Við kunnum virkilega að meta endurgjöfina.",
      saveTestimonial: "",
    };

    return locale === "is" ? is : en;
  }, [locale]);

  // Pre-submit (MAX 6 inputs)
  const [overallStars, setOverallStars] = useState(0);
  const [recommendScore, setRecommendScore] = useState(null);
  const [bookingCommunicationStars, setBookingCommunicationStars] = useState(0);
  const [staffServiceStars, setStaffServiceStars] = useState(0);
  const [spaceCleanlinessStars, setSpaceCleanlinessStars] = useState(0);
  const [improveOneThing, setImproveOneThing] = useState("");

  // After submit
  const [submitted, setSubmitted] = useState(false);
  const [segment, setSegment] = useState(null);
  const [feedbackId, setFeedbackId] = useState(null);

  // Low satisfaction
  const [lowDetails, setLowDetails] = useState("");
  const [lowDetailsSent, setLowDetailsSent] = useState(false);
  const [followUpName, setFollowUpName] = useState("");
  const [followUpContact, setFollowUpContact] = useState("");

  // Add more details
  const [ambienceVibeStars, setAmbienceVibeStars] = useState(0);
  const [techEquipmentStars, setTechEquipmentStars] = useState(0);
  const [flowOnTheDayStars, setFlowOnTheDayStars] = useState(0);
  const [valueForMoneyStars, setValueForMoneyStars] = useState(0);
  const [bestPart, setBestPart] = useState("");

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [patching, setPatching] = useState({});

  const [successModal, setSuccessModal] = useState({
    open: false,
    title: "",
    sub: "",
  });

  useEffect(() => {
    if (!successModal.open) return;
    const t = setTimeout(
      () => setSuccessModal({ open: false, title: "", sub: "" }),
      1800
    );
    return () => clearTimeout(t);
  }, [successModal.open]);

  const overallSectionRef = useRef(null);
  const recommendSectionRef = useRef(null);

  const isPatching = (key) => Boolean(patching?.[key]);

  // When moving to the Thank You screen, scroll to top.
  useEffect(() => {
    if (!submitted) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [submitted]);

  async function patchFeedback(patch, actionKey = "patch") {
    if (!feedbackId) return false;
    setPatching((prev) => ({ ...prev, [actionKey]: true }));
    setError("");
    setInfo("");
    try {
      const res = await fetch("/api/wl/review", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: feedbackId, ...patch }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Request failed");
      return true;
    } catch (e) {
      setError(e?.message || "Something went wrong");
      return false;
    } finally {
      setPatching((prev) => ({ ...prev, [actionKey]: false }));
    }
  }

  async function submitInitial(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (overallStars < 1) {
      toast.error(t.requiredHint, { position: "top-right" });
      overallSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }
    if (recommendScore === null) {
      toast.error(t.requiredHint, { position: "top-right" });
      recommendSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }

    setLoadingInitial(true);
    try {
      const res = await fetch("/api/wl/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          overall_stars: overallStars,
          recommend_score: recommendScore,
          booking_communication_stars:
            bookingCommunicationStars >= 1 ? bookingCommunicationStars : null,
          staff_service_stars: staffServiceStars >= 1 ? staffServiceStars : null,
          space_cleanliness_stars:
            spaceCleanlinessStars >= 1 ? spaceCleanlinessStars : null,
          improve_one_thing: clampText(improveOneThing, 1000) || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Request failed");
      setFeedbackId(json.id);
      setSegment(json.segment);
      setSubmitted(true);
      setInfo("");
    } catch (e2) {
      toast.error(e2?.message || "Something went wrong", { position: "top-right" });
    } finally {
      setLoadingInitial(false);
    }
  }

  async function submitLowDetails() {
    setError("");
    setInfo("");
    if (!clampText(lowDetails, 2000)) {
      setError(t.requiredHint);
      return;
    }
    const name = clampText(followUpName, 2000) || null;
    const email = clampText(followUpContact, 2000) || null;
    const ok = await patchFeedback(
      {
        low_satisfaction_details: clampText(lowDetails, 2000),
        follow_up_ok: email ? true : null,
        follow_up_name: name,
        follow_up_contact: email,
      },
      "lowDetails"
    );
    if (ok) {
      setLowDetailsSent(true);
      setInfo(t.detailsSent);
    }
  }

  return (
    <main
      className="min-h-[100dvh] px-4 pt-10 pb-[max(8rem,env(safe-area-inset-bottom))]"
      suppressHydrationWarning
    >
      <AnimatePresence>
        {successModal.open ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSuccessModal({ open: false, title: "", sub: "" })}
          >
            <motion.div
              className="absolute inset-0 bg-black/20 backdrop-blur-[3px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="relative w-full max-w-[380px]"
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rounded-[28px] p-[1px] bg-gradient-to-br from-emerald-200/80 via-white/40 to-amber-200/60 shadow-[0_34px_90px_-54px_rgba(0,0,0,0.85)]">
                <div className="relative overflow-hidden rounded-[28px] border border-white/50 bg-white/85 backdrop-blur-xl px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(16,185,129,0.18)_0%,rgba(255,255,255,0)_60%)]" />
                  <div className="pointer-events-none absolute -top-10 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-emerald-200/30 blur-2xl" />

                  <div className="relative mx-auto h-[76px] w-[76px]">
                    {/* slow, spacious sparkles */}
                    <motion.span
                      className="absolute -left-6 -top-3 h-2 w-2 rounded-full bg-emerald-300/70 blur-[0.2px]"
                      animate={{ y: [0, -10, 0], opacity: [0.25, 0.9, 0.25] }}
                      transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.span
                      className="absolute -right-4 top-1 h-1.5 w-1.5 rounded-full bg-amber-300/70 blur-[0.2px]"
                      animate={{ y: [0, -8, 0], opacity: [0.25, 0.85, 0.25] }}
                      transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                    />
                    <motion.span
                      className="absolute left-2 -bottom-4 h-1.5 w-1.5 rounded-full bg-emerald-400/60 blur-[0.2px]"
                      animate={{ y: [0, 8, 0], opacity: [0.2, 0.75, 0.2] }}
                      transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.35 }}
                    />

                    <motion.div
                      className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-100 via-white to-amber-100 ring-1 ring-emerald-200/70"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-3xl shadow-[0_18px_52px_-34px_rgba(16,185,129,0.9)]"
                      animate={{ opacity: [0.55, 0.9, 0.55] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* subtle halo sweep */}
                    <motion.div
                      className="absolute inset-[-10px] rounded-[28px] border border-emerald-200/40"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 7.5, ease: "linear", repeat: Infinity }}
                    />

                    <motion.svg
                      className="absolute inset-0 m-auto"
                      width="38"
                      height="38"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      initial="hidden"
                      animate="show"
                    >
                      <motion.path
                        d="M7.5 12.2L10.3 15L16.7 8.7"
                        stroke="rgb(5 150 105)"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        variants={{
                          hidden: { pathLength: 0, opacity: 0 },
                          show: { pathLength: 1, opacity: 1 },
                        }}
                        transition={{ duration: 0.75, ease: "easeOut", delay: 0.22 }}
                      />
                    </motion.svg>
                  </div>

                  <motion.p
                    className="relative mt-4 text-center text-[18px] font-semibold text-gray-900 tracking-tight"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut", delay: 0.06 }}
                  >
                    {successModal.title}
                  </motion.p>
                  <motion.p
                    className="relative mt-2 text-center text-sm text-gray-600"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut", delay: 0.1 }}
                  >
                    {successModal.sub}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <div className="mx-auto flex w-full max-w-[560px] flex-col gap-6">
        {!submitted ? (
          <>
            <div className="px-1 text-center">
              <h1 className="text-[34px] sm:text-3xl md:text-[36px] font-light text-gray-900 tracking-tight">
                {t.titleMain}
              </h1>
              <p className="mt-1 text-sm md:text-[14px] text-gray-500 font-medium tracking-wide">
                {t.titleSub}
              </p>
              <p className="mt-4 mx-auto max-w-[36ch] text-[15px] md:text-[16px] leading-relaxed text-gray-700 font-normal">
                {locale === "is" ? (
                  <>
                    <span className="font-medium text-gray-900">
                      Takk fyrir að halda viðburð hjá White Lotus.
                    </span>
                    <br />
                    Endurgjöfin hjálpar okkur að bæta rýmið og þjónustuna.
                  </>
                ) : (
                  <>
                    <span className="font-medium text-gray-900">
                      Thanks for hosting with White Lotus.
                    </span>
                    <br />
                    Your feedback helps us refine the space and service.
                  </>
                )}
              </p>
            </div>

            <Card>
              <form
                className="flex flex-col divide-y divide-gray-100/70"
                onSubmit={submitInitial}
                suppressHydrationWarning
              >
                {/* 1) Overall (required) */}
                <div ref={overallSectionRef} className="py-6 first:pt-0">
                  <QuestionHeader label={t.overallLabel} required />
                  <StarRating
                    label={t.overallLabel}
                    value={overallStars}
                    onChange={setOverallStars}
                  />
                </div>

                {/* 2) Recommend 0–10 (required) */}
                <div ref={recommendSectionRef} className="py-6">
                  <QuestionHeader
                    label={t.recommendLabel}
                    required
                  />
                  <div className="mt-2">
                    <Score10
                      label={t.recommendLabel}
                      value={recommendScore}
                      onChange={setRecommendScore}
                      endLeft={t.recommendLeft}
                      endRight={t.recommendRight}
                    />
                  </div>
                </div>

                {/* 3) Booking & communication (optional) */}
                <div className="py-6">
                  <QuestionHeader label={t.bookingLabel} helper={t.bookingHelper} />
                  <StarRating
                    label={t.bookingLabel}
                    value={bookingCommunicationStars}
                    onChange={setBookingCommunicationStars}
                  />
                </div>

                {/* 4) Staff service (optional) */}
                <div className="py-6">
                  <QuestionHeader label={t.staffLabel} helper={t.staffHelper} />
                  <StarRating
                    label={t.staffLabel}
                    value={staffServiceStars}
                    onChange={setStaffServiceStars}
                  />
                </div>

                {/* 5) Space readiness & cleanliness (optional) */}
                <div className="py-6">
                  <QuestionHeader label={t.spaceLabel} />
                  <StarRating
                    label={t.spaceLabel}
                    value={spaceCleanlinessStars}
                    onChange={setSpaceCleanlinessStars}
                  />
                </div>

                {/* 6) One thing to improve (optional) */}
                <div className="py-6">
                  <QuestionHeader label={t.improveLabel} />
                  <textarea
                    className="mt-4 w-full rounded-2xl border border-gray-200/70 bg-white/70 px-4 py-4 text-[15px] font-normal text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300/35 focus:border-amber-300/50 transition resize-none scroll-mb-32"
                    rows={3}
                    value={improveOneThing}
                    onChange={(e) => setImproveOneThing(e.target.value)}
                    placeholder={t.improvePlaceholder}
                    suppressHydrationWarning
                  />
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loadingInitial}
                    className="group relative h-12 w-full overflow-hidden rounded-2xl bg-[#7b5a2c] bg-gradient-to-r from-[#7b5a2c] via-[#8b6a36] to-[#7b5a2c] text-sm font-semibold text-white shadow-[0_18px_46px_-28px_rgba(0,0,0,0.65)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_22px_56px_-32px_rgba(0,0,0,0.7)] hover:brightness-[1.03] active:translate-y-0 active:shadow-[0_14px_40px_-28px_rgba(0,0,0,0.6)] disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0)_55%)]" />
                    <span className="relative inline-flex items-center justify-center gap-2">
                      {loadingInitial ? t.sending : t.send}
                      {!loadingInitial ? (
                        <span
                          aria-hidden="true"
                          className="transition-transform duration-200 group-hover:translate-x-0.5"
                        >
                          →
                        </span>
                      ) : null}
                    </span>
                  </button>
                  <p className="mt-3 text-center text-sm text-gray-600 font-normal">
                    {t.underSend}
                  </p>
                </div>
              </form>
            </Card>
          </>
        ) : (
          <>
            <div className="px-1">
              {segment === "high" ? (
                <h1 className="text-3xl sm:text-2xl md:text-3xl font-light text-gray-900 tracking-tight text-center">
                  {t.thanksHighTop}
                  <br />
                  <span className="text-xl sm:text-lg md:text-xl font-light text-gray-700">
                    {t.thanksHighBottom}
                  </span>
                </h1>
              ) : (
                <h1 className="text-3xl sm:text-2xl md:text-3xl font-light text-gray-900 tracking-tight text-center">
                  {segment === "low" ? t.lowHeadline : t.sentTitle}
                </h1>
              )}

              {segment === "low" ? (
                <p className="mt-2 text-sm md:text-[15px] leading-relaxed text-gray-700 font-normal text-center">
                  {t.lowSupport}
                </p>
              ) : null}
            </div>

            <Card>
              <div className="flex flex-col gap-6">
                {/* High satisfaction variant */}
                {segment === "high" ? (
                  <div className="flex flex-col gap-4">
                    <div className="rounded-3xl p-[1px] bg-gradient-to-br from-[#4285F4]/20 via-white/10 to-[#1877F2]/15">
                      <div className="rounded-3xl border border-gray-200/70 bg-white/55 backdrop-blur-md px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
                        <p className="text-center text-[16px] md:text-[18px] font-medium text-gray-900">
                          {t.sharePubliclyTitle}
                        </p>

                        <div className="mt-4 flex items-center justify-center gap-5">
                          <a
                            href={googleReviewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={t.googleBtn}
                            className="group inline-flex flex-col items-center justify-center gap-2 rounded-3xl border border-gray-200/70 bg-white/65 px-5 py-3 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285F4]/25"
                          >
                            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4285F4]/10 transition group-hover:bg-[#4285F4]/15">
                              <FaGoogle className="h-6 w-6 text-[#4285F4]" aria-hidden="true" />
                            </span>
                            <span className="text-xs font-medium text-gray-700">
                              Google
                            </span>
                          </a>

                          <a
                            href={facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={t.facebookBtn}
                            className="group inline-flex flex-col items-center justify-center gap-2 rounded-3xl border border-gray-200/70 bg-white/65 px-5 py-3 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877F2]/25"
                          >
                            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1877F2]/10 transition group-hover:bg-[#1877F2]/15">
                              <FaFacebookF className="h-6 w-6 text-[#1877F2]" aria-hidden="true" />
                            </span>
                            <span className="text-xs font-medium text-gray-700">
                              Facebook
                            </span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Low satisfaction variant */}
                {segment === "low" ? (
                  <div className="flex flex-col gap-4">
                    {lowDetailsSent ? (
                      <div className="rounded-3xl border border-emerald-200/70 bg-emerald-50/60 px-5 py-5 text-center">
                        <p className="text-[15px] font-semibold text-emerald-900">
                          {t.detailsSent}
                        </p>
                        <p className="mt-2 text-sm text-emerald-800/80">
                          {locale === "is"
                            ? "Við förum yfir þetta og bætum ferlið okkar."
                            : "We’ll review this and improve our process."}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <label className="text-sm font-medium text-gray-900 block text-center">
                          {t.lowRequiredLabel}
                        </label>
                        <textarea
                          className="mt-2 w-full rounded-2xl border border-gray-200/70 bg-white/70 px-4 py-3 text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/25 focus:border-[#a77d3b]/35 transition resize-none"
                          rows={4}
                          value={lowDetails}
                          onChange={(e) => setLowDetails(e.target.value)}
                          placeholder={t.lowRequiredPh}
                          suppressHydrationWarning
                        />

                        <div className="mt-4 grid grid-cols-1 gap-3">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                              <label className="text-xs font-medium text-gray-700">
                                {t.followUpNameOpt}
                              </label>
                              <input
                                className="mt-2 h-10 w-full rounded-2xl border border-gray-200/70 bg-white/70 px-4 text-sm font-normal text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/20 focus:border-[#a77d3b]/30 transition"
                                value={followUpName}
                                onChange={(e) => setFollowUpName(e.target.value)}
                                placeholder={t.namePh}
                                suppressHydrationWarning
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700">
                                {t.followUpContactReq}
                              </label>
                              <input
                                className="mt-2 h-10 w-full rounded-2xl border border-gray-200/70 bg-white/70 px-4 text-sm font-normal text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/20 focus:border-[#a77d3b]/30 transition"
                                value={followUpContact}
                                onChange={(e) => setFollowUpContact(e.target.value)}
                                placeholder={t.followUpContactPh}
                                inputMode="email"
                                autoComplete="email"
                                suppressHydrationWarning
                              />
                            </div>
                          </div>
                          <p className="text-[12px] text-gray-600 text-center">
                            {t.followUpHelper}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={isPatching("lowDetails")}
                          className="mt-3 h-11 w-full rounded-2xl bg-[#7b5a2c] text-sm font-medium text-white disabled:opacity-60 hover:bg-[#664826] transition"
                          onClick={submitLowDetails}
                        >
                          {t.sendDetails}
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Middle satisfaction bridge (so it doesn't feel empty) */}
                {segment === "middle" ? (
                  <div className="rounded-3xl border border-gray-200/70 bg-white/50 px-5 py-5 text-center">
                    <p className="text-sm md:text-[15px] leading-relaxed text-gray-700 font-normal">
                      {t.middleNudge}
                    </p>
                  </div>
                ) : null}

                <div className="py-2" aria-hidden="true">
                  <div className="relative h-[4px] w-full">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-gray-600/80 to-transparent md:via-gray-400/60" />
                    <div className="absolute inset-x-0 top-1/2 h-px bg-gray-700/80 md:bg-gray-400/60" />
                  </div>
                </div>

                <MoreDetailsSection
                  title={locale === "is" ? "Áttu 20 sekúndur í viðbót?" : "Have 20 more seconds?"}
                  helper={t.addMoreHelper}
                >
                  <div className="mt-3 flex flex-col gap-6">
                    <div>
                      <QuestionHeader label={t.ambienceLabel} />
                      <StarRating
                        label={t.ambienceLabel}
                        value={ambienceVibeStars}
                        onChange={setAmbienceVibeStars}
                        size="sm"
                      />
                    </div>

                    <div>
                      <QuestionHeader label={t.techLabel} helper={t.techNote} />
                      <StarRating
                        label={t.techLabel}
                        value={techEquipmentStars}
                        onChange={setTechEquipmentStars}
                        size="sm"
                      />
                    </div>

                    <div>
                      <QuestionHeader label={t.flowLabel} />
                      <StarRating
                        label={t.flowLabel}
                        value={flowOnTheDayStars}
                        onChange={setFlowOnTheDayStars}
                        size="sm"
                      />
                    </div>

                    <div>
                      <QuestionHeader label={t.valueLabel} />
                      <StarRating
                        label={t.valueLabel}
                        value={valueForMoneyStars}
                        onChange={setValueForMoneyStars}
                        size="sm"
                      />
                    </div>

                    <div>
                      <QuestionHeader label={t.bestPartLabel} />
                      <textarea
                        className="mt-3 w-full rounded-2xl border border-gray-200/70 bg-white/70 px-4 py-4 text-[15px] font-normal text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300/35 focus:border-amber-300/50 transition resize-none"
                        rows={3}
                        value={bestPart}
                        onChange={(e) => setBestPart(e.target.value)}
                        placeholder={t.bestPartPh}
                        suppressHydrationWarning
                      />
                    </div>

                    <button
                      type="button"
                      disabled={isPatching("moreDetailsSave")}
                      className="h-11 w-full rounded-2xl bg-[#7b5a2c] bg-gradient-to-r from-[#7b5a2c] via-[#8b6a36] to-[#7b5a2c] text-sm font-medium text-white disabled:opacity-60 hover:brightness-[1.03] transition"
                      onClick={async () => {
                        const ok = await patchFeedback(
                          {
                            ambience_vibe_stars:
                              ambienceVibeStars >= 1 ? ambienceVibeStars : null,
                            tech_equipment_stars:
                              techEquipmentStars >= 1 ? techEquipmentStars : null,
                            flow_on_the_day_stars:
                              flowOnTheDayStars >= 1 ? flowOnTheDayStars : null,
                            value_for_money_stars:
                              valueForMoneyStars >= 1 ? valueForMoneyStars : null,
                            best_part: clampText(bestPart, 2000) || null,
                          },
                          "moreDetailsSave"
                        );
                        if (ok) {
                          setSuccessModal({
                            open: true,
                            title: t.detailsSavedTitle,
                            sub: t.detailsSavedSub,
                          });
                        }
                      }}
                    >
                      {t.saveDetails}
                    </button>
                  </div>
                </MoreDetailsSection>

                {error ? (
                  <p className="text-sm text-red-600" role="alert">
                    {error}
                  </p>
                ) : null}
                {info ? (
                  <p className="text-sm text-gray-700" role="status">
                    {info}
                  </p>
                ) : null}
              </div>
            </Card>
          </>
        )}
      </div>
    </main>
  );
}

