"use client";

// Slot picker — modal-style overlay that opens when a visitor clicks a slot
// (or the per-offering "Join waitlist" affordance). Wired to a stub POST that
// returns 501 in stage 2; stage 3 plugs in the real booking submit.
//
// One-of radio between the slot's bookable offerings (auto-selected when only
// one). Then client fields. Waitlist mode reuses the same form with a single
// offering and no slot.

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

function formatTime(iso, locale) {
  return new Intl.DateTimeFormat(locale === "is" ? "is-IS" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

function formatLongDate(iso, locale) {
  return new Intl.DateTimeFormat(locale === "is" ? "is-IS" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

export default function SlotPicker({
  mode = "book", // "book" | "waitlist"
  slot,
  offerings = [],
  locale = "en",
  t,
  onClose,
}) {
  const initialOfferingId = useMemo(
    () => (offerings.length > 0 ? offerings[0].id : ""),
    [offerings]
  );
  const [offeringId, setOfferingId] = useState(initialOfferingId);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Lock body scroll while the panel is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Escape closes the panel.
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");

    if (!offeringId) {
      setError(t.errorRequiredOffering);
      return;
    }
    if (!name.trim()) {
      setError(t.errorRequiredName);
      return;
    }
    if (!email.trim()) {
      setError(t.errorRequiredEmail);
      return;
    }

    setSubmitting(true);
    try {
      const payload =
        mode === "book"
          ? {
              mode: "book",
              slot_id: slot?.id,
              offering_id: offeringId,
              client_name: name,
              client_email: email,
              client_phone: phone || null,
              client_note: note || null,
              language: locale,
            }
          : {
              mode: "waitlist",
              offering_id: offeringId,
              client_name: name,
              client_email: email,
              client_phone: phone || null,
              client_note: note || null,
              language: locale,
            };

      const res = await fetch("/api/private-session/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 501) {
        // Stage 2 only: the endpoint is intentionally a stub.
        setNotice(t.slotPickerNotImplemented);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Submission failed");
      // Real success handling lives in stage 3.
      setNotice("Submitted.");
    } catch (err) {
      setError(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  const headerLabel =
    mode === "book" && slot
      ? `${formatLongDate(slot.starts_at, locale)} · ${formatTime(slot.starts_at, locale)} – ${formatTime(slot.ends_at, locale)}`
      : t.practitionerWaitlistCta;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={mode === "book" ? t.slotPickerHeading : t.practitionerWaitlistCta}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full md:max-w-lg bg-[#160f0a] border border-white/10 rounded-t-3xl md:rounded-3xl overflow-y-auto max-h-[92vh]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white/80 flex items-center justify-center"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="px-6 md:px-8 pt-8 pb-6">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#ff914d] mb-2">
            {mode === "book" ? t.slotPickerHeading : t.practitionerWaitlistCta}
          </div>
          <h3 className="font-cormorant text-2xl md:text-3xl italic text-[#f0ebe3]">
            {headerLabel}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="px-6 md:px-8 pb-8 space-y-5">
          {/* Offering picker (radio if multiple, hidden if one) */}
          {offerings.length > 1 && (
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-[#a09488] mb-2">
                {t.slotPickerChooseOffering}
              </label>
              <div className="space-y-2">
                {offerings.map((o) => (
                  <label
                    key={o.id}
                    className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                      offeringId === o.id
                        ? "border-[#ff914d] bg-[#ff914d]/10"
                        : "border-white/10 bg-white/[0.02] hover:border-white/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="offering"
                      value={o.id}
                      checked={offeringId === o.id}
                      onChange={() => setOfferingId(o.id)}
                      className="mt-1 accent-[#ff914d]"
                    />
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-[#f0ebe3]">
                        {o.title}
                      </span>
                      <span className="block text-xs text-[#a09488] mt-1">
                        {o.duration_minutes} {t.practitionerOfferingDuration} ·{" "}
                        {new Intl.NumberFormat().format(o.price_isk)}{" "}
                        {t.practitionerOfferingPrice}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase tracking-[0.25em] text-[#a09488] mb-2">
              {t.slotPickerName}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-[#f0ebe3] focus:border-[#ff914d] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-[#a09488] mb-2">
                {t.slotPickerEmail}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-[#f0ebe3] focus:border-[#ff914d] outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-[#a09488] mb-2">
                {t.slotPickerPhone}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-[#f0ebe3] focus:border-[#ff914d] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.25em] text-[#a09488] mb-2">
              {t.slotPickerNote}
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-[#f0ebe3] focus:border-[#ff914d] outline-none resize-none"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-200 text-xs">
              {error}
            </div>
          )}
          {notice && (
            <div className="p-3 rounded-lg bg-[#ff914d]/15 border border-[#ff914d]/30 text-[#f0ebe3] text-xs leading-relaxed">
              {notice}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3.5 rounded-full bg-[#ff914d] text-[#160f0a] text-xs tracking-[0.25em] uppercase font-semibold hover:bg-[#ffa566] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? t.slotPickerSubmitting : t.slotPickerSubmit}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 rounded-full border border-white/20 text-[#f0ebe3] text-xs tracking-[0.25em] uppercase hover:bg-white/10 hover:border-white/40 transition"
            >
              {t.slotPickerCancel}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
