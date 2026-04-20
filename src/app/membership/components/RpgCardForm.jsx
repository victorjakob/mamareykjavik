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

import { useEffect, useMemo, useState } from "react";
import { Loader2, CreditCard, Lock, X } from "lucide-react";

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
    testCardFillIn: "Fill in test card",
    errorInvalidPan: "That card number doesn't look right. Please check and try again.",
    errorInvalidExp: "That expiry date is in the past.",
    errorInvalidCvc: "CVC should be 3 or 4 digits.",
    errorConfig: "Payment isn't ready yet. Please refresh and try again, or contact us.",
    errorTeya: "Your bank didn't accept the card. Please try a different card.",
    tosLine: "By subscribing you agree to Mama's membership terms. You can cancel any time from your profile.",
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
    testCardFillIn: "Fylla inn prófunarkort",
    errorInvalidPan: "Kortanúmerið lítur ekki rétt út. Athugaðu og reyndu aftur.",
    errorInvalidExp: "Gildistíminn er liðinn.",
    errorInvalidCvc: "CVC á að vera 3 eða 4 tölustafir.",
    errorConfig: "Greiðsluhluti er ekki tilbúinn. Uppfærðu síðuna eða hafðu samband.",
    errorTeya: "Bankinn samþykkti ekki kortið. Reyndu annað kort.",
    tosLine: "Með áskrift samþykkir þú skilmála Mama aðildar. Þú getur hætt hvenær sem er úr prófílnum þínum.",
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
  const [stage, setStage] = useState("idle");   // idle | tokenizing | charging
  const [errorMsg, setErrorMsg] = useState("");

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

      onSuccess?.(signupJson);
    } catch (err) {
      setErrorMsg(err?.message || t.errorTeya);
      setStage("idle");
    }
  }

  const prettyAmount = formatAmount(amount, language);

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
