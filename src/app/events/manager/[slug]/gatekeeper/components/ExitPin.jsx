// Modal overlay that blocks the kiosk until the correct PIN (or the master
// PIN 2323) is entered. Submitting the right PIN calls /close which returns
// the reconciliation payload, handed back to the parent for rendering.

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import PinPad from "./PinPad";
import { TONE, BigButton, ThresholdRule, EnsoCircle } from "./ui";

export default function ExitPin({ slug, onCancel, onClosed }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => setError(null), [pin]);

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/gatekeeper/${slug}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Incorrect PIN");
      onClosed(data.report);
    } catch (err) {
      setError(err.message);
      setPin("");
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-submit when 4 digits entered — staff shouldn't have to reach for a button.
  useEffect(() => {
    if (pin.length === 4 && !submitting) submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{
        background: "rgba(36,24,16,0.62)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-[28px] overflow-hidden"
        style={{
          background: TONE.paper,
          border: `1px solid ${TONE.line}`,
          width: "min(440px, 92vw)",
          padding: "clamp(1.75rem, 3vw, 2.25rem)",
          boxShadow: "0 30px 80px -20px rgba(36,24,16,0.45)",
        }}
      >
        {/* Quiet ensō behind — only just visible */}
        <div
          aria-hidden
          className="absolute"
          style={{ right: "-18%", top: "-22%", pointerEvents: "none" }}
        >
          <EnsoCircle size={260} stroke={1} color={TONE.bronze} opacity={0.07} />
        </div>

        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="absolute rounded-full flex items-center justify-center"
          style={{
            top: 18, right: 18, width: 40, height: 40,
            background: "#fff", border: `1px solid ${TONE.line}`, color: TONE.sepia,
            zIndex: 1,
          }}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative">
          <p className="text-center uppercase text-[10px]" style={{ letterSpacing: "0.46em", color: TONE.bronze }}>
            Close the threshold
          </p>
          <div className="mt-3 flex justify-center"><ThresholdRule width={40} /></div>
          <p
            className="mt-4 text-center font-extralight italic"
            style={{
              fontFamily: "ui-serif, Georgia, serif",
              color: TONE.ink,
              fontSize: "clamp(1.5rem, 3vw, 1.9rem)",
              lineHeight: 1.2,
            }}
          >
            Enter your PIN
          </p>

          <div className="mt-6">
            <PinPad value={pin} onChange={setPin} />
          </div>

          {error && (
            <p className="mt-4 text-center text-sm" style={{ color: TONE.danger }}>{error}</p>
          )}

          <div className="mt-6">
            <BigButton
              onClick={submit}
              disabled={pin.length !== 4 || submitting}
              tone="ink"
              compact
            >
              {submitting ? "Checking…" : "Unlock & close"}
            </BigButton>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
