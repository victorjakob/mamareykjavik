"use client";

// Light-touch newsletter editor:
//   - one input for the intro note (top line above the events)
//   - exactly one FEATURED event (shows larger, at the top of the letter);
//     defaults to the weekend event, changeable with one click
//   - per-event: editable sensory line + image URL
// Save updates the draft + re-renders HTML. Choosing the feature saves
// silently so the live preview updates immediately. Send fires the broadcast.
//
// Preview shows in an iframe with srcDoc=html so what Mama sees here is
// exactly what subscribers will see.

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const ACCENT = "#ff914d";

// Iceland runs on UTC year-round, so getUTCDay is the local weekday.
function isWeekendISO(iso) {
  if (!iso) return false;
  const day = new Date(iso).getUTCDay();
  return day === 0 || day === 5 || day === 6; // Sun, Fri, Sat
}

// The default feature is the weekend event, else the first one.
function defaultHighlightId(events) {
  const list = Array.isArray(events) ? events : [];
  if (!list.length) return null;
  const weekend = list.find((e) => isWeekendISO(e.date));
  return (weekend || list[0]).id ?? null;
}

export default function NewsletterEditor({ draft }) {
  const router = useRouter();
  const [introNote, setIntroNote] = useState(draft.intro_note || "");
  const [subject, setSubject] = useState(draft.subject || "");
  const [events, setEvents] = useState(
    Array.isArray(draft.events_json) ? draft.events_json : [],
  );
  const [highlightId, setHighlightId] = useState(
    draft.highlight_event_id ?? null,
  );
  const [html, setHtml] = useState(draft.html || "");
  const [status, setStatus] = useState(draft.status);
  const [sentAt, setSentAt] = useState(draft.sent_at);
  const [errorMsg, setErrorMsg] = useState(draft.error_message);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [info, setInfo] = useState(null);

  const isSent = status === "sent";
  const isSending = status === "sending";

  function updateEvent(i, patch) {
    setEvents((prev) =>
      prev.map((ev, idx) => (idx === i ? { ...ev, ...patch } : ev)),
    );
  }

  // Save the draft and refresh the preview HTML. `overrides` lets callers save
  // a value that state hasn't caught up to yet (e.g. a just-picked feature).
  const saveDraft = useCallback(
    async (overrides = {}, opts = {}) => {
      const payload = {
        intro_note: introNote,
        subject,
        events,
        highlight_event_id: highlightId,
        ...overrides,
      };
      if (!opts.silent) {
        setSaving(true);
        setInfo(null);
      }
      try {
        const res = await fetch(`/api/newsletter/save/${draft.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "Save failed");
        setHtml(data.html);
        if (!opts.silent) setInfo("Saved.");
        return data;
      } catch (err) {
        setInfo(`Could not save: ${err.message}`);
        return null;
      } finally {
        if (!opts.silent) setSaving(false);
      }
    },
    [introNote, subject, events, highlightId, draft.id],
  );

  // Always keep exactly one event featured. On open, if the draft has no
  // (valid) feature, default to the weekend event and persist it so the
  // preview shows the hero straight away.
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    if (isSent || isSending || !events.length) return;
    // Ensure exactly one valid feature, then always re-render once on open so
    // the preview reflects the latest template + settings (never stale HTML).
    const valid =
      highlightId != null &&
      events.some((e) => String(e.id) === String(highlightId));
    const def = valid ? highlightId : defaultHighlightId(events);
    if (!valid && def != null) setHighlightId(def);
    saveDraft({ highlight_event_id: def }, { silent: true });
  }, [events, highlightId, isSent, isSending, saveDraft]);

  // Pick a different featured event — saves silently so the preview updates.
  function selectHighlight(id) {
    if (isSent || isSending) return;
    if (String(id) === String(highlightId)) return;
    setHighlightId(id);
    saveDraft({ highlight_event_id: id }, { silent: true });
  }

  async function handleSave() {
    await saveDraft();
  }

  // Re-pull the coming week's events into this draft (keeps wording + feature)
  // and refresh the preview in place — no email sent.
  async function handleRegenerate() {
    if (
      !window.confirm(
        "Pull in the latest events and rebuild this letter? Your wording and featured pick are kept.",
      )
    ) {
      return;
    }
    setRegenerating(true);
    setInfo(null);
    try {
      const res = await fetch("/api/admin/subscribers/regenerate-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId: draft.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Regenerate failed");
      const d = data.draft || {};
      if (Array.isArray(d.events_json)) setEvents(d.events_json);
      if (d.highlight_event_id !== undefined) setHighlightId(d.highlight_event_id);
      if (typeof d.intro_note === "string") setIntroNote(d.intro_note);
      if (typeof d.html === "string") setHtml(d.html);
      setInfo(`Pulled in the latest events (${data.eventsCount}).`);
    } catch (err) {
      setInfo(`Could not refresh events: ${err.message}`);
    } finally {
      setRegenerating(false);
    }
  }

  async function handleSend() {
    if (
      !window.confirm(
        "Send this letter to your subscribers now? This cannot be undone.",
      )
    ) {
      return;
    }
    setSending(true);
    setInfo(null);
    try {
      // Save first so the latest edits go out.
      const saveData = await saveDraft({}, { silent: true });
      if (!saveData) throw new Error("Save failed");

      const sendRes = await fetch(`/api/newsletter/send/${draft.id}`, {
        method: "POST",
      });
      const sendData = await sendRes.json();
      if (!sendRes.ok || !sendData.ok) {
        throw new Error(sendData.error || "Send failed");
      }
      setStatus("sent");
      setSentAt(new Date().toISOString());
      setInfo("Sent.");
      router.refresh();
    } catch (err) {
      setStatus("failed");
      setErrorMsg(err.message);
      setInfo(`Could not send: ${err.message}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1208] text-[#f0ebe3]" data-navbar-theme="dark">
      <div className="max-w-[1400px] mx-auto px-6 pt-28 lg:pt-32 pb-12 grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-10">
        {/* ── Editor column ───────────────────────────────────────── */}
        <div className="space-y-7">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#9a8e82] mb-2">
              Monday letter
            </div>
            <h1 className="font-cormorant italic text-3xl text-[#f0ebe3] mb-1">
              {draft.send_date}
            </h1>
            <div className="text-sm text-[#9a8e82]">
              Status:{" "}
              <span
                style={{
                  color:
                    status === "sent"
                      ? "#7fc8a9"
                      : status === "failed"
                        ? "#ff7575"
                        : ACCENT,
                }}
              >
                {status}
              </span>
              {sentAt ? (
                <>
                  {" · sent "}
                  {new Date(sentAt).toLocaleString()}
                </>
              ) : null}
            </div>
            {errorMsg ? (
              <div className="mt-3 text-sm text-[#ff7575]">{errorMsg}</div>
            ) : null}
            {info ? (
              <div className="mt-3 text-sm" style={{ color: ACCENT }}>
                {info}
              </div>
            ) : null}
          </div>

          <Field label="Subject">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSent || isSending}
              className="w-full p-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#f0ebe3] placeholder-[#7a6a5a] focus:outline-none focus:border-[#ff914d]/40"
            />
          </Field>

          <Field label="Intro note (above the events)">
            <textarea
              value={introNote}
              onChange={(e) => setIntroNote(e.target.value)}
              disabled={isSent || isSending}
              rows={3}
              className="w-full p-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#f0ebe3] placeholder-[#7a6a5a] focus:outline-none focus:border-[#ff914d]/40 resize-y"
            />
          </Field>

          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#9a8e82] mb-1">
              Events ({events.length})
            </div>
            <div className="text-xs text-[#9a8e82] mb-3">
              One event is always <span style={{ color: ACCENT }}>featured</span> —
              it appears larger and centred at the top of the letter, in its own
              subtle frame. It defaults to the weekend event; tap “Make it the
              feature” on any other to move it. The preview on the right updates
              as you choose.
            </div>
            {!isSent && !isSending ? (
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={regenerating}
                className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border border-white/[0.15] text-[#f0ebe3] hover:bg-white/[0.05] transition-colors disabled:opacity-50"
                title="Re-pull this week's events (e.g. after adding one). Keeps your wording and featured pick."
              >
                {regenerating ? "Refreshing…" : "↻ Pull in latest events"}
              </button>
            ) : null}
            <div className="space-y-5">
              {events.length === 0 ? (
                <div className="text-sm text-[#9a8e82]">
                  No events featured. The letter will say the week is quiet.
                </div>
              ) : null}
              {events.map((ev, i) => {
                const featured = String(ev.id) === String(highlightId);
                return (
                  <div
                    key={ev.id || i}
                    className="rounded-xl p-4 space-y-3"
                    style={{
                      background: featured
                        ? "rgba(255,145,77,0.10)"
                        : "rgba(255,255,255,0.03)",
                      border: featured
                        ? `1px solid ${ACCENT}`
                        : "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm font-medium text-[#f0ebe3] flex items-center gap-2">
                        {featured ? <span style={{ color: ACCENT }}>★</span> : null}
                        {ev.name || "Untitled event"}
                      </div>
                      <button
                        type="button"
                        onClick={() => selectHighlight(ev.id)}
                        disabled={isSent || isSending || featured}
                        className="shrink-0 text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded-full transition-colors disabled:opacity-100"
                        style={
                          featured
                            ? { background: ACCENT, color: "#1a1208", fontWeight: 700 }
                            : {
                                background: "transparent",
                                color: "#9a8e82",
                                border: "1px solid rgba(255,255,255,0.15)",
                                cursor: "pointer",
                              }
                        }
                      >
                        {featured ? "★ Featured" : "Make it the feature"}
                      </button>
                    </div>
                    <div className="text-xs text-[#9a8e82]">
                      {ev.date
                        ? new Date(ev.date).toLocaleString("en-GB", {
                            timeZone: "Atlantic/Reykjavik",
                          })
                        : ""}
                    </div>
                    <Field label="Sensory line (override description)" small>
                      <textarea
                        value={ev.sensory_line || ""}
                        onChange={(e) =>
                          updateEvent(i, { sensory_line: e.target.value })
                        }
                        disabled={isSent || isSending}
                        rows={2}
                        placeholder={ev.shortdescription || ""}
                        className="w-full p-2.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[#f0ebe3] placeholder-[#7a6a5a] text-sm focus:outline-none focus:border-[#ff914d]/40 resize-y"
                      />
                    </Field>
                    <Field label="Image URL" small>
                      <input
                        type="text"
                        value={ev.image || ""}
                        onChange={(e) =>
                          updateEvent(i, { image: e.target.value })
                        }
                        disabled={isSent || isSending}
                        className="w-full p-2.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[#f0ebe3] placeholder-[#7a6a5a] text-sm focus:outline-none focus:border-[#ff914d]/40"
                      />
                    </Field>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || sending || isSent || isSending}
              className="flex-1 px-5 py-3 rounded-full text-sm font-semibold border border-white/[0.15] text-[#f0ebe3] hover:bg-white/[0.05] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button
              onClick={handleSend}
              disabled={saving || sending || isSent || isSending}
              className="flex-1 px-5 py-3 rounded-full text-sm font-semibold text-[#1a1208] transition-all disabled:opacity-50"
              style={{ background: ACCENT }}
            >
              {sending
                ? "Sending…"
                : isSent
                  ? "Already sent"
                  : "Send to subscribers"}
            </button>
          </div>
        </div>

        {/* ── Preview column ──────────────────────────────────────── */}
        <div className="lg:sticky lg:top-28 self-start">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#9a8e82] mb-3">
            Live preview
          </div>
          <iframe
            title="Newsletter preview"
            srcDoc={html}
            className="w-full bg-[#1a1208] border border-white/[0.08] rounded-xl"
            style={{ height: "calc(100vh - 200px)", minHeight: "560px" }}
          />
        </div>
      </div>
    </div>
  );
}

function Field({ label, small, children }) {
  return (
    <div>
      <label
        className={`block ${small ? "text-[10px]" : "text-[11px]"} uppercase tracking-[0.25em] text-[#9a8e82] mb-2`}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
