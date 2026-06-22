"use client";

// /admin/email — Email Hub
// ─────────────────────────
// Single place to see every email the system sends, preview it, and send a
// test. Templated emails (in src/emails/templates/) render live in the iframe.
// Legacy emails show a metadata card with a link to the source file until
// they're migrated.
//
// Layout:
//   ┌── AdminHero ───────────────────────────────────────────────┐
//   │             3 templated · 35 legacy · 38 total              │
//   ├──────────┬──────────────────────────────────────────────────┤
//   │ Sidebar  │ Header (name · trigger · recipient · actions)    │
//   │ (groups, │                                                  │
//   │  items,  │  ┌── Preview iframe ────────────────────────┐    │
//   │  status) │  │                                          │    │
//   │          │  │                                          │    │
//   │          │  └──────────────────────────────────────────┘    │
//   └──────────┴──────────────────────────────────────────────────┘

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import AdminGuard from "../AdminGuard";
import Link from "next/link";
import { AdminShell, AdminHero } from "@/app/admin/components/AdminShell";
import {
  EMAIL_MANIFEST,
  EMAIL_GROUPS,
  countByStatus,
  getEmailById,
} from "@/emails/manifest";
import {
  Mail,
  Smartphone,
  Monitor,
  Send,
  ExternalLink,
  Loader2,
  Inbox,
  Sparkles,
  CheckCircle2,
  Clock,
  FileCode2,
  PenLine,
} from "lucide-react";

const ORANGE = "#ff914d";
const ORANGE_DARK = "#a75a1a";
const TEXT_DARK = "#2c1810";
const TEXT_MUTED = "#9a7a62";
const HAIRLINE = "#e8ddd3";
const SOFT_BG = "#faf6f2";

// ── Sidebar ──────────────────────────────────────────────────────
function Sidebar({ selectedId, onSelect }) {
  const grouped = useMemo(() => {
    // Sort weight: templated (0) < legacy-with-preview (1) < legacy-no-preview (2)
    const weight = (e) =>
      e.status === "templated" ? 0 : e.previewable ? 1 : 2;
    return EMAIL_GROUPS.map((g) => ({
      ...g,
      items: EMAIL_MANIFEST
        .filter((e) => e.group === g.id)
        .sort((a, b) => {
          const wa = weight(a);
          const wb = weight(b);
          if (wa !== wb) return wa - wb;
          return a.name.localeCompare(b.name);
        }),
    }));
  }, []);

  return (
    <nav
      className="rounded-2xl overflow-hidden h-fit sticky top-6"
      style={{
        background: "#ffffff",
        border: `1.5px solid #f0e6d8`,
        boxShadow: "0 2px 14px rgba(60,30,10,0.07)",
      }}
    >
      <div
        className="h-[1.5px]"
        style={{
          background: `linear-gradient(to right, rgba(255,145,77,0.4), transparent 60%)`,
        }}
      />
      <div className="px-4 py-4 border-b border-[#e8ddd3] flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(255,145,77,0.14)" }}
        >
          <Inbox className="h-4 w-4 text-[#ff914d]" strokeWidth={1.6} />
        </div>
        <div>
          <p className="text-[#2c1810] text-sm font-semibold leading-tight">
            All emails
          </p>
          <p className="text-[#9a7a62] text-xs">
            {EMAIL_MANIFEST.length} total
          </p>
        </div>
      </div>

      <div className="max-h-[72vh] overflow-y-auto">
        {grouped.map((group) => (
          <div key={group.id}>
            <div
              className="px-4 pt-4 pb-2 flex items-center justify-between"
              style={{ background: "transparent" }}
            >
              <span
                className="text-[10px] uppercase tracking-[0.22em] font-semibold"
                style={{ color: TEXT_MUTED }}
              >
                {group.label}
              </span>
              <span className="text-[10px] text-[#b8a08e]">
                {group.items.length}
              </span>
            </div>

            <ul className="pb-1">
              {group.items.map((email) => {
                const isSelected = selectedId === email.id;
                const isTemplated = email.status === "templated";
                const hasPreview = isTemplated || email.previewable;
                // Dot color: green = templated, orange = legacy w/ adapter, gray = no preview
                const dotColor = isTemplated
                  ? "#1f9e6e"
                  : email.previewable
                    ? "#ff914d"
                    : "#c0a890";
                return (
                  <li key={email.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(email.id)}
                      className="w-full text-left px-4 py-2.5 transition-colors flex items-start gap-2.5"
                      style={
                        isSelected
                          ? {
                              background: "rgba(255,145,77,0.10)",
                              borderLeft: `2px solid ${ORANGE}`,
                              paddingLeft: "calc(1rem - 2px)",
                            }
                          : {
                              background: "transparent",
                              borderLeft: "2px solid transparent",
                              paddingLeft: "calc(1rem - 2px)",
                            }
                      }
                      title={
                        isTemplated
                          ? "Modern React Email template"
                          : hasPreview
                            ? "Legacy email — live preview available"
                            : "Legacy email — preview not yet wired up"
                      }
                    >
                      <span
                        className="mt-1.5 inline-block rounded-full shrink-0"
                        style={{
                          width: "6px",
                          height: "6px",
                          background: dotColor,
                        }}
                      />
                      <span className="flex-1 min-w-0">
                        <span
                          className="block text-[13px] leading-snug"
                          style={{
                            color: isSelected ? TEXT_DARK : "#3a2a1c",
                            fontWeight: isSelected ? 600 : 500,
                          }}
                        >
                          {email.name}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

// ── Status pill ──────────────────────────────────────────────────
function StatusPill({ status }) {
  if (status === "templated") {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-[0.05em]"
        style={{ background: "rgba(31,158,110,0.12)", color: "#1f5c4b" }}
      >
        <CheckCircle2 className="w-3 h-3" strokeWidth={2.2} />
        Templated
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-[0.05em]"
      style={{ background: "rgba(255,145,77,0.14)", color: ORANGE_DARK }}
    >
      <Clock className="w-3 h-3" strokeWidth={2.2} />
      Legacy
    </span>
  );
}

// ── Detail panel ─────────────────────────────────────────────────
function DetailPanel({ emailId }) {
  const email = getEmailById(emailId);
  const [device, setDevice] = useState("desktop");
  const [sending, setSending] = useState(false);
  const previewKey = `${emailId}-${device}`;
  const previewSrc = `/api/admin/email/preview/${emailId}`;

  const handleSendTest = useCallback(async () => {
    if (!email) return;
    if (email.status !== "templated") {
      toast.error("Send-test only works for templated emails");
      return;
    }
    setSending(true);
    const t = toast.loading("Sending test…");
    try {
      const res = await fetch(`/api/admin/email/send-test/${email.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Send failed");
      toast.success(`Sent to ${data.to}`, { id: t });
    } catch (err) {
      toast.error(String(err?.message || err), { id: t });
    } finally {
      setSending(false);
    }
  }, [email]);

  if (!email) {
    return (
      <div
        className="rounded-2xl flex flex-col items-center justify-center text-center p-12"
        style={{
          background: "#ffffff",
          border: `1.5px solid #f0e6d8`,
          minHeight: "60vh",
        }}
      >
        <Mail className="w-10 h-10 mb-4" style={{ color: TEXT_MUTED }} />
        <p
          className="font-cormorant italic text-2xl mb-2"
          style={{ color: TEXT_DARK }}
        >
          Pick an email
        </p>
        <p className="text-sm" style={{ color: TEXT_MUTED }}>
          Select one from the list to preview, edit copy, or send yourself a
          test.
        </p>
      </div>
    );
  }

  const isTemplated = email.status === "templated";
  const sourceHref = email.sourceFile
    ? `https://github.com/mama-reykjavik/mama-page/blob/main/${email.sourceFile}`
    : null;

  // iframe wrap width — desktop ~640, mobile ~390
  const iframeWidth = device === "mobile" ? "390px" : "100%";
  const iframeHeight = device === "mobile" ? "844px" : "780px";

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "#ffffff",
          border: `1.5px solid #f0e6d8`,
          boxShadow: "0 2px 14px rgba(60,30,10,0.07)",
        }}
      >
        <div
          className="h-[1.5px]"
          style={{
            background: `linear-gradient(to right, rgba(255,145,77,0.4), transparent 60%)`,
          }}
        />
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-[10px] uppercase tracking-[0.32em] font-semibold"
                  style={{ color: TEXT_MUTED }}
                >
                  {EMAIL_GROUPS.find((g) => g.id === email.group)?.label}
                </span>
                <StatusPill status={email.status} />
              </div>
              <h2
                className="font-cormorant italic font-light leading-tight"
                style={{
                  fontSize: "clamp(1.6rem, 3vw, 2.1rem)",
                  color: TEXT_DARK,
                }}
              >
                {email.name}
              </h2>
              {email.subjectLine ? (
                <p
                  className="mt-1 text-sm"
                  style={{ color: TEXT_MUTED, fontStyle: "italic" }}
                >
                  Subject: {email.subjectLine}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Device toggle */}
              <div
                className="flex items-center rounded-full p-1"
                style={{
                  background: SOFT_BG,
                  border: `1px solid ${HAIRLINE}`,
                }}
              >
                {[
                  { value: "desktop", icon: Monitor, label: "Desktop" },
                  { value: "mobile", icon: Smartphone, label: "Mobile" },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const active = device === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setDevice(opt.value)}
                      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all text-[11px] font-semibold"
                      style={
                        active
                          ? {
                              background: "#fff",
                              color: TEXT_DARK,
                              boxShadow: "0 1px 4px rgba(60,30,10,0.10)",
                            }
                          : {
                              background: "transparent",
                              color: TEXT_MUTED,
                            }
                      }
                    >
                      <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
                      <span className="hidden sm:inline">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Send test button */}
              <button
                type="button"
                onClick={handleSendTest}
                disabled={!isTemplated || sending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold transition-all"
                style={
                  !isTemplated
                    ? {
                        background: "#f0e6d8",
                        color: "#b8a08e",
                        cursor: "not-allowed",
                      }
                    : sending
                      ? {
                          background: "#ffd9b8",
                          color: ORANGE_DARK,
                          cursor: "wait",
                        }
                      : {
                          background: ORANGE,
                          color: "#fff",
                          boxShadow: "0 2px 10px rgba(255,145,77,0.28)",
                        }
                }
                title={
                  isTemplated
                    ? "Send a test of this email to your own address"
                    : "Send-test is only available for templated emails"
                }
              >
                {sending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" strokeWidth={1.8} />
                )}
                Send test
              </button>

              {/* View source (legacy only) */}
              {!isTemplated && sourceHref ? (
                <a
                  href={sourceHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-semibold transition-all"
                  style={{
                    background: SOFT_BG,
                    color: TEXT_DARK,
                    border: `1px solid ${HAIRLINE}`,
                  }}
                >
                  <FileCode2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                  Source
                </a>
              ) : null}
            </div>
          </div>

          {/* Metadata grid */}
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mt-4 text-[13px]">
            <div>
              <span
                className="text-[10px] uppercase tracking-[0.18em] block mb-1"
                style={{ color: TEXT_MUTED }}
              >
                Trigger
              </span>
              <span style={{ color: TEXT_DARK, lineHeight: 1.5 }}>
                {email.trigger}
              </span>
            </div>
            <div>
              <span
                className="text-[10px] uppercase tracking-[0.18em] block mb-1"
                style={{ color: TEXT_MUTED }}
              >
                Recipient
              </span>
              <span style={{ color: TEXT_DARK, lineHeight: 1.5 }}>
                {email.recipient}
              </span>
            </div>
            {email.note ? (
              <div className="sm:col-span-2 mt-1">
                <span
                  className="text-[10px] uppercase tracking-[0.18em] block mb-1"
                  style={{ color: TEXT_MUTED }}
                >
                  Note
                </span>
                <span
                  style={{ color: TEXT_DARK, lineHeight: 1.55 }}
                  className="text-[13px]"
                >
                  {email.note}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Preview iframe */}
      <motion.div
        key={previewKey}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
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
              Preview · {device === "mobile" ? "iPhone" : "Desktop"}
            </span>
          </div>
          <a
            href={previewSrc}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold"
            style={{ color: TEXT_MUTED }}
          >
            Open raw
            <ExternalLink className="w-3 h-3" strokeWidth={1.8} />
          </a>
        </div>
        <div
          className="flex justify-center py-6 px-3"
          style={{ background: SOFT_BG }}
        >
          <iframe
            key={previewKey}
            src={previewSrc}
            title={`Preview of ${email.name}`}
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
        </div>
      </motion.div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────
export default function EmailHubPage() {
  const counts = countByStatus();
  // Default selection: first templated email (so the user immediately sees a real preview)
  const firstTemplated = EMAIL_MANIFEST.find((e) => e.status === "templated");
  const [selectedId, setSelectedId] = useState(
    firstTemplated?.id || EMAIL_MANIFEST[0]?.id || null,
  );

  const previewableTotal = counts.templated + counts.legacyPreviewable;
  const subtitle = `${previewableTotal} of ${counts.total} previewable · ${counts.templated} templated · ${counts.legacyPreviewable} legacy with live preview`;

  return (
    <AdminGuard>
      <AdminShell
        maxWidth="max-w-7xl"
        hero={
          <AdminHero
            eyebrow="Admin"
            title="Email"
            subtitle={subtitle}
            backHref="/admin"
            backLabel="Back to admin"
            size="compact"
            action={
              <>
                <Link
                  href="/admin/subscribers"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold transition-all"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.25)",
                  }}
                >
                  <Inbox className="w-3.5 h-3.5" strokeWidth={1.8} />
                  Subscribers
                </Link>
                <Link
                  href="/admin/email/newsletter"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold transition-all"
                  style={{
                    background: ORANGE,
                    color: "#fff",
                    boxShadow: "0 2px 12px rgba(255,145,77,0.32)",
                  }}
                >
                  <PenLine className="w-3.5 h-3.5" strokeWidth={1.8} />
                  Compose newsletter
                </Link>
              </>
            }
          />
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 -mt-4">
          <Sidebar selectedId={selectedId} onSelect={setSelectedId} />
          <DetailPanel emailId={selectedId} />
        </div>
      </AdminShell>
    </AdminGuard>
  );
}
