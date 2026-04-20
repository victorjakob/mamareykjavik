// GET /api/admin/memberships/[id]/events
// -----------------------------------------------------------------------------
// Returns the audit trail for a single subscription (renewal attempts, webhook
// hits, cancellations, etc.). Admin-only.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") {
    return { ok: false };
  }
  return { ok: true };
}

export async function GET(_req, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("membership_payment_events")
    .select("id, subscription_id, member_email, event_type, order_id, transaction_id, amount, currency, action_code, message, created_at, raw")
    .eq("subscription_id", id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("admin memberships events error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }

  return NextResponse.json({ events: data || [] });
}
