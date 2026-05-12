"use client";

// /admin/email/newsletter — compose & send the monthly newsletter.
// ─────────────────────────────────────────────────────────────────
// Two-column layout:
//   Left: a form with one field per slot in MonthlyNewsletter.jsx
//   Right: a live preview iframe that re-renders as you type (debounced)
//
// Drafts persist to localStorage between sessions — close the tab, come
// back tomorrow, your in-progress letter is still there.
//
// Three send buttons:
//   - Send test to me        → renders + sends to the logged-in admin (live)
//   - Send to Community/Tribe/All → currently shows "broadcast not configured"
//     toast. When Resend Broadcasts is wired up, only the API needs to change.

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import AdminGuard from "../../AdminGuard";
import { AdminShell, AdminHero } from "@/app/admin/components/AdminShell";
import {
  Plus, X, Send, Loader2, Smartphone, Monitor, Trash2,
  Sparkles, FileText, Calendar, BookOpen, Heart,
} from "lucide-react";

const ORANGE = "#ff914d";
const ORANGE_DARK = "#a75a1a";
const TEXT_DARK = "#2c1810";
const TEXT_MUTED = "#9a7a62";
const HAIRLINE = "#e8ddd3";
const SOFT_BG = "#faf6f2";

const TEMPLATE_ID = "monthly-newsletter";
const DRAFT_KEY = "mama:newsletter:draft:v1";
const PREVIEW_DEBOUNCE_MS = 500;

// Default content the editor starts from — same shape as MonthlyNewsletter.previewProps.
function makeDefaultDraft() {
  const now = new Date();
  const monthLabel = now.toLocaleDateString("en-GB", {
    month: "long", year: "numeric",
  });
  return {
    monthLabel,
    heroLead: "",
    greeting: "",
    events: [makeEmptyEvent()],
    storyEnabled: false,
    story: { title: "", body: "", href: "", hrefLabel: "Read the full piece →" },
    tribeOnlyEnabled: false,
    tribeOnly: { title: "", body: "", href: "", hrefLabel: "Open" },
    closing: "",
    signedOff: "The Mama team",
  };
}

function makeEmptyEvent() {
  return { dateLabel: "", title: "", body: "", href: "", hrefLabel: "Hold a seat →" };
}

// ── Form input primitives (admin-styled) ─────────────────────────
function FieldLabel({ children, hint }) {
  return (
    <div className="mb-1.5">
      <label
        className="block text-[10px] uppercase tracking-[0.28em] font-semibold"
        style={{ color: TEXT_MUTED }}
      >
        {children}
      </label>
      {hint ? (
        <p className="text-[11px] mt-0.5" style={{ color: "#b8a08e" }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, hint, label, mono = false }) {
  return (
    <div>
      {label ? <FieldLabel hint={hint}>{label}</FieldLabel> : null}
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg px-3.5 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-orange-300 transition-shadow"
        style={{
          background: "#ffffff",
          border: `1px solid ${HAIRLINE}`,
          color: TEXT_DARK,
          fontFamily: mono ? '"SF Mono", Menlo, monospace' : "inherit",
        }}
      />
    </div>
  );
}

function TextArea({ value, onChange, placeholder, hint, label, rows = 3 }) {
  return (
    <div>
      {label ? <FieldLabel hint={hint}>{label}</FieldLabel> : null}
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-lg px-3.5 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-orange-300 transition-shadow resize-y"
        style={{
          background: "#ffffff",
          border: `1px solid ${HAIRLINE}`,
          color: TEXT_DARK,
          lineHeight: 1.55,
        }}
      />
    </div>
  );
}

function SectionCard({ icon: Icon, title, subtitle, action, children }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "#ffffff",
        border: `1.5px solid #f0e6d8`,
        boxShadow: "0 2px 14px rgba(60,30,10,0.06)",
      }}
    >
      <div
        className="h-[1.5px]"
        style={{ background: `linear-gradient(to right, rgba(255,145,77,0.4), transparent 60%)` }}
      />
      <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: HAIRLINE }}>
        {Icon ? (
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,145,77,0.14)" }}
          >
            <Icon className="h-4 w-4" strokeWidth={1.6} style={{ color: ORANGE }} />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold leading-tight" style={{ color: TEXT_DARK }}>
            {title}
          </p>
          {subtitle ? (
            <p className="text-[11.5px] mt-0.5" style={{ color: TEXT_MUTED }}>{subtitle}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Toggle({ enabled, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className="inline-flex items-center gap-2 text-[12px] font-semibold transition-all"
      style={{ color: enabled ? ORANGE_DARK : TEXT_MUTED }}
    >
      <span
        className="inline-block rounded-full transition-all"
        style={{
          width: "28px",
          height: "16px",
          background: enabled ? ORANGE : "#d4c6b6",
          position: "relative",
        }}
      >
        <span
          className="absolute top-[2px] rounded-full bg-white transition-all"
          style={{
            width: "12px",
            height: "12px",
            left: enabled ? "14px" : "2px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
          }}
        />
      </span>
      {label}
    </button>
  );
}

// ── Main editor ──────────────────────────────────────────────────
function NewsletterEditorInner() {
  // ── Draft state ───────────────────────────────────────────────
  const [draft, setDraft] = useState(makeDefaultDraft);
  const [hydrated, setHydrated] = useState(false);

  // Load saved draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setDraft({ ...makeDefaultDraft(), ...saved });
      }
    } catch {
      /* ignore parse errors — start from defaults */
    }
    setHydrated(true);
  }, []);

  // Save draft to localStorage on every change (post-hydrate)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* quota errors are fine to ignore */
    }
  }, [draft, hydrated]);

  // ── Field updaters ────────────────────────────────────────────
  const setField = useCallback((key, value) => {
    setDraft((d) => ({ ...d, [key]: value }));
  }, []);

  const setNested = useCallback((parentKey, childKey, value) => {
    setDraft((d) => ({ ...d, [parentKey]: { ...d[parentKey], [childKey]: value } }));
  }, []);

  const setEventField = useCallback((i, key, value) => {
    setDraft((d) => {
      const events = d.events.map((e, idx) => (idx === i ? { ...e, [key]: value } : e));
      return { ...d, events };
    });
  }, []);

  const addEvent = useCallback(() => {
    setDraft((d) => ({ ...d, events: [...d.events, makeEmptyEvent()] }));
  }, []);

  const removeEvent = useCallback((i) => {
    setDraft((d) => ({
      ...d,
      events: d.events.length > 1 ? d.events.filter((_, idx) => idx !== i) : d.events,
    }));
  }, []);

  const resetDraft = useCallback(() => {
    if (!window.confirm("Discard the current draft and start fresh?")) return;
    setDraft(makeDefaultDraft());
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    toast.success("Draft cleared");
  }, []);

  // ── Compose props for the template ────────────────────────────
  const previewProps = useMemo(
    () => ({
      monthLabel: draft.monthLabel,
      heroLead: draft.heroLead,
      greeting: draft.greeting,
      events: draft.events.filter((e) => e.title || e.body || e.dateLabel),
      story: draft.storyEnabled && (draft.story.title || draft.story.body) ? draft.story : null,
      tribeOnly:
        draft.tribeOnlyEnabled && (draft.tribeOnly.title || draft.tribeOnly.body)
          ? draft.tribeOnly
          : null,
      closing: draft.closing,
      signedOff: draft.signedOff,
    }),
    [draft],
  );

  // ── Live preview rendering (debounced) ────────────────────────
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!hydrated) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setPreviewing(true);
      try {
        const res = await fetch("/api/admin/email/preview-draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: TEMPLATE_ID, props: previewProps }),
        });
        if (!res.ok) throw new Error(`${res.status}`);
        const html = await res.text();
        setPreviewHtml(html);
      } catch (err) {
        console.error("[newsletter] preview render failed:", err);
      } finally {
        setPreviewing(false);
      }
    }, PREVIEW_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [previewProps, hydrated]);

  // ── Device toggle ─────────────────────────────────────────────
  const [device, setDevice] = useState("desktop");
  const iframeWidth = device === "mobile" ? "390px" : "100%";
  const iframeHeight = device === "mobile" ? "844px" : "780px";

  // ── Sends ─────────────────────────────────────────────────────
  const [sending, setSending] = useState(null); // "test" | "community" | "tribe" | "all" | null

  const doSend = useCallback(
    async (target) => {
      setSending(target);
      const t = toast.loading(
        target === "test" ? "Sending test…" : `Sending to ${target}…`,
      );
      try {
        const res = await fetch("/api/admin/email/send-draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: TEMPLATE_ID,
            props: previewProps,
            target,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 501) {
            // Audience broadcast not yet wired — show the friendly detail
            toast(data.detail || data.error, {
              id: t,
              icon: "✋",
              duration: 5500,
            });
            return;
          }
          throw new Error(data?.error || "Send failed");
        }
        toast.success(
          target === "test" ? `Sent to ${data.to}` : `Broadcast sent · ${target}`,
          { id: t },
        );
      } catch (err) {
        toast.error(String(err?.message || err), { id: t });
      } finally {
        setSending(null);
      }
    },
    [previewProps],
  );

  // ── Render ────────────────────────────────────────────────────
  return (
    <AdminShell
      maxWidth="max-w-7xl"
      hero={
        <AdminHero
          eyebrow="Admin · Email"
          title="Monthly Newsletter"
          subtitle={`Compose the ${draft.monthLabel || "next"} letter`}
          backHref="/admin/email"
          backLabel="Back to email"
          size="compact"
        />
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 -mt-4">
        {/* ── LEFT: FORM ─────────────────────────────────── */}
        <div className="space-y-5">
          <SectionCard
            icon={FileText}
            title="Header"
            subtitle="The month label and one-line lead under the headline"
          >
            <TextInput
              label="Month label"
              hint="Shown as eyebrow + headline, e.g. 'May 2026'"
              value={draft.monthLabel}
              onChange={(v) => setField("monthLabel", v)}
              placeholder="May 2026"
            />
            <TextArea
              label="Hero lead"
              hint="One short italic sentence — the feeling of the month"
              value={draft.heroLead}
              onChange={(v) => setField("heroLead", v)}
              placeholder="Long evenings, slow mornings, the sound of the kitchen warming up."
              rows={2}
            />
          </SectionCard>

          <SectionCard
            icon={BookOpen}
            title="Opening note"
            subtitle="A short greeting from the team"
          >
            <TextArea
              label="Greeting"
              value={draft.greeting}
              onChange={(v) => setField("greeting", v)}
              placeholder="May at Mama feels softer this year — there's been more space between things, more breath. Here's what's stirring."
              rows={3}
            />
          </SectionCard>

          <SectionCard
            icon={Calendar}
            title="What's on"
            subtitle={`${draft.events.length} event block${draft.events.length === 1 ? "" : "s"}`}
            action={
              <button
                type="button"
                onClick={addEvent}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-semibold transition-all"
                style={{
                  background: ORANGE,
                  color: "#fff",
                  boxShadow: "0 2px 8px rgba(255,145,77,0.25)",
                }}
              >
                <Plus className="w-3 h-3" strokeWidth={2.2} />
                Add event
              </button>
            }
          >
            {draft.events.map((ev, i) => (
              <div
                key={i}
                className="rounded-xl p-4 space-y-3 relative"
                style={{ background: SOFT_BG, border: `1px solid ${HAIRLINE}` }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] uppercase tracking-[0.22em] font-semibold"
                    style={{ color: TEXT_MUTED }}
                  >
                    Event {i + 1}
                  </span>
                  {draft.events.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeEvent(i)}
                      className="p-1 rounded transition-colors"
                      style={{ color: "#b8a08e" }}
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                  ) : null}
                </div>
                <TextInput
                  label="Date label"
                  hint="As you want it to read, e.g. 'Sat 17 May · 19:30'"
                  value={ev.dateLabel}
                  onChange={(v) => setEventField(i, "dateLabel", v)}
                  placeholder="Sat 17 May · 19:30"
                />
                <TextInput
                  label="Title"
                  value={ev.title}
                  onChange={(v) => setEventField(i, "title", v)}
                  placeholder="New Moon Cacao Ceremony"
                />
                <TextArea
                  label="Body"
                  rows={2}
                  value={ev.body}
                  onChange={(v) => setEventField(i, "body", v)}
                  placeholder="An intimate evening with cacao, breath, and the slow descent into the dark of the lunar cycle. Limited to 22 seats."
                />
                <div className="grid grid-cols-2 gap-3">
                  <TextInput
                    label="Link URL"
                    value={ev.href}
                    onChange={(v) => setEventField(i, "href", v)}
                    placeholder="https://mama.is/events/..."
                    mono
                  />
                  <TextInput
                    label="Link label"
                    value={ev.hrefLabel}
                    onChange={(v) => setEventField(i, "hrefLabel", v)}
                    placeholder="Hold a seat →"
                  />
                </div>
              </div>
            ))}
          </SectionCard>

          <SectionCard
            icon={BookOpen}
            title="From the space"
            subtitle="A longer reflection — kitchen, ceremony, or person"
            action={
              <Toggle
                enabled={draft.storyEnabled}
                onChange={(v) => setField("storyEnabled", v)}
                label={draft.storyEnabled ? "Included" : "Off"}
              />
            }
          >
            {draft.storyEnabled ? (
              <>
                <TextInput
                  label="Title"
                  value={draft.story.title}
                  onChange={(v) => setNested("story", "title", v)}
                  placeholder="Why we changed the bread."
                />
                <TextArea
                  label="Body"
                  rows={4}
                  value={draft.story.body}
                  onChange={(v) => setNested("story", "body", v)}
                  placeholder="After eighteen months of the same sourdough, we've moved to a slower fermented spelt loaf…"
                />
                <div className="grid grid-cols-2 gap-3">
                  <TextInput
                    label="Link URL"
                    value={draft.story.href}
                    onChange={(v) => setNested("story", "href", v)}
                    placeholder="https://mama.is/journal/..."
                    mono
                  />
                  <TextInput
                    label="Link label"
                    value={draft.story.hrefLabel}
                    onChange={(v) => setNested("story", "hrefLabel", v)}
                    placeholder="Read the full piece →"
                  />
                </div>
              </>
            ) : (
              <p className="text-[12.5px]" style={{ color: TEXT_MUTED }}>
                Toggle on to add a deeper story block to this letter.
              </p>
            )}
          </SectionCard>

          <SectionCard
            icon={Heart}
            title="For the Tribe"
            subtitle="Tribe-only block — shown only when sending to Tribe / All"
            action={
              <Toggle
                enabled={draft.tribeOnlyEnabled}
                onChange={(v) => setField("tribeOnlyEnabled", v)}
                label={draft.tribeOnlyEnabled ? "Included" : "Off"}
              />
            }
          >
            {draft.tribeOnlyEnabled ? (
              <>
                <TextInput
                  label="Title"
                  value={draft.tribeOnly.title}
                  onChange={(v) => setNested("tribeOnly", "title", v)}
                  placeholder="Your May virtual ceremony."
                />
                <TextArea
                  label="Body"
                  rows={3}
                  value={draft.tribeOnly.body}
                  onChange={(v) => setNested("tribeOnly", "body", v)}
                  placeholder="Wednesday 28 May at 20:00 — a one-hour live cacao + breath session…"
                />
                <div className="grid grid-cols-2 gap-3">
                  <TextInput
                    label="Link URL"
                    value={draft.tribeOnly.href}
                    onChange={(v) => setNested("tribeOnly", "href", v)}
                    placeholder="https://mama.is/membership"
                    mono
                  />
                  <TextInput
                    label="Button label"
                    value={draft.tribeOnly.hrefLabel}
                    onChange={(v) => setNested("tribeOnly", "hrefLabel", v)}
                    placeholder="Add to my calendar"
                  />
                </div>
              </>
            ) : (
              <p className="text-[12.5px]" style={{ color: TEXT_MUTED }}>
                Toggle on to include a Tribe-only block (perks, early access, virtual ceremonies).
              </p>
            )}
          </SectionCard>

          <SectionCard icon={Sparkles} title="Closing" subtitle="Sign-off line and name">
            <TextArea
              label="Closing line"
              rows={2}
              value={draft.closing}
              onChange={(v) => setField("closing", v)}
              placeholder="Until next month — come find us in the space, or just on the page."
            />
            <TextInput
              label="Signed off"
              value={draft.signedOff}
              onChange={(v) => setField("signedOff", v)}
              placeholder="The Mama team"
            />
          </SectionCard>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={resetDraft}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11.5px] font-semibold transition-all"
              style={{
                background: SOFT_BG,
                color: TEXT_MUTED,
                border: `1px solid ${HAIRLINE}`,
              }}
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
              Discard draft
            </button>
          </div>
        </div>

        {/* ── RIGHT: PREVIEW + ACTIONS ─────────────────────── */}
        <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          {/* Send actions */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "#ffffff",
              border: `1.5px solid #f0e6d8`,
              boxShadow: "0 2px 14px rgba(60,30,10,0.06)",
            }}
          >
            <div
              className="h-[1.5px]"
              style={{ background: `linear-gradient(to right, rgba(255,145,77,0.4), transparent 60%)` }}
            />
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[13px] font-semibold" style={{ color: TEXT_DARK }}>
                  Send
                </p>
                {/* Device toggle */}
                <div
                  className="flex items-center rounded-full p-1"
                  style={{ background: SOFT_BG, border: `1px solid ${HAIRLINE}` }}
                >
                  {[
                    { value: "desktop", icon: Monitor, label: "Desktop" },
                    { value: "mobile",  icon: Smartphone, label: "Mobile" },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const active = device === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setDevice(opt.value)}
                        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-all text-[11px] font-semibold"
                        style={
                          active
                            ? { background: "#fff", color: TEXT_DARK, boxShadow: "0 1px 4px rgba(60,30,10,0.10)" }
                            : { background: "transparent", color: TEXT_MUTED }
                        }
                      >
                        <Icon className="w-3 h-3" strokeWidth={1.8} />
                        <span className="hidden sm:inline">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => doSend("test")}
                disabled={!!sending}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-semibold transition-all"
                style={
                  sending === "test"
                    ? { background: "#ffd9b8", color: ORANGE_DARK, cursor: "wait" }
                    : sending
                      ? { background: "#f0e6d8", color: "#b8a08e", cursor: "not-allowed" }
                      : {
                          background: ORANGE,
                          color: "#fff",
                          boxShadow: "0 2px 10px rgba(255,145,77,0.28)",
                        }
                }
              >
                {sending === "test" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" strokeWidth={1.8} />}
                Send test to me
              </button>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { target: "community", label: "Community" },
                  { target: "tribe",     label: "Tribe" },
                  { target: "all",       label: "All" },
                ].map((opt) => (
                  <button
                    key={opt.target}
                    type="button"
                    onClick={() => doSend(opt.target)}
                    disabled={!!sending}
                    className="px-3 py-2 rounded-full text-[11.5px] font-semibold transition-all"
                    style={{
                      background: SOFT_BG,
                      color: TEXT_DARK,
                      border: `1px solid ${HAIRLINE}`,
                      opacity: sending ? 0.6 : 1,
                      cursor: sending ? "not-allowed" : "pointer",
                    }}
                    title="Audience send — requires Resend Broadcasts setup"
                  >
                    To {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] leading-relaxed pt-1" style={{ color: TEXT_MUTED }}>
                Audience sends need Resend Broadcasts configured — clicking shows a setup note.
                Test send works now (delivers to your own email).
              </p>
            </div>
          </div>

          {/* Preview iframe */}
          <motion.div
            key={device}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: SOFT_BG,
              border: `1.5px solid ${HAIRLINE}`,
              boxShadow: "0 2px 14px rgba(60,30,10,0.07)",
            }}
          >
            <div
              className="px-5 py-3 flex items-center justify-between border-b"
              style={{ borderColor: HAIRLINE }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" style={{ color: ORANGE }} />
                <span
                  className="text-[11px] uppercase tracking-[0.22em] font-semibold"
                  style={{ color: TEXT_MUTED }}
                >
                  Live preview · {device === "mobile" ? "iPhone" : "Desktop"}
                </span>
              </div>
              {previewing ? (
                <Loader2 className="w-3 h-3 animate-spin" style={{ color: TEXT_MUTED }} />
              ) : (
                <span className="text-[10px]" style={{ color: "#b8a08e" }}>
                  Updated
                </span>
              )}
            </div>
            <div className="flex justify-center py-6 px-3" style={{ background: SOFT_BG }}>
              {previewHtml ? (
                <iframe
                  title="Newsletter preview"
                  srcDoc={previewHtml}
                  style={{
                    width: iframeWidth,
                    maxWidth: "100%",
                    height: iframeHeight,
                    background: "#fff",
                    border: "1px solid #e8ddd3",
                    borderRadius: "10px",
                    boxShadow: "0 4px 24px rgba(60,30,10,0.10)",
                  }}
                />
              ) : (
                <div
                  className="flex items-center justify-center"
                  style={{ width: "100%", height: "300px", color: TEXT_MUTED, fontSize: "13px" }}
                >
                  Preparing preview…
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AdminShell>
  );
}

export default function NewsletterEditorPage() {
  return (
    <AdminGuard>
      <NewsletterEditorInner />
    </AdminGuard>
  );
}
