// fireWorkflowEvent — the function code calls to kick off event-triggered
// workflows.
// ──────────────────────────────────────────────────────────────────────
// Usage from any route / lib sender:
//
//   import { fireWorkflowEvent } from "@/workflows/fireEvent.server";
//   await fireWorkflowEvent("tribe_card_created", {
//     holder_name: "Mama",
//     holder_email: "mama@example.com",
//     expires_at: "2027-05-13",
//   });
//
// What it does:
//   1. Look up all enabled workflows with trigger_type='event' and
//      trigger_config.event matching the event id.
//   2. For each, insert a workflow_runs row with status='pending', the
//      payload stored on context, current_node_id=null (so the runner
//      starts at the trigger node).
//   3. Return { fired: [{ workflow_id, run_id }] }.
//
// Caller is fire-and-forget: failures are logged but never thrown. An
// event hook breaking should NEVER take down the user-facing route that
// fired it (e.g. tribe-card creation must not fail because the workflow
// table has a hiccup).

import "server-only";
import { createServerSupabase } from "@/util/supabase/server";

export async function fireWorkflowEvent(eventId, payload = {}) {
  try {
    const supabase = createServerSupabase();

    const { data: workflows, error } = await supabase
      .from("workflows")
      .select("id, name, trigger_config")
      .eq("enabled", true)
      .eq("trigger_type", "event")
      .filter("trigger_config->>event", "eq", eventId);

    if (error) {
      console.warn("[fireWorkflowEvent] lookup failed:", error.message);
      return { fired: [], error: error.message };
    }
    if (!workflows?.length) return { fired: [] };

    const rows = workflows.map((wf) => ({
      workflow_id: wf.id,
      status: "pending",
      context: { event: eventId, ...payload },
      triggered_by: "event",
    }));

    const { data: inserted, error: insErr } = await supabase
      .from("workflow_runs")
      .insert(rows)
      .select("id, workflow_id");

    if (insErr) {
      console.warn("[fireWorkflowEvent] insert failed:", insErr.message);
      return { fired: [], error: insErr.message };
    }

    return { fired: inserted || [] };
  } catch (err) {
    console.warn("[fireWorkflowEvent] crashed:", err?.message || err);
    return { fired: [], error: String(err?.message || err) };
  }
}
