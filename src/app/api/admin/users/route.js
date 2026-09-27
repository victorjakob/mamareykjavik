// /api/admin/users — admin-only user list and role changes.
//   GET   ?roles=host,admin → [{ name, email, email_subscription, created_at, role }]
//   PATCH { email, role }
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { requireAdminSession, jsonError } from "@/lib/api/session";

export const dynamic = "force-dynamic";

const ROLES = ["user", "host", "admin"];

export async function GET(req) {
  const session = await requireAdminSession();
  if (session instanceof NextResponse) return session;

  const roles = (new URL(req.url).searchParams.get("roles") || "")
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);

  let q = createServerSupabase()
    .from("users")
    .select("name, email, email_subscription, created_at, role")
    .order("email", { ascending: true });
  if (roles.length) q = q.in("role", roles);

  const { data, error } = await q;
  if (error) return jsonError(error);
  return NextResponse.json({ users: data || [] });
}

export async function PATCH(req) {
  const session = await requireAdminSession();
  if (session instanceof NextResponse) return session;

  const { email, role } = await req.json().catch(() => ({}));
  if (!email || !ROLES.includes(role)) return jsonError("Invalid email or role", 400);

  const { error } = await createServerSupabase()
    .from("users")
    .update({ role })
    .eq("email", email);
  if (error) return jsonError(error);
  return NextResponse.json({ success: true });
}
