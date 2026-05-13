"use client";

// /admin/automations — overview of every automatic thing the system does.
// ───────────────────────────────────────────────────────────────────────
// Mirrors the /admin/email hub: sidebar grouped by trigger type,
// detail panel showing what each one does + a link to its source file.
//
// Three groups:
//   - Scheduled (cron)  — daily Vercel-scheduled tasks
//   - Webhooks          — third-party (Teya/SaltPay) callbacks into our API
//   - Admin actions     — admin clicks → side-effects (emails, charges, etc.)
//
// This is an OVERVIEW, not a builder. It tells you what's already running
// so you can audit/understand the system. A visual workflow designer for
// composing new automations is a separate future build.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import AdminGuard from "../AdminGuard";
import { AdminShell, AdminHero } from "@/app/admin/components/AdminShell";
import {
  AUTOMATION_MANIFEST,
  AUTOMATION_GROUPS,
  countAutomations,
  describeCron,
  getAutomationById,
} from "@/automations/manifest";
import {
  Workflow,
  Clock,
  Webhook,
  Hand,
  FileCode2,
  ExternalLink,
  Zap,
} from "lucide-react";

const ORANGE = "#ff914d";
const TEXT_DARK = "#2c1810";
const TEXT_MUTED = "#9a7a62";
const HAIRLINE = "#e8ddd3";
const SOFT_BG = "#faf6f2";

const GROUP_ICONS = {
  cron: Clock,
  webhook: Webhook,
  "admin-action": Hand,
};

const GROUP_TONES = {
  cron: { bg: "rgba(31,92,75,0.12)", fg: "#1f5c4b" },     // moss green
  webhook: { bg: "rgba(255,145,77,0.14)", fg: "#a75a1a" }, // orange
  "admin-action": { bg: "rgba(154,122,98,0.16)", fg: "#6a5040" }, // sepia
};

// ── Sidebar ──────────────────────────────────────────────────────
function Sidebar({ selectedId, onSelect }) {
  const grouped = useMemo(() => {
    return AUTOMATION_GROUPS.map((g) => ({
      ...g,
      items: AUTOMATION_MANIFEST
        .filter((a) => a.group === g.id)
        .sort((a, b) => a.name.localeCompare(b.name)),
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
        style={{ background: `linear-gradient(to right, rgba(255,145,77,0.4), transparent 60%)` }}
      />
      <div className="px-4 py-4 border-b border-[#e8ddd3] flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(255,145,77,0.14)" }}
        >
          <Workflow className="h-4 w-4 text-[#ff914d]" strokeWidth={1.6} />
        </div>
        <div>
          <p className="text-[#2c1810] text-sm font-semibold leading-tight">
            All automations
          </p>
          <p className="text-[#9a7a62] text-xs">
            {AUTOMATION_MANIFEST.length} total
          </p>
        </div>
      </div>

      <div className="max-h-[72vh] overflow-y-auto">
        {grouped.map((group) => {
          const Icon = GROUP_ICONS[group.id] || Zap;
          return (
            <div key={group.id}>
              <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Icon className="w-3 h-3" style={{ color: TEXT_MUTED }} strokeWidth={1.6} />
                  <span
                    className="text-[10px] uppercase tracking-[0.22em] font-semibold"
                    style={{ color: TEXT_MUTED }}
                  >
                    {group.label}
                  </span>
                </span>
                <span className="text-[10px] text-[#b8a08e]">
                  {group.items.length}
                </span>
              </div>

              <ul className="pb-1">
                {group.items.map((a) => {
                  const isSelected = selectedId === a.id;
                  return (
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(a.id)}
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
                      >
                        <span
                          className="mt-1.5 inline-block rounded-full shrink-0"
                          style={{
                            width: "6px",
                            height: "6px",
                            background: GROUP_TONES[a.group]?.fg || "#c0a890",
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
                            {a.name}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

// ── Group pill ───────────────────────────────────────────────────
function GroupPill({ group }) {
  const tone = GROUP_TONES[group] || GROUP_TONES["admin-action"];
  const Icon = GROUP_ICONS[group] || Zap;
  const label =
    AUTOMATION_GROUPS.find((g) => g.id === group)?.label || group;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-[0.05em]"
      style={{ background: tone.bg, color: tone.fg }}
    >
      <Icon className="w-3 h-3" strokeWidth={2} />
      {label}
    </span>
  );
}

// ── Detail panel ─────────────────────────────────────────────────
function DetailPanel({ id }) {
  const a = getAutomationById(id);

  if (!a) {
    return (
      <div
        className="rounded-2xl flex flex-col items-center justify-center text-center p-12"
        style={{
          background: "#ffffff",
          border: `1.5px solid #f0e6d8`,
          minHeight: "60vh",
        }}
      >
        <Workflow className="w-10 h-10 mb-4" style={{ color: TEXT_MUTED }} />
        <p
          className="font-cormorant italic text-2xl mb-2"
          style={{ color: TEXT_DARK }}
        >
          Pick an automation
        </p>
        <p className="text-sm" style={{ color: TEXT_MUTED }}>
          Select one from the list to see what it does, when it runs, and
          where its code lives.
        </p>
      </div>
    );
  }

  const sourceHref = a.sourceFile
    ? `https://github.com/mama-reykjavik/mama-page/blob/main/${a.sourceFile}`
    : null;

  return (
    <motion.div
      key={a.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-4"
    >
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
          style={{ background: `linear-gradient(to right, rgba(255,145,77,0.4), transparent 60%)` }}
        />
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <GroupPill group={a.group} />
              </div>
              <h2
                className="font-cormorant italic font-light leading-tight"
                style={{ fontSize: "clamp(1.6rem, 3vw, 2.1rem)", color: TEXT_DARK }}
              >
                {a.name}
              </h2>
            </div>

            {sourceHref ? (
              <a
                href={sourceHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-semibold transition-all shrink-0"
                style={{
                  background: SOFT_BG,
                  color: TEXT_DARK,
                  border: `1px solid ${HAIRLINE}`,
                }}
              >
                <FileCode2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                Source
                <ExternalLink className="w-3 h-3" strokeWidth={1.8} />
              </a>
            ) : null}
          </div>

          {/* Trigger row */}
          <div className="mt-2">
            <span
              className="text-[10px] uppercase tracking-[0.18em] block mb-1"
              style={{ color: TEXT_MUTED }}
            >
              Trigger
            </span>
            {a.group === "cron" ? (
              <div className="flex items-center gap-2">
                <span style={{ color: TEXT_DARK, fontSize: "14px", fontWeight: 600 }}>
                  {describeCron(a.schedule)}
                </span>
                <span
                  style={{
                    color: TEXT_MUTED,
                    fontSize: "12px",
                    fontFamily: '"SF Mono", Menlo, monospace',
                  }}
                >
                  ({a.schedule})
                </span>
              </div>
            ) : (
              <span style={{ color: TEXT_DARK, fontSize: "14px", lineHeight: 1.55 }}>
                {a.triggerSummary || "—"}
              </span>
            )}
            {a.cronPath ? (
              <p
                className="mt-1"
                style={{
                  color: TEXT_MUTED,
                  fontSize: "12px",
                  fontFamily: '"SF Mono", Menlo, monospace',
                }}
              >
                {a.cronPath}
              </p>
            ) : null}
          </div>

          {/* What it does */}
          <div className="mt-5">
            <span
              className="text-[10px] uppercase tracking-[0.18em] block mb-1"
              style={{ color: TEXT_MUTED }}
            >
              What it does
            </span>
            <p style={{ color: TEXT_DARK, fontSize: "14px", lineHeight: 1.65 }}>
              {a.summary}
            </p>
          </div>

          {/* Side effects */}
          {a.sideEffects && a.sideEffects.length > 0 ? (
            <div className="mt-5">
              <span
                className="text-[10px] uppercase tracking-[0.18em] block mb-2"
                style={{ color: TEXT_MUTED }}
              >
                Side effects
              </span>
              <ul className="space-y-1.5">
                {a.sideEffects.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2"
                    style={{ color: TEXT_DARK, fontSize: "13.5px", lineHeight: 1.55 }}
                  >
                    <span
                      className="inline-block rounded-full mt-2 shrink-0"
                      style={{
                        width: "4px",
                        height: "4px",
                        background: GROUP_TONES[a.group]?.fg || ORANGE,
                      }}
                    />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Source file path */}
          <div className="mt-5 pt-4 border-t" style={{ borderColor: HAIRLINE }}>
            <span
              className="text-[10px] uppercase tracking-[0.18em] block mb-1"
              style={{ color: TEXT_MUTED }}
            >
              Source file
            </span>
            <code
              style={{
                color: TEXT_DARK,
                fontSize: "12px",
                fontFamily: '"SF Mono", Menlo, monospace',
                background: SOFT_BG,
                padding: "3px 8px",
                borderRadius: "5px",
                display: "inline-block",
              }}
            >
              {a.sourceFile}
            </code>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────
export default function AutomationsPage() {
  const counts = countAutomations();
  const [selectedId, setSelectedId] = useState(AUTOMATION_MANIFEST[0]?.id || null);

  const subtitle =
    `${counts.cron || 0} scheduled · ${counts.webhook || 0} webhooks · ` +
    `${counts["admin-action"] || 0} admin actions`;

  return (
    <AdminGuard>
      <AdminShell
        maxWidth="max-w-7xl"
        hero={
          <AdminHero
            eyebrow="Admin"
            title="Automations"
            subtitle={subtitle}
            backHref="/admin"
            backLabel="Back to admin"
            size="compact"
          />
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 -mt-4">
          <Sidebar selectedId={selectedId} onSelect={setSelectedId} />
          <DetailPanel id={selectedId} />
        </div>
      </AdminShell>
    </AdminGuard>
  );
}
