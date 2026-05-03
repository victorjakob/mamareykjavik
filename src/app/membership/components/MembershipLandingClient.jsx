"use client";

// /membership — interactive client body.
//
// Three tiers: Free, Tribe (2,000 ISK/mo), High Ticket (one-time 20k–200k ISK).
// - Free → POST /api/membership/join-free, then redirect to /profile.
// - Tribe / High Ticket → open the inline RpgCardForm, which tokenises
//   the card directly at Teya and posts the resulting SingleToken to
//   /api/membership/rpg-signup for the first CIT charge. No hosted-page
//   redirect; the card PAN never passes through our server.
//
// Visual language mirrors /tribe-card: warm dark hero, cream body, Cormorant
// display type, quiet copy. Never salesy.
//
// Auth: if the user isn't signed in, the join buttons bounce through
// /auth/signin?callbackUrl=/membership so they come back here afterwards.

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf,
  Sparkles,
  HandHeart,
  Loader2,
  Check,
  AlertCircle,
  X,
  CalendarDays,
  CreditCard,
  CircleDot,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import RpgCardForm from "./RpgCardForm";

const PATRON_MIN = 20000;
const PATRON_MAX = 200000;
const PATRON_DEFAULT = 20000;
const PATRON_STEP = 1000;

const COPY = {
  en: {
    eyebrow: "Mama · Community",
    heading: "Be part of Mama",
    heroLead:
      "Choose the path that feels right for you right now, whether you come for the food, the gatherings, the energy, or simply to be.",
    introTitle: "Why we're asking",
    intro:
      "A plant-based kitchen in the middle of Reykjavík is a small miracle held up by many hands. Our memberships are a way for the people who love Mama to help keep the stove warm — and to get a little something back every time they come home.",
    tiers: {
      free: {
        name: "Free",
        price: "0 ISK",
        cadence: "/ always",
        tagline: "Purpose: build the list, create belonging.",
        perks: [
          "Event calendar news (don't miss out on anything)",
          "Weekly group newsletter (wellness tips, events, stories)",
          "1 free recorded meditation or guided experience per month (coming soon)",
          "Access to community forum / discussion board (coming soon)",
        ],
        cta: "Join for free",
      },
      tribe: {
        name: "Tribe",
        price: "2,000 ISK",
        cadence: "/ month",
        tagline: "Everything in Free — plus the full Mama circle.",
        perks: [
          "Mama Tribe Card: 20% discount on all food & drinks at Mama",
          "Monthly live virtual ceremony (cacao, meditation, breathwork)",
          "Early access to event tickets (subscribers book first)",
          "Private subscriber-only chat / group",
          "Our monthly \"Letter from Mama\" — reflections, vision, inspiration",
          "Full library of recorded experiences + workshops (coming soon)",
        ],
        cta: "Join the Tribe",
        popular: "Most loved",
      },
      patron: {
        name: "High Ticket",
        price: "Coming soon",
        cadence: "",
        tagline: "Retreats, VIP moments, and bespoke offerings — in the works.",
        perks: [
          "Multi-day immersive retreats (Iceland-based)",
          "Private ceremonies (cacao, sound healing, breathwork intensives)",
          "Iceland Eclipse Festival 2026 VIP packages",
          "Corporate wellness transformation days",
        ],
        cta: "Coming soon",
        comingSoonNote: "Tell us you're interested — we'll write when these open.",
        amountLabel: "Your amount (ISK)",
        amountHelp: "One-time payment. Choose any whole amount from 20,000 to 200,000 ISK.",
      },
    },
    notes: [
      "Cancel any time from your profile — no emails, no paperwork.",
      "Tribe renews monthly through Teya. High Ticket is charged once, in the ISK amount you choose within the range. We only store a secure token for renewals, never your full card number.",
      "Free tier is just an email hello. No card, no commitment.",
    ],
    signedOutNote: "We'll ask you to sign in first, so your membership lives in your Mama profile.",
    processing: "One moment…",
    errorFallback: "Something went sideways. Please try again, or write to us and we'll fix it.",
    manageHref: "/membership",
    manageLabel: "Manage my membership",
    currentPlanBadge: "Your plan",
    currentPlanCta: "Current plan",
    upgradeCta: "Upgrade",
    addPatronCta: "Add a High Ticket experience",
    downgradeFreeCta: "Move to Free",
    resumeCta: "Resume membership",
    resumeBanner: (until) => `Welcome back. Your membership will keep renewing as normal — no break in benefits, next renewal still on ${until}.`,
    resumeError: "We couldn't resume the membership just now. Please try again.",
    pendingCta: "Finishing checkout…",
    currentBanner: (tier) => `You're currently on ${tier}.`,
    pendingBanner: "We're waiting on your first payment to finish your membership.",
    graceBanner: "Your last payment didn't go through. We're trying again — you can update your card from your profile.",
    cancelingBanner: (until) => `Your membership ends on ${until}. You can rejoin any time.`,
    manage: {
      title: "Your membership",
      subtitleActive: (tier) => `Thank you for holding us up — you're in ${tier}.`,
      subtitleEnding: (until) => `On ${until} your membership quietly ends. Until then, everything still belongs to you.`,
      subtitlePending: "We're still waiting on your first payment to settle.",
      subtitleGrace: "Your last renewal didn't go through. We'll try again soon — or you can refresh your card from your profile.",
      labelTier:        "Plan",
      labelPrice:       "Price",
      labelNextBill:    "Next renewal",
      labelEndsOn:      "Access until",
      labelStartedOn:   "Member since",
      labelStatus:      "Status",
      labelPeriod:      "Period ends",
      statusActive:     "Active",
      statusEnding:     "Ending soon",
      statusPending:    "Pending",
      statusGrace:      "Payment retrying",
      statusPaused:     "Paused",
      cadenceMonth:     "per month",
      cadenceOneTime:   "one-time",
      cadenceFree:      "free",
      cancelCta:        "Cancel membership",
      downgradeCta:     "Move to Free instead",
      profileCta:       "Update card in profile",
      rejoinCta:        "Join again",
      ownerThanks:      "You're one of the hands holding this vision alive. Thank you.",
      // Cancel dialog (paid tier, ongoing)
      cancelTitle:      "Cancel your membership?",
      cancelBodyPaid: (until) =>
        `Nothing changes today. You'll keep every benefit of your membership until ${until}, and no further payments will come out of your card. You can rejoin any time.`,
      cancelBodyFree:
        "Your free membership will end right away. You can rejoin any time — no card needed.",
      cancelConfirmKeep: "Keep my membership",
      cancelConfirmGo:   "Yes, cancel",
      cancelError:       "We couldn't cancel just now. Please try again in a moment.",
      // Downgrade dialog (Tribe → Free)
      downgradeTitle:    "Move to Free?",
      downgradeBody: (until) =>
        `You'll stay in the Tribe until ${until} — full 20% discount, events, all of it. After that, your membership winds down and you can join our Free circle any time.`,
      downgradeConfirmKeep: "Stay in the Tribe",
      downgradeConfirmGo:   "Move to Free",
      // Success toast
      cancelSuccess:   "Your membership has been cancelled. Thank you for being with us.",
      downgradeSuccess: (until) => `We've scheduled the change. You'll stay in the Tribe until ${until}.`,
    },
  },
  is: {
    eyebrow: "Mama · Samfélag",
    heading: "Vertu hluti af Mama",
    heroLead:
      "Ef Mama er staður sem þú kemur aftur á, þá er þetta einföld leið til að styðja staðinn. Þrjár leiðir í aðild, eftir því hvað hentar lífinu þínu núna.",
    introTitle: "Af hverju við biðjum",
    intro:
      "Jurtaeldhús í miðri Reykjavík er lítið kraftaverk sem margar hendur halda uppi. Aðildin okkar er leið fyrir þau sem elska Mama til að halda hitanum á eldavélinni — og fá líka smá til baka í hvert sinn sem þau koma heim.",
    tiers: {
      free: {
        name: "Frítt",
        price: "0 ISK",
        cadence: "/ alltaf",
        tagline: "Tilgangur: byggja listann, skapa tilheyri.",
        perks: [
          "Fréttir af viðburðadagatali (missir ekki af neinu)",
          "Vikulegt hópfréttabréf (vellíðan, viðburðir, sögur)",
          "1 ókeypis tekin upp hugleiðsla eða leiðsögn á mánuði (kemur bráðum)",
          "Aðgangur að samfélagsvettvangi / spjallborði (kemur bráðum)",
        ],
        cta: "Skrá mig frítt",
      },
      tribe: {
        name: "Ættbálkur",
        price: "2.000 ISK",
        cadence: "/ mánuður",
        tagline: "Allt í Fríu — og dýpri tengsl við Mama.",
        perks: [
          "Mama Ættbálkurskort: 20% afsláttur af öllum mat og drykk á Mama",
          "Mánaðarleg bein útsending: athöfn (kakó, hugleiðsla, öndunarvinnu)",
          "Forgangur að miðasölu (áskrifendur bóka fyrst)",
          "Einkaspjall / hópur fyrir áskrifendur",
          "Mánaðarlegt „Bréf frá Mama“ — íhugun, framtíðarsýn, innblástur",
          "Fullt safn af tekinni upp upplifun + vinnustofum (kemur bráðum)",
        ],
        cta: "Ganga í Ættbálkinn",
        popular: "Mest elskað",
      },
      patron: {
        name: "High Ticket",
        price: "Kemur bráðum",
        cadence: "",
        tagline: "Frístundir, VIP og sérsniðin upplifun — í vinnslu.",
        perks: [
          "Margdaga djúpupplifun í náttúru Íslands",
          "Einkaaðgerðir (kakó, hljóðlækningar, öndunarintensíf)",
          "VIP pakkar fyrir Iceland Eclipse Festival 2026",
          "Skrifstofuvellíðan og umbreytingardagar",
        ],
        cta: "Kemur bráðum",
        comingSoonNote: "Láttu okkur vita ef þú hefur áhuga — við skrifum þegar þetta opnar.",
        amountLabel: "Upphæð þín (ISK)",
        amountHelp: "Ein greiðsla. Veldu heila krónuupphæð frá 20.000 til 200.000 ISK.",
      },
    },
    notes: [
      "Hættu hvenær sem er úr prófílnum þínum — engin tölvupóstsamskipti, engin pappírsvinna.",
      "Ættbálkur endurnýjast mánaðarlega í gegnum Teya. High Ticket er rukkað einu sinni, í þeirri ISK upphæð sem þú velur innan markanna. Við geymum aðeins örugga kortagerð fyrir endurnýjun, aldrei fullt kortanúmer.",
      "Frí aðild er bara lítill póstur. Ekkert kort, engin skuldbinding.",
    ],
    signedOutNote: "Við biðjum þig að skrá þig inn fyrst, svo aðildin þín lifi í Mama prófílnum þínum.",
    processing: "Eitt augnablik…",
    errorFallback: "Eitthvað fór úrskeiðis. Reyndu aftur, eða skrifaðu okkur og við löfum því.",
    manageHref: "/is/membership",
    manageLabel: "Stýra aðildinni minni",
    currentPlanBadge: "Þín aðild",
    currentPlanCta: "Núverandi aðild",
    upgradeCta: "Uppfæra",
    addPatronCta: "Bæta við High Ticket upplifun",
    downgradeFreeCta: "Færa á Frítt",
    resumeCta: "Halda áfram með aðild",
    resumeBanner: (until) => `Velkomin/n aftur. Aðildin þín endurnýjast eins og venjulega — engin truflun á réttindum, næsta endurnýjun ${until}.`,
    resumeError: "Við gátum ekki haldið áfram með aðildina núna. Reyndu aftur.",
    pendingCta: "Klára greiðslu…",
    currentBanner: (tier) => `Þú ert núna í ${tier}.`,
    pendingBanner: "Við bíðum eftir að fyrsta greiðslan klárist.",
    graceBanner: "Síðasta greiðsla fór ekki í gegn. Við reynum aftur — þú getur uppfært kortið í prófílnum þínum.",
    cancelingBanner: (until) => `Aðildin þín rennur út ${until}. Þú getur gengið aftur í hvenær sem er.`,
    manage: {
      title: "Aðildin þín",
      subtitleActive: (tier) => `Takk fyrir að halda í okkur — þú ert í ${tier}.`,
      subtitleEnding: (until) => `Þann ${until} rennur aðildin þín hljóðlega út. Þangað til er allt þitt.`,
      subtitlePending: "Við bíðum ennþá eftir að fyrsta greiðslan klárist.",
      subtitleGrace: "Síðasta endurnýjun fór ekki í gegn. Við reynum aftur fljótlega — eða þú getur uppfært kortið í prófílnum.",
      labelTier:        "Áskrift",
      labelPrice:       "Verð",
      labelNextBill:    "Næsta endurnýjun",
      labelEndsOn:      "Aðgangur til",
      labelStartedOn:   "Meðlimur frá",
      labelStatus:      "Staða",
      labelPeriod:      "Tímabil endar",
      statusActive:     "Virk",
      statusEnding:     "Rennur út",
      statusPending:    "Í vinnslu",
      statusGrace:      "Endurtekur greiðslu",
      statusPaused:     "Hlé",
      cadenceMonth:     "á mánuði",
      cadenceOneTime:   "ein greiðsla",
      cadenceFree:      "frítt",
      cancelCta:        "Hætta í aðild",
      downgradeCta:     "Færa mig á Frítt",
      profileCta:       "Uppfæra kort í prófíl",
      rejoinCta:        "Skrá aftur",
      ownerThanks:      "Þú ert ein af höndunum sem halda þessu eldhúsi uppi. Takk.",
      cancelTitle:      "Hætta í aðildinni?",
      cancelBodyPaid: (until) =>
        `Ekkert breytist í dag. Þú heldur öllu sem fylgir aðildinni til ${until}, og engar frekari greiðslur verða teknar. Þú getur skráð þig aftur hvenær sem er.`,
      cancelBodyFree:
        "Fría aðildin þín hættir strax. Þú getur skráð þig aftur hvenær sem er — ekkert kort þarf.",
      cancelConfirmKeep: "Halda aðildinni",
      cancelConfirmGo:   "Já, hætta",
      cancelError:       "Við gátum ekki hætt núna. Reyndu aftur eftir andartak.",
      downgradeTitle:    "Fara á Frítt?",
      downgradeBody: (until) =>
        `Þú heldur áfram í Ættbálknum til ${until} — 20% afsláttur, viðburðir, allt saman. Eftir það lýkur aðildinni og þú getur gengið aftur í Fría hringinn hvenær sem er.`,
      downgradeConfirmKeep: "Vera í Ættbálknum",
      downgradeConfirmGo:   "Fara á Frítt",
      cancelSuccess:   "Aðildin þín hefur verið afskráð. Takk fyrir að vera með okkur.",
      downgradeSuccess: (until) => `Við höfum sett breytinguna í gang. Þú verður í Ættbálknum til ${until}.`,
    },
  },
};

const TIER_RANK = { free: 0, tribe: 1, patron: 2 };

function formatIskDisplay(value, language) {
  const locale = language === "is" ? "is-IS" : "en-IS";
  return new Intl.NumberFormat(locale, {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function MembershipLandingClient() {
  const { language } = useLanguage();
  const t = COPY[language === "is" ? "is" : "en"];

  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [patronAmount, setPatronAmount] = useState(PATRON_DEFAULT);
  const [pendingTier, setPendingTier] = useState(null); // "free" | "tribe" | "patron"
  const [errorMsg, setErrorMsg] = useState("");
  const [membership, setMembership] = useState(null);   // null until loaded
  const [membershipLoading, setMembershipLoading] = useState(false);
  // Inline RPG card form — open when the user clicks a paid tier's CTA.
  // Holds the tier + amount so the form component can stay pure.
  const [cardForm, setCardForm] = useState(null);       // { tier, amount, patronAmount } | null

  // Manage-panel dialogs — "cancel" is the blanket end-your-membership flow,
  // "downgrade" is specifically Tribe → Free (same backend call, different copy).
  const [dialog, setDialog] = useState(null);           // null | "cancel" | "downgrade"
  const [dialogBusy, setDialogBusy] = useState(false);
  const [dialogError, setDialogError] = useState("");
  const [successToast, setSuccessToast] = useState(""); // soft confirmation banner

  // Load the signed-in user's current membership so the cards can reflect it.
  const reloadMembership = async () => {
    try {
      const res = await fetch("/api/membership/me");
      const data = await res.json().catch(() => ({}));
      setMembership(data?.membership || null);
    } catch {
      setMembership(null);
    }
  };

  useEffect(() => {
    if (authStatus !== "authenticated") {
      setMembership(null);
      return undefined;
    }
    let alive = true;
    setMembershipLoading(true);
    (async () => {
      try {
        const res = await fetch("/api/membership/me");
        const data = await res.json().catch(() => ({}));
        if (!alive) return;
        setMembership(data?.membership || null);
      } catch {
        if (alive) setMembership(null);
      } finally {
        if (alive) setMembershipLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [authStatus]);

  // Only treat live states as "current" — canceled / past_due / pending_payment
  // rows shouldn't disable the Join button.
  const currentTier = useMemo(() => {
    if (!membership) return null;
    if (["active", "grace_period", "paused"].includes(membership.status)) {
      return membership.tier;
    }
    return null;
  }, [membership]);

  const currentRank = currentTier ? TIER_RANK[currentTier] : -1;

  // True while the member has chosen to cancel but is still inside their
  // paid period — they can resume any time before currentPeriodEnd.
  const isCancelScheduled = !!(
    membership?.status === "active" &&
    membership?.cancelAtPeriodEnd &&
    membership?.currentPeriodEnd
  );

  // Human-readable banner for signed-in users who already have something.
  const statusBanner = useMemo(() => {
    if (!membership) return null;
    const tierName = t.tiers[membership.tier]?.name || membership.tier;

    if (membership.status === "pending_payment") return t.pendingBanner;
    if (membership.status === "grace_period")    return t.graceBanner;

    if (membership.status === "active" && membership.cancelAtPeriodEnd && membership.currentPeriodEnd) {
      const d = new Date(membership.currentPeriodEnd);
      const fmt = d.toLocaleDateString(language === "is" ? "is-IS" : "en-GB", {
        day: "numeric", month: "short", year: "numeric",
      });
      return t.cancelingBanner(fmt);
    }

    if (["active", "paused"].includes(membership.status)) {
      return t.currentBanner(tierName);
    }
    return null;
  }, [membership, t, language]);

  const patronValid = useMemo(
    () =>
      Number.isFinite(patronAmount) &&
      patronAmount >= PATRON_MIN &&
      patronAmount <= PATRON_MAX,
    [patronAmount],
  );

  async function requireSession(callbackPath) {
    if (authStatus === "authenticated") return true;
    // Bounce through NextAuth, land back here.
    await signIn(undefined, {
      callbackUrl: callbackPath || (language === "is" ? "/is/membership" : "/membership"),
    });
    return false;
  }

  async function handleJoinFree() {
    setErrorMsg("");
    const ok = await requireSession();
    if (!ok) return;
    try {
      setPendingTier("free");
      const res = await fetch("/api/membership/join-free", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t.errorFallback);
      router.push(t.manageHref);
    } catch (err) {
      setErrorMsg(err.message || t.errorFallback);
      setPendingTier(null);
    }
  }

  // Reverses a "cancel-at-period-end" while the member is still inside
  // their paid period. No new charge — same period_end, just clears the
  // cancel flag.
  async function handleResume() {
    setErrorMsg("");
    const ok = await requireSession();
    if (!ok) return;
    try {
      // Re-use the per-tier busy spinner so the existing UI doesn't need
      // a second loading state.
      setPendingTier(membership?.tier || "tribe");
      const res = await fetch("/api/membership/resume", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t.resumeError);
      // Nudge the membership state so isEnding flips back to false and
      // the management panel re-renders without the "ending soon" banner.
      await reloadMembership();
    } catch (err) {
      setErrorMsg(err.message || t.resumeError);
    } finally {
      setPendingTier(null);
    }
  }

  async function handleCheckout(tier) {
    setErrorMsg("");
    const ok = await requireSession();
    if (!ok) return;

    // RPG-direct signup: open the inline card form. No redirect, no
    // SecurePay — the card PAN goes straight from browser to Teya, we
    // only see the SingleToken on our server.
    try {
      if (tier === "patron" && !patronValid) {
        throw new Error(
          language === "is"
            ? `Upphæð verður að vera á milli ${formatIskDisplay(PATRON_MIN, "is")} og ${formatIskDisplay(PATRON_MAX, "is")} ISK.`
            : `Amount must be between ${formatIskDisplay(PATRON_MIN, "en")} and ${formatIskDisplay(PATRON_MAX, "en")} ISK.`,
        );
      }
      const amount = tier === "patron" ? Math.round(patronAmount) : 2000;
      setPendingTier(tier);
      setCardForm({
        tier,
        amount,
        patronAmount: tier === "patron" ? Math.round(patronAmount) : null,
      });
    } catch (err) {
      setErrorMsg(err.message || t.errorFallback);
      setPendingTier(null);
    }
  }

  function handleCardFormClose() {
    setCardForm(null);
    setPendingTier(null);
  }

  function handleCardFormSuccess() {
    setCardForm(null);
    setPendingTier(null);
    // Already on /membership — just refresh the membership state so the
    // management panel takes over for this new active subscription.
    reloadMembership();
  }

  function openDialog(which) {
    setDialogError("");
    setDialog(which);
  }

  function closeDialog() {
    if (dialogBusy) return;
    setDialog(null);
    setDialogError("");
  }

  async function handleConfirmCancelOrDowngrade() {
    setDialogError("");
    setDialogBusy(true);
    try {
      const res = await fetch("/api/membership/cancel", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t.manage.cancelError);

      const until =
        membership?.currentPeriodEnd
          ? new Date(membership.currentPeriodEnd).toLocaleDateString(
              language === "is" ? "is-IS" : "en-GB",
              { day: "numeric", month: "short", year: "numeric" },
            )
          : "";

      if (dialog === "downgrade") {
        setSuccessToast(t.manage.downgradeSuccess(until));
      } else {
        setSuccessToast(t.manage.cancelSuccess);
      }

      setDialog(null);
      await reloadMembership();
    } catch (err) {
      setDialogError(err?.message || t.manage.cancelError);
    } finally {
      setDialogBusy(false);
    }
  }

  const isBusy = pendingTier !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff6ea] via-white to-[#f5efe6]">
      {/* Warm dark hero — gives the white navbar a backdrop to sit on. */}
      <section
        data-navbar-theme="dark"
        className="relative overflow-hidden bg-gradient-to-br from-[#1a0f08] via-[#2c1810] to-[#5c2e12] pt-28 sm:pt-32 pb-16 px-5"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            background:
              "radial-gradient(circle at 22% 18%, rgba(255,145,77,0.35) 0%, transparent 55%), radial-gradient(circle at 80% 80%, rgba(31,92,75,0.28) 0%, transparent 55%)",
          }}
        />
        <div className="relative max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#f1c9a0] mb-2">
              {t.eyebrow}
            </p>
            <h1
              className="text-white text-4xl sm:text-5xl font-light mb-5 leading-[1.05] italic"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              {t.heading}
            </h1>
            <p className="text-white/85 text-base sm:text-lg leading-relaxed">
              {t.heroLead}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="pb-20 px-5">
        <div className="max-w-5xl mx-auto pt-12">
          {/* Pro management panel for signed-in active members */}
          {authStatus === "authenticated" && membership && currentTier ? (
            <ManagePanel
              t={t}
              language={language}
              membership={membership}
              onCancel={() => openDialog("cancel")}
              onDowngrade={() => openDialog("downgrade")}
              onResume={handleResume}
              successToast={successToast}
              clearToast={() => setSuccessToast("")}
            />
          ) : authStatus === "authenticated" && statusBanner ? (
            <div className="mb-8 mx-auto max-w-2xl">
              <div className="relative overflow-hidden rounded-2xl border border-[#d9c7af] bg-gradient-to-br from-white to-[#fbf5ec] shadow-[0_14px_34px_rgba(44,24,16,0.08)]">
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[#c06a3d] to-[#1f5c4b]"
                />
                <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:pl-6">
                  <div className="text-[#4a3728]">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-[#8a6a54]">
                      {t.currentPlanBadge}
                    </p>
                    <p className="mt-1 text-[14px] leading-relaxed">{statusBanner}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Tier cards */}
          <div className="grid items-start gap-6 md:grid-cols-3">
            {(() => {
              const cards = [
                {
                  tier: "free",
                  tone: "cream",
                  Icon: Leaf,
                  copy: t.tiers.free,
                  highlight: false,
                  onClick: handleJoinFree,
                  children: null,
                },
                {
                  tier: "tribe",
                  tone: "clay",
                  Icon: Sparkles,
                  copy: t.tiers.tribe,
                  highlight: true,
                  onClick: () => handleCheckout("tribe"),
                  children: null,
                },
                {
                  // Patron tier is shown on the landing as a "Coming
                  // soon" preview (2026-05-02). Backend / activation
                  // logic still supports purchase — we just gate the
                  // UI: no amount input, disabled CTA, simplified
                  // perks copy. Re-enable by setting comingSoon: false
                  // and restoring the HighTicketAmount child.
                  tier: "patron",
                  tone: "forest",
                  Icon: HandHeart,
                  copy: t.tiers.patron,
                  highlight: false,
                  comingSoon: true,
                  onClick: () => {}, // disabled below; no-op for safety
                  children: t.tiers.patron.comingSoonNote ? (
                    <p className="mb-4 text-[12.5px] italic text-[#8a7060] leading-relaxed text-center">
                      {t.tiers.patron.comingSoonNote}
                    </p>
                  ) : null,
                },
              ];
              return cards.map((c) => {
                const rank = TIER_RANK[c.tier];
                const isCurrent = currentTier === c.tier;
                // Patron is a one-time purchase, not a subscription tier — a
                // Patron user should still be able to join Tribe if they like,
                // and anyone can buy another High Ticket experience.
                const isLower =
                  c.tier !== "patron" &&
                  currentRank > rank &&
                  currentTier !== "patron";
                const isUpgrade = currentTier && rank > currentRank && c.tier !== "patron";

                // Free card + user is on a paid tier → offer a soft downgrade,
                // routed through the same confirmation dialog as cancel.
                const showDowngradeFree =
                  c.tier === "free" && currentTier && currentTier !== "free";

                // The current paid tier, while mid-cancel, becomes a
                // "Resume" affordance — clicking flips cancel_at_period_end
                // back off without re-charging.
                const showResume = isCurrent && isCancelScheduled && c.tier !== "free";

                // Patron is one-time — never "Upgrade". Use friendlier phrasing
                // when the user already has a tier (or has bought Patron before).
                let ctaOverride = null;
                if (c.comingSoon) {
                  // Coming-soon overrides everything else. The card stays
                  // visible but the button is locked out.
                  ctaOverride = c.copy.cta; // already "Coming soon" / "Kemur bráðum"
                } else if (showResume) {
                  ctaOverride = t.resumeCta;
                } else if (isCurrent) {
                  ctaOverride = t.currentPlanCta;
                } else if (showDowngradeFree) {
                  ctaOverride = t.downgradeFreeCta;
                } else if (c.tier === "patron" && currentTier) {
                  ctaOverride = t.addPatronCta;
                } else if (isUpgrade) {
                  ctaOverride = t.upgradeCta;
                }

                // When the Free card is acting as a "Move to Free" downgrade,
                // clicking it opens the downgrade confirmation dialog instead
                // of firing /api/membership/join-free (which would just
                // duplicate their current tier).
                const onClick = showResume
                  ? handleResume
                  : showDowngradeFree
                  ? () => openDialog("downgrade")
                  : c.onClick;

                return (
                  <TierCard
                    key={c.tier}
                    tier={c.tier}
                    tone={c.tone}
                    Icon={c.Icon}
                    copy={c.copy}
                    busy={pendingTier === c.tier}
                    disabled={
                      c.comingSoon ||
                      (isBusy && pendingTier !== c.tier) ||
                      // Current plan is locked, EXCEPT when it's mid-cancel
                      // and we're showing the Resume CTA.
                      (isCurrent && !showResume) ||
                      isLower ||
                      membershipLoading ||
                      (c.tier === "patron" && !c.comingSoon && !patronValid)
                    }
                    processingLabel={t.processing}
                    highlight={c.highlight}
                    onClick={onClick}
                    ctaOverride={ctaOverride}
                    showCurrentBadge={isCurrent}
                    currentBadgeLabel={t.currentPlanBadge}
                  >
                    {c.children}
                  </TierCard>
                );
              });
            })()}
          </div>

          {errorMsg ? (
            <div className="mt-6 max-w-2xl mx-auto rounded-xl border border-[#c06a3d]/30 bg-[#fff3ea] px-4 py-3 text-[13.5px] text-[#5c2e12]">
              {errorMsg}
            </div>
          ) : null}

          {/* Gentle notes under the cards */}
          <div className="mt-14 max-w-2xl mx-auto space-y-2.5 text-center">
            {t.notes.map((line, i) => (
              <p key={i} className="text-[13px] text-[#8a7060] leading-relaxed">
                {line}
              </p>
            ))}
            {authStatus !== "authenticated" ? (
              <p className="text-[13px] text-[#8a7060] leading-relaxed italic">
                {t.signedOutNote}
              </p>
            ) : null}
          </div>

          {/* Manage link — only useful when someone has a live subscription
              but the panel above is scrolled out of view. We scroll back to it
              rather than navigate away. */}
          {authStatus === "authenticated" && membership && currentTier ? (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => {
                  if (typeof document !== "undefined") {
                    const el = document.getElementById("mama-manage-panel");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                className="inline-flex items-center gap-2 text-[13px] tracking-[0.2em] uppercase text-[#6a5040] hover:text-[#2c1810] transition-colors border-b border-[#6a5040]/30 hover:border-[#2c1810] pb-0.5"
              >
                {t.manageLabel}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Inline RPG card form — replaces the SecurePay redirect flow. */}
      {cardForm ? (
        <RpgCardForm
          tier={cardForm.tier}
          amount={cardForm.amount}
          patronAmount={cardForm.patronAmount}
          language={language === "is" ? "is" : "en"}
          onCancel={handleCardFormClose}
          onSuccess={handleCardFormSuccess}
        />
      ) : null}

      {/* Cancel / downgrade confirmation dialog — portal to body. */}
      <ConfirmDialog
        open={dialog !== null}
        kind={dialog}
        busy={dialogBusy}
        error={dialogError}
        t={t}
        language={language}
        membership={membership}
        onClose={closeDialog}
        onConfirm={handleConfirmCancelOrDowngrade}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tier card                                                                 */
/* -------------------------------------------------------------------------- */

const TONE_STYLES = {
  cream: {
    card: "bg-white border-[#e8dcc7]",
    price: "text-[#2c1810]",
    icon: "bg-[#f5efe6] text-[#8a6a3f]",
    button:
      "bg-[#2c1810] text-[#fff6ea] hover:bg-[#3d2417] disabled:opacity-60",
  },
  clay: {
    card: "bg-gradient-to-br from-[#fff6ea] to-[#fde3c8] border-[#f1c9a0]",
    price: "text-[#5c2e12]",
    icon: "bg-white/70 text-[#b35a2a]",
    button:
      "bg-[#b35a2a] text-white hover:bg-[#8f4620] disabled:opacity-60",
  },
  forest: {
    card: "bg-gradient-to-br from-[#f1efe7] to-[#e6ece4] border-[#c9d4c6]",
    price: "text-[#1f3a2e]",
    icon: "bg-white/70 text-[#1f5c4b]",
    button:
      "bg-[#1f5c4b] text-white hover:bg-[#174538] disabled:opacity-60",
  },
};

function TierCard({
  tier,
  tone,
  Icon,
  copy,
  busy,
  disabled,
  highlight,
  processingLabel,
  onClick,
  children,
  ctaOverride,
  showCurrentBadge,
  currentBadgeLabel,
}) {
  const s = TONE_STYLES[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: tier === "free" ? 0.1 : tier === "tribe" ? 0.2 : 0.3 }}
      className={`relative rounded-2xl border ${s.card} p-7 flex flex-col items-center text-center shadow-sm ${showCurrentBadge ? "ring-2 ring-[#1f5c4b]/40" : ""}`}
    >
      {showCurrentBadge ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] uppercase bg-[#1f5c4b] text-white px-3 py-1 rounded-full inline-flex items-center gap-1">
          <Check className="w-3 h-3" strokeWidth={2.2} />
          {currentBadgeLabel}
        </span>
      ) : highlight && copy.popular ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] uppercase bg-[#2c1810] text-[#f1c9a0] px-3 py-1 rounded-full">
          {copy.popular}
        </span>
      ) : null}

      <div className={`w-10 h-10 rounded-full ${s.icon} flex items-center justify-center mb-4`}>
        <Icon className="w-5 h-5" strokeWidth={1.6} />
      </div>

      <h3
        className="mb-1 italic font-semibold text-[#2c1810]"
        style={{
          fontFamily: "Cormorant Garamond, Georgia, serif",
          fontSize: "clamp(2rem, 2.6vw, 2.35rem)",
          lineHeight: 1.08,
        }}
      >
        {copy.name}
      </h3>
      <p className="text-[13px] text-[#8a7060] mb-5 leading-snug">{copy.tagline}</p>

      <div className="mb-5">
        <span className={`text-3xl font-light ${s.price}`}>{copy.price}</span>
        <span className="text-[13px] text-[#8a7060] ml-1">{copy.cadence}</span>
      </div>

      <ul className="space-y-2 mb-6 text-[14px] text-[#4a3728] leading-relaxed w-full text-left">
        {copy.perks.map((p, i) => (
          <li key={i} className="flex items-start justify-start gap-2 text-left">
            <span className="text-[#b35a2a] mt-0.5 shrink-0">·</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>

      {children}

      <div className="pt-2">
        <button
          type="button"
          onClick={onClick}
          disabled={busy || disabled}
          className={`w-full rounded-full px-5 py-3 text-[13px] tracking-[0.2em] uppercase transition-colors ${s.button} inline-flex items-center justify-center gap-2`}
        >
          {busy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.8} />
              <span>{processingLabel}</span>
            </>
          ) : (
            ctaOverride || copy.cta
          )}
        </button>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  High Ticket — one-time amount (20k–200k ISK)                              */
/* -------------------------------------------------------------------------- */

function HighTicketAmount({ language, amount, setAmount, copy }) {
  const suggestions = [20000, 50000, 100000, 200000];

  return (
    <div className="mb-4 w-full max-w-[280px] rounded-xl bg-white/60 border border-[#c9d4c6] p-3.5 text-left">
      <span className="text-[12px] tracking-[0.18em] uppercase text-[#4a3728] block mb-2">
        {copy.amountLabel}
      </span>
      <div className="flex flex-wrap gap-1.5 mb-2.5 justify-center">
        {suggestions.map((v) => (
          <button
            type="button"
            key={v}
            onClick={() => setAmount(v)}
            className={`text-[10.5px] px-2.5 py-1 rounded-full border transition-colors ${
              amount === v
                ? "bg-[#1f5c4b] text-white border-[#1f5c4b]"
                : "bg-white text-[#4a3728] border-[#c9d4c6] hover:border-[#1f5c4b]"
            }`}
          >
            {formatIskDisplay(v, language)}
          </button>
        ))}
      </div>
      <label className="block">
        <span className="sr-only">{copy.amountLabel}</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={PATRON_MIN}
            max={PATRON_MAX}
            step={PATRON_STEP}
            value={amount}
            onChange={(e) => {
              const n = Number(e.target.value);
              setAmount(Number.isFinite(n) ? n : PATRON_MIN);
            }}
            className="flex-1 rounded-md border border-[#c9d4c6] bg-white px-2.5 py-1.5 text-[13px] text-[#1f3a2e] focus:outline-none focus:border-[#1f5c4b]"
          />
          <span className="text-[11px] text-[#8a7060] shrink-0">ISK</span>
        </div>
      </label>
      <p className="text-[11px] text-[#8a7060] mt-2 leading-snug">{copy.amountHelp}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Manage panel — pro "your membership" block for signed-in active members   */
/* -------------------------------------------------------------------------- */

function ManagePanel({
  t,
  language,
  membership,
  onCancel,
  onDowngrade,
  onResume,
  successToast,
  clearToast,
}) {
  const tier = membership.tier;
  const tierMeta = t.tiers[tier];
  const tierLabel = tierMeta?.name || tier;

  const isFree     = tier === "free";
  const isTribe    = tier === "tribe";
  const isPatron   = tier === "patron";
  const isEnding   = !!(membership.cancelAtPeriodEnd && membership.currentPeriodEnd);
  const isGrace    = membership.status === "grace_period";
  const isPending  = membership.status === "pending_payment";
  const isPaused   = membership.status === "paused";

  const locale = language === "is" ? "is-IS" : "en-GB";
  const fmtDate = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "—";
    return dt.toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  const fmtMoney = (n) => formatIskDisplay(Number(n || 0), language);

  const untilLabel = fmtDate(membership.currentPeriodEnd);

  let subtitle = t.manage.subtitleActive(tierLabel);
  if (isPending) subtitle = t.manage.subtitlePending;
  else if (isGrace) subtitle = t.manage.subtitleGrace;
  else if (isEnding) subtitle = t.manage.subtitleEnding(untilLabel);

  let statusLabel = t.manage.statusActive;
  let statusTone = "active";
  if (isPending) { statusLabel = t.manage.statusPending; statusTone = "pending"; }
  else if (isGrace) { statusLabel = t.manage.statusGrace; statusTone = "grace"; }
  else if (isEnding) { statusLabel = t.manage.statusEnding; statusTone = "ending"; }
  else if (isPaused) { statusLabel = t.manage.statusPaused; statusTone = "pending"; }

  const statusPalette = {
    active:  { bg: "#e7f2ed", color: "#1f5c4b" },
    pending: { bg: "#fff3e0", color: "#c76a2b" },
    grace:   { bg: "#fdecec", color: "#9a1f1f" },
    ending:  { bg: "#f2ece3", color: "#8a7261" },
  }[statusTone];

  // Clear the success toast after a short moment so it doesn't linger.
  // We intentionally only depend on `successToast`'s content so that the
  // timer isn't reset on every parent render (clearToast is a fresh closure
  // each time).
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (!successToast) return undefined;
    const timer = setTimeout(() => clearToast(), 6500);
    return () => clearTimeout(timer);
  }, [successToast]);
  /* eslint-enable react-hooks/exhaustive-deps */

  // Price cell copy
  const priceValue = isFree ? t.manage.cadenceFree : `${fmtMoney(membership.priceAmount)} ISK`;
  const priceCadence = isFree
    ? ""
    : isPatron
      ? t.manage.cadenceOneTime
      : t.manage.cadenceMonth;

  // Next-renewal cell copy
  let renewalLabel = t.manage.labelNextBill;
  let renewalValue = "—";
  if (isEnding) {
    renewalLabel = t.manage.labelEndsOn;
    renewalValue = untilLabel;
  } else if (isFree) {
    renewalLabel = t.manage.labelPeriod;
    renewalValue = "∞";
  } else if (isPatron) {
    renewalLabel = t.manage.labelPeriod;
    renewalValue = fmtDate(membership.currentPeriodEnd);
  } else if (isPending) {
    renewalLabel = t.manage.labelNextBill;
    renewalValue = "—";
  } else {
    renewalValue = fmtDate(membership.nextBillingDate || membership.currentPeriodEnd);
  }

  return (
    <motion.div
      id="mama-manage-panel"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mb-10 mx-auto max-w-3xl"
    >
      <div
        className="relative overflow-hidden rounded-[24px]"
        style={{
          background: "linear-gradient(180deg, #fffdf9 0%, #fbf5ec 100%)",
          border: "1.5px solid #e8dcc7",
          boxShadow: "0 18px 42px rgba(44,24,16,0.10), 0 2px 10px rgba(44,24,16,0.04)",
        }}
      >
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-1.5"
          style={{ background: "linear-gradient(to bottom, #c06a3d, #1f5c4b)" }}
        />

        <div className="px-6 pt-6 pb-5 sm:px-8 sm:pt-7">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] tracking-[0.35em] uppercase text-[#8a6a54] mb-1.5">
                {t.manage.title}
              </p>
              <h2
                className="italic font-light text-[#2c1810]"
                style={{
                  fontFamily: "Cormorant Garamond, Georgia, serif",
                  fontSize: "clamp(1.75rem, 2.4vw, 2.1rem)",
                  lineHeight: 1.15,
                }}
              >
                Mama · {tierLabel}
              </h2>
            </div>

            <span
              className="text-[10px] tracking-[0.18em] uppercase px-2.5 py-1 rounded-full inline-flex items-center gap-1.5"
              style={{ backgroundColor: statusPalette.bg, color: statusPalette.color }}
            >
              <CircleDot className="w-3 h-3" strokeWidth={2} />
              {statusLabel}
            </span>
          </div>

          <p className="mt-3 text-[14px] leading-relaxed text-[#4a3728]">
            {subtitle}
          </p>

          {/* Success toast (cancel / downgrade confirmed) */}
          <AnimatePresence>
            {successToast ? (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-4 rounded-xl border border-[#c9d4c6] bg-[#f0f5ef] px-3.5 py-2.5 text-[13px] text-[#1f5c4b]"
              >
                {successToast}
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Stat cells */}
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <StatCell
              icon={CircleDot}
              label={t.manage.labelPrice}
              value={priceValue}
              hint={priceCadence}
            />
            <StatCell
              icon={CalendarDays}
              label={renewalLabel}
              value={renewalValue}
            />
            <StatCell
              icon={CreditCard}
              label={t.manage.labelStartedOn}
              value={fmtDate(membership.createdAt)}
            />
          </div>
        </div>

        {/* Footer actions */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 sm:px-8"
          style={{ borderTop: "1px solid #f0e8dc", background: "#fffaf3" }}
        >
          <p className="text-[12.5px] text-[#8a7060] italic max-w-[440px]">
            {isPatron ? t.manage.ownerThanks : t.manage.ownerThanks}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mid-cancel: keep the "Ending soon" status visible AND offer
                a one-click resume so the member doesn't have to scroll
                back up to the tier cards. */}
            {isEnding ? (
              <>
                <span className="text-[12px] tracking-[0.16em] uppercase text-[#8a7261]">
                  {t.manage.statusEnding}
                </span>
                {onResume ? (
                  <button
                    type="button"
                    onClick={onResume}
                    className="rounded-full bg-[#1f5c4b] text-white px-4 py-2 text-[11px] tracking-[0.18em] uppercase hover:bg-[#2a6f5c] transition-colors"
                  >
                    {t.resumeCta}
                  </button>
                ) : null}
              </>
            ) : null}

            {!isEnding && !isPending && isTribe ? (
              <button
                type="button"
                onClick={onDowngrade}
                className="rounded-full border border-[#e8ddd3] px-4 py-2 text-[11px] tracking-[0.18em] uppercase text-[#6a5040] hover:bg-[#fff4e8] hover:border-[#c06a3d]/50 transition-colors"
              >
                {t.manage.downgradeCta}
              </button>
            ) : null}

            {/* Tribe: soft cancel is the "end my subscription" CTA. */}
            {!isEnding && !isPending && isTribe ? (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full bg-[#2c1810] text-[#fff6ea] px-4 py-2 text-[11px] tracking-[0.18em] uppercase hover:bg-[#3d2417] transition-colors"
              >
                {t.manage.cancelCta}
              </button>
            ) : null}

            {/* Free: cancel just removes them from the directory. */}
            {!isEnding && !isPending && isFree ? (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full border border-[#e8ddd3] px-4 py-2 text-[11px] tracking-[0.18em] uppercase text-[#6a5040] hover:bg-[#fff4e8] hover:border-[#c06a3d]/50 transition-colors"
              >
                {t.manage.cancelCta}
              </button>
            ) : null}

            {/* Patron: no cancel — High Ticket is a completed one-time
                payment. For refunds, members write to us directly. */}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCell({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-xl border border-[#ecdec9] bg-white/70 px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-[10px] tracking-[0.22em] uppercase text-[#8a6a54] mb-1">
        {Icon ? <Icon className="w-3 h-3" strokeWidth={1.8} /> : null}
        <span>{label}</span>
      </div>
      <div
        className="text-[#2c1810] italic font-light"
        style={{
          fontFamily: "Cormorant Garamond, Georgia, serif",
          fontSize: "1.35rem",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {hint ? (
        <div className="text-[11px] text-[#8a7060] mt-0.5">{hint}</div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Confirmation dialog — soft cancel + soft downgrade                        */
/* -------------------------------------------------------------------------- */

function ConfirmDialog({
  open,
  kind,             // "cancel" | "downgrade"
  busy,
  error,
  t,
  language,
  membership,
  onClose,
  onConfirm,
}) {
  if (typeof document === "undefined") return null;

  const locale = language === "is" ? "is-IS" : "en-GB";
  const untilLabel = membership?.currentPeriodEnd
    ? new Date(membership.currentPeriodEnd).toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  const isDowngrade = kind === "downgrade";
  const isFree = membership?.tier === "free";

  const title = isDowngrade ? t.manage.downgradeTitle : t.manage.cancelTitle;
  const body = isDowngrade
    ? t.manage.downgradeBody(untilLabel)
    : isFree
      ? t.manage.cancelBodyFree
      : t.manage.cancelBodyPaid(untilLabel);

  const keepLabel = isDowngrade ? t.manage.downgradeConfirmKeep : t.manage.cancelConfirmKeep;
  const goLabel   = isDowngrade ? t.manage.downgradeConfirmGo   : t.manage.cancelConfirmGo;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center px-5 bg-black/55 backdrop-blur-sm"
          onClick={() => (busy ? null : onClose())}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_30px_80px_rgba(0,0,0,0.28)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => (busy ? null : onClose())}
              className="absolute top-3 right-3 p-1 rounded-full text-[#9a7a62] hover:text-[#2c1810]"
              aria-label="Close"
            >
              <X className="h-4 w-4" strokeWidth={1.8} />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: isDowngrade ? "#f2ece3" : "#fff3e0" }}
              >
                <AlertCircle
                  className="h-4 w-4"
                  style={{ color: isDowngrade ? "#8a7261" : "#c76a2b" }}
                  strokeWidth={1.8}
                />
              </div>
              <h3
                className="italic font-light text-[#2c1810]"
                style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.6rem" }}
              >
                {title}
              </h3>
            </div>

            <p className="text-[14px] text-[#4a3728] leading-relaxed mb-5">
              {body}
            </p>

            {error ? (
              <div className="mb-4 rounded-lg bg-[#fdecec] border border-[#e5c1c1] px-3 py-2 text-[12.5px] text-[#9a1f1f]">
                {error}
              </div>
            ) : null}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => (busy ? null : onClose())}
                disabled={busy}
                className="flex-1 rounded-full border border-[#e8ddd3] px-4 py-2.5 text-[12px] tracking-[0.18em] uppercase text-[#6a5040] hover:bg-[#fff7f0] disabled:opacity-60"
              >
                {keepLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={busy}
                className="flex-1 rounded-full bg-[#2c1810] px-4 py-2.5 text-[12px] tracking-[0.18em] uppercase text-[#fff6ea] hover:bg-[#3d2417] disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.8} />
                    <span>{t.processing}</span>
                  </>
                ) : (
                  goLabel
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
