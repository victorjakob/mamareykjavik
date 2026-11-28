// Admin API for website chat conversations (assistant_conversations).
// GET    → latest conversations (admins only)
// PATCH  { id, flagged?, admin_note? } → update review fields
// DELETE { id } → remove a conversation

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

const UUID_RE = /^[0-9a-f-]{36}$/i;

export async function GET(request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "300", 10) || 300, 1), 1000);

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("assistant_conversations")
    .select("id, session_id, page, lang, messages, message_count, handed_off, handed_off_to, flagged, admin_note, created_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[admin/assistant] fetch failed:", error.message);
    return NextResponse.json({ error: "Failed to load conversations" }, { status: 500 });
  }
  return NextResponse.json({ conversations: data || [] });
}

export async function PATCH(request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  if (!UUID_RE.test(body?.id || "")) return NextResponse.json({ error: "Bad id" }, { status: 400 });

  const update = {};
  if (typeof body.flagged === "boolean") update.flagged = body.flagged;
  if (typeof body.admin_note === "string") update.admin_note = body.admin_note.slice(0, 2000);
  if (!Object.keys(update).length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  const supabase = createServerSupabase();
  const { error } = await supabase.from("assistant_conversations").update(update).eq("id", body.id);
  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  if (!UUID_RE.test(body?.id || "")) return NextResponse.json({ error: "Bad id" }, { status: 400 });

  const supabase = createServerSupabase();
  const { error } = await supabase.from("assistant_conversations").delete().eq("id", body.id);
  if (error) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
