// POST /api/admin/credits/[id]/cancel — admin only. Cancels an unclaimed
// credit (conditional update, so a credit claimed a moment earlier stays claimed).
import { NextResponse } from "next/server";
import { requireAdminSession, jsonError } from "@/lib/api/session";
import { createServerSupabase } from "@/util/supabase/server";
import { isCreditId } from "@/lib/productCredits";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const session = await requireAdminSession();
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  if (!isCreditId(id)) return jsonError("Credit not found", 404);

  const { data, error } = await createServerSupabase()
    .from("product_credits")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancelled_by: session.user?.email || null,
    })
    .eq("id", id)
    .eq("status", "unclaimed")
    .select("id, status")
    .maybeSingle();
  if (error) return jsonError(error);
  if (!data) return jsonError("Only unclaimed credits can be cancelled.", 409);
  return NextResponse.json({ ok: true });
}
