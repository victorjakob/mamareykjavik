"use client";

// Light-touch newsletter editor:
//   - one input for the intro note (top line above the events)
//   - per-event: editable sensory line + image URL
// Save updates the draft + re-renders HTML. Send fires the broadcast.
//
// Preview shows in an iframe with srcDoc=html so what Mama sees here is
// exactly what subscribers will see.

import { useState } from "react";
import { useRouter } from "next/navigation";

const ACCENT = "#ff914d";

export default function NewsletterEditor({ draft }) {
  const router = useRouter();
  const [introNote, setIntroNote] = useState(draft.intro_note || "");
  const [subject, setSubject] = useState(draft.subject || "");
  const [events, setEvents] = useState(
    Array.isArray(draft.events_json) ? draft.events_json : [],
  );
  const [html, setHtml] = useState(draft.html || "");
  const [status, setStatus] = useState(draft.status);
  const [sentAt, setSentAt] = useState(draft.sent_at);
  const [errorMsg, setErrorMsg] = useState(draft.error_message);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [info, setInfo] = useState(null);

  const isSent = status === "sent";
  const isSending = status === "sending";

  function updateEvent(i, patch) {
    setEvents((prev) =>
      prev.map((ev, idx) => (idx === i ? { ...ev, ...patch } : ev)),
    );
  }

  async function handleSave() {
    setSaving(true);
    setInfo(null);
    try {
      const res = await fetch(`/api/newsletter/save/${draft.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intro_note: introNote,
          subject,
          events,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Save failed");
      }
      setHtml(data.html);
      setInfo("Saved.");
    } catch (err) {
      setInfo(`Could not save: ${err.message}`);
    } finally {
      setSaving(false);
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
      const saveRes = await fetch(`/api/newsletter/save/${draft.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intro_note: introNote, subject, events }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok || !saveData.ok) {
        throw new Error(saveData.error || "Save failed");
      }
      setHtml(saveData.html);

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
    <div className="min-h-screen bg-[#1a1208] text-[#f0ebe3]">
      <div className="max-w-[1400px] mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-10">
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
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#9a8e82] mb-3">
              Events ({events.length})
            </div>
            <div className="space-y-5">
              {events.length === 0 ? (
                <div className="text-sm text-[#9a8e82]">
                  No events featured. The letter will say the week is quiet.
                </div>
              ) : null}
              {events.map((ev, i) => (
                <div
                  key={ev.id || i}
                  className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 space-y-3"
                >
                  <div className="text-sm font-medium text-[#f0ebe3]">
                    {ev.name || "Untitled event"}
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
              ))}
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
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#9a8e82] mb-3">
            Live preview
          </div>
          <iframe
            title="Newsletter preview"
            srcDoc={html}
            className="w-full bg-[#1a1208] border border-white/[0.08] rounded-xl"
            style={{ height: "calc(100vh - 120px)", minHeight: "600px" }}
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
