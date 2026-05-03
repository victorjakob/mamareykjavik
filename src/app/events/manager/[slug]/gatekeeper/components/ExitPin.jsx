// Staff actions modal for the active kiosk.
//
// Two stages inside one overlay:
//   1. "pin"  → ask for the staff PIN (or master 2323) and verify it.
//   2. "menu" → after a correct PIN, show a small set of door-staff actions:
//                 - Manage attendees   → opens the in-kiosk CRUD screen
//                 - Edit setup         → re-opens the Initiator
//                 - Close kiosk        → calls /close, returns the report
//
// The PIN is only ever exchanged with /verify-pin (no state mutation) until
// the user actually confirms "Close kiosk" — in which case the same PIN is
// sent to /close. This keeps the gate strict but the menu cheap.

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Settings, DoorClosed, ChevronRight } from "lucide-react";
import PinPad from "./PinPad";
import { TONE, BigButton, ThresholdRule, EnsoCircle } from "./ui";

export default function ExitPin({ slug, onCancel, onClosed, onAction }) {
  const [stage, setStage] = useState("pin"); // "pin" | "menu"
  const [pin, setPin] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [closingDown, setClosingDown] = useState(false);

  useEffect(() => setError(null), [pin]);

  const verify = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/gatekeeper/${slug}/verify-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Incorrect PIN");
      setStage("menu");
    } catch (err) {
      setError(err.message);
      setPin("");
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-submit when 4 digits entered — staff shouldn't have to reach for a button.
  useEffect(() => {
    if (stage !== "pin") return;
    if (pin.length === 4 && !submitting) verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, stage]);

  const closeKiosk = async () => {
    if (closingDown) return;
    setClosingDown(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/gatekeeper/${slug}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not close kiosk");
      onClosed(data.report);
    } catch (err) {
      setError(err.message);
      setClosingDown(false);
    }
  };

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
          width: "min(460px, 92vw)",
          padding: "clamp(1.75rem, 3vw, 2.25rem)",
          boxShadow: "0 30px 80px -20px rgba(36,24,16,0.45)",
        }}
      >
        {/* Quiet ensō behind */}
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
          <AnimatePresence mode="wait">
            {stage === "pin" ? (
              <motion.div
                key="pin"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <p
                  className="text-center uppercase text-[10px]"
                  style={{ letterSpacing: "0.46em", color: TONE.bronze }}
                >
                  Staff actions
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
                  <p className="mt-4 text-center text-sm" style={{ color: TONE.danger }}>
                    {error}
                  </p>
                )}

                <div className="mt-6">
                  <BigButton
                    onClick={verify}
                    disabled={pin.length !== 4 || submitting}
                    tone="ink"
                    compact
                  >
                    {submitting ? "Checking…" : "Unlock"}
                  </BigButton>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <p
                  className="text-center uppercase text-[10px]"
                  style={{ letterSpacing: "0.46em", color: TONE.bronze }}
                >
                  Unlocked
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
                  What would you like to do?
                </p>

                <div className="mt-6 space-y-2.5">
                  <ActionRow
                    icon={Users}
                    label="Manage attendees"
                    sub="Edit names, mark arrived, remove an entry"
                    onClick={() => onAction?.("manage")}
                  />
                  <ActionRow
                    icon={Settings}
                    label="Edit setup"
                    sub="Change payment methods, options, PIN"
                    onClick={() => onAction?.("editSetup")}
                  />
                  <ActionRow
                    icon={DoorClosed}
                    label="Close kiosk"
                    sub="End check-in and view the totals"
                    onClick={closeKiosk}
                    busy={closingDown}
                    tone="ink"
                  />
                </div>

                {error && (
                  <p className="mt-4 text-center text-sm" style={{ color: TONE.danger }}>
                    {error}
                  </p>
                )}

                <p
                  className="mt-5 text-center text-[11px] italic font-[ui-serif]"
                  style={{ color: TONE.muted, letterSpacing: "0.05em" }}
                >
                  Manage and Edit set-up keep the kiosk active.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ActionRow({ icon: Icon, label, sub, onClick, busy, tone = "ghost" }) {
  const styles = {
    ghost: {
      background: "#fff",
      color: TONE.ink,
      border: `1.5px solid ${TONE.line}`,
    },
    ink: {
      background: TONE.ink,
      color: TONE.paper,
      border: `1.5px solid ${TONE.ink}`,
    },
  };
  const subColor = tone === "ink" ? "rgba(247,242,232,0.7)" : TONE.muted;
  const iconColor = tone === "ink" ? TONE.bronzeHi : TONE.bronze;

  return (
    <motion.button
      whileTap={{ scale: 0.985 }}
      type="button"
      onClick={onClick}
      disabled={busy}
      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left disabled:opacity-60"
      style={styles[tone]}
    >
      <span
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
        style={{
          background: tone === "ink" ? "rgba(255,242,220,0.08)" : "#fff7ec",
          color: iconColor,
          border: tone === "ink" ? "1px solid rgba(255,242,220,0.12)" : `1px solid ${TONE.line}`,
        }}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold leading-tight">
          {busy ? "Closing…" : label}
        </span>
        {sub && (
          <span className="mt-0.5 block text-[12px]" style={{ color: subColor }}>
            {sub}
          </span>
        )}
      </span>
      <ChevronRight
        className="h-4 w-4 flex-shrink-0"
        style={{ color: tone === "ink" ? TONE.bronzeHi : TONE.muted }}
      />
    </motion.button>
  );
}
