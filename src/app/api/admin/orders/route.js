// /api/admin/orders — admin-only shop orders.
//   GET                          → { orders }
//   PATCH { id, status: "complete" }
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { requireAdminSession, jsonError } from "@/lib/api/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdminSession();
  if (session instanceof NextResponse) return session;

  const { data, error } = await createServerSupabase()
    .from("orders")
    .select(
      "id, created_at, user_email, price, payment_status, delivery, shipping_info, saltpay_order_id, status, delivery_notification_sent_at"
    )
    .order("created_at", { ascending: false });
  if (error) return jsonError(error);
  return NextResponse.json({ orders: data || [] });
}

export async function PATCH(req) {
  const session = await requireAdminSession();
  if (session instanceof NextResponse) return session;

  const { id, status } = await req.json().catch(() => ({}));
  if (!id || status !== "complete") return jsonError("Invalid request", 400);

  const { error } = await createServerSupabase()
    .from("orders")
    .update({ status: "complete" })
    .eq("id", id);
  if (error) return jsonError(error);
  return NextResponse.json({ success: true });
}
