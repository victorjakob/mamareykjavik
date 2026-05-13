// /api/admin/workflows/[id]
//   GET    → load one workflow
//   PATCH  → update fields (name, description, enabled, trigger, graph)
//   DELETE → drop the workflow (cascades to workflow_runs)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") return { ok: false };
  return { ok: true, session };
}

export async function GET(_req, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("workflows")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ workflow: data });
}

export async function PATCH(req, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  let body = {};
  try { body = await req.json(); } catch {}

  // Only allow updating the editor-controlled fields.
  const updates = { updated_at: new Date().toISOString() };
  if (typeof body.name === "string")        updates.name = body.name.trim() || "Untitled workflow";
  if (typeof body.description === "string") updates.description = body.description;
  if (typeof body.enabled === "boolean")    updates.enabled = body.enabled;
  if (typeof body.trigger_type === "string") {
    if (!["schedule", "event", "manual"].includes(body.trigger_type)) {
      return NextResponse.json({ error: "Invalid trigger_type" }, { status: 400 });
    }
    updates.trigger_type = body.trigger_type;
  }
  if (body.trigger_config && typeof body.trigger_config === "object") {
    updates.trigger_config = body.trigger_config;
  }
  if (body.graph && typeof body.graph === "object") {
    updates.graph = body.graph;
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("workflows")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    if (error.code === "PGRST116") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ workflow: data });
}

export async function DELETE(_req, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const supabase = createServerSupabase();
  const { error } = await supabase.from("workflows").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
