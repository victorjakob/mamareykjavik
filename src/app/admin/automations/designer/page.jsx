"use client";

// /admin/automations/designer — index of admin-composed workflows.
// ─────────────────────────────────────────────────────────────────
// A workflow = a trigger + a graph of steps (waits / conditions / actions).
// This page lists them. Each row links to the canvas editor at
// /admin/automations/designer/[id].
//
// A "+ New workflow" button creates a blank one and routes to its editor.

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import AdminGuard from "../../AdminGuard";
import { AdminShell, AdminHero } from "@/app/admin/components/AdminShell";
import {
  Workflow, Plus, Trash2, Power, PowerOff, Clock, Zap, Hand, Loader2,
} from "lucide-react";

const ORANGE = "#ff914d";
const TEXT_DARK = "#2c1810";
const TEXT_MUTED = "#9a7a62";
const HAIRLINE = "#e8ddd3";
const SOFT_BG = "#faf6f2";

const TRIGGER_ICONS = { schedule: Clock, event: Zap, manual: Hand };

function formatRelative(iso) {
  if (!iso) return "";
  const d = Date.now() - new Date(iso).getTime();
  if (d < 60 * 1000) return "just now";
  if (d < 60 * 60 * 1000) return `${Math.floor(d / (60 * 1000))} min ago`;
  if (d < 24 * 60 * 60 * 1000) return `${Math.floor(d / (60 * 60 * 1000))} h ago`;
  return `${Math.floor(d / (24 * 60 * 60 * 1000))} d ago`;
}

function Inner() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/workflows", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `${res.status}`);
      setWorkflows(data.workflows || []);
    } catch (err) {
      console.error("[workflows.list]", err);
      toast.error(String(err?.message || err));
      setWorkflows([]);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createNew = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/admin/workflows", { method: "POST", body: "{}" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `${res.status}`);
      router.push(`/admin/automations/designer/${data.workflow.id}`);
    } catch (err) {
      toast.error(String(err?.message || err));
    } finally {
      setCreating(false);
    }
  };

  const toggleEnabled = async (wf) => {
    try {
      const res = await fetch(`/api/admin/workflows/${wf.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !wf.enabled }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);
      setWorkflows((ws) =>
        ws.map((w) => (w.id === wf.id ? { ...w, enabled: !w.enabled } : w)),
      );
    } catch (err) {
      toast.error(String(err?.message || err));
    }
  };

  const remove = async (wf) => {
    if (!window.confirm(`Delete "${wf.name}"? This can't be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/workflows/${wf.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `${res.status}`);
      }
      setWorkflows((ws) => ws.filter((w) => w.id !== wf.id));
      toast.success("Workflow deleted");
    } catch (err) {
      toast.error(String(err?.message || err));
    }
  };

  return (
    <AdminShell
      maxWidth="max-w-5xl"
      hero={
        <AdminHero
          eyebrow="Admin · Automations"
          title="Workflow Designer"
          subtitle="Compose custom flows — when X happens, wait, then do Y."
          backHref="/admin/automations"
          backLabel="Back to automations"
          size="compact"
          action={
            <button
              type="button"
              onClick={createNew}
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold transition-all"
              style={{
                background: ORANGE,
                color: "#fff",
                boxShadow: "0 2px 12px rgba(255,145,77,0.32)",
              }}
            >
              {creating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" strokeWidth={2} />
              )}
              New workflow
            </button>
          }
        />
      }
    >
      <div className="-mt-4 space-y-3">
        {workflows == null ? (
          <div className="flex items-center justify-center py-16" style={{ color: TEXT_MUTED }}>
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : workflows.length === 0 ? (
          <div
            className="rounded-2xl flex flex-col items-center justify-center text-center p-12"
            style={{ background: "#ffffff", border: `1.5px solid #f0e6d8` }}
          >
            <Workflow className="w-10 h-10 mb-4" style={{ color: TEXT_MUTED }} />
            <p className="font-cormorant italic text-2xl mb-2" style={{ color: TEXT_DARK }}>
              No workflows yet
            </p>
            <p className="text-sm mb-6 max-w-md" style={{ color: TEXT_MUTED }}>
              Workflows let you compose flows like "when a tribe card is created, wait 7 days, then send a check-in email" — visually, on a canvas.
            </p>
            <button
              type="button"
              onClick={createNew}
              disabled={creating}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all"
              style={{ background: ORANGE, color: "#fff", boxShadow: "0 2px 10px rgba(255,145,77,0.28)" }}
            >
              {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" strokeWidth={2} />}
              Create your first workflow
            </button>
          </div>
        ) : (
          workflows.map((w, i) => {
            const TriggerIcon = TRIGGER_ICONS[w.trigger_type] || Zap;
            const stepCount = w.graph?.nodes?.filter((n) => n.type !== "trigger")?.length || 0;
            return (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "#ffffff",
                  border: `1.5px solid #f0e6d8`,
                  boxShadow: "0 2px 14px rgba(60,30,10,0.06)",
                }}
              >
                <div
                  className="h-[1.5px]"
                  style={{
                    background: w.enabled
                      ? `linear-gradient(to right, ${ORANGE}, rgba(255,145,77,0) 70%)`
                      : `linear-gradient(to right, ${HAIRLINE}, transparent 70%)`,
                  }}
                />
                <div className="p-4 flex items-center gap-4">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: w.enabled ? "rgba(255,145,77,0.14)" : SOFT_BG }}
                  >
                    <TriggerIcon
                      className="h-4 w-4"
                      strokeWidth={1.7}
                      style={{ color: w.enabled ? ORANGE : TEXT_MUTED }}
                    />
                  </div>

                  <Link
                    href={`/admin/automations/designer/${w.id}`}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-[14px] font-semibold leading-tight" style={{ color: TEXT_DARK }}>
                      {w.name}
                    </p>
                    <p className="text-[12px] mt-0.5" style={{ color: TEXT_MUTED }}>
                      {w.trigger_type} · {stepCount} step{stepCount === 1 ? "" : "s"} · edited {formatRelative(w.updated_at)}
                    </p>
                  </Link>

                  <button
                    type="button"
                    onClick={() => toggleEnabled(w)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-semibold transition-all"
                    style={
                      w.enabled
                        ? { background: "rgba(31,158,110,0.12)", color: "#1f5c4b" }
                        : { background: SOFT_BG, color: TEXT_MUTED, border: `1px solid ${HAIRLINE}` }
                    }
                  >
                    {w.enabled ? (
                      <Power className="w-3 h-3" strokeWidth={2.2} />
                    ) : (
                      <PowerOff className="w-3 h-3" strokeWidth={2.2} />
                    )}
                    {w.enabled ? "Enabled" : "Disabled"}
                  </button>

                  <button
                    type="button"
                    onClick={() => remove(w)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: "#b8a08e" }}
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </AdminShell>
  );
}

export default function WorkflowsListPage() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
