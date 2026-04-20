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
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Leaf, Sparkles, HandHeart, Loader2, Check } from "lucide-react";
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
          "10% discount on first paid event booking",
          "1 free recorded meditation or guided experience per month",
          "Event calendar news (don't miss out on anything)",
          "Weekly group newsletter (wellness tips, events, stories)",
          "Member directory (connect with others)",
          "Access to community forum / discussion board",
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
          "Monthly credits toward in-person events (e.g. 1 free entry/month)",
          "Monthly live virtual ceremony (cacao, meditation, breathwork)",
          "Full library of recorded experiences + workshops",
          "Early access to event tickets (subscribers book first)",
          "Private subscriber-only chat / group",
          "Our monthly \"Letter from Mama\" — reflections, vision, inspiration",
        ],
        cta: "Join the Tribe",
        popular: "Most loved",
      },
      patron: {
        name: "High Ticket",
        price: "20,000 – 200,000 ISK",
        cadence: "/ one-time",
        tagline: "Retreats, VIP moments, and bespoke offerings.",
        perks: [
          "Iceland Eclipse Festival 2026 VIP packages",
          "Private ceremonies (cacao, sound healing, breathwork intensives)",
          "Multi-day immersive retreats (Iceland-based)",
          "\"Season at Mama\" quarterly membership (dining + unlimited events)",
          "Corporate wellness transformation days",
          "Subscribers get priority booking + discounted pricing",
        ],
        cta: "Join High Ticket",
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
    pendingCta: "Finishing checkout…",
    currentBanner: (tier) => `You're currently on ${tier}.`,
    pendingBanner: "We're waiting on your first payment to finish your membership.",
    graceBanner: "Your last payment didn't go through. We're trying again — you can update your card from your profile.",
    cancelingBanner: (until) => `Your membership ends on ${until}. You can rejoin any time.`,
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
          "10% afsláttur af fyrstu greiddu viðburðabókun",
          "1 ókeypis tekið upp hugleiðsla eða leiðsögn á mánuði",
          "Fréttir af viðburðadagatali (missir ekki af neinu)",
          "Vikulegt hópfréttabréf (vellíðan, viðburðir, sögur)",
          "Meðlimaskrá (tengstu öðrum)",
          "Aðgangur að samfélagsvettvangi / spjallborði",
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
          "Mánaðarlegar einingar að viðburðum á staðnum (t.d. 1 ókeypis aðgangur/mán.)",
          "Mánaðarleg bein útsending: athöfn (kakó, hugleiðsla, öndunarvinnu)",
          "Fullt safn af tekinni upp upplifun + vinnustofum",
          "Forgangur að miðasölu (áskrifendur bóka fyrst)",
          "Einkaspjall / hópur fyrir áskrifendur",
          "Mánaðarlegt „Bréf frá Mama“ — íhugun, framtíðarsýn, innblástur",
        ],
        cta: "Ganga í Ættbálkinn",
        popular: "Mest elskað",
      },
      patron: {
        name: "High Ticket",
        price: "20.000 – 200.000 ISK",
        cadence: "/ ein greiðsla",
        tagline: "Frístundir, VIP og sérsniðin upplifun.",
        perks: [
          "VIP pakkar fyrir Iceland Eclipse Festival 2026",
          "Einkaaðgerðir (kakó, hljóðlækningar, öndunarintensíf)",
          "Margdaga djúpupplifun í náttúru Íslands",
          "„Season at Mama“ ársfjórðungsaðild (matur + ótakmarkaðir viðburðir)",
          "Skrifstofuvellíðan og umbreytingardagar",
          "Áskrifendur fá forgang í bókun + afslátt",
        ],
        cta: "Skrá í High Ticket",
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
    pendingCta: "Klára greiðslu…",
    currentBanner: (tier) => `Þú ert núna í ${tier}.`,
    pendingBanner: "Við bíðum eftir að fyrsta greiðslan klárist.",
    graceBanner: "Síðasta greiðsla fór ekki í gegn. Við reynum aftur — þú getur uppfært kortið í prófílnum þínum.",
    cancelingBanner: (until) => `Aðildin þín rennur út ${until}. Þú getur gengið aftur í hvenær sem er.`,
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

  // Load the signed-in user's current membership so the cards can reflect it.
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
    // Land on the manage page — the new subscription is already active.
    router.push(t.manageHref);
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
          {/* Current-membership banner for signed-in members */}
          {authStatus === "authenticated" && statusBanner ? (
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

                  {membership?.status === "active" && !membership?.cancelAtPeriodEnd ? (
                    <a
                      href={t.manageHref}
                      className="inline-flex items-center justify-center rounded-full border border-[#c06a3d]/55 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-[#5c2e12] transition-colors hover:border-[#c06a3d] hover:bg-[#fff4e8]"
                    >
                      {t.manageLabel}
                    </a>
                  ) : null}
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
                  tier: "patron",
                  tone: "forest",
                  Icon: HandHeart,
                  copy: t.tiers.patron,
                  highlight: false,
                  onClick: () => handleCheckout("patron"),
                  children: (
                    <HighTicketAmount
                      language={language}
                      amount={patronAmount}
                      setAmount={setPatronAmount}
                      copy={t.tiers.patron}
                    />
                  ),
                },
              ];
              return cards.map((c) => {
                const rank = TIER_RANK[c.tier];
                const isCurrent = currentTier === c.tier;
                const isLower   = currentRank > rank;       // user already above this tier
                const isUpgrade = currentTier && rank > currentRank;
                const ctaOverride =
                  isCurrent ? t.currentPlanCta
                  : isUpgrade ? t.upgradeCta
                  : null;

                return (
                  <TierCard
                    key={c.tier}
                    tier={c.tier}
                    tone={c.tone}
                    Icon={c.Icon}
                    copy={c.copy}
                    busy={pendingTier === c.tier}
                    disabled={
                      (isBusy && pendingTier !== c.tier) ||
                      isCurrent ||
                      isLower ||
                      membershipLoading ||
                      (c.tier === "patron" && !patronValid)
                    }
                    processingLabel={t.processing}
                    highlight={c.highlight}
                    onClick={c.onClick}
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

          {/* Manage link for returning members */}
          {authStatus === "authenticated" ? (
            <div className="mt-10 text-center">
              <a
                href={t.manageHref}
                className="inline-flex items-center gap-2 text-[13px] tracking-[0.2em] uppercase text-[#6a5040] hover:text-[#2c1810] transition-colors border-b border-[#6a5040]/30 hover:border-[#2c1810] pb-0.5"
              >
                {t.manageLabel}
              </a>
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
        className="text-2xl mb-1 italic font-light text-[#2c1810]"
        style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
      >
        {copy.name}
      </h3>
      <p className="text-[13px] text-[#8a7060] mb-5 leading-snug">{copy.tagline}</p>

      <div className="mb-5">
        <span className={`text-3xl font-light ${s.price}`}>{copy.price}</span>
        <span className="text-[13px] text-[#8a7060] ml-1">{copy.cadence}</span>
      </div>

      <ul className="space-y-2 mb-6 text-[14px] text-[#4a3728] leading-relaxed w-full">
        {copy.perks.map((p, i) => (
          <li key={i} className="flex items-start justify-center gap-2 text-center">
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
