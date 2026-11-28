"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Flag, Loader2, Mail, MessageSquare, Search, Trash2, X } from "lucide-react";
import {
  AdminShell,
  AdminHero,
  AdminStatCard,
  AdminPillButton,
} from "@/app/admin/components/AdminShell";

const DAY = 24 * 60 * 60 * 1000;

function timeAgo(value) {
  const diff = Date.now() - new Date(value).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} d ago`;
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function firstQuestion(c) {
  return (c.messages || []).find((m) => m.role === "user")?.content || "(no question)";
}

const mdComponents = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="break-words text-[#c45f1f] underline">
      {children}
    </a>
  ),
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 list-disc pl-4 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal pl-4 last:mb-0">{children}</ol>,
};

function Badge({ children, tone = "neutral" }) {
  const styles = {
    neutral: { background: "#faf6f2", color: "#9a7a62", border: "1px solid #e8ddd3" },
    orange: { background: "rgba(255,145,77,0.12)", color: "#c45f1f", border: "1px solid rgba(255,145,77,0.3)" },
    red: { background: "rgba(220,60,60,0.08)", color: "#b23a3a", border: "1px solid rgba(220,60,60,0.25)" },
  };
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold" style={styles[tone]}>
      {children}
    </span>
  );
}

export default function AssistantPageClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/assistant");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        if (!cancelled) setItems(data.conversations || []);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const now = Date.now();
    const week = items.filter((c) => now - new Date(c.created_at).getTime() < 7 * DAY);
    return {
      week: week.length,
      questions: week.reduce((n, c) => n + (c.message_count || 0), 0),
      handoffs: items.filter((c) => c.handed_off).length,
      flagged: items.filter((c) => c.flagged).length,
    };
  }, [items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((c) => {
      if (filter === "handoff" && !c.handed_off) return false;
      if (filter === "flagged" && !c.flagged) return false;
      if (filter === "is" && c.lang !== "is") return false;
      if (!q) return true;
      return (c.messages || []).some((m) => m.content?.toLowerCase().includes(q));
    });
  }, [items, filter, query]);

  const selected = items.find((c) => c.id === selectedId) || null;

  function open(c) {
    setSelectedId(c.id);
    setNote(c.admin_note || "");
  }

  async function patch(id, update) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/assistant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...update }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.map((c) => (c.id === id ? { ...c, ...update } : c)));
    } catch {
      alert("Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this conversation? This can't be undone.")) return;
    const res = await fetch("/api/admin/assistant", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setItems((prev) => prev.filter((c) => c.id !== id));
      setSelectedId(null);
    }
  }

  return (
    <AdminShell maxWidth="max-w-6xl">
      <AdminHero
        eyebrow="Admin"
        title="Chat assistant"
        subtitle="What guests ask the AI on mama.is"
        size="compact"
      />

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <AdminStatCard label="Chats this week" value={stats.week} icon={MessageSquare} delay={0} />
        <AdminStatCard label="Questions this week" value={stats.questions} icon={Search} delay={0.05} />
        <AdminStatCard label="Sent to team" value={stats.handoffs} icon={Mail} delay={0.1} />
        <AdminStatCard label="Flagged" value={stats.flagged} icon={Flag} highlight={stats.flagged > 0} delay={0.15} />
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {[
          ["all", "All"],
          ["handoff", "Sent to team"],
          ["flagged", "Flagged"],
          ["is", "Icelandic"],
        ].map(([key, label]) => (
          <AdminPillButton key={key} active={filter === key} onClick={() => setFilter(key)}>
            {label}
          </AdminPillButton>
        ))}
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b8a998]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations"
            className="w-full rounded-full border border-[#e8ddd3] bg-white py-2 pl-9 pr-4 text-sm text-[#2c1810] outline-none focus:border-[#ff914d]"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-[#ff914d]" />
        </div>
      ) : error ? (
        <p className="py-10 text-center text-sm text-[#b23a3a]">{error}</p>
      ) : visible.length === 0 ? (
        <p className="py-16 text-center text-sm text-[#9a7a62]">
          {items.length ? "No conversations match." : "No chats yet. They'll show up here as guests use the assistant."}
        </p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <ul className="space-y-2">
            {visible.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => open(c)}
                  className="w-full rounded-2xl bg-white px-4 py-3 text-left transition-colors hover:bg-[#fffaf5]"
                  style={{
                    border: c.id === selectedId ? "1.5px solid #ff914d" : "1.5px solid #f0e6d8",
                  }}
                >
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-[#9a7a62]">{timeAgo(c.updated_at)}</span>
                    <span className="flex gap-1">
                      {c.lang === "is" && <Badge>IS</Badge>}
                      {c.handed_off && (
                        <Badge tone="orange">
                          <Mail className="h-3 w-3" /> Sent
                        </Badge>
                      )}
                      {c.flagged && (
                        <Badge tone="red">
                          <Flag className="h-3 w-3" />
                        </Badge>
                      )}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm font-medium text-[#2c1810]">{firstQuestion(c)}</p>
                  <p className="mt-1 text-[11px] text-[#b8a998]">
                    {c.message_count} {c.message_count === 1 ? "question" : "questions"}
                    {c.page ? ` · ${c.page}` : ""}
                  </p>
                </button>
              </li>
            ))}
          </ul>

          <div className="lg:sticky lg:top-24 lg:self-start">
            {selected ? (
              <div className="rounded-2xl bg-white" style={{ border: "1.5px solid #f0e6d8" }}>
                <div className="flex items-center justify-between gap-3 border-b border-[#f0e6d8] px-5 py-3">
                  <div className="text-xs text-[#9a7a62]">
                    {new Date(selected.created_at).toLocaleString("en-GB")}
                    {selected.handed_off_to ? ` · sent to ${selected.handed_off_to}` : ""}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => patch(selected.id, { flagged: !selected.flagged })}
                      title={selected.flagged ? "Unflag" : "Flag as wrong answer"}
                      className={`rounded-full p-2 transition-colors ${
                        selected.flagged ? "bg-[#fde8e8] text-[#b23a3a]" : "text-[#9a7a62] hover:bg-[#faf6f2]"
                      }`}
                    >
                      <Flag className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(selected.id)}
                      title="Delete"
                      className="rounded-full p-2 text-[#9a7a62] transition-colors hover:bg-[#faf6f2] hover:text-[#b23a3a]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      title="Close"
                      className="rounded-full p-2 text-[#9a7a62] transition-colors hover:bg-[#faf6f2] lg:hidden"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-[60vh] space-y-3 overflow-y-auto px-5 py-4">
                  {(selected.messages || []).map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          m.role === "user"
                            ? "rounded-br-md bg-[#110f0d] text-[#f0ebe3]"
                            : "rounded-bl-md bg-[#faf6f2] text-[#2c1810]"
                        }`}
                      >
                        {m.role === "assistant" ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                            {m.content}
                          </ReactMarkdown>
                        ) : (
                          <span className="whitespace-pre-wrap">{m.content}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#f0e6d8] px-5 py-4">
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a7a62]">
                    Note (what to fix in the bot)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    placeholder="It should have said…"
                    className="w-full resize-none rounded-xl border border-[#e8ddd3] bg-[#fffaf5] px-3 py-2 text-sm text-[#2c1810] outline-none focus:border-[#ff914d]"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={saving || note === (selected.admin_note || "")}
                      onClick={() => patch(selected.id, { admin_note: note })}
                      className="rounded-full bg-[#ff914d] px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                    >
                      {saving ? "Saving…" : "Save note"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="hidden rounded-2xl px-6 py-16 text-center text-sm text-[#9a7a62] lg:block"
                style={{ border: "1.5px dashed #e8ddd3" }}
              >
                Pick a conversation to read it.
              </div>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
