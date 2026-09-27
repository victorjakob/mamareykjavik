// GET /api/admin/orders/[id]/items — admin-only line items for one order.
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { requireAdminSession, jsonError } from "@/lib/api/session";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const session = await requireAdminSession();
  if (session instanceof NextResponse) return session;
  const { id } = await params;

  const { data, error } = await createServerSupabase()
    .from("order_items")
    .select("id, product_id, product_name, product_price, quantity, unit_price, total_price")
    .eq("order_id", id);
  if (error) return jsonError(error);
  return NextResponse.json({ items: data || [] });
}
