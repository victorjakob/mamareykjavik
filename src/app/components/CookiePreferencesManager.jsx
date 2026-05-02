"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, Info, X } from "lucide-react";
import { useCookieConsent } from "@/providers/CookieConsentProvider";

function PreferenceCard({
  title,
  badge,
  description,
  examples,
  checked,
  disabled,
  onChange,
}) {
  return (
    <div className="rounded-3xl border border-[#eadfd2] bg-[#fffaf5] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-medium text-[#2c1810]">{title}</h4>
            <span className="rounded-full bg-[#ff914d]/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b96529]">
              {badge}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[#6f5a49]">
            {description}
          </p>
          {examples ? (
            <p className="mt-2 text-xs leading-relaxed text-[#9a7a62]">
              {examples}
            </p>
          ) : null}
        </div>
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          className="mt-1 h-5 w-5 shrink-0 accent-[#ff914d]"
        />
      </div>
    </div>
  );
}

export default function CookiePreferencesManager({ isOpen, onClose }) {
  const { preferences, updatePreferences, resetPreferences } =
    useCookieConsent();

  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalPreferences(preferences);
    setHasChanges(false);
  }, [preferences, isOpen]);

  const handlePreferenceChange = (type, value) => {
    setLocalPreferences((prev) => ({ ...prev, [type]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updatePreferences(localPreferences);
    setHasChanges(false);
    onClose();
  };

  const handleReset = () => {
    resetPreferences();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] overflow-y-auto">
          <motion.button
            type="button"
            aria-label="Close cookie preferences"
            className="fixed inset-0 bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <div className="flex min-h-full items-end justify-center p-3 sm:items-center sm:p-6">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] bg-[#f9f4ec] text-left shadow-[0_28px_90px_rgba(20,12,6,0.35)] ring-1 ring-[#eadfd2]"
            >
              <div className="bg-[#110f0d] px-6 py-6 text-[#f0ebe3]">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close cookie preferences"
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex items-start gap-4 pr-10">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ff914d] text-[#1a1410]">
                    <Cookie className="h-6 w-6" strokeWidth={2.3} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.32em] text-[#ff914d]">
                      Privacy
                    </p>
                    <h3 className="mt-2 font-cormorant text-4xl italic leading-none">
                      Cookie preferences
                    </h3>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#b8aca0]">
                      Choose which optional cookies Mama can use. Essential
                      cookies stay active so the site can work properly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="max-h-[65dvh] space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
                <PreferenceCard
                  title="Essential cookies"
                  badge="Always active"
                  description="Needed for security, checkout, sessions, language, and the basic site experience."
                  checked={localPreferences.essential}
                  disabled
                />
                <PreferenceCard
                  title="Analytics cookies"
                  badge="Performance"
                  description="Anonymous usage signals that help us understand what works and what needs care."
                  examples="Examples: analytics and performance measurement."
                  checked={localPreferences.analytics}
                  onChange={(checked) =>
                    handlePreferenceChange("analytics", checked)
                  }
                />
                <PreferenceCard
                  title="Functional cookies"
                  badge="Convenience"
                  description="Helpful memory for preferences, cart continuity, and smoother returning visits."
                  examples="Examples: language preference, guest cart, saved preferences."
                  checked={localPreferences.functional}
                  onChange={(checked) =>
                    handlePreferenceChange("functional", checked)
                  }
                />

                <div className="rounded-3xl bg-[#110f0d]/5 p-4 text-sm leading-relaxed text-[#6f5a49]">
                  <div className="mb-2 flex items-center gap-2 font-medium text-[#2c1810]">
                    <Info className="h-4 w-4 text-[#ff914d]" />
                    How cookies work
                  </div>
                  Cookies are small text files stored on your device. Changes
                  apply right away, and you can reopen these settings from the
                  footer at any time.
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-[#eadfd2] bg-white/55 px-5 py-4 sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className="rounded-full bg-[#ff914d] px-6 py-3 text-sm font-semibold text-[#1a1410] transition-colors hover:bg-[#ff914d]/90 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Save changes
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-[#2c1810]/12 bg-white px-6 py-3 text-sm font-medium text-[#2c1810] transition-colors hover:bg-[#fffaf5]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full px-6 py-3 text-sm font-medium text-[#b23b2d] transition-colors hover:bg-red-50"
                >
                  Reset preferences
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
