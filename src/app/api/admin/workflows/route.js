// /api/admin/workflows
//   GET  → list all workflows
//   POST → create a blank workflow, return its id
//
// Admin only. The actual editing happens via /api/admin/workflows/[id].

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

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("workflows")
    .select(
      "id, name, description, enabled, trigger_type, trigger_config, graph, created_at, updated_at",
    )
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[workflows.GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ workflows: data || [] });
}

export async function POST(req) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body = {};
  try { body = await req.json(); } catch {}

  const name = (typeof body.name === "string" && body.name.trim()) || "Untitled workflow";

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("workflows")
    .insert({
      name,
      description: body.description || null,
      enabled: false,
      trigger_type: body.trigger_type || "manual",
      trigger_config: body.trigger_config || {},
      graph: body.graph || { nodes: [], edges: [] },
      created_by: auth.session.user.email || null,
    })
    .select("id, name, enabled, trigger_type, created_at")
    .single();

  if (error) {
    console.error("[workflows.POST]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ workflow: data }, { status: 201 });
}
