// Top-level orchestrator for the Gatekeeper kiosk.
//
// Phases:
//   "loading"       → fetching session + config
//   "forbidden"     → user can't manage this event
//   "initiator"     → host set-up (config + PIN + activate)
//   "kiosk"         → activated kiosk for door attendees
//   "reconcile"     → host just closed; show totals / wrap email CTA
//
// We intentionally mount the whole kiosk on the client to avoid flashing
// the set-up screen while we fetch state.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Initiator from "./Initiator";
import Kiosk from "./Kiosk";
import ExitPin from "./ExitPin";
import Reconciliation from "./Reconciliation";
import { TONE, SACRED_GRADIENT, KioskSpinner, Eyebrow, KioskTitle, BigButton, ThresholdRule, EnsoCircle } from "./ui";

export default function GatekeeperApp({ slug }) {
  const { data: session, status } = useSession();
  const [phase, setPhase] = useState("loading");
  const [event, setEvent] = useState(null);
  const [config, setConfig] = useState(null);
  const [report, setReport] = useState(null);
  const [showExit, setShowExit] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // On mount + after auth, fetch the config. Derive phase from config state.
  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated") {
      setPhase("forbidden");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/events/gatekeeper/${slug}/config`, { cache: "no-store" });
        if (res.status === 403 || res.status === 401) {
          if (!cancelled) setPhase("forbidden");
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load");
        if (cancelled) return;
        setEvent(data.event);
        setConfig(data.config);
        setPhase(data.config?.activated_at ? "kiosk" : "initiator");
      } catch (err) {
        if (!cancelled) {
          setLoadError(err.message);
          setPhase("forbidden");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, status]);

  const handleActivated = (newConfig) => {
    setConfig(newConfig);
    setPhase("kiosk");
  };

  const handleClosed = (reconciliationReport) => {
    setReport(reconciliationReport);
    setShowExit(false);
    setPhase("reconcile");
  };

  if (phase === "loading") {
    return <KioskSpinner label="Preparing the threshold" />;
  }

  if (phase === "forbidden") {
    return (
      <div
        className="relative"
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: SACRED_GRADIENT,
        }}
      >
        {/* A single ensō, quiet, behind the message */}
        <div
          aria-hidden
          className="absolute"
          style={{ pointerEvents: "none", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        >
          <EnsoCircle size={520} stroke={1} color={TONE.bronze} opacity={0.06} drawIn />
        </div>
        <div className="relative" style={{ maxWidth: 480, textAlign: "center" }}>
          <Eyebrow align="center">Gatekeeper</Eyebrow>
          <div className="mt-3 flex justify-center"><ThresholdRule width={48} /></div>
          <div className="mt-4"><KioskTitle><span className="italic" style={{ color: TONE.ink }}>Not your door.</span></KioskTitle></div>
          <p className="mt-5 font-[ui-serif]" style={{ color: TONE.sepia, fontSize: "1.05rem", lineHeight: 1.7 }}>
            Only the event's host, co-host, or an admin can hold this threshold. If you should have access, please ask an admin to add your email to the event.
          </p>
          {loadError && (
            <p className="mt-4 text-sm" style={{ color: TONE.muted }}>{loadError}</p>
          )}
          <div className="mt-8 flex justify-center">
            <Link
              href="/events/manager"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm"
              style={{ background: "#fff", border: `1px solid ${TONE.line}`, color: TONE.ink }}
            >
              <ArrowLeft className="h-4 w-4" /> Back to Event Manager
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "initiator") {
    return (
      <Initiator
        slug={slug}
        event={event}
        initialConfig={config || undefined}
        onActivated={handleActivated}
      />
    );
  }

  if (phase === "kiosk") {
    return (
      <>
        <Kiosk slug={slug} event={event} config={config} onUnlockRequested={() => setShowExit(true)} />
        <AnimatePresence>
          {showExit && (
            <ExitPin
              slug={slug}
              onCancel={() => setShowExit(false)}
              onClosed={handleClosed}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  if (phase === "reconcile" && report) {
    return <Reconciliation report={report} slug={slug} />;
  }

  // Fallback — shouldn't hit this unless something desyncs.
  return <KioskSpinner label="Working" />;
}
