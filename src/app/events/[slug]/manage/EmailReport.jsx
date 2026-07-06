"use client";

// "Email report" — lives in the hub header, right under "View public page".
// Opens a small modal: recipient prefilled with the event's host email
// (editable — send to anyone), one Send button. The email itself is the
// full guest & sales report: every attendee with their email and what they
// paid, ticket-type breakdown when variants exist, and the grand total.

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Mail, Send, CheckCircle2, X } from "lucide-react";

const ORANGE = "#ff914d";
const DARK = "#2c1810";
const MUTED = "#9a7a62";
const BORDER = "#f0e6d8";

function isk(n) {
  return new Intl.NumberFormat("is-IS").format(Math.round(Number(n) || 0));
}

export default function EmailReportButton({ slug }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium"
        style={{ background: "#fff", color: MUTED, border: "1.5px solid #e8ddd3" }}
      >
        <Mail className="h-3.5 w-3.5" strokeWidth={1.9} />
        Email report
      </button>
      {open ? <ReportModal slug={slug} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function ReportModal({ slug, onClose }) {
  const [summary, setSummary] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [to, setTo] = useState("");
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/events/${slug}/manage/report`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Couldn't load the report");
        if (alive) {
          setSummary(json);
          if (json.defaultRecipient) setTo(json.defaultRecipient);
        }
      } catch (e) {
        if (alive) setLoadError(e.message || "Couldn't load the report");
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  // Close on Escape.
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (summary && inputRef.current) inputRef.current.focus();
  }, [summary]);

  async function send(e) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      const res = await fetch(`/events/${slug}/manage/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Couldn't send the report");
      setSentTo(json.to);
      toast.success(`Report sent to ${json.to}`);
    } catch (err) {
      toast.error(err.message || "Couldn't send the report");
    } finally {
      setSending(false);
    }
  }

  const totals = summary?.totals;
  const empty = totals && totals.orders === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(44,24,16,0.35)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Email the event report"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white"
        style={{ border: `1.5px solid ${BORDER}`, boxShadow: "0 12px 40px rgba(60,30,10,0.18)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-[3px] w-full" style={{ background: "linear-gradient(to right, #ff914d, #ffb06a40)" }} />

        <div className="p-5 sm:p-6">
          <div className="mb-1 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" style={{ color: ORANGE }} strokeWidth={1.9} />
              <h2 className="text-base font-semibold" style={{ color: DARK }}>
                Email the report
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-full p-1.5"
              style={{ color: MUTED, background: "#faf6f0" }}
            >
              <X className="h-4 w-4" strokeWidth={1.9} />
            </button>
          </div>

          <p className="text-xs leading-relaxed" style={{ color: MUTED }}>
            Online sales through mama.is only — every guest with their email
            and what they paid{summary?.hasVariants ? ", the ticket-type breakdown" : ""},
            and the total. Cash and door sales are not included. It also goes
            to the host automatically once the event ends.
          </p>

          {totals && !empty ? (
            <div className="mt-3 flex gap-3">
              <div className="flex-1 rounded-xl px-3.5 py-2.5" style={{ background: "#faf6f0" }}>
                <p className="text-[11px]" style={{ color: MUTED }}>Online tickets</p>
                <p className="mt-0.5 text-lg font-semibold" style={{ color: DARK }}>{totals.guests}</p>
              </div>
              <div className="flex-1 rounded-xl px-3.5 py-2.5" style={{ background: "#faf6f0" }}>
                <p className="text-[11px]" style={{ color: MUTED }}>Total online</p>
                <p className="mt-0.5 text-lg font-semibold" style={{ color: DARK }}>
                  {isk(totals.revenue)}
                  <span className="ml-1 text-xs font-normal" style={{ color: MUTED }}>kr</span>
                </p>
              </div>
            </div>
          ) : null}

          <div className="mt-4">
            {loadError ? (
              <p className="text-xs" style={{ color: "#b23b2d" }}>{loadError}</p>
            ) : !summary ? (
              <div className="flex items-center gap-2 py-1 text-xs" style={{ color: MUTED }}>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Preparing report…
              </div>
            ) : empty ? (
              <p className="text-xs" style={{ color: MUTED }}>
                No online tickets sold yet — the report unlocks with the first
                mama.is booking.
              </p>
            ) : (
              <form onSubmit={send}>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: DARK }}>
                  Send to
                </label>
                <input
                  ref={inputRef}
                  type="email"
                  required
                  value={to}
                  onChange={(e) => {
                    setTo(e.target.value);
                    setSentTo(null);
                  }}
                  placeholder="host@example.com"
                  list={summary?.suggestions?.length ? "host-report-suggestions" : undefined}
                  autoComplete="off"
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ background: "#faf6f0", color: DARK, border: `1.5px solid ${BORDER}` }}
                />
                {summary?.suggestions?.length ? (
                  <>
                    {/* Native autocomplete over everyone who has ever hosted —
                        start typing an email or a name and pick from the list. */}
                    <datalist id="host-report-suggestions">
                      {summary.suggestions.map((s) => (
                        <option key={s.email} value={s.email}>
                          {s.name || undefined}
                        </option>
                      ))}
                    </datalist>
                    <p className="mt-1.5 text-[11px]" style={{ color: MUTED }}>
                      Start typing — suggests everyone who has hosted before.
                    </p>
                  </>
                ) : null}
                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full px-4 py-2 text-sm font-medium"
                    style={{ background: "#fff", color: MUTED, border: "1.5px solid #e8ddd3" }}
                  >
                    {sentTo ? "Done" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={sending || !to.trim()}
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50"
                    style={
                      sentTo
                        ? { background: "#eefaf4", color: "#0f9d6b", border: "1.5px solid #bfe9d6" }
                        : {
                            background: ORANGE,
                            color: "#fff",
                            border: "1.5px solid transparent",
                            boxShadow: "0 2px 8px rgba(255,145,77,0.28)",
                          }
                    }
                  >
                    {sending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : sentTo ? (
                      <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.9} />
                    ) : (
                      <Send className="h-3.5 w-3.5" strokeWidth={1.9} />
                    )}
                    {sentTo ? "Sent" : "Send report"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
