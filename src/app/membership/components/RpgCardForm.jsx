"use client";

// RpgCardForm — inline card form used by /membership to sign up subscribers
// via Teya RPG (direct tokenization). Replaces the SecurePay hosted-page
// redirect which cannot return a reusable card token.
//
// Flow (client side):
//   1. Fetch /api/membership/rpg-config (signed-in only) → get publicKey + base URL
//   2. User fills PAN / MM / YY / CVC → client-side validation (Luhn, future date)
//   3. POST card to `${baseUrl}/api/token/single` with Basic auth (public key only).
//      Tries header auth first; falls back to `?api_key=` query if header is rejected.
//      Response 201: { Token } — the SingleToken.
//   4. POST { singleToken, tier, patronAmount?, last4, brand } to /api/membership/rpg-signup
//   5. On success → call onSuccess() so the parent can route to /profile / /membership.
//
// The card PAN / CVC NEVER leave the browser to our own server.

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, CreditCard, Lock, X, CheckCircle2, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const CURRENT_YEAR_FULL = new Date().getFullYear();
const YEARS = Array.from({ length: 15 }, (_, i) => String((CURRENT_YEAR_FULL + i) % 100).padStart(2, "0"));

// Luhn check — prevents trivial typos from reaching Teya.
function luhnValid(pan) {
  const digits = String(pan || "").replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function detectBrand(pan) {
  const d = String(pan || "").replace(/\D/g, "");
  if (/^4/.test(d)) return "VISA";
  if (/^(5[1-5]|2[2-7])/.test(d)) return "MC";
  if (/^3[47]/.test(d)) return "AMEX";
  if (/^6(?:011|5)/.test(d)) return "DISCOVER";
  return null;
}

function formatPan(raw) {
  const d = String(raw || "").replace(/\D/g, "").slice(0, 19);
  return d.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function b64(str) {
  if (typeof btoa === "function") return btoa(str);
  return Buffer.from(str, "utf8").toString("base64");
}

const COPY = {
  en: {
    title: "Your card",
    sub:   "We never see your card number. It goes straight to Teya, our payment processor, and we only keep a secure token for future renewals.",
    cardNumber: "Card number",
    expiry: "Expiry",
    cvc: "CVC",
    month: "Month",
    year:  "Year",
    cancel: "Cancel",
    pay: (amount, tier) => tier === "patron"
      ? `Pay ${amount} ISK once`
      : `Subscribe — ${amount} ISK / month`,
    securing: "Securing card…",
    processing: "Processing payment…",
    verifying: "Verifying with your bank…",
    verifyingTitle: "Verifying with your bank",
    verifyingBody:  "Your bank is checking that this is really you. Follow the prompts in the frame below — this usually takes under a minute.",
    verifyingTakingLong: "Still waiting on your bank. If nothing happens in the next 30 seconds, try using a different card.",
    verifyingFallback:   "If the verification window doesn't load,",
    verifyingFallbackLink: "open it in a new tab",
    verifyingCancel: "Cancel verification",
    testCardFillIn: "Fill in test card",
    errorInvalidPan: "That card number doesn't look right. Please check and try again.",
    errorInvalidExp: "That expiry date is in the past.",
    errorInvalidCvc: "CVC should be 3 or 4 digits.",
    errorConfig: "Payment isn't ready yet. Please refresh and try again, or contact us.",
    errorTeya: "Your bank didn't accept the card. Please try a different card.",
    tosLine: "By subscribing you agree to Mama's membership terms. You can cancel any time from your profile.",
    // Success screen
    successTitleTribe:    "Welcome to the Tribe 🌿",
    successTitlePatron:   "Thank you, Patron ✨",
    successEyebrow:       "Payment confirmed",
    successChargedLabel:  "Charged today",
    successRenewLabel:    "Next renewal",
    successCardLabel:     "Card",
    successBodyTribe:     "We're so glad you're here. Your Tribe card is active and waiting for you — 15% off every meal, priority seating at ceremonies, and a warm welcome whenever you walk through the door.",
    successBodyPatron:    "Your one-time gift has been received with deep gratitude. It holds space for ceremonies, community meals, and everything that keeps Mama's kitchen glowing.",
    successReceiptNote:   "A receipt is on its way to your inbox.",
    successContinue:      "Continue to my profile",
    successCloseNote:     "You can close this window when you're ready.",
  },
  is: {
    title: "Kortið þitt",
    sub:   "Við sjáum aldrei kortanúmerið þitt. Það fer beint til Teya, greiðsluaðila okkar, og við geymum aðeins öruggan kóða fyrir komandi endurnýjanir.",
    cardNumber: "Kortanúmer",
    expiry: "Gildistími",
    cvc: "CVC",
    month: "Mánuður",
    year:  "Ár",
    cancel: "Hætta við",
    pay: (amount, tier) => tier === "patron"
      ? `Greiða ${amount} ISK einu sinni`
      : `Gerast áskrifandi — ${amount} ISK / mán.`,
    securing: "Öryggisprófa kort…",
    processing: "Skráði greiðsluna…",
    verifying: "Staðfesti hjá bankanum þínum…",
    verifyingTitle: "Staðfesti hjá bankanum",
    verifyingBody:  "Bankinn þinn er að staðfesta að þetta sért þú. Fylgdu leiðbeiningunum hér að neðan — þetta tekur yfirleitt innan við mínútu.",
    verifyingTakingLong: "Þetta tekur lengri tíma en venjulega. Ef ekkert gerist næstu 30 sekúndur, prófaðu annað kort.",
    verifyingFallback:   "Ef staðfestingarglugginn birtist ekki,",
    verifyingFallbackLink: "opnaðu hann í nýjum flipa",
    verifyingCancel: "Hætta við staðfestingu",
    testCardFillIn: "Fylla inn prófunarkort",
    errorInvalidPan: "Kortanúmerið lítur ekki rétt út. Athugaðu og reyndu aftur.",
    errorInvalidExp: "Gildistíminn er liðinn.",
    errorInvalidCvc: "CVC á að vera 3 eða 4 tölustafir.",
    errorConfig: "Greiðsluhluti er ekki tilbúinn. Uppfærðu síðuna eða hafðu samband.",
    errorTeya: "Bankinn samþykkti ekki kortið. Reyndu annað kort.",
    tosLine: "Með áskrift samþykkir þú skilmála Mama aðildar. Þú getur hætt hvenær sem er úr prófílnum þínum.",
    // Success screen
    successTitleTribe:    "Velkomin í Ættflokkinn 🌿",
    successTitlePatron:   "Takk fyrir, Patron ✨",
    successEyebrow:       "Greiðsla staðfest",
    successChargedLabel:  "Tekið í dag",
    successRenewLabel:    "Næsta endurnýjun",
    successCardLabel:     "Kort",
    successBodyTribe:     "Við erum svo þakklát að þú sért hér. Ættflokkskortið þitt er virkt — 15% afsláttur af hverri máltíð, forgang í athafnir, og hlýtt faðmlag þegar þú kemur.",
    successBodyPatron:    "Gjöfin þín hefur verið móttekin með djúpri þakklæti. Hún heldur rými fyrir athafnir, samfélagsmáltíðir og allt sem heldur eldhúsi Mama lifandi.",
    successReceiptNote:   "Kvittun er á leiðinni í póstinn þinn.",
    successContinue:      "Áfram á prófílinn",
    successCloseNote:     "Þú mátt loka þessum glugga þegar þú ert tilbúin.",
  },
};

function formatAmount(n, language) {
  return new Intl.NumberFormat(language === "is" ? "is-IS" : "en-IS", { maximumFractionDigits: 0 }).format(n);
}

export default function RpgCardForm({
  tier,                     // "tribe" | "patron"
  amount,                   // ISK whole kr
  patronAmount,             // for tier === "patron" (passed to server)
  language = "en",          // "en" | "is"
  onSuccess,                // (result) => void — result has { subscriptionId, tier, amount }
  onCancel,                 // () => void
}) {
  const t = COPY[language === "is" ? "is" : "en"];

  const [config, setConfig] = useState(null);        // { tokenSingleUrl, publicAccessToken, testMode, testPan, ... }
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState("");

  const [pan, setPan] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvc, setCvc] = useState("");           // used client-side only for sanity check
  const [stage, setStage] = useState("idle");   // idle | tokenizing | charging | verifying | finalising | success
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState(null); // { tier, amount, nextBillingDate, last4, brand, transactionId }
  const [challenge, setChallenge] = useState(null);     // { actionUrl, paReq, md, termUrl, subscriptionId }
  const [lastTokenisedCard, setLastTokenisedCard] = useState(null); // { last4, brand } — preserved across challenge

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/membership/rpg-config");
        const data = await res.json().catch(() => ({}));
        if (!alive) return;
        if (!res.ok) { setConfigError(data.error || t.errorConfig); return; }
        setConfig(data);
      } catch {
        if (alive) setConfigError(t.errorConfig);
      } finally {
        if (alive) setConfigLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [t.errorConfig]);

  const brand = useMemo(() => detectBrand(pan), [pan]);

  const canSubmit =
    !configLoading && config && pan && expMonth && expYear && cvc &&
    stage === "idle";

  function fillTestCard() {
    if (!config?.testMode) return;
    setPan(formatPan(config.testPan || "4176669999000104"));
    setExpMonth(config.testExpMM || "12");
    setExpYear(config.testExpYY || "31");
    setCvc(config.testCvc || "123");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    // ─── Client-side validation ─────────────────────────────────────────────
    const rawPan = pan.replace(/\D/g, "");
    if (!luhnValid(rawPan)) { setErrorMsg(t.errorInvalidPan); return; }

    const expMonthNum = Number(expMonth);
    const expYearFull = 2000 + Number(expYear);
    const now = new Date();
    const expDate = new Date(expYearFull, expMonthNum, 0, 23, 59, 59);
    if (!(expDate > now)) { setErrorMsg(t.errorInvalidExp); return; }

    if (!/^\d{3,4}$/.test(cvc)) { setErrorMsg(t.errorInvalidCvc); return; }

    if (!config?.tokenSingleUrl || !config?.publicAccessToken) {
      setErrorMsg(t.errorConfig); return;
    }

    try {
      // ─── Step 1: tokenize at Teya (browser → Teya, never our server) ─────
      setStage("tokenizing");
      const authHeader = "Basic " + b64(`${config.publicAccessToken}:`);
      const body = {
        PAN:      rawPan,
        ExpMonth: expMonth,
        ExpYear:  expYear,
        // 5-minute lifetime is plenty — we redeem immediately on the server.
        TokenLifetime: 5,
      };

      let teyaRes, teyaJson;
      try {
        teyaRes = await fetch(config.tokenSingleUrl, {
          method: "POST",
          headers: {
            "Authorization": authHeader,
            "Content-Type":  "application/json",
            "Accept":        "application/json",
          },
          body: JSON.stringify(body),
        });
        teyaJson = await teyaRes.json().catch(() => ({}));
      } catch (err) {
        setErrorMsg(t.errorTeya);
        setStage("idle");
        return;
      }

      // Fallback: if the header style is rejected (401/403), try the
      // legacy `?api_key=` query param the Swagger UI uses.
      if (teyaRes.status === 401 || teyaRes.status === 403) {
        const fallbackUrl = `${config.tokenSingleUrl}?api_key=${encodeURIComponent(config.publicAccessToken)}`;
        teyaRes = await fetch(fallbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(body),
        });
        teyaJson = await teyaRes.json().catch(() => ({}));
      }

      if (!teyaRes.ok || !teyaJson?.Token) {
        setErrorMsg(teyaJson?.Message || t.errorTeya);
        setStage("idle");
        return;
      }
      const singleToken = teyaJson.Token;
      const last4 = rawPan.slice(-4);

      // ─── Step 2: hand the SingleToken to our server ─────────────────────
      setStage("charging");
      const signupPayload = {
        tier,
        singleToken,
        last4,
        brand: brand || null,
        language: language === "is" ? "IS" : "EN",
      };
      if (tier === "patron") signupPayload.patronAmount = Math.round(patronAmount || amount);

      const signupRes = await fetch("/api/membership/rpg-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupPayload),
      });
      const signupJson = await signupRes.json().catch(() => ({}));

      if (!signupRes.ok || !signupJson?.ok) {
        setErrorMsg(signupJson?.error || t.errorTeya);
        setStage("idle");
        return;
      }

      // Remember which card we just tokenised — the verify step doesn't
      // re-read the PAN input so we keep last4/brand here.
      setLastTokenisedCard({ last4, brand: brand || null });

      // ── PSD2: bank wants a 3DS challenge. Stash state and flip to the
      // challenge view; the iframe there collects the PaRes and posts it
      // back to the parent via postMessage.
      if (signupJson.needs3ds && signupJson.challenge?.actionUrl && signupJson.challenge?.paReq) {
        setChallenge({
          actionUrl:      signupJson.challenge.actionUrl,
          paReq:          signupJson.challenge.paReq,
          md:             signupJson.challenge.md || "",
          termUrl:        signupJson.challenge.termUrl || "",
          subscriptionId: signupJson.subscriptionId,
        });
        setStage("verifying");
        return;
      }

      setSuccessData({
        tier:            signupJson.tier || tier,
        amount:          signupJson.amount || amount,
        nextBillingDate: signupJson.nextBillingDate || null,
        last4,
        brand:           brand || null,
        transactionId:   signupJson.transactionId || null,
        subscriptionId:  signupJson.subscriptionId || null,
      });
      setStage("success");
    } catch (err) {
      setErrorMsg(err?.message || t.errorTeya);
      setStage("idle");
    }
  }

  function handleSuccessContinue() {
    // Parent decides where to route (usually /profile). We hold the success
    // screen until the user actively dismisses it — never close silently.
    onSuccess?.(successData || {});
  }

  function handleCancelChallenge() {
    setChallenge(null);
    setStage("idle");
    setErrorMsg("");
  }

  // ─── 3DS challenge → listen for the iframe's postMessage ─────────────────
  // Once the ACS finishes, /api/membership/rpg-3ds-return posts PaRes+MD up
  // to us via postMessage. We then call rpg-verify to run the final charge.
  useEffect(() => {
    if (stage !== "verifying") return undefined;

    async function handleMessage(ev) {
      // Only trust same-origin messages with our expected shape.
      if (typeof window === "undefined") return;
      if (ev.origin !== window.location.origin) return;
      const data = ev.data;
      if (!data || typeof data !== "object") return;
      if (data.type !== "mama-rpg-3ds-complete") return;
      if (!challenge?.subscriptionId) return;

      setStage("finalising");
      setErrorMsg("");

      try {
        const res = await fetch("/api/membership/rpg-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscriptionId: challenge.subscriptionId,
            paRes:          data.paRes || null,
            cRes:           data.cRes  || null,
            md:             data.md    || challenge.md || null,
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json?.ok) {
          setErrorMsg(json?.error || t.errorTeya);
          setChallenge(null);
          setStage("idle");
          return;
        }
        setSuccessData({
          tier:            json.tier || tier,
          amount:          json.amount || amount,
          nextBillingDate: json.nextBillingDate || null,
          last4:           lastTokenisedCard?.last4 || null,
          brand:           lastTokenisedCard?.brand || null,
          transactionId:   json.transactionId || null,
          subscriptionId:  json.subscriptionId || null,
        });
        setChallenge(null);
        setStage("success");
      } catch (err) {
        setErrorMsg(err?.message || t.errorTeya);
        setChallenge(null);
        setStage("idle");
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [stage, challenge, tier, amount, lastTokenisedCard, t.errorTeya]);

  const prettyAmount = formatAmount(amount, language);

  // ─── Success screen ─────────────────────────────────────────────────────
  // Shown after the first charge succeeds. We NEVER close the modal silently
  // — the member should see confirmation of what just happened before being
  // routed on to their profile.
  if (stage === "success" && successData) {
    return (
      <SuccessView
        t={t}
        language={language}
        data={successData}
        onContinue={handleSuccessContinue}
      />
    );
  }

  // ─── 3DS challenge screen ───────────────────────────────────────────────
  // The iframe renders the issuer's ACS. We programmatically submit the
  // PaReq form into it, then wait for the postMessage from
  // /api/membership/rpg-3ds-return. During the final charge we stay on the
  // same "verifying" screen but switch the label to "processing".
  if ((stage === "verifying" || stage === "finalising") && challenge) {
    return (
      <ChallengeView
        t={t}
        challenge={challenge}
        finalising={stage === "finalising"}
        errorMsg={errorMsg}
        onCancel={handleCancelChallenge}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-0 sm:px-4">
      <form
        onSubmit={handleSubmit}
        className="relative w-full sm:max-w-md bg-[#fff6ea] rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 text-[#2c1810] max-h-[94vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label={t.cancel}
          className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-[#8a7060] hover:bg-white/60"
        >
          <X className="w-4 h-4" strokeWidth={1.8} />
        </button>

        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#fde3c8] text-[#b35a2a] flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" strokeWidth={1.6} />
          </div>
          <div>
            <h3
              className="text-2xl italic font-light leading-tight"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              {t.title}
            </h3>
            <p className="text-[13px] text-[#8a7060] leading-snug mt-1">{t.sub}</p>
          </div>
        </div>

        {configError ? (
          <div className="rounded-lg border border-[#c06a3d]/30 bg-[#fff3ea] px-3 py-2 text-[13px] text-[#5c2e12] mb-4">
            {configError}
          </div>
        ) : null}

        {/* Card number */}
        <label className="block mb-3">
          <span className="text-[12px] tracking-[0.18em] uppercase text-[#4a3728] block mb-1.5">
            {t.cardNumber}
          </span>
          <div className="relative">
            <input
              inputMode="numeric"
              autoComplete="cc-number"
              value={pan}
              onChange={(e) => setPan(formatPan(e.target.value))}
              placeholder="4176 6699 9900 0104"
              className="w-full rounded-lg border border-[#e8dcc7] bg-white px-3 py-2.5 text-[15px] tracking-wider text-[#2c1810] focus:outline-none focus:border-[#1f5c4b]"
            />
            {brand ? (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] tracking-[0.18em] uppercase text-[#8a7060]">
                {brand}
              </span>
            ) : null}
          </div>
        </label>

        {/* Exp + CVC */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <label className="col-span-2">
            <span className="text-[12px] tracking-[0.18em] uppercase text-[#4a3728] block mb-1.5">
              {t.expiry}
            </span>
            <div className="flex gap-2">
              <select
                value={expMonth}
                onChange={(e) => setExpMonth(e.target.value)}
                className="w-full rounded-lg border border-[#e8dcc7] bg-white px-2 py-2.5 text-[14px] text-[#2c1810] focus:outline-none focus:border-[#1f5c4b]"
              >
                <option value="" disabled>{t.month}</option>
                {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <select
                value={expYear}
                onChange={(e) => setExpYear(e.target.value)}
                className="w-full rounded-lg border border-[#e8dcc7] bg-white px-2 py-2.5 text-[14px] text-[#2c1810] focus:outline-none focus:border-[#1f5c4b]"
              >
                <option value="" disabled>{t.year}</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </label>
          <label>
            <span className="text-[12px] tracking-[0.18em] uppercase text-[#4a3728] block mb-1.5">
              {t.cvc}
            </span>
            <input
              inputMode="numeric"
              autoComplete="cc-csc"
              maxLength={4}
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))}
              placeholder="123"
              className="w-full rounded-lg border border-[#e8dcc7] bg-white px-3 py-2.5 text-[15px] tracking-wider text-[#2c1810] focus:outline-none focus:border-[#1f5c4b]"
            />
          </label>
        </div>

        {/* Test-mode helper */}
        {config?.testMode ? (
          <button
            type="button"
            onClick={fillTestCard}
            className="text-[12px] underline decoration-[#c06a3d]/40 text-[#8a6a3f] hover:text-[#5c2e12] mb-4"
          >
            {t.testCardFillIn}
          </button>
        ) : null}

        {errorMsg ? (
          <div className="rounded-lg border border-[#c06a3d]/30 bg-[#fff3ea] px-3 py-2 text-[13px] text-[#5c2e12] mb-4">
            {errorMsg}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-full px-5 py-3 text-[13px] tracking-[0.2em] uppercase bg-[#1f5c4b] text-white hover:bg-[#174538] disabled:opacity-60 inline-flex items-center justify-center gap-2"
        >
          {stage === "idle" ? (
            <>
              <Lock className="w-4 h-4" strokeWidth={1.8} />
              {t.pay(prettyAmount, tier)}
            </>
          ) : (
            <>
              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.8} />
              {stage === "tokenizing" ? t.securing : t.processing}
            </>
          )}
        </button>

        <p className="text-[11px] text-[#8a7060] leading-snug mt-4 text-center">
          {t.tosLine}
        </p>
      </form>
    </div>
  );
}

// ─── ChallengeView ──────────────────────────────────────────────────────────
// Renders the issuer's ACS (Access Control Server) inside a sandboxed iframe.
// Teya gave us `actionUrl`, `paReq`, `md`, `termUrl` in /api/membership/rpg-signup's
// response. We build a form targeting our iframe and submit it programmatically
// on mount. When the ACS completes, it POSTs PaRes + MD back to `termUrl` (our
// /api/membership/rpg-3ds-return route), which renders a tiny HTML page that
// postMessages the PaRes up to the parent window. The parent component
// (RpgCardForm) listens for that message and calls /api/membership/rpg-verify
// to finalise.
//
// Security:
//   - iframe is sandboxed with allow-forms + allow-scripts + allow-same-origin
//     + allow-top-navigation-by-user-activation. Without allow-same-origin we
//     couldn't read the inner doc; but we rely on postMessage anyway so same-
//     origin is not load-bearing. Teya ACSs sometimes try to break frames —
//     allow-top-navigation-by-user-activation lets them do that if they must.
function ChallengeView({ t, challenge, finalising, errorMsg, onCancel }) {
  const formRef  = useRef(null);
  const iframeRef = useRef(null);
  const [takingLong, setTakingLong] = useState(false);

  useEffect(() => {
    // Submit the PaReq form into the iframe exactly once.
    const form = formRef.current;
    if (!form) return;
    try { form.submit(); } catch { /* swallow — fallback link below */ }
    const timer = setTimeout(() => setTakingLong(true), 20000);
    return () => clearTimeout(timer);
  }, []);

  const iframeName = "mama-rpg-3ds-frame";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-0 sm:px-4">
      <div
        role="dialog"
        aria-live="polite"
        className="relative w-full sm:max-w-xl bg-[#fff6ea] rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 sm:p-7 text-[#2c1810] max-h-[94vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[#e7f0e3] text-[#1f5c4b] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h3
              className="text-2xl italic font-light leading-tight"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              {t.verifyingTitle}
            </h3>
            <p className="text-[13px] text-[#8a7060] leading-snug mt-1">
              {t.verifyingBody}
            </p>
          </div>
        </div>

        {/* Hidden form, submitted into the iframe on mount. */}
        <form
          ref={formRef}
          method="POST"
          action={challenge.actionUrl}
          target={iframeName}
          acceptCharset="UTF-8"
          style={{ display: "none" }}
        >
          <input type="hidden" name="PaReq"   defaultValue={challenge.paReq || ""} />
          <input type="hidden" name="MD"      defaultValue={challenge.md || ""} />
          <input type="hidden" name="TermUrl" defaultValue={challenge.termUrl || ""} />
        </form>

        <div className="rounded-xl overflow-hidden border border-[#e8dcc7] bg-white flex-1 min-h-[380px] mb-4">
          <iframe
            ref={iframeRef}
            name={iframeName}
            title="3D Secure verification"
            sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation-by-user-activation"
            className="w-full h-[420px] sm:h-[460px] bg-white"
          />
        </div>

        {finalising ? (
          <div className="flex items-center gap-2 text-[13px] text-[#1f5c4b] mb-3">
            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.8} />
            {t.processing}
          </div>
        ) : takingLong ? (
          <p className="text-[12px] text-[#8a6a3f] leading-snug mb-3">
            {t.verifyingTakingLong}
          </p>
        ) : null}

        {errorMsg ? (
          <div className="rounded-lg border border-[#c06a3d]/30 bg-[#fff3ea] px-3 py-2 text-[13px] text-[#5c2e12] mb-3">
            {errorMsg}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3 text-[12px] text-[#8a7060]">
          <span>
            {t.verifyingFallback}{" "}
            <a
              href={challenge.actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[#1f5c4b]"
            >
              {t.verifyingFallbackLink}
            </a>
            .
          </span>
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-full border border-[#c9b79f] text-[#4a3728] hover:bg-[#f6ead7] text-[11px] tracking-[0.18em] uppercase"
          >
            {t.verifyingCancel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SuccessView ────────────────────────────────────────────────────────────
// Celebration screen shown in-modal immediately after a successful first
// charge. Shows what was charged, next renewal date, and a warm tribe-voice
// welcome. The user clicks "Continue to my profile" when ready — we never
// dismiss the modal silently.
function SuccessView({ t, language, data, onContinue }) {
  const isPatron = data.tier === "patron";
  const title   = isPatron ? t.successTitlePatron : t.successTitleTribe;
  const body    = isPatron ? t.successBodyPatron  : t.successBodyTribe;
  const amount  = formatAmount(data.amount, language);
  const dateFmt = new Intl.DateTimeFormat(language === "is" ? "is-IS" : "en-GB", {
    day:   "numeric",
    month: "long",
    year:  "numeric",
  });
  const renewDate = data.nextBillingDate ? dateFmt.format(new Date(data.nextBillingDate)) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-0 sm:px-4">
      <div
        role="dialog"
        aria-live="polite"
        className="relative w-full sm:max-w-md bg-[#fff6ea] rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 text-[#2c1810] max-h-[94vh] overflow-y-auto"
      >
        {/* Animated check mark */}
        <div className="flex justify-center mb-5 mt-2">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-full bg-[#e7f0e3] flex items-center justify-center"
              style={{ animation: "mamaPop 0.5s cubic-bezier(0.22, 1, 0.36, 1) both" }}
            >
              <CheckCircle2 className="w-12 h-12 text-[#1f5c4b]" strokeWidth={1.6} />
            </div>
            <Sparkles
              className="absolute -top-1 -right-1 w-5 h-5 text-[#c58a3e]"
              strokeWidth={1.8}
              style={{ animation: "mamaFloat 2.2s ease-in-out infinite" }}
            />
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-[11px] tracking-[0.22em] uppercase text-[#1f5c4b] mb-2">
            {t.successEyebrow}
          </p>
          <h3
            className="text-3xl italic font-light leading-tight text-[#2c1810]"
            style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
          >
            {title}
          </h3>
        </div>

        {/* Receipt panel */}
        <div className="rounded-xl bg-white/70 border border-[#e8dcc7] px-4 py-4 mb-5 space-y-3">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-[11px] tracking-[0.18em] uppercase text-[#8a7060]">
              {t.successChargedLabel}
            </span>
            <span className="text-[17px] font-medium text-[#2c1810] tabular-nums">
              {amount} ISK
            </span>
          </div>

          {!isPatron && renewDate ? (
            <div className="flex items-baseline justify-between gap-4 border-t border-[#e8dcc7] pt-3">
              <span className="text-[11px] tracking-[0.18em] uppercase text-[#8a7060]">
                {t.successRenewLabel}
              </span>
              <span className="text-[14px] text-[#2c1810]">{renewDate}</span>
            </div>
          ) : null}

          {data.last4 ? (
            <div className="flex items-baseline justify-between gap-4 border-t border-[#e8dcc7] pt-3">
              <span className="text-[11px] tracking-[0.18em] uppercase text-[#8a7060]">
                {t.successCardLabel}
              </span>
              <span className="text-[13px] text-[#2c1810] tracking-wider">
                {data.brand ? `${data.brand} ` : ""}•••• {data.last4}
              </span>
            </div>
          ) : null}
        </div>

        <p className="text-[14px] leading-relaxed text-[#4a3728] mb-5 text-center">
          {body}
        </p>

        <p className="text-[12px] text-[#8a7060] leading-snug mb-6 text-center italic">
          {t.successReceiptNote}
        </p>

        <button
          type="button"
          onClick={onContinue}
          className="w-full rounded-full px-5 py-3 text-[13px] tracking-[0.2em] uppercase bg-[#1f5c4b] text-white hover:bg-[#174538] inline-flex items-center justify-center gap-2"
        >
          {t.successContinue}
          <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
        </button>

        <p className="text-[11px] text-[#8a7060] leading-snug mt-4 text-center">
          {t.successCloseNote}
        </p>

        {/* Small bespoke keyframes — no Tailwind equivalent */}
        <style jsx>{`
          @keyframes mamaPop {
            0%   { opacity: 0; transform: scale(0.6); }
            60%  { opacity: 1; transform: scale(1.08); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes mamaFloat {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50%      { transform: translateY(-3px) rotate(8deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
