"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { FaFacebookF, FaGoogle } from "react-icons/fa";
import { toast } from "react-hot-toast";
import Card from "./components/Card";
import MoreDetailsSection from "./components/MoreDetailsSection";
import QuestionHeader from "./components/QuestionHeader";
import Score10 from "./components/Score10";
import StarRating from "./components/StarRating";
import SuccessModal from "./components/SuccessModal";

function clampText(s, max) {
  if (typeof s !== "string") return "";
  const trimmed = s.trim();
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
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
        "Hversu líklegt er að þú myndir mæla með White Lotus við vin eða samstarfsfélaga?",
      recommendHelper: "",
      recommendLeft: "Ólíklegt",
      recommendRight: "Mjög líklegt",

      bookingLabel: "Bókun og samskipti",
      bookingHelper: "Fyrir viðburð",
      staffLabel: "Þjónusta og umsjón starfsfólks",
      staffHelper: "Á meðan á viðburðinum stóð",
      spaceLabel: "Undirbúningur og hreinlæti rýmisins",
      optional: "Valfrjálst",

      improveLabel: "Hvað er eitt sem við gætum bætt?",
      improvePlaceholder:
        "Dæmi: skýrari upplýsingar, hlýrri lýsing, betra flæði/tímasetningar…",

      send: "Senda",
      underSend: "Svör eru prívat og ekki opinber.",

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

      lowHeadline: "Takk — við tökum þessu alvarlega.",
      lowSupport:
        "Ef þú getur, segðu okkur því hvað virkaði ekki. Við förum yfir þetta og bætum ferlið okkar.",
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
      bestPartPh: "Augnablik, smáatriði eða hlutir sem þú elskaðir...",
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
      1800,
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
          staff_service_stars:
            staffServiceStars >= 1 ? staffServiceStars : null,
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
      toast.error(e2?.message || "Something went wrong", {
        position: "top-right",
      });
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
      "lowDetails",
    );
    if (ok) {
      setLowDetailsSent(true);
      setInfo(t.detailsSent);
    }
  }

  return (
    <main
      className="relative min-h-[100dvh] bg-[#0e0b08] text-[#f0ebe3] px-4 pt-10 pb-[max(8rem,env(safe-area-inset-bottom))]"
      suppressHydrationWarning
    >
      {/* Subtle WL background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <Image
          src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1766576002/wl-cover_yzyuhz.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-[0.04] blur-sm scale-105"
        />
      </div>
      <SuccessModal
        open={successModal.open}
        title={successModal.title}
        sub={successModal.sub}
        onClose={() => setSuccessModal({ open: false, title: "", sub: "" })}
      />
      <div className="mx-auto flex w-full max-w-[560px] flex-col gap-6">
        {!submitted ? (
          <>
            <div className="px-1 text-center">
              <h1 className="font-cormorant font-light italic text-[#f0ebe3] tracking-tight" style={{ fontSize: "clamp(2rem, 5vw, 2.8rem)" }}>
                {t.titleMain}
              </h1>
              <p className="mt-1 text-xs uppercase tracking-[0.3em] text-[#ff914d]">
                {t.titleSub}
              </p>
              <p className="mt-4 mx-auto max-w-[36ch] text-[14px] md:text-[15px] leading-relaxed text-[#a09488] font-normal">
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
                className="flex flex-col divide-y divide-white/[0.06]"
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
                  <QuestionHeader label={t.recommendLabel} required />
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
                  <QuestionHeader
                    label={t.bookingLabel}
                    helper={t.bookingHelper}
                  />
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
                    className="mt-4 w-full rounded-2xl px-4 py-4 text-[14px] font-normal text-[#f0ebe3] placeholder:text-[#6a5e52] focus:outline-none transition resize-none scroll-mb-32" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
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
                    className="group relative h-12 w-full overflow-hidden rounded-full bg-[#ff914d] text-sm font-semibold text-black shadow-[0_2px_20px_rgba(255,145,77,0.3)] transition-all duration-200 hover:scale-[1.02] hover:bg-[#ff914d]/90 active:scale-[0.99] disabled:opacity-60"
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
                  <p className="mt-3 text-center text-xs text-[#6a5e52] font-normal">
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
                <h1 className="font-cormorant font-light italic text-[#f0ebe3] tracking-tight text-center" style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}>
                  {t.thanksHighTop}
                  <br />
                  <span className="text-lg font-light text-[#a09488]">
                    {t.thanksHighBottom}
                  </span>
                </h1>
              ) : (
                <h1 className="font-cormorant font-light italic text-[#f0ebe3] tracking-tight text-center" style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}>
                  {segment === "low" ? t.lowHeadline : t.sentTitle}
                </h1>
              )}

              {segment === "low" ? (
                <p className="mt-2 text-sm leading-relaxed text-[#a09488] font-normal text-center">
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
                      <div className="rounded-3xl px-5 py-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <p className="text-center text-[15px] font-medium text-[#f0ebe3]">
                          {t.sharePubliclyTitle}
                        </p>

                        <div className="mt-4 flex items-center justify-center gap-5">
                          <a
                            href={googleReviewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={t.googleBtn}
                            className="group inline-flex flex-col items-center justify-center gap-2 rounded-3xl px-5 py-3 transition focus-visible:outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                          >
                            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl transition" style={{ background: "rgba(66,133,244,0.12)" }}>
                              <FaGoogle
                                className="h-6 w-6 text-[#4285F4]"
                                aria-hidden="true"
                              />
                            </span>
                            <span className="text-xs font-medium text-[#a09488]">
                              Google
                            </span>
                          </a>

                          <a
                            href={facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={t.facebookBtn}
                            className="group inline-flex flex-col items-center justify-center gap-2 rounded-3xl px-5 py-3 transition focus-visible:outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                          >
                            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl transition" style={{ background: "rgba(24,119,242,0.12)" }}>
                              <FaFacebookF
                                className="h-6 w-6 text-[#1877F2]"
                                aria-hidden="true"
                              />
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
                      <div className="rounded-3xl px-5 py-5 text-center" style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.18)" }}>
                        <p className="text-[15px] font-semibold text-emerald-400">
                          {t.detailsSent}
                        </p>
                        <p className="mt-2 text-sm text-emerald-400/70">
                          {locale === "is"
                            ? "Við förum yfir þetta og bætum ferlið okkar."
                            : "We’ll review this and improve our process."}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <label className="text-sm font-medium text-[#f0ebe3] block text-center">
                          {t.lowRequiredLabel}
                        </label>
                        <textarea
                          className="mt-2 w-full rounded-2xl px-4 py-3 text-sm font-normal text-[#f0ebe3] placeholder:text-[#6a5e52] focus:outline-none transition resize-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                          rows={4}
                          value={lowDetails}
                          onChange={(e) => setLowDetails(e.target.value)}
                          placeholder={t.lowRequiredPh}
                          suppressHydrationWarning
                        />

                        <div className="mt-4 grid grid-cols-1 gap-3">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                              <label className="text-xs font-medium text-[#8a7e72]">
                                {t.followUpNameOpt}
                              </label>
                              <input
                                className="mt-2 h-10 w-full rounded-2xl px-4 text-sm font-normal text-[#f0ebe3] placeholder:text-[#6a5e52] focus:outline-none transition" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                                value={followUpName}
                                onChange={(e) =>
                                  setFollowUpName(e.target.value)
                                }
                                placeholder={t.namePh}
                                suppressHydrationWarning
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700">
                                {t.followUpContactReq}
                              </label>
                              <input
                                className="mt-2 h-10 w-full rounded-2xl px-4 text-sm font-normal text-[#f0ebe3] placeholder:text-[#6a5e52] focus:outline-none transition" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                                value={followUpContact}
                                onChange={(e) =>
                                  setFollowUpContact(e.target.value)
                                }
                                placeholder={t.followUpContactPh}
                                inputMode="email"
                                autoComplete="email"
                                suppressHydrationWarning
                              />
                            </div>
                          </div>
                          <p className="text-[11px] text-[#6a5e52] text-center">
                            {t.followUpHelper}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={isPatching("lowDetails")}
                          className="mt-3 h-11 w-full rounded-full bg-[#ff914d] text-sm font-medium text-black disabled:opacity-60 hover:bg-[#ff914d]/90 transition"
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
                  <div className="rounded-3xl px-5 py-5 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-sm leading-relaxed text-[#a09488] font-normal">
                      {t.middleNudge}
                    </p>
                  </div>
                ) : null}

                <div className="py-2" aria-hidden="true">
                  <div className="relative h-[4px] w-full">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                    <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
                  </div>
                </div>

                <MoreDetailsSection
                  title={
                    locale === "is"
                      ? "Áttu auka 20 sekúndur?"
                      : "Have 20 more seconds?"
                  }
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
                        className="mt-3 w-full rounded-2xl px-4 py-4 text-[14px] font-normal text-[#f0ebe3] placeholder:text-[#6a5e52] focus:outline-none transition resize-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
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
                      className="h-11 w-full rounded-full bg-[#ff914d] text-sm font-medium text-black disabled:opacity-60 hover:bg-[#ff914d]/90 transition"
                      onClick={async () => {
                        const ok = await patchFeedback(
                          {
                            ambience_vibe_stars:
                              ambienceVibeStars >= 1 ? ambienceVibeStars : null,
                            tech_equipment_stars:
                              techEquipmentStars >= 1
                                ? techEquipmentStars
                                : null,
                            flow_on_the_day_stars:
                              flowOnTheDayStars >= 1 ? flowOnTheDayStars : null,
                            value_for_money_stars:
                              valueForMoneyStars >= 1
                                ? valueForMoneyStars
                                : null,
                            best_part: clampText(bestPart, 2000) || null,
                          },
                          "moreDetailsSave",
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
                  <p className="text-sm text-red-400" role="alert">
                    {error}
                  </p>
                ) : null}
                {info ? (
                  <p className="text-sm text-[#a09488]" role="status">
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
