"use client";

// /admin/automations/designer/[id] — visual workflow editor.
// ──────────────────────────────────────────────────────────
// Layout:
//   ┌─────────────────────────────────────────────────────────┐
//   │ Hero with name (editable) + Save / Enable / Delete       │
//   ├──────────────────────────────────┬──────────────────────┤
//   │ Canvas (react-flow)              │ Right rail:           │
//   │   Trigger node always at top.    │   - Trigger config    │
//   │   Drag step types from the rail. │   - Selected node form│
//   │   Connect edges to define flow.  │   - "Add step" buttons│
//   └──────────────────────────────────┴──────────────────────┘
//
// State model:
//   The Trigger lives outside the canvas graph (in `trigger_type` +
//   `trigger_config` on the row). The canvas graph holds the steps:
//   wait | condition | action. The runner walks edges from the trigger
//   into the first step.
//
// MVP scope: save+load + canvas drag/drop. Per-node config edits via
// the right rail. Execution comes in a follow-up (the runner cron).

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  ReactFlow, Background, Controls, MiniMap, addEdge,
  useNodesState, useEdgesState, Handle, Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import AdminGuard from "../../../AdminGuard";
import { AdminShell, AdminHero } from "@/app/admin/components/AdminShell";
import {
  STEP_TYPES, TRIGGER_TYPES, WORKFLOW_ACTIONS, WORKFLOW_EVENTS,
  getStepType, getTriggerType, getAction,
} from "@/workflows/catalog";
import {
  Clock, Zap, Hand, GitBranch, Mail, Bell, FileText, Loader2,
  Save, Power, Trash2, Plus, ArrowLeft, Play,
} from "lucide-react";

const ORANGE = "#ff914d";
const TEXT_DARK = "#2c1810";
const TEXT_MUTED = "#9a7a62";
const HAIRLINE = "#e8ddd3";
const SOFT_BG = "#faf6f2";

const STEP_ICONS = {
  wait: Clock,
  condition: GitBranch,
  action: Zap,
};

const ACTION_ICONS = {
  send_email: Mail,
  send_to_self: Bell,
  log_only: FileText,
};

// ── Custom node renderers ────────────────────────────────────────

function TriggerNode({ data, selected }) {
  const t = getTriggerType(data.trigger_type) || { label: "Trigger" };
  const Icon = data.trigger_type === "schedule" ? Clock : data.trigger_type === "event" ? Zap : Hand;
  return (
    <div
      className="rounded-xl px-4 py-3 min-w-[200px]"
      style={{
        background: "linear-gradient(135deg, #ff914d 0%, #ff7a2e 100%)",
        color: "#fff",
        border: selected ? "2px solid #2c1810" : "2px solid transparent",
        boxShadow: "0 4px 16px rgba(255,145,77,0.32)",
      }}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" strokeWidth={2} />
        <span className="text-[10px] uppercase tracking-[0.28em] font-semibold">
          Trigger
        </span>
      </div>
      <p className="mt-1 text-[14px] font-semibold leading-tight">{t.label}</p>
      {data.summary ? (
        <p className="mt-0.5 text-[12px] opacity-90">{data.summary}</p>
      ) : null}
      <Handle type="source" position={Position.Bottom} style={{ background: "#2c1810" }} />
    </div>
  );
}

function StepNode({ data, selected }) {
  const Icon = STEP_ICONS[data.step_type] || Zap;
  const config = data.config || {};
  let summary = "Click to configure";
  if (data.step_type === "wait" && config.amount) {
    summary = `Wait ${config.amount} ${config.unit || "hours"}`;
  } else if (data.step_type === "condition" && config.path) {
    summary = `If ${config.path} ${config.op || "eq"} ${config.value ?? ""}`;
  } else if (data.step_type === "action" && config.action) {
    const a = getAction(config.action);
    summary = a ? a.label : config.action;
  }

  return (
    <div
      className="rounded-xl px-4 py-3 min-w-[200px]"
      style={{
        background: "#fff",
        color: TEXT_DARK,
        border: selected ? `2px solid ${ORANGE}` : `1.5px solid ${HAIRLINE}`,
        boxShadow: "0 2px 10px rgba(60,30,10,0.08)",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: ORANGE }} />
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" style={{ color: ORANGE }} strokeWidth={1.8} />
        <span className="text-[10px] uppercase tracking-[0.22em] font-semibold" style={{ color: TEXT_MUTED }}>
          {data.step_type}
        </span>
      </div>
      <p className="mt-1 text-[13px] font-semibold leading-tight">{summary}</p>
      <Handle type="source" position={Position.Bottom} style={{ background: ORANGE }} />
    </div>
  );
}

const nodeTypes = { trigger: TriggerNode, step: StepNode };

// ── Field input primitive (shared with right rail) ───────────────
function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.22em] font-semibold mb-1" style={{ color: TEXT_MUTED }}>
        {label}
      </label>
      {children}
      {hint ? <p className="text-[11px] mt-0.5" style={{ color: "#b8a08e" }}>{hint}</p> : null}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, mono = false }) {
  return (
    <input
      type="text"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-orange-300"
      style={{
        background: "#fff",
        border: `1px solid ${HAIRLINE}`,
        color: TEXT_DARK,
        fontFamily: mono ? '"SF Mono", Menlo, monospace' : "inherit",
      }}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-orange-300 resize-y"
      style={{ background: "#fff", border: `1px solid ${HAIRLINE}`, color: TEXT_DARK, lineHeight: 1.5 }}
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-orange-300"
      style={{ background: "#fff", border: `1px solid ${HAIRLINE}`, color: TEXT_DARK }}
    >
      <option value="">— pick one —</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// Render a field definition (used by both trigger config + step config forms)
function renderField(fieldDef, value, onChange) {
  if (fieldDef.type === "text") {
    return <TextInput value={value} onChange={onChange} placeholder={fieldDef.placeholder} />;
  }
  if (fieldDef.type === "textarea") {
    return <TextArea value={value} onChange={onChange} placeholder={fieldDef.placeholder} />;
  }
  if (fieldDef.type === "number") {
    return <TextInput value={value} onChange={onChange} placeholder={fieldDef.placeholder} />;
  }
  if (fieldDef.type === "select") {
    const opts = typeof fieldDef.options === "function" ? fieldDef.options() : (fieldDef.options || []);
    return <Select value={value} onChange={onChange} options={opts} />;
  }
  return null;
}

// ── Main editor ──────────────────────────────────────────────────

function Inner() {
  const router = useRouter();
  const { id } = useParams();
  const [wf, setWf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Canvas state — react-flow's hooks
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Right-rail selection: { kind: "trigger" } | { kind: "step", nodeId: string }
  const [selection, setSelection] = useState({ kind: "trigger" });

  // ── Load workflow ────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/workflows/${id}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || `${res.status}`);
        const w = data.workflow;
        setWf(w);

        // Bootstrap canvas from saved graph. Always make sure a Trigger
        // node exists at the top — if the saved graph doesn't have one,
        // insert one. The trigger node's data syncs with trigger_type +
        // trigger_config so the user sees changes immediately.
        const savedNodes = Array.isArray(w.graph?.nodes) ? w.graph.nodes : [];
        const savedEdges = Array.isArray(w.graph?.edges) ? w.graph.edges : [];
        const hasTrigger = savedNodes.some((n) => n.type === "trigger");
        const triggerNode = hasTrigger
          ? savedNodes.find((n) => n.type === "trigger")
          : {
              id: "trigger",
              type: "trigger",
              position: { x: 220, y: 40 },
              data: { trigger_type: w.trigger_type, summary: summariseTrigger(w) },
            };
        triggerNode.data = {
          ...triggerNode.data,
          trigger_type: w.trigger_type,
          summary: summariseTrigger(w),
        };
        const otherNodes = savedNodes.filter((n) => n.type !== "trigger");
        setNodes([triggerNode, ...otherNodes]);
        setEdges(savedEdges);
      } catch (err) {
        console.error("[workflow.load]", err);
        toast.error(String(err?.message || err));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Connect edges in the canvas ──────────────────────────────
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: ORANGE } }, eds)),
    [setEdges],
  );

  // Click a node → select it for the right rail
  const onNodeClick = useCallback((_evt, node) => {
    if (node.type === "trigger") setSelection({ kind: "trigger" });
    else setSelection({ kind: "step", nodeId: node.id });
  }, []);

  // ── Add a new step node from the right rail ──────────────────
  const addStep = (stepType) => {
    const newId = `step_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const yMax = Math.max(0, ...nodes.map((n) => n.position?.y || 0));
    const newNode = {
      id: newId,
      type: "step",
      position: { x: 220, y: yMax + 140 },
      data: { step_type: stepType, config: {} },
    };
    setNodes((ns) => [...ns, newNode]);
    setSelection({ kind: "step", nodeId: newId });
  };

  // Delete the currently-selected step
  const deleteSelectedStep = () => {
    if (selection.kind !== "step") return;
    setNodes((ns) => ns.filter((n) => n.id !== selection.nodeId));
    setEdges((es) => es.filter((e) => e.source !== selection.nodeId && e.target !== selection.nodeId));
    setSelection({ kind: "trigger" });
  };

  // ── Field updaters ───────────────────────────────────────────
  const updateTrigger = (changes) => {
    setWf((w) => {
      const next = {
        ...w,
        ...(changes.trigger_type != null ? { trigger_type: changes.trigger_type } : {}),
        trigger_config: { ...(w.trigger_config || {}), ...(changes.trigger_config || {}) },
      };
      // Reflect the change on the trigger node's summary live
      setNodes((ns) =>
        ns.map((n) =>
          n.type === "trigger"
            ? { ...n, data: { ...n.data, trigger_type: next.trigger_type, summary: summariseTrigger(next) } }
            : n,
        ),
      );
      return next;
    });
  };

  const updateStepConfig = (nodeId, changes) => {
    setNodes((ns) =>
      ns.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, config: { ...(n.data.config || {}), ...changes } } }
          : n,
      ),
    );
  };

  // ── Save ─────────────────────────────────────────────────────
  const save = async () => {
    if (!wf) return;
    setSaving(true);
    const t = toast.loading("Saving…");
    try {
      const res = await fetch(`/api/admin/workflows/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: wf.name,
          description: wf.description,
          trigger_type: wf.trigger_type,
          trigger_config: wf.trigger_config,
          graph: { nodes, edges },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `${res.status}`);
      setWf(data.workflow);
      toast.success("Saved", { id: t });
    } catch (err) {
      toast.error(String(err?.message || err), { id: t });
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async () => {
    if (!wf) return;
    try {
      const res = await fetch(`/api/admin/workflows/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !wf.enabled }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);
      setWf(data.workflow);
    } catch (err) {
      toast.error(String(err?.message || err));
    }
  };

  // Fire the workflow manually. Creates a new workflow_runs row (triggered_by=admin)
  // and advances it once on the server so the admin sees the first hop immediately.
  // Remaining waits/branches are picked up by /api/cron/run-workflows.
  const [running, setRunning] = useState(false);
  const runNow = async () => {
    if (!wf) return;
    setRunning(true);
    try {
      const res = await fetch(`/api/admin/workflows/${id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: {} }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `${res.status}`);
      const status = data?.result?.status;
      if (status === "waiting") {
        toast.success("Run started — paused at first wait step.");
      } else if (status === "done") {
        toast.success("Run completed.");
      } else if (status === "error") {
        toast.error(`Run errored: ${data?.result?.error || "see logs"}`);
      } else {
        toast.success(`Run started (${status || "queued"}).`);
      }
    } catch (err) {
      toast.error(String(err?.message || err));
    } finally {
      setRunning(false);
    }
  };

  const deleteWorkflow = async () => {
    if (!wf) return;
    if (!window.confirm(`Delete "${wf.name}"? This can't be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/workflows/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `${res.status}`);
      }
      router.push("/admin/automations/designer");
    } catch (err) {
      toast.error(String(err?.message || err));
    }
  };

  const selectedStep = useMemo(() => {
    if (selection.kind !== "step") return null;
    return nodes.find((n) => n.id === selection.nodeId) || null;
  }, [nodes, selection]);

  if (loading || !wf) {
    return (
      <AdminShell maxWidth="max-w-7xl">
        <div className="flex items-center justify-center py-24" style={{ color: TEXT_MUTED }}>
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      maxWidth="max-w-7xl"
      hero={
        <AdminHero
          eyebrow="Admin · Automations"
          title={wf.name || "Untitled workflow"}
          subtitle={wf.description || "Edit the trigger and steps below — drag to connect."}
          backHref="/admin/automations/designer"
          backLabel="All workflows"
          size="compact"
          action={
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={toggleEnabled}
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all"
                style={
                  wf.enabled
                    ? { background: "rgba(31,158,110,0.18)", color: "#1f5c4b" }
                    : { background: "rgba(0,0,0,0.35)", color: "#f0ebe3", border: "1px solid rgba(255,145,77,0.4)" }
                }
              >
                <Power className="w-3.5 h-3.5" strokeWidth={2} />
                {wf.enabled ? "Enabled" : "Disabled"}
              </button>
              <button
                type="button"
                onClick={runNow}
                disabled={running}
                title="Run this workflow now"
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all"
                style={{
                  background: "rgba(0,0,0,0.45)",
                  color: "#f0ebe3",
                  border: "1px solid rgba(255,145,77,0.4)",
                  opacity: running ? 0.7 : 1,
                }}
              >
                {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" strokeWidth={1.8} />}
                Run now
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold transition-all"
                style={{
                  background: ORANGE,
                  color: "#fff",
                  boxShadow: "0 2px 12px rgba(255,145,77,0.32)",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" strokeWidth={1.8} />}
                Save
              </button>
            </div>
          }
        />
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 -mt-4">
        {/* ── CANVAS ──────────────────────────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "#ffffff",
            border: `1.5px solid #f0e6d8`,
            boxShadow: "0 2px 14px rgba(60,30,10,0.06)",
            height: "70vh",
            minHeight: "560px",
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={20} color="#e8ddd3" />
            <Controls showInteractive={false} />
            <MiniMap pannable zoomable style={{ background: SOFT_BG }} maskColor="rgba(154,122,98,0.18)" />
          </ReactFlow>
        </div>

        {/* ── RIGHT RAIL ──────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Name + description */}
          <SectionCard title="Workflow">
            <Field label="Name">
              <TextInput value={wf.name} onChange={(v) => setWf((w) => ({ ...w, name: v }))} placeholder="My workflow" />
            </Field>
            <Field label="Description">
              <TextArea
                value={wf.description || ""}
                onChange={(v) => setWf((w) => ({ ...w, description: v }))}
                placeholder="What does this workflow do?"
                rows={2}
              />
            </Field>
          </SectionCard>

          {/* Trigger config OR Step config */}
          {selection.kind === "trigger" ? (
            <SectionCard title="Trigger">
              <Field label="Type" hint="When should this flow run?">
                <Select
                  value={wf.trigger_type}
                  onChange={(v) => updateTrigger({ trigger_type: v, trigger_config: {} })}
                  options={TRIGGER_TYPES.map((t) => ({ value: t.id, label: t.label }))}
                />
              </Field>
              {(getTriggerType(wf.trigger_type)?.fields || []).map((f) => (
                <Field key={f.key} label={f.label} hint={f.hint}>
                  {renderField(
                    f,
                    wf.trigger_config?.[f.key],
                    (v) => updateTrigger({ trigger_config: { [f.key]: v } }),
                  )}
                </Field>
              ))}
            </SectionCard>
          ) : selectedStep ? (
            <SectionCard
              title={`Step · ${getStepType(selectedStep.data.step_type)?.label || selectedStep.data.step_type}`}
              action={
                <button
                  type="button"
                  onClick={deleteSelectedStep}
                  className="p-1.5 rounded text-[#b8a08e] hover:text-[#9a1f1f] transition-colors"
                  title="Delete step"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                </button>
              }
            >
              {(getStepType(selectedStep.data.step_type)?.fields || []).map((f) => (
                <Field key={f.key} label={f.label} hint={f.hint}>
                  {renderField(
                    f,
                    selectedStep.data.config?.[f.key],
                    (v) => updateStepConfig(selectedStep.id, { [f.key]: v }),
                  )}
                </Field>
              ))}
              {selectedStep.data.step_type === "action" && selectedStep.data.config?.action ? (
                <ActionExtras
                  action={selectedStep.data.config.action}
                  config={selectedStep.data.config}
                  onChange={(changes) => updateStepConfig(selectedStep.id, changes)}
                />
              ) : null}
            </SectionCard>
          ) : null}

          {/* Add step buttons */}
          <SectionCard title="Add step">
            <p className="text-[12px] mb-3" style={{ color: TEXT_MUTED }}>
              Drop a new step onto the canvas. Connect it by dragging from the trigger or another step.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {STEP_TYPES.map((s) => {
                const Icon = STEP_ICONS[s.id] || Zap;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => addStep(s.id)}
                    className="flex flex-col items-center gap-1 rounded-xl p-3 transition-all text-[11.5px] font-semibold"
                    style={{ background: SOFT_BG, color: TEXT_DARK, border: `1px solid ${HAIRLINE}` }}
                    title={s.description}
                  >
                    <Icon className="w-4 h-4" style={{ color: ORANGE }} strokeWidth={1.7} />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </SectionCard>

          {/* Danger zone */}
          <button
            type="button"
            onClick={deleteWorkflow}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-[11.5px] font-semibold transition-all"
            style={{ background: SOFT_BG, color: TEXT_MUTED, border: `1px solid ${HAIRLINE}` }}
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
            Delete workflow
          </button>
        </div>
      </div>
    </AdminShell>
  );
}

// Helper to keep the trigger node's subtitle in sync with config.
function summariseTrigger(w) {
  if (w.trigger_type === "schedule") {
    return w.trigger_config?.schedule ? `cron · ${w.trigger_config.schedule}` : "Schedule not set";
  }
  if (w.trigger_type === "event") {
    const e = WORKFLOW_EVENTS.find((x) => x.id === w.trigger_config?.event);
    return e ? `on ${e.label}` : "Event not chosen";
  }
  if (w.trigger_type === "manual") return "manual run";
  return "—";
}

// Renders the per-action fields below the "Action" select.
function ActionExtras({ action, config, onChange }) {
  const a = getAction(action);
  if (!a) return null;
  // Skip the first field (the `action` picker itself — already rendered).
  return (
    <>
      {a.fields.map((f) => (
        <Field key={f.key} label={f.label} hint={f.hint}>
          {renderField(f, config?.[f.key], (v) => onChange({ [f.key]: v }))}
        </Field>
      ))}
    </>
  );
}

function SectionCard({ title, action, children }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "#ffffff",
        border: `1.5px solid #f0e6d8`,
        boxShadow: "0 2px 14px rgba(60,30,10,0.06)",
      }}
    >
      <div className="h-[1.5px]" style={{ background: `linear-gradient(to right, rgba(255,145,77,0.4), transparent 60%)` }} />
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: HAIRLINE }}>
        <p className="text-[12px] font-semibold" style={{ color: TEXT_DARK }}>{title}</p>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

export default function WorkflowDesignerPage() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
