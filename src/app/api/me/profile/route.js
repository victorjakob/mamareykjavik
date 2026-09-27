// GET   /api/me/profile — the signed-in user's own profile (never the password)
// PATCH /api/me/profile — update own name and/or email_subscription
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { requireSession, jsonError } from "@/lib/api/session";

export const dynamic = "force-dynamic";

const PROFILE_FIELDS =
  "id, email, name, created_at, role, updated_at, email_subscription, provider";

export async function GET() {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;
  if (!session.user.id) return jsonError("No user id in session", 400);

  const { data, error } = await createServerSupabase()
    .from("users")
    .select(PROFILE_FIELDS)
    .eq("id", session.user.id)
    .single();
  if (error) return jsonError(error);
  return NextResponse.json({ profile: data });
}

export async function PATCH(req) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;
  if (!session.user.id) return jsonError("No user id in session", 400);

  const body = await req.json().catch(() => ({}));
  const updates = {};
  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name || name.length > 200) return jsonError("Invalid name", 400);
    updates.name = name;
  }
  if (typeof body.email_subscription === "boolean") {
    updates.email_subscription = body.email_subscription;
  }
  if (Object.keys(updates).length === 0) return jsonError("Nothing to update", 400);
  updates.updated_at = new Date().toISOString();

  const { error } = await createServerSupabase()
    .from("users")
    .update(updates)
    .eq("id", session.user.id);
  if (error) return jsonError(error);
  return NextResponse.json({ success: true });
}
