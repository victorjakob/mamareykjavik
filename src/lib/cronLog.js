// Cron run logging — small helpers so each cron handler can record:
//   1. start  → insert row, return id
//   2. success → set status=ok + finished_at + result payload
//   3. error  → set status=error + finished_at + error message
//
// All three are no-throws — a logging failure must never crash a cron run.
// If the cron_runs table doesn't exist yet, they warn and continue.
//
// Usage:
//   const runId = await logCronRunStart("cron-renew-memberships", triggeredBy);
//   try {
//     // ... do work
//     await logCronRunSuccess(runId, { processed: 5 });
//   } catch (err) {
//     await logCronRunError(runId, err);
//     throw err;
//   }

import { createServerSupabase } from "@/util/supabase/server";

export async function logCronRunStart(automationId, triggeredBy = "cron") {
  try {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("cron_runs")
      .insert({
        automation_id: automationId,
        status: "running",
        triggered_by: triggeredBy === "admin" ? "admin" : "cron",
      })
      .select("id")
      .single();
    if (error) {
      console.warn("[cronLog] start failed:", error.message);
      return null;
    }
    return data?.id ?? null;
  } catch (err) {
    console.warn("[cronLog] start crashed:", err?.message || err);
    return null;
  }
}

export async function logCronRunSuccess(runId, result = null) {
  if (!runId) return;
  try {
    const supabase = createServerSupabase();
    await supabase
      .from("cron_runs")
      .update({
        status: "ok",
        finished_at: new Date().toISOString(),
        result,
      })
      .eq("id", runId);
  } catch (err) {
    console.warn("[cronLog] success update crashed:", err?.message || err);
  }
}

export async function logCronRunError(runId, error) {
  if (!runId) return;
  try {
    const supabase = createServerSupabase();
    await supabase
      .from("cron_runs")
      .update({
        status: "error",
        finished_at: new Date().toISOString(),
        error: String(error?.message || error),
      })
      .eq("id", runId);
  } catch (err) {
    console.warn("[cronLog] error update crashed:", err?.message || err);
  }
}

// Helper for the manual-trigger endpoint — reads the X-Triggered-By header
// the admin proxy sets so we can flag admin-initiated runs in the log.
export function triggeredByFromRequest(req) {
  const header = req.headers.get?.("x-triggered-by") || "";
  return header === "admin" ? "admin" : "cron";
}

// runWithLogging — wraps a cron handler in start/success/error logging.
// Usage:
//   export async function POST(req) {
//     if (!authorized(req)) return Response.json({ error: "..." }, { status: 401 });
//     return runWithLogging("cron-foo", req, () => myCronFn());
//   }
//
// Inspects the Response status: <400 = success, >=400 = error.
// Also peeks at the JSON body so result column captures the handler's payload.
export async function runWithLogging(automationId, req, handler) {
  const runId = await logCronRunStart(automationId, triggeredByFromRequest(req));
  let res;
  try {
    res = await handler();
  } catch (err) {
    await logCronRunError(runId, err);
    throw err;
  }

  let body = null;
  try {
    body = await res.clone().json();
  } catch {
    /* response wasn't JSON — fine, we still record success/error from status */
  }

  if (res.status >= 400) {
    await logCronRunError(runId, body?.error || body?.message || `HTTP ${res.status}`);
  } else {
    await logCronRunSuccess(runId, body);
  }
  return res;
}
