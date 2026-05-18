// POST /api/admin/workflows/[id]/run
// -----------------------------------------------------------------------------
// Admin endpoint: fire a workflow manually. Creates a pending workflow_runs row
// with triggered_by='admin' and immediately advances it once (so the admin sees
// movement). Subsequent waits/branches are picked up by the cron.
//
// Body (optional): { context: { ...payload } } — gets merged into the run's
// context for variable substitution. Useful for testing event-triggered flows
// without actually firing the underlying event.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";
import { advanceRun } from "@/workflows/runner.server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") return { ok: false };
  return { ok: true, session };
}

export async function POST(req, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  let body = {};
  try { body = await req.json(); } catch {}
  const context = (body.context && typeof body.context === "object") ? body.context : {};

  const supabase = createServerSupabase();

  // Sanity check the workflow exists
  const { data: wf, error: wfErr } = await supabase
    .from("workflows")
    .select("id, name, enabled")
    .eq("id", id)
    .single();
  if (wfErr || !wf) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  // Create the run
  const { data: run, error: runErr } = await supabase
    .from("workflow_runs")
    .insert({
      workflow_id: id,
      status: "pending",
      context: { manual: true, triggered_at: new Date().toISOString(), ...context },
      triggered_by: "admin",
    })
    .select("id")
    .single();
  if (runErr || !run) {
    return NextResponse.json({ error: runErr?.message || "Failed to create run" }, { status: 500 });
  }

  // Advance once so the admin sees the first hop right away.
  const result = await advanceRun(run.id);

  return NextResponse.json({ ok: true, run_id: run.id, result });
}
