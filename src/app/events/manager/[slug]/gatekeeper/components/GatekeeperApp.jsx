// Top-level orchestrator for the Gatekeeper kiosk.
//
// Phases:
//   "loading"       → fetching session + config
//   "forbidden"     → user can't manage this event
//   "initiator"     → host set-up (config + PIN + activate)
//   "kiosk"         → activated kiosk for door attendees
//   "manage"        → in-kiosk attendee CRUD (PIN-gated entry)
//   "editSetup"     → re-entered Initiator while kiosk is active (PIN-gated)
//   "reconcile"     → host just closed; show totals / wrap email CTA
//
// The kiosk's lock-icon opens an ExitPin modal which, after a correct PIN,
// shows three options: Manage attendees, Edit setup, or Close kiosk. Each
// transitions the parent into the matching phase.

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
import ManageAttendees from "./ManageAttendees";
import useKioskBackGuard from "./useKioskBackGuard";
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

  // Triggered from inside the ExitPin modal once the PIN is verified.
  // "manage"     → mount ManageAttendees
  // "editSetup"  → re-mount Initiator with current config
  // (closing happens inside ExitPin and uses handleClosed.)
  const handleStaffAction = (action) => {
    setShowExit(false);
    if (action === "manage") setPhase("manage");
    else if (action === "editSetup") setPhase("editSetup");
  };

  // Trap the browser back button + tab-close while the kiosk is "live" so a
  // stray tablet swipe can't kick the door staff out mid-event. Pre-activation
  // set-up and the post-close reconciliation should keep normal navigation.
  const kioskIsLive =
    phase === "kiosk" || phase === "manage" || phase === "editSetup";
  useKioskBackGuard(kioskIsLive);

  if (phase === "loading") {
    return <KioskSpinner label="Preparing check-in" />;
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
          <div className="mt-4"><KioskTitle><span className="italic" style={{ color: TONE.ink }}>Access denied.</span></KioskTitle></div>
          <p className="mt-5 font-[ui-serif]" style={{ color: TONE.sepia, fontSize: "1.05rem", lineHeight: 1.7 }}>
            Only the event host, co-host, or an admin can open this check-in screen. If you should have access, ask an admin to add your email to the event.
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

  if (phase === "editSetup") {
    return (
      <Initiator
        slug={slug}
        event={event}
        initialConfig={config || undefined}
        onActivated={handleActivated}
        onExit={() => setPhase("kiosk")}
      />
    );
  }

  if (phase === "manage") {
    return (
      <ManageAttendees
        slug={slug}
        event={event}
        onExit={() => setPhase("kiosk")}
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
              onAction={handleStaffAction}
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
