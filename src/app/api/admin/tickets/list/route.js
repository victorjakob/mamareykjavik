// GET /api/admin/tickets/list — admin-only list of paid/door tickets with
// their event (for /admin/manage-events/statistics/tickets).
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { requireAdminSession, jsonError } from "@/lib/api/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdminSession();
  if (session instanceof NextResponse) return session;

  const { data, error } = await createServerSupabase()
    .from("tickets")
    .select("*, events ( name, date )")
    .in("status", ["paid", "door"])
    .order("created_at", { ascending: false });
  if (error) return jsonError(error);
  return NextResponse.json({ tickets: data || [] });
}
