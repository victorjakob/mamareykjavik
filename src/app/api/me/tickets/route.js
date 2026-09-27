// GET /api/me/tickets — the signed-in user's tickets (for /profile/my-tickets).
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { requireSession, jsonError } from "@/lib/api/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { data, error } = await createServerSupabase()
    .from("tickets")
    .select(
      "id, buyer_email, order_id, status, quantity, total_price, variant_name, created_at, events (name, date, duration)"
    )
    .in("status", ["paid", "door", "free"])
    .eq("buyer_email", session.user.email)
    .order("created_at", { ascending: false });
  if (error) return jsonError(error);
  return NextResponse.json({ tickets: data || [] });
}
