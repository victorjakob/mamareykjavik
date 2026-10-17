"use client";

import { useState } from "react";

// Apple + Google Wallet buttons for a Tribe Card, shared by the public
// /tribe-card/[token] page and /profile/my-tribe-card. Both use the card's
// access_token: Apple is a direct .pkpass download, Google fetches a freshly
// signed JWT save URL on click.

export const WALLET_SUBTEXTS = {
  en: {
    walletSubtext:
      "Always one tap away on your iPhone or Apple Watch. Auto-updates when your membership renews.",
    googleWalletSubtext:
      "Always one tap away on your Android phone or Wear OS watch. Auto-updates when your membership renews.",
  },
  is: {
    walletSubtext:
      "Alltaf einn smellur frá á iPhone eða Apple Watch. Uppfærist sjálfkrafa þegar áskriftin endurnýjast.",
    googleWalletSubtext:
      "Alltaf einn smellur frá á Android síma eða Wear OS úri. Uppfærist sjálfkrafa þegar áskriftin endurnýjast.",
  },
};

export default function TribeCardWalletButtons({ token, walletSubtext, googleWalletSubtext }) {
  return (
    <>
      {/* Apple Wallet (iOS) — direct .pkpass download */}
      <div className="text-center">
        <a
          href={`/api/tribe-cards/by-token/${token}/pkpass`}
          aria-label="Add to Apple Wallet"
          className="inline-block leading-none transition-transform hover:scale-[1.03] active:scale-100"
        >
          <img
            src="/wallet-pass/add-to-apple-wallet.svg"
            alt="Add to Apple Wallet"
            width={165}
            height={50}
            className="block"
          />
        </a>
        <p className="mt-3 text-[12px] text-[#8a7261] max-w-xs mx-auto leading-relaxed">
          {walletSubtext}
        </p>
      </div>

      {/* Google Wallet (Android / web) — fetch JWT save URL on click */}
      <div className="text-center">
        <GoogleWalletButton token={token} subtext={googleWalletSubtext} />
      </div>
    </>
  );
}

export // "Save to Google Wallet" button. Unlike Apple's flow (where the .pkpass
// is a static file we serve), Google needs a freshly-signed JWT for each
// click — so we fetch it on click rather than embedding the URL directly.
// On success the user lands on Google's save page in a new tab. If the
// Google Wallet endpoint isn't configured yet (issuer not set up), we
// show a friendly "coming soon" state instead of an error.
function GoogleWalletButton({ token, subtext }) {
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  async function handleClick(e) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tribe-cards/by-token/${token}/google-pass`);
      if (!res.ok) {
        // Most common cause before launch: env vars not yet set on Vercel.
        // Don't show a scary error — show "coming soon".
        setUnavailable(true);
        return;
      }
      const data = await res.json();
      if (data?.saveUrl) {
        window.open(data.saveUrl, "_blank", "noopener,noreferrer");
      } else {
        setUnavailable(true);
      }
    } catch {
      setUnavailable(true);
    } finally {
      setLoading(false);
    }
  }

  if (unavailable) {
    return (
      <div>
        <span
          aria-disabled="true"
          className="inline-block leading-none opacity-50 cursor-not-allowed"
          title="Google Wallet coming soon"
        >
          <img
            src="/wallet-pass/save-to-google-wallet.svg"
            alt="Save to Google Wallet (coming soon)"
            width={220}
            height={50}
            className="block"
          />
        </span>
        <p className="mt-3 text-[12px] text-[#8a7261] max-w-xs mx-auto leading-relaxed">
          Google Wallet support is coming soon.
        </p>
      </div>
    );
  }

  return (
    <div>
      <a
        href="#"
        onClick={handleClick}
        aria-label="Save to Google Wallet"
        className={`inline-block leading-none transition-transform ${
          loading ? "opacity-70" : "hover:scale-[1.03] active:scale-100"
        }`}
      >
        <img
          src="/wallet-pass/save-to-google-wallet.svg"
          alt="Save to Google Wallet"
          width={220}
          height={50}
          className="block"
        />
      </a>
      <p className="mt-3 text-[12px] text-[#8a7261] max-w-xs mx-auto leading-relaxed">
        {subtext}
      </p>
    </div>
  );
}
