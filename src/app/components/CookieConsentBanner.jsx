"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, Settings2, X } from "lucide-react";
import { useCookieConsent } from "@/providers/CookieConsentProvider";

function PreferenceRow({ title, description, checked, disabled, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl bg-white/[0.06] px-4 py-3">
      <span>
        <span className="block text-sm font-medium text-[#f0ebe3]">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-[#a79b90]">
          {description}
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="h-4 w-4 accent-[#ff914d]"
      />
    </label>
  );
}

export default function CookieConsentBanner() {
  const {
    showBanner,
    preferences,
    updatePreferences,
    acceptAll,
    rejectAll,
    setShowBanner,
  } = useCookieConsent();

  const [showDetails, setShowDetails] = useState(false);
  const [localPreferences, setLocalPreferences] = useState(preferences);

  if (!showBanner) return null;

  const closeBanner = (callback) => {
    const banner = document.querySelector("[data-cookie-banner]");
    if (!banner) {
      callback();
      return;
    }

    banner.style.transform = "translateY(32px)";
    banner.style.opacity = "0";
    banner.style.transition = "all 0.35s ease";
    setTimeout(callback, 350);
  };

  const handleAcceptAll = () => closeBanner(acceptAll);
  const handleRejectAll = () => closeBanner(rejectAll);
  const handleClose = () => closeBanner(() => setShowBanner(false));
  const handleSavePreferences = () =>
    closeBanner(() => updatePreferences(localPreferences));

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 34, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 34, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
          className="fixed bottom-3 right-3 z-[99999] w-[calc(100vw-1.5rem)] max-w-sm sm:bottom-5 sm:right-5 sm:max-w-md"
          data-cookie-banner
        >
          <div className="relative overflow-hidden rounded-[1.75rem] bg-[#110f0d] text-[#f0ebe3] shadow-[0_24px_80px_rgba(20,12,6,0.35)] ring-1 ring-[#ff914d]/20">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#ff914d]/45 to-transparent" />

            <div className="p-3">
              <div className="flex items-center gap-2.5 pr-8">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ff914d] text-[#1a1410]">
                  <Cookie className="h-4 w-4" strokeWidth={2.3} />
                </div>
                <div>
                  <p className="font-cormorant text-lg italic leading-none">
                    We use cookies
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-[#b8aca0]">
                    Essential for the site, optional for analytics.
                  </p>
                </div>
              </div>

              <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="rounded-full bg-[#ff914d] px-3 py-2 text-[11px] font-semibold text-[#1a1410] transition-colors hover:bg-[#ff914d]/90"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={handleRejectAll}
                  className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-2 text-[11px] font-medium text-[#f0ebe3] transition-colors hover:bg-white/[0.10]"
                >
                  Essential
                </button>
                <button
                  type="button"
                  onClick={() => setShowDetails((value) => !value)}
                  className="inline-flex items-center justify-center gap-1 rounded-full border border-white/12 bg-white/[0.06] px-3 py-2 text-[11px] font-medium text-[#f0ebe3] transition-colors hover:bg-white/[0.10]"
                >
                  <Settings2 className="h-3 w-3" />
                  {showDetails ? "Hide" : "Options"}
                </button>
              </div>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Close cookie banner"
                className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full text-white/55 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden border-t border-white/10"
                >
                  <div className="space-y-1.5 px-3 pb-3 pt-2.5">
                    <PreferenceRow
                      title="Essential"
                      description="Required for checkout, security, language, and basic site functionality."
                      checked={localPreferences.essential}
                      disabled
                    />
                    <PreferenceRow
                      title="Analytics"
                      description="Anonymous insights that help us improve pages and experiences."
                      checked={localPreferences.analytics}
                      onChange={(checked) =>
                        setLocalPreferences((prev) => ({
                          ...prev,
                          analytics: checked,
                        }))
                      }
                    />
                    <PreferenceRow
                      title="Functional"
                      description="Remember helpful preferences like language and cart continuity."
                      checked={localPreferences.functional}
                      onChange={(checked) =>
                        setLocalPreferences((prev) => ({
                          ...prev,
                          functional: checked,
                        }))
                      }
                    />
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleSavePreferences}
                        className="rounded-full bg-[#ff914d] px-5 py-2.5 text-sm font-semibold text-[#1a1410] transition-colors hover:bg-[#ff914d]/90"
                      >
                        Save choices
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
