"use client";

// Light-touch newsletter editor:
//   - one input for the intro note (top line above the events)
//   - exactly one FEATURED event (shows larger, at the top of the letter);
//     defaults to the weekend event, changeable with one click
//   - MANUAL ORDER: drag the cards (or use ▲▼) to order the letter by
//     importance rather than by date. The order of the events array IS the
//     order in the letter, so reordering here is all it takes.
//   - per-event: editable sensory line + image URL
// Save updates the draft + re-renders HTML. Choosing the feature and
// reordering save silently so the live preview updates immediately. Send
// fires the broadcast.
//
// Preview shows in an iframe with srcDoc=html so what Mama sees here is
// exactly what subscribers will see.

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_HEADER_KICKER,
  DEFAULT_HEADER_TITLE,
} from "@/lib/newsletter-copy";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const ACCENT = "#ff914d";

// Iceland runs on UTC year-round, so getUTCDay is the local weekday.
function isWeekendISO(iso) {
  if (!iso) return false;
  const day = new Date(iso).getUTCDay();
  return day === 0 || day === 5 || day === 6; // Sun, Fri, Sat
}

// Stable dnd id for an event row (event ids are integers; fall back to index).
function rowId(ev, i) {
  return String(ev?.id ?? `row-${i}`);
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
  // Masthead lines under "Mama / REYKJAVÍK". null in the DB means "use the
  // renderer default", so show that default in the box rather than an empty
  // field the user has to guess at.
  const [headerKicker, setHeaderKicker] = useState(
    draft.header_kicker ?? DEFAULT_HEADER_KICKER,
  );
  const [headerTitle, setHeaderTitle] = useState(
    draft.header_title ?? DEFAULT_HEADER_TITLE,
  );
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
        header_kicker: headerKicker,
        header_title: headerTitle,
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
    [
      introNote,
      subject,
      headerKicker,
      headerTitle,
      events,
      highlightId,
      draft.id,
    ],
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

  // ── Ordering ────────────────────────────────────────────────────
  // The letter renders events in array order (the featured one is lifted to
  // the top as the hero), so "order by importance" is just reordering here.
  // Every reorder saves silently → the preview re-renders straight away.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const commitOrder = useCallback(
    (next) => {
      setEvents(next);
      saveDraft({ events: next }, { silent: true });
    },
    [saveDraft],
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = events.map((ev, i) => rowId(ev, i));
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    commitOrder(arrayMove(events, from, to));
  }

  function moveEvent(i, delta) {
    const to = i + delta;
    if (to < 0 || to >= events.length) return;
    commitOrder(arrayMove(events, i, to));
  }

  function sortByDate() {
    const next = [...events].sort(
      (a, b) => new Date(a.date || 0) - new Date(b.date || 0),
    );
    commitOrder(next);
  }

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

          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#9a8e82] mb-2">
              Masthead
            </div>
            <div className="text-xs text-[#9a8e82] mb-3">
              The letter already says{" "}
              <span className="text-[#c0b4a8]">Mama · REYKJAVÍK</span> at the
              very top, so these two lines are for the week and the room, not
              the brand. Leave a line empty to drop it from the letter.
            </div>
            <div className="grid grid-cols-[1fr_1.2fr] gap-3">
              <Field label="Kicker (small caps)" small>
                <input
                  type="text"
                  value={headerKicker}
                  onChange={(e) => setHeaderKicker(e.target.value)}
                  onBlur={() => saveDraft({}, { silent: true })}
                  disabled={isSent || isSending}
                  placeholder={DEFAULT_HEADER_KICKER}
                  className="w-full p-2.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[#f0ebe3] placeholder-[#7a6a5a] text-sm focus:outline-none focus:border-[#ff914d]/40"
                />
              </Field>
              <Field label="Title line (large italic)" small>
                <input
                  type="text"
                  value={headerTitle}
                  onChange={(e) => setHeaderTitle(e.target.value)}
                  onBlur={() => saveDraft({}, { silent: true })}
                  disabled={isSent || isSending}
                  placeholder={DEFAULT_HEADER_TITLE}
                  className="w-full p-2.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[#f0ebe3] placeholder-[#7a6a5a] text-sm focus:outline-none focus:border-[#ff914d]/40"
                />
              </Field>
            </div>
          </div>

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
              feature” on any other to move it.{" "}
              <span className="text-[#c0b4a8]">
                Everything below the feature runs in the order you set here —
                drag a card by its handle, or use ▲▼. Order by importance, not
                date.
              </span>{" "}
              The preview on the right updates as you go.
            </div>
            {!isSent && !isSending ? (
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border border-white/[0.15] text-[#f0ebe3] hover:bg-white/[0.05] transition-colors disabled:opacity-50"
                  title="Re-pull this week's events (e.g. after adding one). Keeps your wording, featured pick and running order."
                >
                  {regenerating ? "Refreshing…" : "↻ Pull in latest events"}
                </button>
                {events.length > 1 ? (
                  <button
                    type="button"
                    onClick={sortByDate}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border border-white/[0.15] text-[#9a8e82] hover:bg-white/[0.05] hover:text-[#f0ebe3] transition-colors"
                    title="Undo manual ordering and put the events back in date order."
                  >
                    ⇅ Back to date order
                  </button>
                ) : null}
              </div>
            ) : null}
            {events.length === 0 ? (
              <div className="text-sm text-[#9a8e82]">
                No events featured. The letter will say the week is quiet.
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={events.map((ev, i) => rowId(ev, i))}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-5">
                    {events.map((ev, i) => (
                      <SortableEventCard
                        key={rowId(ev, i)}
                        id={rowId(ev, i)}
                        ev={ev}
                        index={i}
                        total={events.length}
                        featured={String(ev.id) === String(highlightId)}
                        locked={isSent || isSending}
                        onSelectHighlight={() => selectHighlight(ev.id)}
                        onMove={(delta) => moveEvent(i, delta)}
                        onPatch={(patch) => updateEvent(i, patch)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
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

// ── One event card: drag handle + ▲▼, feature toggle, per-event copy ──
function SortableEventCard({
  id,
  ev,
  index,
  total,
  featured,
  locked,
  onSelectHighlight,
  onMove,
  onPatch,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: locked });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: featured ? "rgba(255,145,77,0.10)" : "rgba(255,255,255,0.03)",
    border: featured ? `1px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.07)",
    opacity: isDragging ? 0.85 : 1,
    boxShadow: isDragging ? "0 10px 30px rgba(0,0,0,0.45)" : "none",
    zIndex: isDragging ? 20 : "auto",
    position: "relative",
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        {/* Drag handle + position */}
        <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
          <button
            type="button"
            {...attributes}
            {...listeners}
            disabled={locked}
            aria-label={`Drag ${ev.name || "event"} to reorder`}
            className="text-[#9a8e82] hover:text-[#f0ebe3] disabled:opacity-30 leading-none"
            style={{ cursor: locked ? "default" : "grab", touchAction: "none" }}
            title="Drag to reorder"
          >
            ⠿
          </button>
          <span
            className="text-[10px] tabular-nums"
            style={{ color: featured ? ACCENT : "#7a6a5a" }}
            title={
              featured
                ? "Featured events always render first, whatever the order"
                : `Position ${index + 1} of ${total}`
            }
          >
            {featured ? "★" : index + 1}
          </span>
          {!locked && total > 1 ? (
            <div className="flex flex-col leading-none">
              <button
                type="button"
                onClick={() => onMove(-1)}
                disabled={index === 0}
                aria-label="Move up"
                title="Move up"
                className="text-[11px] text-[#9a8e82] hover:text-[#f0ebe3] disabled:opacity-25"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => onMove(1)}
                disabled={index === total - 1}
                aria-label="Move down"
                title="Move down"
                className="text-[11px] text-[#9a8e82] hover:text-[#f0ebe3] disabled:opacity-25"
              >
                ▼
              </button>
            </div>
          ) : null}
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="text-sm font-medium text-[#f0ebe3] flex items-center gap-2">
              {featured ? <span style={{ color: ACCENT }}>★</span> : null}
              {ev.name || "Untitled event"}
            </div>
            <button
              type="button"
              onClick={onSelectHighlight}
              disabled={locked || featured}
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
            {featured ? (
              <span style={{ color: ACCENT }}> · always shown first</span>
            ) : null}
          </div>
          <Field label="Sensory line (override description)" small>
            <textarea
              value={ev.sensory_line || ""}
              onChange={(e) => onPatch({ sensory_line: e.target.value })}
              disabled={locked}
              rows={2}
              placeholder={ev.shortdescription || ""}
              className="w-full p-2.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[#f0ebe3] placeholder-[#7a6a5a] text-sm focus:outline-none focus:border-[#ff914d]/40 resize-y"
            />
          </Field>
          <Field label="Image URL" small>
            <input
              type="text"
              value={ev.image || ""}
              onChange={(e) => onPatch({ image: e.target.value })}
              disabled={locked}
              className="w-full p-2.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[#f0ebe3] placeholder-[#7a6a5a] text-sm focus:outline-none focus:border-[#ff914d]/40"
            />
          </Field>
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
