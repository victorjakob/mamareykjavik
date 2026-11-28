// GET  /api/admin/customers?q=&merged=0  — list and search (admin only)
// POST /api/admin/customers              — add a customer
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { ADMIN_SELECT, accountFields, customerFields, friendlyDbError, requireAdmin } from "@/lib/customers/admin";
import { digitsOf, safeLike } from "@/lib/customers/shared";

export const dynamic = "force-dynamic";

export async function GET(request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const q = safeLike(params.get("q"));
  const showMerged = params.get("merged") === "1";
  const supabase = createServerSupabase();
  let query = supabase.from("customers").select(ADMIN_SELECT).order("name").limit(500);
  if (!showMerged) query = query.is("merged_into", null);
  if (q) {
    const kt = digitsOf(q);
    const ors = [`name.ilike.%${q}%`, `company.ilike.%${q}%`, `email.ilike.%${q}%`, `phone.ilike.%${q}%`];
    if (kt.length >= 4) ors.push(`kennitala.like.${kt}%`);
    query = query.or(ors.join(","));
  }
  const { data, error } = await query;
  if (error) {
    console.error("admin customers list failed", error);
    return NextResponse.json({ error: "Could not load customers" }, { status: 500 });
  }
  return NextResponse.json({ customers: data ?? [] });
}

export async function POST(request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const { fields, error: invalid } = customerFields(body, { creating: true });
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
  const supabase = createServerSupabase();
  const { data, error } = await supabase.from("customers").insert(fields).select("id").single();
  if (error) return NextResponse.json({ error: friendlyDbError(error) }, { status: 400 });
  if (body.account) {
    const acct = accountFields(body.account, null, session.user?.email);
    const res = await supabase.from("customer_accounts").insert({ customer_id: data.id, ...acct });
    if (res.error) return NextResponse.json({ error: "Saved the customer, but not the account." }, { status: 500 });
  }
  return NextResponse.json({ id: data.id });
}
