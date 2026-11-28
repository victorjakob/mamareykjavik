// POST /api/admin/customers/:id/merge  { into }  — :id is the duplicate.
// customers_merge (POS repo, migration 008) marks it merged into `into` and
// repoints tribe cards, gift cards, bookings, till bills and the account.
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { requireAdmin } from "@/lib/customers/admin";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f-]{36}$/i;

export async function POST(request, { params }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { into } = await request.json().catch(() => ({}));
  if (!UUID.test(id) || !UUID.test(String(into ?? ""))) {
    return NextResponse.json({ error: "Pick the customer to keep." }, { status: 400 });
  }
  const supabase = createServerSupabase();
  const { error } = await supabase.rpc("customers_merge", { p_duplicate: id, p_survivor: into });
  if (error) {
    console.error("customer merge failed", error);
    return NextResponse.json({ error: error.message || "Could not merge." }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
