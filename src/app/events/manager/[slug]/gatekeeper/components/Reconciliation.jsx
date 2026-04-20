// Reconciliation screen — shown immediately after the host closes
// Gatekeeper. Totals by payment method + tips + walk-in list. Includes
// a "send me the wrap now" button so the host can trigger the
// Spotify-Wrapped email on demand instead of waiting for the cron.

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import Link from "next/link";
import { Mail, ArrowRight, Sparkles } from "lucide-react";
import {
  TONE,
  SACRED_GRADIENT,
  Eyebrow,
  KioskTitle,
  Panel,
  BigButton,
  EnsoCircle,
  SealDot,
  ThresholdRule,
} from "./ui";

const METHOD_LABELS = {
  online:   "Online (pre-paid)",
  cash:     "Cash",
  pos:      "POS (Card)",
  transfer: "Bank transfer",
  exchange: "Exchange",
  door:     "Door (legacy)",
};

export default function Reconciliation({ report, slug }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const { event, totals, walkIns } = report;

  const sendWrap = async () => {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/sendgrid/gatekeeper-wrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: event.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Email failed");
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const checkedInPct = totals.tickets > 0 ? Math.round((totals.checkedIn / totals.tickets) * 100) : 0;

  return (
    <div
      className="relative"
      style={{ minHeight: "100dvh", background: SACRED_GRADIENT }}
    >
      <div className="mx-auto w-full" style={{ maxWidth: 920, padding: "clamp(2rem, 4vw, 3rem) clamp(1.25rem, 3vw, 2.5rem) 5rem" }}>
        {/* Hero — ink-on-bone with a slow-drawn ensō behind the title.
            The stats sit as four quiet pillars beneath the threshold rule. */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-[28px] overflow-hidden"
          style={{
            background: TONE.paper,
            border: `1px solid ${TONE.line}`,
            padding: "clamp(2.2rem, 4vw, 3rem) clamp(1.5rem, 3vw, 2.5rem)",
          }}
        >
          {/* Ensō watermark */}
          <div
            aria-hidden
            className="absolute"
            style={{
              right: "-10%",
              top: "-30%",
              pointerEvents: "none",
            }}
          >
            <EnsoCircle size={460} stroke={1} color={TONE.bronze} opacity={0.08} drawIn />
          </div>

          <div className="relative text-center">
            <Eyebrow align="center">The evening, held</Eyebrow>
            <div className="mt-3 flex justify-center">
              <ThresholdRule width={72} />
            </div>
            <div className="mt-5">
              <KioskTitle>
                <span style={{ color: TONE.ink }}>{event.name}</span>
              </KioskTitle>
            </div>
            <p className="mt-3 font-[ui-serif] italic" style={{ color: TONE.sepia, fontSize: "clamp(0.95rem, 1.5vw, 1.05rem)" }}>
              {format(new Date(event.date), "EEEE, MMMM d · HH:mm")}
            </p>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-0">
              <HeroStat label="In the room" value={totals.checkedIn} sub={`${checkedInPct}% of ${totals.tickets}`} first />
              <HeroStat label="At the door" value={totals.walkIns} sub="walk-ins tonight" />
              <HeroStat label="Revenue" value={Number(totals.revenue).toLocaleString()} sub="ISK collected" />
              <HeroStat label="Tips" value={Number(totals.tipsTotal).toLocaleString()} sub={`ISK · ${totals.tippers} offered`} last />
            </div>
          </div>
        </motion.div>

        {/* By method */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mt-6"
        >
          <Panel padded={false}>
            <div className="px-6 pt-6">
              <Eyebrow>By payment method</Eyebrow>
              <p className="mt-2 text-sm" style={{ color: TONE.muted }}>
                Every walk-in is saved in the attendees list — emails included.
              </p>
            </div>
            <table className="w-full mt-4">
              <thead>
                <tr style={{ background: TONE.warm, borderTop: `1px solid ${TONE.line}` }}>
                  <th className="text-left uppercase text-[10px] font-semibold py-3 px-6" style={{ letterSpacing: "0.25em", color: TONE.sepia }}>Method</th>
                  <th className="text-right uppercase text-[10px] font-semibold py-3 px-6" style={{ letterSpacing: "0.25em", color: TONE.sepia }}>Tickets</th>
                  <th className="text-right uppercase text-[10px] font-semibold py-3 px-6" style={{ letterSpacing: "0.25em", color: TONE.sepia }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(totals.byMethod).length === 0 && (
                  <tr><td colSpan={3} className="py-8 px-6 text-center text-sm" style={{ color: TONE.muted }}>No sales recorded.</td></tr>
                )}
                {Object.entries(totals.byMethod).map(([key, v]) => (
                  <tr key={key} style={{ borderTop: `1px solid ${TONE.line}` }}>
                    <td className="py-4 px-6" style={{ color: TONE.ink, fontSize: "1rem" }}>{METHOD_LABELS[key] || key}</td>
                    <td className="py-4 px-6 text-right tabular-nums" style={{ color: TONE.ink, fontSize: "1rem" }}>{v.tickets}</td>
                    <td className="py-4 px-6 text-right tabular-nums" style={{ color: TONE.ink, fontSize: "1rem" }}>{Number(v.revenue).toLocaleString()} ISK</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </motion.div>

        {/* Walk-in list */}
        {walkIns && walkIns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mt-6"
          >
            <Panel padded={false}>
              <div className="px-6 pt-6">
                <Eyebrow>Walk-ins tonight</Eyebrow>
                <p className="mt-2 text-sm" style={{ color: TONE.muted }}>
                  {walkIns.length} {walkIns.length === 1 ? "person" : "people"} added at the door. All are saved in your attendee list.
                </p>
              </div>
              <ul className="mt-4">
                {walkIns.map((w, i) => (
                  <li
                    key={w.id}
                    className="flex items-center justify-between gap-3 px-6 py-4"
                    style={{ borderTop: i === 0 ? `1px solid ${TONE.line}` : `1px solid ${TONE.line}` }}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold truncate" style={{ color: TONE.ink, fontSize: "1.05rem" }}>
                        {w.name}
                      </p>
                      <p className="text-sm truncate" style={{ color: TONE.muted }}>
                        {w.email || "— no email provided —"}
                      </p>
                      {w.note && (
                        <p className="mt-1 text-xs italic" style={{ color: TONE.sepia }}>"{w.note}"</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs uppercase" style={{ letterSpacing: "0.2em", color: TONE.muted }}>{w.method}</p>
                      <p className="tabular-nums" style={{ color: TONE.ink, fontSize: "1rem" }}>
                        {Number(w.total).toLocaleString()} ISK
                        {w.tip > 0 && (
                          <span className="ml-1 text-xs" style={{ color: TONE.gold }}>
                            (incl. {w.tip.toLocaleString()} tip)
                          </span>
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <BigButton onClick={sendWrap} tone={sent ? "ghost" : "sacred"} disabled={sending || sent}>
            {sent ? (
              <><Sparkles className="inline h-4 w-4 mr-2" /> Wrap emailed</>
            ) : sending ? (
              "Sending…"
            ) : (
              <><Mail className="inline h-4 w-4 mr-2" /> Email me the full wrap</>
            )}
          </BigButton>
          <Link
            href={`/events/manager/${slug}/attendance`}
            className="inline-flex items-center justify-center rounded-[22px] font-semibold uppercase tracking-[0.1em]"
            style={{
              padding: "clamp(1.15rem, 2.2vw, 1.6rem)",
              background: "#fff",
              color: TONE.ink,
              border: `1.5px solid ${TONE.line}`,
              fontSize: "clamp(1rem, 1.9vw, 1.25rem)",
            }}
          >
            Attendee list <ArrowRight className="inline h-4 w-4 ml-2" />
          </Link>
        </motion.div>
        {error && <p className="mt-4 text-center text-sm" style={{ color: TONE.danger }}>{error}</p>}

        <p className="mt-8 text-center text-xs" style={{ color: TONE.muted, letterSpacing: "0.2em" }}>
          A Spotify-Wrapped-style recap will also land in your inbox tomorrow morning.
        </p>
      </div>
    </div>
  );
}

function HeroStat({ label, value, sub, first, last }) {
  // Four quiet pillars, separated by vertical hairlines. No glass, no shadow.
  return (
    <div
      className="py-1 px-3 sm:px-4 text-center"
      style={{
        borderLeft: first ? "none" : `1px solid ${TONE.line}`,
      }}
    >
      <p className="text-[10px] uppercase" style={{ letterSpacing: "0.38em", color: TONE.bronze }}>
        {label}
      </p>
      <p
        className="mt-3 font-extralight italic tabular-nums"
        style={{
          fontFamily: "ui-serif, Georgia, serif",
          fontSize: "clamp(1.6rem, 3.2vw, 2rem)",
          lineHeight: 1.05,
          color: TONE.ink,
        }}
      >
        {value}
      </p>
      <p className="mt-1.5 text-xs" style={{ color: TONE.muted }}>
        {sub}
      </p>
    </div>
  );
}
