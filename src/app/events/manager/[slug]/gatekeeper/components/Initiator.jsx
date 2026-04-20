// Initiator screen — the host's pre-flight: pick payment methods, set the
// bank details if transfer is on, set flags (tip, receipt, upsell), and
// create a 4-digit PIN that locks the kiosk. Pressing ACTIVATE sets
// activated_at and transitions the app to the Kiosk screen.

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ArrowLeft, Sparkles, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import {
  TONE,
  SACRED_GRADIENT,
  Eyebrow,
  KioskTitle,
  BigButton,
  Panel,
  BigInput,
  TogglePill,
  EnsoCircle,
  ThresholdRule,
} from "./ui";
import PinPad from "./PinPad";

const METHOD_DEFS = [
  { key: "cash",     label: "Cash",          sub: "Simple, no setup needed" },
  { key: "pos",      label: "POS (Card)",    sub: "Your existing terminal — no integration" },
  { key: "transfer", label: "Bank transfer", sub: "Asks you to enter kt + bank below" },
  { key: "exchange", label: "Exchange",      sub: "Barter, work-trade, or gift — guest writes a note" },
];

export default function Initiator({ slug, event, initialConfig, onActivated }) {
  const [enabled, setEnabled] = useState(new Set(initialConfig?.enabled_methods || ["cash"]));
  const [bankDetails, setBankDetails] = useState({
    kt: initialConfig?.bank_details?.kt || "",
    bank: initialConfig?.bank_details?.bank || "",
    explanation: initialConfig?.bank_details?.explanation || "",
  });
  const [tipEnabled, setTipEnabled] = useState(initialConfig?.tip_enabled ?? true);
  const [receiptEnabled, setReceiptEnabled] = useState(initialConfig?.receipt_enabled ?? true);
  const [upsellEnabled, setUpsellEnabled] = useState(initialConfig?.upsell_enabled ?? true);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState("config"); // "config" | "pin"

  const needsBankDetails = enabled.has("transfer");
  const transferDetailsValid = !needsBankDetails || (bankDetails.kt && bankDetails.bank);
  const methodsValid = enabled.size > 0;
  const hasStoredPin = !!initialConfig?.has_pin;
  const canProceedToPin = methodsValid && transferDetailsValid;
  const pinValid = /^\d{4}$/.test(pin);

  const toggleMethod = (key) => {
    const next = new Set(enabled);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setEnabled(next);
  };

  const activate = async () => {
    setSaving(true);
    setError(null);
    try {
      const body = {
        enabled_methods: Array.from(enabled),
        bank_details: bankDetails,
        tip_enabled: tipEnabled,
        receipt_enabled: receiptEnabled,
        upsell_enabled: upsellEnabled,
        activate: true,
      };
      // Only send pin if user provided a new one (or if they had none before).
      if (/^\d{4}$/.test(pin)) body.pin = pin;

      const res = await fetch(`/api/events/gatekeeper/${slug}/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to activate");
      onActivated(data.config);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="relative"
      style={{ minHeight: "100dvh", background: SACRED_GRADIENT }}
    >
      {/* Top bar */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between"
        style={{
          padding: "clamp(1rem, 2vw, 1.4rem) clamp(1.2rem, 3vw, 2.2rem)",
          background: "rgba(255,250,244,0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: `1px solid ${TONE.line}`,
        }}
      >
        <Link
          href={`/events/manager/${slug}/attendance`}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
          style={{ background: "#fff", border: `1.5px solid ${TONE.line}`, color: TONE.sepia }}
        >
          <ArrowLeft className="h-4 w-4" />
          Exit set-up
        </Link>
        <div className="text-right">
          <p className="text-[10px] uppercase font-semibold" style={{ letterSpacing: "0.35em", color: TONE.gold }}>
            Gatekeeper
          </p>
          <p className="text-sm" style={{ color: TONE.sepia }}>
            {event?.name} · {event?.date ? format(new Date(event.date), "MMM d · HH:mm") : ""}
          </p>
        </div>
      </div>

      <div className="mx-auto w-full" style={{ maxWidth: 960, padding: "clamp(1.5rem, 3vw, 2.5rem)" }}>
        {step === "config" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="relative"
          >
            {/* Ensō watermark — quiet, drawn in slowly behind the hero */}
            <div
              aria-hidden
              className="absolute"
              style={{ right: "-6%", top: "-8%", pointerEvents: "none" }}
            >
              <EnsoCircle size={340} stroke={1} color={TONE.bronze} opacity={0.08} drawIn />
            </div>

            <div className="relative">
              <Eyebrow>Before the doors open</Eyebrow>
              <div className="mt-3"><ThresholdRule width={56} /></div>
              <div className="mt-5">
                <KioskTitle>
                  <span style={{ color: TONE.ink }}>Set up check-in.</span><br />
                  <span className="italic" style={{ color: TONE.sepia }}>Keep it simple at the door.</span>
                </KioskTitle>
              </div>
              <p className="mt-5 max-w-xl font-[ui-serif]" style={{ color: TONE.sepia, fontSize: "clamp(1rem, 1.6vw, 1.1rem)", lineHeight: 1.7 }}>
                Choose the payment methods you'll accept, what guests will see, and a PIN to lock the kiosk. When you're ready, tap <em>Activate</em> and the tablet becomes a simple self-serve check-in stand.
              </p>
            </div>

            <div className="mt-8 space-y-5">
              <Panel>
                <Eyebrow>Payment methods</Eyebrow>
                <p className="mt-2 mb-5 text-sm" style={{ color: TONE.muted }}>
                  Toggle what you'll accept at the door.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {METHOD_DEFS.map((m) => (
                    <TogglePill
                      key={m.key}
                      checked={enabled.has(m.key)}
                      onChange={() => toggleMethod(m.key)}
                      label={m.label}
                      sub={m.sub}
                    />
                  ))}
                </div>
                {!methodsValid && (
                  <p className="mt-3 text-sm" style={{ color: TONE.danger }}>
                    Enable at least one method.
                  </p>
                )}
              </Panel>

              {needsBankDetails && (
                <Panel>
                  <Eyebrow>Bank details (for transfers)</Eyebrow>
                  <p className="mt-2 mb-5 text-sm" style={{ color: TONE.muted }}>
                    These appear on-screen so the guest can transfer directly from their banking app.
                  </p>
                  <div className="space-y-4">
                    <BigInput
                      label="KT (Kennitala)"
                      value={bankDetails.kt}
                      onChange={(v) => setBankDetails({ ...bankDetails, kt: v })}
                      placeholder="123456-7890"
                      inputMode="numeric"
                      required
                    />
                    <BigInput
                      label="Bank (e.g. 0133-26-012345)"
                      value={bankDetails.bank}
                      onChange={(v) => setBankDetails({ ...bankDetails, bank: v })}
                      placeholder="0133-26-012345"
                      required
                    />
                    <BigInput
                      label="Explanation / reference (optional)"
                      value={bankDetails.explanation}
                      onChange={(v) => setBankDetails({ ...bankDetails, explanation: v })}
                      placeholder={`e.g. ${event?.name || "Event"} ticket`}
                    />
                  </div>
                </Panel>
              )}

              <Panel>
                <Eyebrow>Kiosk options</Eyebrow>
                <div className="mt-4 space-y-3">
                  <TogglePill
                    checked={tipEnabled}
                    onChange={setTipEnabled}
                    label="Offer a tip"
                    sub="Subtle, always optional. Amounts are suggested, not forced."
                  />
                  <TogglePill
                    checked={receiptEnabled}
                    onChange={setReceiptEnabled}
                    label="Offer email receipt"
                    sub="Checkbox defaults off; email becomes required if checked."
                  />
                  <TogglePill
                    checked={upsellEnabled}
                    onChange={setUpsellEnabled}
                    label="Show gentle upsell"
                    sub="A soft nod to ceremonial cacao + the restaurant upstairs."
                  />
                </div>
              </Panel>
            </div>

            <div className="mt-10 flex items-center gap-3">
              <BigButton
                onClick={() => setStep("pin")}
                disabled={!canProceedToPin}
                tone="ink"
              >
                Continue to the seal →
              </BigButton>
            </div>
          </motion.div>
        )}

        {step === "pin" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="max-w-md mx-auto"
          >
            <button
              type="button"
              onClick={() => setStep("config")}
              className="inline-flex items-center gap-2 text-sm mb-6"
              style={{ color: TONE.sepia }}
            >
              <ArrowLeft className="h-4 w-4" /> Back to set-up
            </button>

            <Eyebrow align="center">{hasStoredPin ? "Confirm the seal" : "Set the seal"}</Eyebrow>
            <div className="mt-3 flex justify-center"><ThresholdRule width={48} /></div>
            <div className="text-center mt-4">
              <KioskTitle>
                <span style={{ color: TONE.ink }}>
                  {hasStoredPin ? "Welcome back." : "Seal the kiosk."}
                </span>
              </KioskTitle>
            </div>
            <p className="mt-4 text-center font-[ui-serif]" style={{ color: TONE.sepia, fontSize: "clamp(0.95rem, 1.5vw, 1.05rem)", lineHeight: 1.7 }}>
              {hasStoredPin
                ? "Re-enter your four digits, or set new ones to replace them."
                : "Four digits. You'll need it to close or exit. The master PIN also works, if you ever forget."}
            </p>

            <div className="mt-8">
              <PinPad value={pin} onChange={setPin} label="Enter PIN" />

              {/* Show / hide digits — so a mistyped PIN is obvious before activation */}
              <div className="mt-4 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setShowPin((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.25em]"
                  style={{
                    background: "#fff",
                    border: `1.5px solid ${TONE.line}`,
                    color: TONE.sepia,
                  }}
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showPin ? "Hide PIN" : "Show PIN"}
                </button>
              </div>
              {showPin && (
                <p
                  className="mt-3 text-center font-mono tracking-[0.5em]"
                  style={{ color: TONE.ink, fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)" }}
                >
                  {pin || "——"}
                </p>
              )}
            </div>

            {error && (
              <p className="mt-5 text-center text-sm" style={{ color: TONE.danger }}>{error}</p>
            )}

            <div className="mt-8">
              <BigButton onClick={activate} disabled={!pinValid || saving}>
                {saving ? "Opening the door…" : (<><Sparkles className="inline h-5 w-5 mr-2" />Open the door</>)}
              </BigButton>
            </div>

            <p className="mt-5 text-center text-xs italic font-[ui-serif]" style={{ color: TONE.muted, letterSpacing: "0.05em" }}>
              Once activated, the tablet stays in check-in mode. Exiting asks for your PIN.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
