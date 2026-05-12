"use client";

// /unsubscribe — CAN-SPAM-compliant unsubscribe landing page.
// ────────────────────────────────────────────────────────────
// Every email sent from this codebase links to this page in its footer.
// To stay compliant with email regulations (CAN-SPAM in the US, PECR/GDPR
// in the UK/EU) we MUST honour unsubscribe requests promptly.
//
// Flow:
//   1. User lands here (typically from an email footer link with ?token=...
//      or ?email=...).
//   2. Page shows the email being unsubscribed (when known) and a single
//      confirmation button.
//   3. Click → POST /api/unsubscribe with the token/email → server records
//      the opt-out → page shows confirmation.
//
// Design: same calm cream/orange brand as the marketing site. Single column,
// centred, no sidebar/navigation distraction.

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

const ORANGE = "#ff914d";
const CREAM = "#f9f4ec";
const TEXT_DARK = "#2c1810";
const TEXT_MUTED = "#9a7a62";
const HAIRLINE = "#e8ddd3";

function UnsubscribeInner() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const email = params.get("email") || "";

  const [status, setStatus] = useState("idle"); // idle | submitting | done | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleConfirm = async () => {
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Server returned ${res.status}`);
      }
      setStatus("done");
    } catch (err) {
      console.error("Unsubscribe failed:", err);
      setStatus("error");
      setErrorMsg(String(err?.message || err));
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-16"
      style={{ background: CREAM }}
    >
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md text-center"
      >
        {/* Wordmark */}
        <p
          className="text-[10px] uppercase tracking-[0.42em]"
          style={{ color: TEXT_MUTED, fontWeight: 600 }}
        >
          Mama
        </p>

        <div
          className="mx-auto my-5 h-[2px] w-12 rounded"
          style={{ background: ORANGE }}
        />

        {status === "done" ? (
          <>
            <h1
              className="font-cormorant italic font-light leading-[1.05] mb-4"
              style={{ fontSize: "clamp(1.9rem, 5vw, 2.5rem)", color: TEXT_DARK }}
            >
              You've been unsubscribed.
            </h1>
            <p style={{ color: TEXT_MUTED, lineHeight: 1.65 }}>
              You won't receive marketing emails from us going forward. It may
              take up to 24 hours for any in-flight messages to stop.
            </p>
            <p
              className="mt-6 text-sm"
              style={{ color: TEXT_MUTED, lineHeight: 1.65 }}
            >
              If you change your mind, you can re-subscribe anytime from{" "}
              <a
                href="/membership"
                style={{ color: ORANGE, textDecoration: "none", fontWeight: 600 }}
              >
                /membership
              </a>
              . Important transactional emails (booking confirmations, receipts,
              password resets) will still be sent — those aren't marketing.
            </p>
          </>
        ) : (
          <>
            <h1
              className="font-cormorant italic font-light leading-[1.05] mb-4"
              style={{ fontSize: "clamp(1.9rem, 5vw, 2.5rem)", color: TEXT_DARK }}
            >
              Unsubscribe from Mama emails?
            </h1>
            <p style={{ color: TEXT_MUTED, lineHeight: 1.65 }}>
              We get it — inboxes are loud. Confirm below and we'll stop
              sending you our community letter and marketing notes.
            </p>

            {email ? (
              <div
                className="mt-6 mx-auto inline-block px-4 py-2 rounded-full"
                style={{
                  background: "#ffffff",
                  border: `1px solid ${HAIRLINE}`,
                  color: TEXT_DARK,
                  fontSize: "13px",
                  fontFamily: '"SF Mono", Menlo, monospace',
                }}
              >
                {email}
              </div>
            ) : null}

            <div className="mt-8">
              <button
                onClick={handleConfirm}
                disabled={status === "submitting"}
                className="inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-semibold transition-all"
                style={
                  status === "submitting"
                    ? {
                        background: "#ffd9b8",
                        color: "#a75a1a",
                        cursor: "wait",
                      }
                    : {
                        background: ORANGE,
                        color: "#ffffff",
                        boxShadow: "0 2px 10px rgba(255,145,77,0.28)",
                      }
                }
              >
                {status === "submitting" ? "Unsubscribing…" : "Confirm unsubscribe"}
              </button>
            </div>

            {status === "error" ? (
              <p
                className="mt-4 text-sm"
                style={{ color: "#9a1f1f", lineHeight: 1.55 }}
              >
                Something went wrong: {errorMsg}. Please reply to any email
                from us and we'll handle it manually.
              </p>
            ) : null}

            <p
              className="mt-8 text-xs"
              style={{ color: TEXT_MUTED, lineHeight: 1.6 }}
            >
              Transactional emails — booking confirmations, payment receipts,
              password resets — will still be sent. Those aren't marketing.
            </p>
          </>
        )}

        <p
          className="mt-12 text-[11px]"
          style={{ color: TEXT_MUTED, letterSpacing: "0.08em" }}
        >
          Mama Reykjavík · Bankastræti 2 · 101 Reykjavík
        </p>
      </motion.div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={null}>
      <UnsubscribeInner />
    </Suspense>
  );
}
