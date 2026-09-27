// GET /api/me/meal-cards — the signed-in user's paid meal cards.
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { requireSession, jsonError } from "@/lib/api/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { data, error } = await createServerSupabase()
    .from("meal_cards")
    .select("*")
    .eq("buyer_email", session.user.email)
    .in("status", ["paid"])
    .order("created_at", { ascending: false });
  if (error) return jsonError(error);
  return NextResponse.json({ mealCards: data || [] });
}
