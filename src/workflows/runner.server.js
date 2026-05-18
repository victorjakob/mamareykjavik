// Workflow runner — advances a single workflow_run row through the graph.
// ────────────────────────────────────────────────────────────────────────
// Called by /api/cron/run-workflows for every run that is ready (state
// "pending" or "waiting" with next_check_at <= now).
//
// Walks the graph node-by-node:
//   trigger    → take the single outgoing edge, follow it
//   action     → run the action, then follow the outgoing edge
//   wait       → set next_check_at to now+amount*unit, mark waiting, return
//   condition  → eval condition, follow "then" or "else" edge accordingly
//
// Stops when:
//   • a wait step is hit (run goes to status "waiting")
//   • no outgoing edge from the current node (run goes to status "done")
//   • any handler throws (run goes to status "error" with the message)
//
// The runner is intentionally synchronous-ish: one tick can complete many
// nodes in sequence — only a wait breaks the loop.

import "server-only";
import { createServerSupabase } from "@/util/supabase/server";
import { runAction, evaluateCondition } from "./actions.server";

const MAX_STEPS_PER_TICK = 50; // belt-and-braces against an accidental cycle

// ── Edge helpers ─────────────────────────────────────────────────
function outgoingEdges(graph, nodeId) {
  return (graph?.edges || []).filter((e) => e.source === nodeId);
}

// Pick the next node id following the given source. For condition nodes
// we honour the edge's `sourceHandle` ("then" | "else"); otherwise we
// take the first outgoing edge.
function nextNodeId(graph, fromNodeId, handle = null) {
  const edges = outgoingEdges(graph, fromNodeId);
  if (handle) {
    const matched = edges.find((e) => e.sourceHandle === handle);
    if (matched) return matched.target;
  }
  return edges[0]?.target ?? null;
}

function findNode(graph, id) {
  return (graph?.nodes || []).find((n) => n.id === id) || null;
}

function addLog(history, entry) {
  history.push({ at: new Date().toISOString(), ...entry });
  return history;
}

function unitToMs(unit, amount) {
  const n = Number(amount) || 0;
  switch (unit) {
    case "hours": return n * 60 * 60 * 1000;
    case "days":  return n * 24 * 60 * 60 * 1000;
    case "weeks": return n * 7 * 24 * 60 * 60 * 1000;
    default:      return n * 60 * 1000; // fallback: treat as minutes
  }
}

// ── Public: advance one run ──────────────────────────────────────
//
// Loads the workflow + run, walks the graph from the current node, and
// persists the updated state. Returns { status, nodes_run, error? }.
export async function advanceRun(runId) {
  const supabase = createServerSupabase();

  const { data: run, error: runErr } = await supabase
    .from("workflow_runs")
    .select("*")
    .eq("id", runId)
    .single();
  if (runErr || !run) return { status: "missing", error: runErr?.message };

  const { data: wf, error: wfErr } = await supabase
    .from("workflows")
    .select("id, name, enabled, graph")
    .eq("id", run.workflow_id)
    .single();
  if (wfErr || !wf) return { status: "missing", error: wfErr?.message };

  // If a run was queued before the workflow got disabled, skip it.
  if (!wf.enabled && run.triggered_by !== "admin") {
    await supabase
      .from("workflow_runs")
      .update({
        status: "cancelled",
        finished_at: new Date().toISOString(),
        error: "Workflow disabled before this run could finish",
      })
      .eq("id", runId);
    return { status: "cancelled" };
  }

  const graph = wf.graph || { nodes: [], edges: [] };
  const context = run.context || {};
  const history = Array.isArray(run.result?.history) ? [...run.result.history] : [];

  let currentId = run.current_node_id;
  if (!currentId) {
    // Fresh run — start at the trigger node.
    currentId = (graph.nodes || []).find((n) => n.type === "trigger")?.id || null;
    if (!currentId) {
      return await finishRun(supabase, runId, "error", history, "No trigger node found in graph");
    }
    // Advance past the trigger node immediately.
    currentId = nextNodeId(graph, currentId);
    if (!currentId) {
      return await finishRun(supabase, runId, "done", history, null, "Trigger had no outgoing edge");
    }
  }

  let steps = 0;
  while (currentId && steps < MAX_STEPS_PER_TICK) {
    steps += 1;
    const node = findNode(graph, currentId);
    if (!node) {
      return await finishRun(supabase, runId, "error", history, `Node ${currentId} not found`);
    }

    // Designer stores step_type (snake_case) inside node.data; node.type
    // is "step" / "trigger" — the canvas-level kind, not the step kind.
    const stepType = node.data?.step_type || node.data?.stepType || node.type;
    addLog(history, { nodeId: node.id, step: stepType });

    if (stepType === "wait") {
      const cfg = node.data?.config || {};
      const ms = unitToMs(cfg.unit || "hours", cfg.amount || 0);
      const next = new Date(Date.now() + ms).toISOString();
      const after = nextNodeId(graph, node.id);
      await supabase
        .from("workflow_runs")
        .update({
          status: "waiting",
          current_node_id: after, // park ON the next node so we resume there
          next_check_at: next,
          result: { history, last: { waitedUntil: next } },
        })
        .eq("id", runId);
      return { status: "waiting", nodes_run: steps, next_check_at: next };
    }

    if (stepType === "condition") {
      const cond = node.data?.config || {};
      const pass = evaluateCondition(cond, context);
      addLog(history, { nodeId: node.id, conditionResult: pass });
      currentId = nextNodeId(graph, node.id, pass ? "then" : "else");
      continue;
    }

    if (stepType === "action") {
      const cfg = node.data?.config || {};
      const actionId = cfg.action;
      const result = await runAction(actionId, cfg, context);
      addLog(history, { nodeId: node.id, action: actionId, result });
      if (!result?.ok) {
        return await finishRun(
          supabase, runId, "error", history,
          `Action ${actionId} failed: ${result?.error || "unknown"}`,
        );
      }
      currentId = nextNodeId(graph, node.id);
      continue;
    }

    // Unknown step type — fail loud.
    return await finishRun(supabase, runId, "error", history, `Unknown step type: ${stepType}`);
  }

  if (steps >= MAX_STEPS_PER_TICK) {
    return await finishRun(supabase, runId, "error", history, "Step budget exceeded — possible cycle");
  }

  // No more nodes — done.
  return await finishRun(supabase, runId, "done", history, null);
}

async function finishRun(supabase, runId, status, history, error, note) {
  await supabase
    .from("workflow_runs")
    .update({
      status,
      finished_at: new Date().toISOString(),
      error: error || null,
      result: { history, ...(note ? { note } : {}) },
    })
    .eq("id", runId);
  return { status, error };
}

// ── Pick up all ready runs (used by the cron) ─────────────────────
//
// Ready means:
//   • status = "pending" (newly created by fireWorkflowEvent / manual trigger)
//   • OR status = "waiting" AND next_check_at <= now
export async function pickReadyRuns(limit = 50) {
  const supabase = createServerSupabase();
  const nowIso = new Date().toISOString();

  // Two queries — Postgres OR with mixed null comparisons gets fiddly.
  const [{ data: pending }, { data: waiting }] = await Promise.all([
    supabase
      .from("workflow_runs")
      .select("id")
      .eq("status", "pending")
      .order("started_at", { ascending: true })
      .limit(limit),
    supabase
      .from("workflow_runs")
      .select("id")
      .eq("status", "waiting")
      .lte("next_check_at", nowIso)
      .order("next_check_at", { ascending: true })
      .limit(limit),
  ]);

  return [...(pending || []), ...(waiting || [])].map((r) => r.id);
}
