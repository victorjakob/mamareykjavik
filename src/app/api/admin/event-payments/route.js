// /api/admin/event-payments — admin-only payouts recorded against events.
//   POST { event_id, amount, details } → { payment }
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { requireAdminSession, jsonError } from "@/lib/api/session";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const session = await requireAdminSession();
  if (session instanceof NextResponse) return session;

  const body = await req.json().catch(() => ({}));
  const eventId = Number(body.event_id);
  const amount = Number(body.amount);
  if (!Number.isInteger(eventId) || !Number.isFinite(amount)) {
    return jsonError("Invalid event or amount", 400);
  }

  const { data, error } = await createServerSupabase()
    .from("event-payments")
    .insert([{ event_id: eventId, amount, details: body.details ?? null }])
    .select("id,event_id,amount,details,created_at")
    .single();
  if (error) return jsonError(error);
  return NextResponse.json({ payment: data });
}
