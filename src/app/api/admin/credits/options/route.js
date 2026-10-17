// GET /api/admin/credits/options — admin only. Menu categories and items to
// pick a credit's product/category from (read from the existing menu tables).
import { NextResponse } from "next/server";
import { requireAdminSession, jsonError } from "@/lib/api/session";
import { createServerSupabase } from "@/util/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdminSession();
  if (session instanceof NextResponse) return session;
  const supabase = createServerSupabase();
  const [cats, items] = await Promise.all([
    supabase.from("menu_categories").select("id, name, order").order("order", { ascending: true }),
    supabase.from("menu_items").select("id, name, category_id, order, available").order("order", { ascending: true }),
  ]);
  if (cats.error) return jsonError(cats.error);
  if (items.error) return jsonError(items.error);
  return NextResponse.json({ categories: cats.data || [], items: items.data || [] });
}
